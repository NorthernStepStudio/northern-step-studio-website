import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('noobs.db');

export async function run(sql: string, params: any[] = []): Promise<void> {
  await db.runAsync(sql, params);
}

export async function all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return await db.getAllAsync<T>(sql, params);
}

export async function one<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  return await db.getFirstAsync<T>(sql, params);
}

interface SentimentData {
  user_vote: string;
}

export async function getSentiment(): Promise<SentimentData | null> {
  const row = await db.getFirstAsync<SentimentData>(`SELECT * FROM market_sentiment LIMIT 1`);
  return row;
}

// ... types and other functions ...

export function initDb() {
  // user profile (single row)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY NOT NULL,
      age_range TEXT,
      income_range TEXT,
      expense_range TEXT,
      emergency_fund_status TEXT,
      debt_status TEXT,
      goal_type TEXT,
      risk_level INTEGER
    );
  `);

  // Black Swan events log
  db.execSync(`
            CREATE TABLE IF NOT EXISTS black_swan_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                headline TEXT NOT NULL,
                magnitude REAL NOT NULL,
                timestamp TEXT NOT NULL
            );
        `);

  // Discovery Feed (Local Broadcasts)
  db.execSync(`
            CREATE TABLE IF NOT EXISTS discovery_feed (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT NOT NULL,
                type TEXT NOT NULL,
                headline TEXT NOT NULL,
                thesis TEXT,
                timestamp TEXT NOT NULL
            );
        `);

  // Market Sentiment (Single user vote)
  db.execSync(`
            CREATE TABLE IF NOT EXISTS market_sentiment (
                user_vote TEXT PRIMARY KEY
            );
        `);

  // lessons
  db.execSync(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Migration: Add summary column if it accidentally didn't exist in a previous build
  const tableInfo = db.getAllSync<{ name: string }>("PRAGMA table_info(lessons)");
  const hasSummary = tableInfo.some(col => col.name === 'summary');
  if (!hasSummary) {
    db.execSync("ALTER TABLE lessons ADD COLUMN summary TEXT NOT NULL DEFAULT ''");
  }

  // plan (single row)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS plan (
      id INTEGER PRIMARY KEY NOT NULL,
      stage TEXT,
      contribution_amount REAL,
      frequency TEXT,
      allocation_template TEXT
    );
  `);

  // transactions: paper + real
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL, -- 'paper' | 'real'
      asset_name TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      date_iso TEXT NOT NULL
    );
  `);

  // weekly checkins
  db.execSync(`
    CREATE TABLE IF NOT EXISTS weekly_checkins (
      week_start_iso TEXT PRIMARY KEY NOT NULL,
      followed_plan INTEGER NOT NULL,
      emotional INTEGER NOT NULL,
      note TEXT
    );
  `);

  // achievements
  db.execSync(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY NOT NULL,
      unlocked_at TEXT NOT NULL
    );
  `);

  // Default rows if missing
  db.execSync(`INSERT OR IGNORE INTO plan (id, stage, contribution_amount, frequency, allocation_template) VALUES (1, 'Stability First', 0, 'monthly', 'balanced');`);
}

// Initialize immediately so queries don't fail during early redirects
initDb();

export async function resetDb() {
  await run(`DELETE FROM user_profile;`);
  await run(`UPDATE lessons SET completed = 0;`);
  await run(`UPDATE plan SET stage='Not set', contribution_amount=0, frequency='weekly', allocation_template='balanced' WHERE id=1;`);
  await run(`DELETE FROM transactions;`);
  await run(`DELETE FROM weekly_checkins;`);
  await run(`DELETE FROM discovery_feed;`);
  await run(`DELETE FROM market_sentiment;`);
}
