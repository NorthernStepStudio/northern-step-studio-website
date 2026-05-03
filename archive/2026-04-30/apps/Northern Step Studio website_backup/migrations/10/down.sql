
DROP INDEX idx_notifications_is_read;
DROP INDEX idx_notifications_recipient;
DROP TABLE notifications;

ALTER TABLE users DROP COLUMN display_name;
