import { Hono } from "hono";
import { getDb, type Env } from "./db";
import { authMiddleware, type AppUser } from "./auth";

const community = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

async function getCurrentDbUser(c: { env: Env; req: { url: string } }) {
  const sql = getDb(c.env);
  // Implementation...
  return null;
}

export default community;
