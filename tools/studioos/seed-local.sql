-- Clean up
DELETE FROM projects;
DELETE FROM assistant_memory;
DELETE FROM build_runs;
DELETE FROM intelligence_action_queue;

-- Seeding projects
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p1', 'Northern Step Studio Website', 'active', 'high', 'The primary public-facing studio presence.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p2', 'Studio Intelligence', 'active', 'critical', 'The private admin dashboard and operational core for NStep AI.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p3', 'NStep AI', 'active', 'high', 'The broader product ecosystem for NStep automation and intelligence.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p4', 'Matterhorn', 'active', 'high', 'The main NStep AI agent and operator.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p5', 'Synox', 'active', 'critical', 'The core intelligence engine powering Matterhorn and Studio Intelligence.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p6', 'NexusBuild', 'active', 'high', 'Dev and build orchestration platform.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p7', 'ProvLy', 'planning', 'medium', 'PSA and CRM automation suite.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p8', 'NeuroMoves', 'active', 'high', 'Pediatric motor therapy and education suite.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p9', 'Doomed / Roguelike', 'active', 'medium', 'Tactical roguelike RPG game.');
INSERT INTO projects (uuid, name, status, priority, description) VALUES ('p10', 'NStep Build Center', 'active', 'medium', 'Build and artifact management center.');

-- Seeding Operational Memory
INSERT INTO assistant_memory (id, scope, key, value, category) VALUES ('m1', 'general', 'canonical_naming', 'NStep AI ecosystem uses Synox (engine), Matterhorn (agent), and Studio Intelligence (dashboard).', 'governance');
INSERT INTO assistant_memory (id, scope, key, value, category) VALUES ('m2', 'general', 'safety_boundary', 'All intelligence modules are admin-only and gated by isUserAdmin checks.', 'security');
INSERT INTO assistant_memory (id, scope, key, value, category) VALUES ('m3', 'general', 'matterhorn_role', 'Matterhorn is advisory-only. It cannot execute code, run shell commands, or modify the repository directly.', 'governance');
INSERT INTO assistant_memory (id, scope, key, value, category) VALUES ('m4', 'general', 'synox_role', 'Synox is a reasoning and context engine. It provides grounded analysis based on studio data.', 'governance');

-- Seeding Sample Build
INSERT INTO build_runs (id, app_key, platform, build_type, status, version_name, version_code, summary, risk_level) 
VALUES ('b1', 'neurormoves', 'android', 'release', 'failed', '1.2.0', '42', 'Android production build failed during Gradle execution.', 'medium');

-- Seeding Action Queue
INSERT INTO intelligence_action_queue (id, title, description, priority, risk_level, source_type, reasoning_summary, suggested_prompt, status)
VALUES ('a1', 'Review latest repo snapshot', 'A new snapshot was generated. Analyze for architectural drift.', 'medium', 'low', 'system', 'Fresh snapshot available for reasoning.', 'What are the main architectural changes in the latest snapshot?', 'suggested');
INSERT INTO intelligence_action_queue (id, title, description, priority, risk_level, source_type, reasoning_summary, suggested_prompt, status)
VALUES ('a2', 'Review failed Android build phase', 'NeuroMoves build failed during gradle phase.', 'high', 'medium', 'build_failure', 'Build failure detected in logs.', 'Explain the cause of the NeuroMoves build failure.', 'suggested');
