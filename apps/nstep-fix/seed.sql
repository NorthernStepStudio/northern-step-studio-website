
CREATE TABLE apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  status TEXT,
  logo TEXT,
  screenshots TEXT,
  cta_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_category ON apps(category);
CREATE INDEX idx_apps_status ON apps(status);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

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

CREATE TABLE promotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  target_app TEXT,
  cta_url TEXT,
  is_active BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_active ON promotions(is_active);

CREATE TABLE blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  author_id INTEGER,
  is_published BOOLEAN DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);
ALTER TABLE apps ADD COLUMN video_url TEXT;
ALTER TABLE apps ADD COLUMN features TEXT;
ALTER TABLE apps ADD COLUMN platform TEXT DEFAULT 'mobile';
CREATE TABLE studio_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  is_pinned BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_studio_notes_category ON studio_notes(category);
CREATE INDEX idx_studio_notes_pinned ON studio_notes(is_pinned);
ALTER TABLE blog_posts ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE blog_posts ADD COLUMN excerpt TEXT;
ALTER TABLE blog_posts ADD COLUMN cover_image TEXT;
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

ALTER TABLE users ADD COLUMN display_name TEXT;

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_id INTEGER NOT NULL,
  sender_id INTEGER,
  type TEXT NOT NULL DEFAULT 'mention',
  reference_type TEXT,
  reference_id INTEGER,
  content TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(recipient_id, is_read);

-- Add uuid column for stable internal identifiers
ALTER TABLE apps ADD COLUMN uuid TEXT;

