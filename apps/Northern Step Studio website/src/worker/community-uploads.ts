import { Hono } from "hono";
import { getDb, type Env } from "./db";
import { authMiddleware, type AppUser } from "./auth";

const communityUploads = new Hono<{ Bindings: Env; Variables: { user: AppUser } }>();

export default communityUploads;
