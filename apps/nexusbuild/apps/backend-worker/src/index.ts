import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./routes/auth";
import builds from "./routes/builds";
import chat from "./routes/chat";
import prices from "./routes/prices";
import billing from "./routes/billing";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  REVENUECAT_WEBHOOK_SECRET?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use("*", cors());

// Routes
const apiRoutes = new Hono<{ Bindings: Bindings }>();
apiRoutes.get("/health", (c) => {
  return c.json({
    status: "healthy",
    message: "NexusBuild API (Cloudflare Worker) is running",
    timestamp: new Date().toISOString(),
  });
});

apiRoutes.route("/auth", auth);
apiRoutes.route("/builds", builds);
apiRoutes.route("/chat", chat);
apiRoutes.route("/prices", prices);
apiRoutes.route("/billing", billing);

app.route("/api", apiRoutes);
app.route("/api/nexus", apiRoutes);

app.get("/", (c) => {
  return c.json({
    message: "Welcome to NexusBuild API (Integrated Worker)",
    version: "2.0.0-worker",
  });
});

export default app;
