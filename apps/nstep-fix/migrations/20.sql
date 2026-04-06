CREATE TABLE app_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER,
  app_uuid TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT DEFAULT 'progress',
  version TEXT,
  is_published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);