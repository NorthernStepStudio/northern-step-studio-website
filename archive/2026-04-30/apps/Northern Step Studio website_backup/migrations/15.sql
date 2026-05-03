
CREATE TABLE community_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  user_id INTEGER,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  is_pinned BOOLEAN DEFAULT 0,
  is_locked BOOLEAN DEFAULT 0,
  is_hidden BOOLEAN DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL,
  user_id INTEGER,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_community_threads_category ON community_threads(category_id);
CREATE INDEX idx_community_threads_slug ON community_threads(slug);
CREATE INDEX idx_community_posts_thread ON community_posts(thread_id);
CREATE INDEX idx_community_posts_user ON community_posts(user_id);

INSERT INTO community_categories (name, slug, description, icon, sort_order) VALUES
  ('General', 'general', 'General discussion about Northern Step Studio projects', '💬', 1),
  ('Development', 'development', 'Technical discussions and development updates', '🛠️', 2),
  ('Support', 'support', 'Get help with our apps and services', '🆘', 3),
  ('Announcements', 'announcements', 'Official updates and news', '📢', 4);
