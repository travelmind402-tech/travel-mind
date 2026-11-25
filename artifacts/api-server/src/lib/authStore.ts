import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool, usersTable } from "@workspace/db";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

const BCRYPT_ROUNDS = 12;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SESSION_SECRET =
  process.env.AUTH_SESSION_SECRET && process.env.AUTH_SESSION_SECRET.length >= 16
    ? process.env.AUTH_SESSION_SECRET
    : crypto.randomBytes(32).toString("hex");

// Precomputed valid bcrypt hash used to equalize timing when login email is absent
const DUMMY_BCRYPT_HASH =
  "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";

const DATA_DIR = path.resolve(process.cwd(), "artifacts", "api-server", ".data");
const FALLBACK_USERS_FILE = path.join(DATA_DIR, "users.json");

let pgTableReady: Promise<boolean> | null = null;

async function ensurePostgresUsersTable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (!pgTableReady) {
    pgTableReady = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `);
        return true;
      } catch {
        return false;
      }
    })();
  }
  return pgTableReady;
}

function readFallbackUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(FALLBACK_USERS_FILE)) return [];
    const raw = fs.readFileSync(FALLBACK_USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFallbackUsers(users: StoredUser[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  const tmpFile = `${FALLBACK_USERS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(users, null, 2), { mode: 0o600 });
  fs.renameSync(tmpFile, FALLBACK_USERS_FILE);
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = normalizeEmail(email);
  if (await ensurePostgresUsersTable()) {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalized))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password_hash: row.passwordHash,
      created_at: row.createdAt.toISOString(),
    };
  }

  const users = readFallbackUsers();
  return users.find((u) => u.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  if (!id) return null;
  if (await ensurePostgresUsersTable()) {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: row.createdAt.toISOString(),
    };
  }

  const users = readFallbackUsers();
  const found = users.find((u) => u.id === id);
  return found ? toPublicUser(found) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const normalizedEmail = normalizeEmail(input.email);
  const trimmedName = input.name.trim();
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  if (await ensurePostgresUsersTable()) {
    const [inserted] = await db
      .insert(usersTable)
      .values({
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
      })
      .returning();
    return {
      id: inserted.id,
      name: inserted.name,
      email: inserted.email,
      created_at: inserted.createdAt.toISOString(),
    };
  }

  const users = readFallbackUsers();
  if (users.some((u) => u.email === normalizedEmail)) {
    const err = new Error("Email already exists") as Error & { code?: string };
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  const created: StoredUser = {
    id: crypto.randomUUID(),
    name: trimmedName,
    email: normalizedEmail,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };
  users.push(created);
  writeFallbackUsers(users);
  return toPublicUser(created);
}

export async function verifyPassword(
  password: string,
  storedHash: string | null,
): Promise<boolean> {
  if (!storedHash) {
    await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
    return false;
  }
  return bcrypt.compare(password, storedHash);
}

function base64UrlEncode(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): Buffer {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLen), "base64");
}

export function signSessionToken(userId: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({ sub: userId, iat: now, exp: now + SESSION_TTL_SECONDS }),
  );
  const signingInput = `${header}.${payload}`;
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(signingInput)
    .digest();
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const signingInput = `${header}.${payload}`;
  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(signingInput)
    .digest();
  let actualSig: Buffer;
  try {
    actualSig = base64UrlDecode(signature);
  } catch {
    return null;
  }
  if (
    actualSig.length !== expectedSig.length ||
    !crypto.timingSafeEqual(actualSig, expectedSig)
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(base64UrlDecode(payload).toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof parsed?.sub !== "string" ||
      typeof parsed?.exp !== "number" ||
      parsed.exp <= now
    ) {
      return null;
    }
    return { userId: parsed.sub };
  } catch {
    return null;
  }
}

// Sliding-window login rate limiter
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_ACCOUNT = 8;
const MAX_ATTEMPTS_PER_IP = 25;
const attemptMap = new Map<string, number[]>();

function pruneHits(key: string, now: number): number[] {
  const hits = (attemptMap.get(key) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (hits.length === 0) {
    attemptMap.delete(key);
  } else {
    attemptMap.set(key, hits);
  }
  return hits;
}

export function checkLoginRateLimit(
  ip: string,
  email: string,
): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const ipKey = `ip:${ip}`;
  const acctKey = `acct:${ip}:${normalizeEmail(email)}`;
  const ipHits = pruneHits(ipKey, now);
  const acctHits = pruneHits(acctKey, now);

  if (ipHits.length >= MAX_ATTEMPTS_PER_IP) {
    const retryAfterSec = Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - ipHits[0])) / 1000));
    return { limited: true, retryAfterSec };
  }
  if (acctHits.length >= MAX_ATTEMPTS_PER_ACCOUNT) {
    const retryAfterSec = Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - acctHits[0])) / 1000));
    return { limited: true, retryAfterSec };
  }
  return { limited: false, retryAfterSec: 0 };
}

export function recordFailedLoginAttempt(ip: string, email: string): void {
  const now = Date.now();
  const ipKey = `ip:${ip}`;
  const acctKey = `acct:${ip}:${normalizeEmail(email)}`;
  const ipHits = pruneHits(ipKey, now);
  ipHits.push(now);
  attemptMap.set(ipKey, ipHits);

  const acctHits = pruneHits(acctKey, now);
  acctHits.push(now);
  attemptMap.set(acctKey, acctHits);
}

export function clearLoginRateLimit(ip: string, email: string): void {
  attemptMap.delete(`acct:${ip}:${normalizeEmail(email)}`);
}

export const AUTH_COOKIE_NAME = "tm_session";
export const AUTH_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
