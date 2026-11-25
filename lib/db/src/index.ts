import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function createMockDb(): { pool: pg.Pool; db: NodePgDatabase<typeof schema> } {
  console.warn("[AI Studio] Database not connected — using mock");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d?: { data?: unknown }) => d?.data ?? {},
    update: async (d?: { data?: unknown }) => d?.data ?? {},
    delete: async () => ({}),
  };
  const mockPool = new Proxy({} as pg.Pool, {
    get: () => async () => ({ rows: [] }),
  });
  const mockDb = new Proxy({} as NodePgDatabase<typeof schema>, {
    get: (_, prop) =>
      prop === "query"
        ? new Proxy({}, { get: () => noOp })
        : async () => [],
  });
  return { pool: mockPool, db: mockDb };
}

let pool: pg.Pool;
let db: NodePgDatabase<typeof schema>;

if (!process.env.DATABASE_URL) {
  ({ pool, db } = createMockDb());
} else {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } catch {
    ({ pool, db } = createMockDb());
  }
}

export { pool, db };
export * from "./schema";
