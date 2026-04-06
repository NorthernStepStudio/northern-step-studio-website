
CREATE TABLE analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  app_id INTEGER,
  user_id INTEGER,
  metadata TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event ON analytics(event);
CREATE INDEX idx_analytics_app_id ON analytics(app_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
