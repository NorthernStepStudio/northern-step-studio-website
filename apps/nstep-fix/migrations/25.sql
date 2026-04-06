ALTER TABLE contact_messages ADD COLUMN phone TEXT;
ALTER TABLE contact_messages ADD COLUMN sms_consent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contact_messages ADD COLUMN source TEXT NOT NULL DEFAULT 'contact_page';
ALTER TABLE contact_messages ADD COLUMN intent TEXT;
ALTER TABLE contact_messages ADD COLUMN requested_tier TEXT;
ALTER TABLE contact_messages ADD COLUMN industry TEXT;
ALTER TABLE contact_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE contact_messages ADD COLUMN admin_notes TEXT;
ALTER TABLE contact_messages ADD COLUMN contacted_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_intent ON contact_messages(intent);
CREATE INDEX IF NOT EXISTS idx_contact_messages_source ON contact_messages(source);

INSERT OR IGNORE INTO role_permissions (role, page, can_access) VALUES
  ('admin', 'leads', 1),
  ('moderator', 'leads', 1);
