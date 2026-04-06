import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .dev.vars from Northern Step Studio website
const envPath = path.resolve(process.cwd(), '../Northern Step Studio website/.dev.vars');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE credentials. Aborting deployment.");
  process.exit(1);
}

try {
  console.log("Triggering Vercel Production Build and Deploy...");
  
  // Build the command using npx vercel with inline environment variables
  const cmd = `npx vercel --prod --yes -e SUPABASE_URL="${SUPABASE_URL}" -e SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_KEY}"`;
  
  // Execute synchronously and inherit stdio so we can see the Vercel link!
  execSync(cmd, { stdio: 'inherit' });
  
  console.log("Deployment dispatched successfully!");
} catch (error) {
  console.error("Vercel deployment failed:", error.message);
  process.exit(1);
}
