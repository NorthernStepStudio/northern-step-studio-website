
CREATE TABLE maintenance_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  is_active BOOLEAN DEFAULT 0,
  message TEXT,
  scheduled_date TEXT,
  scheduled_time TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO maintenance_settings (is_active, message) VALUES (0, 'We are currently performing scheduled maintenance. We will be back shortly!');
