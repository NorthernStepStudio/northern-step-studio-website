CREATE TABLE role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  page TEXT NOT NULL,
  can_access BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, page)
);

-- Insert default permissions for admin (full access)
INSERT INTO role_permissions (role, page, can_access) VALUES
  ('admin', 'dashboard', 1),
  ('admin', 'apps', 1),
  ('admin', 'analytics', 1),
  ('admin', 'content', 1),
  ('admin', 'promos', 1),
  ('admin', 'users', 1),
  ('admin', 'permissions', 1),
  ('admin', 'studio', 1),
  ('admin', 'revenue', 1);

-- Insert default permissions for moderator (limited access)
INSERT INTO role_permissions (role, page, can_access) VALUES
  ('moderator', 'dashboard', 1),
  ('moderator', 'apps', 0),
  ('moderator', 'analytics', 0),
  ('moderator', 'content', 1),
  ('moderator', 'promos', 0),
  ('moderator', 'users', 1),
  ('moderator', 'permissions', 0),
  ('moderator', 'studio', 0),
  ('moderator', 'revenue', 0);