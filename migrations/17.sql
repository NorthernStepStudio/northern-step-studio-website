
CREATE TABLE feature_toggles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT 1,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feature_toggles_key ON feature_toggles(feature_key);

INSERT INTO feature_toggles (feature_key, feature_name, description, is_enabled) VALUES
('apps', 'Apps Hub', 'Project/Apps browsing page', 1),
('community', 'Community Forum', 'Community discussion forum', 1),
('about', 'About Page', 'About Northern Step Studio page', 1),
('contact', 'Contact Page', 'Contact form and information', 1),
('docs', 'Knowledge Base', 'Documentation and FAQ page', 1),
('responseos', 'ResponseOS', 'ResponseOS pricing and info page', 1),
('blog', 'Blog', 'Blog posts and articles', 1);
