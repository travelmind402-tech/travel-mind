import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  checkLoginRateLimit,
  clearLoginRateLimit,
  createUser,
  findUserByEmail,
  findUserById,
  isValidEmail,
  normalizeEmail,
  recordFailedLoginAttempt,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from "../lib/authStore";

const authRouter: IRouter = Router();

authRouter.use(cookieParser());

// Replace global wildcard CORS on authenticated endpoints with credentialed same-origin reflection
authRouter.use((req: Request, res: Response, next: NextFunction) => {
  res.removeHeader("Access-Control-Allow-Origin");
  const origin = req.headers.origin;
  const host = (req.headers["x-forwarded-host"] as string | undefined) || req.headers.host;

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      const expectedHost = host.split(",")[0].trim();
      if (originHost === expectedHost) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
      }
    } catch {
      // Ignore malformed origin header
    }
  }

  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
    res.status(204).end();
    return;
  }

  next();
});

// Origin / custom-header check on state-changing routes to prevent cross-site CSRF
function verifyCsrfOrigin(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const host = ((req.headers["x-forwarded-host"] as string | undefined) || req.headers.host || "")
    .split(",")[0]
    .trim();

  if (origin) {
    try {
      if (new URL(origin).host === host) {
        next();
        return;
      }
    } catch {
      // Fall through to rejection
    }
    res.status(403).json({ error: "Cross-origin request rejected." });
    return;
  }

  if (req.headers["x-requested-with"]) {
    next();
    return;
  }

  // Allow direct same-host server/curl calls without a foreign Origin header
  if (host) {
    next();
    return;
  }

  res.status(403).json({ error: "Origin verification failed." });
}

function setSessionCookie(res: Response, token: string): void {
  res.append(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=None; Partitioned`,
  );
}

function clearSessionCookie(res: Response): void {
  res.append(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned`,
  );
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

authRouter.post("/signup", verifyCsrfOrigin, async (req: Request, res: Response) => {
  try {
    const rawName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
    const rawPassword = typeof req.body?.password === "string" ? req.body.password : "";
    const rawConfirm =
      typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : undefined;

    if (!rawName || rawName.length < 2 || rawName.length > 100) {
      res.status(400).json({ error: "Please enter your name (2–100 characters)." });
      return;
    }

    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    if (rawPassword.length < 8 || rawPassword.length > 128) {
      res.status(400).json({ error: "Password must be at least 8 characters long." });
      return;
    }

    if (rawConfirm !== undefined && rawConfirm !== rawPassword) {
      res.status(400).json({ error: "Passwords do not match." });
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const user = await createUser({
      name: rawName,
      email,
      password: rawPassword,
    });

    const token = signSessionToken(user.id);
    setSessionCookie(res, token);
    res.status(201).json({ user });
  } catch (err: any) {
    if (err?.code === "EMAIL_EXISTS" || err?.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    res.status(500).json({ error: "Could not create your account right now." });
  }
});

authRouter.post("/login", verifyCsrfOrigin, async (req: Request, res: Response) => {
  try {
    const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
    const rawPassword = typeof req.body?.password === "string" ? req.body.password : "";
    const email = normalizeEmail(rawEmail);
    const ip = getClientIp(req);

    const limit = checkLoginRateLimit(ip, email || "empty");
    if (limit.limited) {
      res.setHeader("Retry-After", String(limit.retryAfterSec));
      res.status(429).json({
        error: "Too many login attempts. Please wait a few minutes and try again.",
      });
      return;
    }

    if (!isValidEmail(email) || !rawPassword) {
      recordFailedLoginAttempt(ip, email || "invalid");
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const existing = await findUserByEmail(email);
    const ok = await verifyPassword(rawPassword, existing ? existing.password_hash : null);

    if (!existing || !ok) {
      recordFailedLoginAttempt(ip, email);
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    clearLoginRateLimit(ip, email);
    const token = signSessionToken(existing.id);
    setSessionCookie(res, token);

    res.status(200).json({
      user: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        created_at: existing.created_at,
      },
    });
  } catch {
    res.status(500).json({ error: "Could not sign in right now." });
  }
});

authRouter.post("/logout", verifyCsrfOrigin, (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
});

authRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const verified = verifySessionToken(token);
    if (!verified) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Session expired." });
      return;
    }
    const user = await findUserById(verified.userId);
    if (!user) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    res.status(200).json({ user });
  } catch {
    res.status(401).json({ error: "Not authenticated." });
  }
});

export default authRouter;
