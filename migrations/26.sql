-- Update NexusBuild metadata to point to the new integrated web app
UPDATE apps 
SET 
  cta_url = '/apps/nexusbuild/app',
  platform = 'web',
  description = 'NexusBuild helps PC builders compare parts, validate compatibility, and craft perfect setups with AI recommendations, now fully integrated into the Northern Step Studio ecosystem.',
  status = 'BETA',
  status_label = 'Beta (Integrated)',
  visibility = 'published'
WHERE slug = 'nexusbuild';
