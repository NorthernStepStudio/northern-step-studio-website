DROP INDEX idx_user_sessions_expires_at;
DROP INDEX idx_user_sessions_user_id;
DROP TABLE user_sessions;

ALTER TABLE users DROP COLUMN password_salt;
ALTER TABLE users DROP COLUMN password_hash;
