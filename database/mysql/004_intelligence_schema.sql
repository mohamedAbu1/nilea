-- AlpNile intelligence layer for MySQL/MariaDB.
-- Additive and idempotent: no DROP, DELETE, or destructive ALTER statements.
SET NAMES utf8mb4;
SET time_zone = '+00:00';
USE `u700970108_alpnile`;

CREATE TABLE IF NOT EXISTS catalog_events (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  anonymous_key CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
  event_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  entity_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  entity_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  entity_slug VARCHAR(200) NULL,
  search_query VARCHAR(255) NULL,
  metadata JSON NOT NULL,
  occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY catalog_events_user_idx (user_id, event_type, occurred_at),
  KEY catalog_events_anonymous_idx (anonymous_key, event_type, occurred_at),
  KEY catalog_events_entity_idx (entity_type, entity_id, event_type, occurred_at),
  KEY catalog_events_slug_idx (entity_type, entity_slug, occurred_at),
  CONSTRAINT catalog_events_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  preferred_locale VARCHAR(12) NOT NULL DEFAULT 'en',
  budget_level VARCHAR(40) NULL,
  trip_styles JSON NOT NULL,
  preferred_cities JSON NOT NULL,
  preferred_duration_min INT NULL,
  preferred_duration_max INT NULL,
  dietary_preferences JSON NOT NULL,
  accessibility_needs TINYINT(1) NOT NULL DEFAULT 0,
  traveling_with_children TINYINT(1) NOT NULL DEFAULT 0,
  traveling_with_pets TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_relations (
  trip_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  related_trip_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  relation_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'similar',
  score DECIMAL(8,4) NOT NULL DEFAULT 0,
  reason VARCHAR(255) NULL,
  source VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'algorithm',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (trip_id, related_trip_id, relation_type),
  KEY trip_relations_related_idx (related_trip_id, relation_type, score),
  KEY trip_relations_score_idx (relation_type, score),
  CONSTRAINT trip_relations_trip_fk FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT trip_relations_related_fk FOREIGN KEY (related_trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed explainable relations from the catalog itself. These are a safe cold-start
-- baseline; later event data can improve scores without replacing the catalog.
INSERT INTO trip_relations (trip_id, related_trip_id, relation_type, score, reason, source)
SELECT a.id,
       b.id,
       'similar',
       (CASE WHEN a.city_id IS NOT NULL AND a.city_id = b.city_id THEN 0.6000 ELSE 0 END)
         + (CASE WHEN a.category_id IS NOT NULL AND a.category_id = b.category_id THEN 0.3000 ELSE 0 END)
         + (CASE WHEN a.price_level IS NOT NULL AND a.price_level = b.price_level THEN 0.1000 ELSE 0 END),
       CONCAT_WS(' + ',
         CASE WHEN a.city_id IS NOT NULL AND a.city_id = b.city_id THEN 'same city' END,
         CASE WHEN a.category_id IS NOT NULL AND a.category_id = b.category_id THEN 'same category' END,
         CASE WHEN a.price_level IS NOT NULL AND a.price_level = b.price_level THEN 'same price level' END),
       'catalog_seed'
  FROM trips a
  JOIN trips b ON a.id <> b.id
 WHERE a.is_active = 1 AND a.catalog_visible = 1
   AND b.is_active = 1 AND b.catalog_visible = 1
   AND (a.city_id = b.city_id OR a.category_id = b.category_id OR a.price_level = b.price_level)
ON DUPLICATE KEY UPDATE score = VALUES(score), reason = VALUES(reason), source = VALUES(source), updated_at = UTC_TIMESTAMP(6);

-- Add search indexes only when they do not already exist. FULLTEXT is supported by
-- InnoDB in current Hostinger MySQL/MariaDB versions and keeps search in the catalog.
SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE trips ADD FULLTEXT KEY trips_catalog_fulltext_idx (title, description, location_label)',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trips' AND INDEX_NAME = 'trips_catalog_fulltext_idx'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE stays ADD FULLTEXT KEY stays_catalog_fulltext_idx (name, description, location_label)',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'stays' AND INDEX_NAME = 'stays_catalog_fulltext_idx'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE products ADD FULLTEXT KEY products_catalog_fulltext_idx (name, description)',
    'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'products_catalog_fulltext_idx'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO schema_migrations (version)
VALUES ('004_intelligence_schema')
ON DUPLICATE KEY UPDATE version = VALUES(version);
