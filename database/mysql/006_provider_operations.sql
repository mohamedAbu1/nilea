-- AlpNile provider operations: drivers and property owners.
-- Additive and idempotent. Providers are approved by an administrator before
-- their profile can receive operational assignments.
SET NAMES utf8mb4;
SET time_zone = '+00:00';
USE `u700970108_alpnile`;

CREATE TABLE IF NOT EXISTS provider_profiles (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  provider_role VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  approval_status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'pending',
  company_name VARCHAR(255) NULL,
  license_number VARCHAR(120) NULL,
  service_area VARCHAR(255) NULL,
  bio TEXT NULL,
  availability_status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'offline',
  current_location_label VARCHAR(255) NULL,
  current_lat DECIMAL(10,7) NULL,
  current_lng DECIMAL(10,7) NULL,
  location_updated_at DATETIME(6) NULL,
  verification_note TEXT NULL,
  approved_at DATETIME(6) NULL,
  approved_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id),
  KEY provider_profiles_role_status_idx (provider_role, approval_status),
  KEY provider_profiles_availability_idx (availability_status, location_updated_at),
  CONSTRAINT provider_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT provider_profiles_approved_by_fk FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS provider_assignments (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  provider_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  booking_type VARCHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  booking_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assignment_status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'assigned',
  scheduled_at DATETIME(6) NULL,
  meeting_location VARCHAR(255) NULL,
  instructions TEXT NULL,
  customer_name VARCHAR(255) NULL,
  customer_phone VARCHAR(80) NULL,
  assigned_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  accepted_at DATETIME(6) NULL,
  started_at DATETIME(6) NULL,
  completed_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY provider_assignments_booking_uq (provider_id, booking_type, booking_id),
  KEY provider_assignments_provider_status_idx (provider_id, assignment_status, scheduled_at),
  KEY provider_assignments_booking_idx (booking_type, booking_id),
  CONSTRAINT provider_assignments_provider_fk FOREIGN KEY (provider_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT provider_assignments_assigned_by_fk FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS provider_tasks (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  provider_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assignment_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  task_type VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'instruction',
  title VARCHAR(255) NOT NULL,
  instructions TEXT NULL,
  task_status VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'pending',
  requires_location TINYINT(1) NOT NULL DEFAULT 0,
  due_at DATETIME(6) NULL,
  provider_note TEXT NULL,
  location_label VARCHAR(255) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  completed_at DATETIME(6) NULL,
  created_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY provider_tasks_provider_status_idx (provider_id, task_status, due_at),
  KEY provider_tasks_assignment_idx (assignment_id, task_status),
  CONSTRAINT provider_tasks_provider_fk FOREIGN KEY (provider_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT provider_tasks_assignment_fk FOREIGN KEY (assignment_id) REFERENCES provider_assignments (id) ON DELETE CASCADE,
  CONSTRAINT provider_tasks_created_by_fk FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS provider_location_pings (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  provider_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assignment_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  task_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  location_label VARCHAR(255) NULL,
  source VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'browser',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY provider_location_pings_provider_idx (provider_id, created_at),
  KEY provider_location_pings_assignment_idx (assignment_id, created_at),
  CONSTRAINT provider_location_pings_provider_fk FOREIGN KEY (provider_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT provider_location_pings_assignment_fk FOREIGN KEY (assignment_id) REFERENCES provider_assignments (id) ON DELETE CASCADE,
  CONSTRAINT provider_location_pings_task_fk FOREIGN KEY (task_id) REFERENCES provider_tasks (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version)
VALUES ('006_provider_operations')
ON DUPLICATE KEY UPDATE version = VALUES(version);
