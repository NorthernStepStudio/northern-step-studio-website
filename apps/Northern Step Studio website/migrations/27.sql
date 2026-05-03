-- Remove deprecated missed-call text-back and service automation offering content.
-- This migration purges old service rows and key-based content that should no longer be public.

DELETE FROM apps
WHERE slug IN (
  'missed-call-text-back',
  'lead-recovery',
  'response-automation',
  'sms-automation',
  'twilio-follow-up',
  'local-service-automation'
)
OR lower(name) IN (
  'missed call text back',
  'lead recovery',
  'response automation',
  'sms automation',
  'twilio follow-up',
  'local service automation'
)
OR lower(coalesce(description, '')) LIKE '%missed call%'
OR lower(coalesce(description, '')) LIKE '%lead recovery%'
OR lower(coalesce(description, '')) LIKE '%response automation%'
OR lower(coalesce(description, '')) LIKE '%sms automation%'
OR lower(coalesce(description, '')) LIKE '%twilio%'
OR lower(coalesce(description, '')) LIKE '%voicemail%';

DELETE FROM site_content
WHERE key IN (
  'home.portfolio_lead',
  'home.portfolio_lead_desc',
  'home.portfolio_lead_title',
  'home.portfolio_lead_outcome',
  'home.portfolio_lead_live_today',
  'home.portfolio_type_service'
)
OR key LIKE 'mctb_page.%'
OR key LIKE 'home.portfolio_lead%'
OR lower(coalesce(content, '')) LIKE '%missed-call-text-back%'
OR lower(coalesce(content, '')) LIKE '%missed call%'
OR lower(coalesce(content, '')) LIKE '%lead recovery%'
OR lower(coalesce(content, '')) LIKE '%response automation%'
OR lower(coalesce(content, '')) LIKE '%sms automation%'
OR lower(coalesce(content, '')) LIKE '%twilio%'
OR lower(coalesce(content, '')) LIKE '%voicemail%'
OR lower(coalesce(content, '')) LIKE '%local service automation%';

UPDATE contact_messages
SET
  intent = 'general-support',
  subject = REPLACE(REPLACE(REPLACE(subject, 'lead recovery', 'support workflow'), 'Lead Recovery', 'Support Workflow'), 'missed call', 'support request'),
  message = REPLACE(REPLACE(REPLACE(message, 'lead recovery', 'support workflow'), 'Lead Recovery', 'Support Workflow'), 'missed call', 'support request'),
  updated_at = CURRENT_TIMESTAMP
WHERE lower(coalesce(intent, '')) = 'lead-recovery-demo'
   OR lower(coalesce(subject, '')) LIKE '%lead recovery%'
   OR lower(coalesce(subject, '')) LIKE '%missed call%'
   OR lower(coalesce(subject, '')) LIKE '%service automation%'
   OR lower(coalesce(message, '')) LIKE '%lead recovery%'
   OR lower(coalesce(message, '')) LIKE '%missed call%'
   OR lower(coalesce(message, '')) LIKE '%service automation%';

DELETE FROM community_posts
WHERE thread_id IN (
  SELECT id
  FROM community_threads
  WHERE lower(slug) LIKE '%lead-recovery%'
     OR lower(slug) LIKE '%missed-call%'
     OR lower(title) LIKE '%lead recovery%'
     OR lower(title) LIKE '%missed call%'
);

DELETE FROM community_threads
WHERE lower(slug) LIKE '%lead-recovery%'
   OR lower(slug) LIKE '%missed-call%'
   OR lower(title) LIKE '%lead recovery%'
   OR lower(title) LIKE '%missed call%'
   OR lower(coalesce(content, '')) LIKE '%missed call%'
   OR lower(coalesce(content, '')) LIKE '%lead recovery%';

DELETE FROM community_categories
WHERE lower(slug) = 'lead-recovery'
   OR lower(name) LIKE '%lead recovery%'
   OR lower(coalesce(description, '')) LIKE '%missed call%'
   OR lower(coalesce(description, '')) LIKE '%lead recovery%';
