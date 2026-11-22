-- AlpNile user intelligence and admin notifications.
-- Additive and idempotent. It never deletes or overwrites existing business data.
SET NAMES utf8mb4;
SET time_zone = '+00:00';
USE `u700970108_alpnile`;

CREATE TABLE IF NOT EXISTS admin_notifications (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_type VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  entity_type VARCHAR(40) CHARACTER SET ascii COLLATE ascii_bin NULL,
  entity_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  metadata JSON NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY admin_notifications_unread_idx (is_read, created_at),
  KEY admin_notifications_user_idx (user_id, created_at),
  KEY admin_notifications_entity_idx (entity_type, entity_id, created_at),
  CONSTRAINT admin_notifications_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version)
VALUES ('005_user_profiles_notifications')
ON DUPLICATE KEY UPDATE version = VALUES(version);