-- Generate UUIDs for existing apps
UPDATE apps SET uuid = lower(
  hex(randomblob(4)) || '-' ||
  hex(randomblob(2)) || '-' ||
  '4' || substr(hex(randomblob(2)), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' ||
  hex(randomblob(6))
);

-- Create index on uuid for performance
CREATE INDEX idx_apps_uuid ON apps(uuid);

-- Add visibility column to apps table
ALTER TABLE apps ADD COLUMN visibility TEXT DEFAULT 'draft';

-- Create app_media table for screenshots
CREATE TABLE app_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_uuid TEXT NOT NULL,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'screenshot',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient lookups
CREATE INDEX idx_app_media_app_uuid ON app_media(app_uuid);
CREATE INDEX idx_app_media_sort ON app_media(app_uuid, sort_order);

ALTER TABLE apps ADD COLUMN monetization TEXT DEFAULT 'Free';
ALTER TABLE apps ADD COLUMN progress_percent INTEGER DEFAULT 0;

-- Add app_uuid column to analytics table
ALTER TABLE analytics ADD COLUMN app_uuid TEXT;

-- Create index for efficient UUID lookups
CREATE INDEX idx_analytics_app_uuid ON analytics(app_uuid);

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
  ('General', 'general', 'General discussion about Northern Step Studio projects', 'ðŸ’¬', 1),
  ('Development', 'development', 'Technical discussions and development updates', 'ðŸ› ï¸', 2),
  ('Support', 'support', 'Get help with our apps and services', 'ðŸ†˜', 3),
  ('Announcements', 'announcements', 'Official updates and news', 'ðŸ“¢', 4);

CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email_thread_replies BOOLEAN DEFAULT 1,
  email_mentions BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

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
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
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
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN password_salt TEXT;

CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token_hash TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
ALTER TABLE apps ADD COLUMN tagline TEXT;
ALTER TABLE apps ADD COLUMN full_description TEXT;
ALTER TABLE apps ADD COLUMN status_label TEXT;
ALTER TABLE apps ADD COLUMN target_date TEXT;
ALTER TABLE apps ADD COLUMN tech_stack TEXT;
ALTER TABLE apps ADD COLUMN progress TEXT;

INSERT OR IGNORE INTO apps (
  uuid,
  name,
  slug,
  tagline,
  description,
  full_description,
  category,
  status,
  status_label,
  target_date,
  tech_stack,
  progress,
  logo,
  screenshots,
  cta_url,
  video_url,
  features,
  platform,
  visibility,
  progress_percent,
  monetization
) VALUES
(
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  'ProvLy',
  'provly',
  'Local-First Home Inventory Vault',
  'ProvLy is a privacy-first home inventory vault that helps households document belongings, attach receipts and warranties, build organized insurance claim packs, and stay ahead of maintenance reminders.',
  'ProvLy is a privacy-first home inventory vault designed for insurance readiness and long-term household care. It keeps inventory records, receipts, warranties, exports, and reminders in one place without turning the product into a bloated enterprise platform.',
  'HOME',
  'PREVIEW',
  'Preview',
  'Q4 2026',
  '["React Native","SQLite","Claim Pack Export"]',
  '[{"text":"Homes, rooms, and item capture flow","completed":true},{"text":"Receipt, warranty, and document attachment flow","completed":true},{"text":"Claim Pack export for insurance-ready reports","completed":true},{"text":"Maintenance reminder engine","completed":true},{"text":"Opt-in AI receipt parsing and scan assist","completed":false},{"text":"Subscription billing and production export delivery","completed":false}]',
  '/brand/provly-logo.png',
  '[]',
  'https://drive.google.com/uc?export=download&id=1-HgGFNgREMH3v_s3SvygVBBaLD4lXtCI',
  NULL,
  '["Claim Pack Export: Generate PDF, CSV, and ZIP exports with receipts, photos, and item records for insurance claims","Maintenance Reminders: Keep appliances and equipment on predictable care schedules instead of relying on memory","AI Assist: Use optional assisted parsing for receipts and faster household inventory setup"]',
  'mobile',
  'published',
  76,
  'Free'
),
(
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  'NexusBuild',
  'nexusbuild',
  'AI-Powered PC Build Companion',
  'NexusBuild helps PC builders compare parts, validate compatibility, manage builds, and use AI-assisted recommendations without losing visibility into the real hardware tradeoffs.',
  'NexusBuild is a full-stack PC building companion spanning mobile, web, backend services, and deal tracking workflows. It is built for enthusiasts who want compatibility confidence, cleaner build planning, and smarter part selection support.',
  'AI TOOL',
  'PREVIEW',
  'Preview',
  'Q3 2026',
  '["React Native","React","PostgreSQL"]',
  '[{"text":"Mobile app, web app, and backend foundation","completed":true},{"text":"Compatibility engine and build management","completed":true},{"text":"AI recommendation workflow","completed":true},{"text":"Price tracking and deal alert surfaces","completed":true},{"text":"Subscription and entitlement rollout","completed":false},{"text":"Production affiliate and notification wiring","completed":false}]',
  '/brand/nexusbuild-logo.png',
  '[]',
  'https://drive.google.com/uc?export=download&id=1xkZFmxgmZisxI3XttBL9Q3fzAK4obqe0',
  NULL,
  '["AI Recommendations: Generate smarter build ideas around budget, performance, and intent instead of picking parts blind","Compatibility Engine: Check sockets, power, fit, and supporting constraints before a build turns into a mismatch","Build and Deal Tracking: Save builds, compare options, and watch pricing without leaving the product"]',
  'mobile',
  'published',
  84,
  'Free'
),
(
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  'NooBS Investing',
  'noobs-investing',
  'Beginner-Friendly Investing Companion',
  'NooBS Investing teaches core market concepts through guided lessons, behavioral simulations, mini-games, and visual progress systems designed for first-time investors.',
  'NooBS Investing is a mobile-first learning companion built to make intimidating finance concepts easier to absorb. It blends structured lessons, interactive practice, and premium visual feedback into a product that feels approachable instead of academic.',
  'FINANCE',
  'PREVIEW',
  'Preview',
  'Q2 2026',
  '["React Native","Interactive Lessons","Gamified Learning"]',
  '[{"text":"Language-first onboarding and lesson flow","completed":true},{"text":"Core mini-games and learning modules","completed":true},{"text":"Portfolio analytics and progress systems","completed":true},{"text":"Premium paywall and entitlement scaffold","completed":true},{"text":"Production billing and legal link cleanup","completed":false},{"text":"Launch QA across translations and settings","completed":false}]',
  '/brand/noobs-investing-logo.png',
  '[]',
  'https://drive.google.com/uc?export=download&id=1Sf7j0viRyWQGPPmXE-rww5SI2l4Qmsd1',
  NULL,
  '["Structured Lessons: Learn core investing ideas through guided, beginner-friendly flows instead of disconnected articles","Interactive Simulations: Practice concepts with behavior-driven mini-games and market scenarios","Visual Progress Systems: Track understanding and momentum with a clearer, more motivating feedback loop"]',
  'mobile',
  'published',
  72,
  'Free'
),
(
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  'NeuroMoves',
  'neuromoves',
  'Guided OT Companion for Children',
  'NeuroMoves is a guided occupational therapy companion for young children, combining errorless-learning activities, routines, parent tools, and progress tracking in a friendly mobile experience.',
  'NeuroMoves is designed around structured movement, communication, and routine-building activities for children. It combines approachable visuals, guided prompts, parent-facing tools, and therapy-friendly reporting to keep the app useful outside of a single session.',
  'EDUCATION',
  'PREVIEW',
  'Preview',
  'Q2 2026',
  '["React Native","Therapy Activities","Parent Profiles"]',
  '[{"text":"Core OT activity flows, auth, and onboarding","completed":true},{"text":"Child profile management and routine setup","completed":true},{"text":"Text-to-speech guidance and haptic feedback","completed":true},{"text":"Progress reports, journal, and rewards systems","completed":true},{"text":"Production billing and auth hardening","completed":false},{"text":"Therapy content QA and launch cleanup","completed":false}]',
  '/brand/neuromoves-logo.png',
  '[]',
  'https://drive.google.com/uc?export=download&id=11eXBZ8C9_JtcDDIxexRSBRyjAVFYXvrK',
  NULL,
  '["Errorless Learning Activities: Guide children through structured tasks with gentle feedback instead of failure-heavy loops","Parent and Therapist Tools: Manage child profiles, routines, journals, and progress reporting in one place","Engagement Systems: Use rewards, avatar progression, and guided prompts to keep routines consistent"]',
  'mobile',
  'published',
  63,
  'Free'
),
(
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  'PasoScore',
  'pasoscore',
  'Deterministic Credit Builder Companion',
  'PasoScore is a mobile-first credit guidance app that walks users through month-by-month improvement steps with deterministic decision paths, multilingual support, and zero credit-bureau access.',
  'PasoScore focuses on practical credit-building guidance without turning the product into a high-risk prediction system. It stays deterministic, mobile-first, and privacy-conscious while giving users clear next-best actions month by month.',
  'FINANCE',
  'ALPHA',
  'Alpha',
  'Q3 2026',
  '["React Native","Decision Tree Engine","RevenueCat"]',
  '[{"text":"Dual onboarding for anonymous and personalized paths","completed":true},{"text":"Deterministic roadmap engine and step tracking","completed":true},{"text":"Multilingual UX across Spanish, English, and Italian","completed":true},{"text":"Letter generator and PDF export flow","completed":false},{"text":"Subscription rollout and customer restore flow","completed":false},{"text":"Compliance review and launch hardening","completed":false}]',
  '/brand/pasoscore-logo.png',
  '[]',
  '/contact',
  NULL,
  '["Deterministic Guidance Paths: Follow a clear month-by-month decision system instead of vague financial advice","Dual Onboarding: Start anonymously or use the more personalized path without exposing sensitive bureau data","Privacy-First Boundaries: No SSN collection, no credit report access, and mobile-local user data"]',
  'mobile',
  'published',
  58,
  'Free'
);

INSERT OR IGNORE INTO role_permissions (role, page, can_access) VALUES
  ('admin', 'updates', 1),
  ('admin', 'community', 1),
  ('moderator', 'updates', 1),
  ('moderator', 'community', 1);
UPDATE apps SET category = 'HOME' WHERE slug = 'provly';
UPDATE apps SET category = 'AI TOOL' WHERE slug = 'nexusbuild';
UPDATE apps SET category = 'FINANCE' WHERE slug IN ('noobs-investing', 'pasoscore');
UPDATE apps SET category = 'EDUCATION' WHERE slug = 'neuromoves';
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  destination_email TEXT NOT NULL,
  email_sent INTEGER NOT NULL DEFAULT 0,
  email_error TEXT,
  email_message_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

CREATE TABLE IF NOT EXISTS preview_interest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  interest TEXT,
  source TEXT NOT NULL DEFAULT 'contact_page',
  email_sent INTEGER NOT NULL DEFAULT 0,
  email_error TEXT,
  email_message_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preview_interest_created_at ON preview_interest(created_at);
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
-- Update NexusBuild metadata to point to the new integrated web app
UPDATE apps 
SET 
  cta_url = '/apps/nexusbuild/app',
  platform = 'web',
  description = 'NexusBuild helps PC builders compare parts, validate compatibility, and craft perfect setups with AI recommendations, now fully integrated into the Northern Step Studio ecosystem.',
  status = 'PREVIEW',
  status_label = 'Preview (Integrated)',
  visibility = 'published'
WHERE slug = 'nexusbuild';
-- Migration: Add Site Content Table for CMS
-- Targeted at: Supabase / PostgreSQL

CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);

-- Seed some initial content (optional fallback if not using hardcoded defaults)
-- INSERT INTO site_content (key, content) VALUES ('terms_last_updated', 'March 24, 2026') ON CONFLICT (key) DO NOTHING;
