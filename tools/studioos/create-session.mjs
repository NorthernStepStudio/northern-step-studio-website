import crypto from 'crypto';
import { execSync } from 'child_process';

const token = crypto.randomBytes(32).toString('hex');
const hash = crypto.createHash('sha256').update(token).digest('hex');

// Insert owner user if not exists
const insertUserSql = `INSERT OR IGNORE INTO users (id, email, role, display_name) VALUES (1, 'studio@northernstep.com', 'owner', 'Studio Owner');`;
const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
const insertSessionSql = `INSERT INTO user_sessions (user_id, session_token_hash, expires_at) VALUES (1, '${hash}', '${expiresAt}');`;

const cmd1 = `npx wrangler d1 execute northern-step-studio-website --local --command "${insertUserSql}"`;
const cmd2 = `npx wrangler d1 execute northern-step-studio-website --local --command "${insertSessionSql}"`;

console.log("🎟️ Generating dev user and session...");
try {
  execSync(cmd1);
  execSync(cmd2);
  console.log("✅ Session created.");
  console.log(`TOKEN: ${token}`);
} catch (e) {
  console.error("❌ Failed to create session:", e.message);
}
