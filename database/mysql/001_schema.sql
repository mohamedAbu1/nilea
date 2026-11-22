-- AlpNile MySQL foundation for Hostinger.
-- Safe to run on an empty database or alongside an existing database.
-- This file intentionally contains no DROP or DELETE statements.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(100) NOT NULL,
  applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Supabase Auth has no MySQL equivalent. This table is the future application-owned
-- identity table; existing Supabase auth users require a separate controlled export.
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  email VARCHAR(255) NULL,
  password_hash VARCHAR(255) NULL,
  full_name VARCHAR(255) NOT NULL DEFAULT 'Traveler',
  phone VARCHAR(80) NULL,
  avatar_url VARCHAR(1024) NULL,
  auth_provider VARCHAR(40) NOT NULL DEFAULT 'password',
  auth_provider_subject VARCHAR(255) NULL,
  email_verified_at DATETIME(6) NULL,
  last_login_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY users_email_uq (email),
  UNIQUE KEY users_provider_subject_uq (auth_provider, auth_provider_subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  full_name VARCHAR(255) NOT NULL DEFAULT 'Traveler',
  phone VARCHAR(80) NULL,
  avatar_url VARCHAR(1024) NULL,
  preferred_locale VARCHAR(12) NOT NULL DEFAULT 'en',
  gender VARCHAR(12) NULL,
  access_role VARCHAR(20) NOT NULL DEFAULT 'traveler',
  account_type VARCHAR(12) NOT NULL DEFAULT 'user',
  device_type VARCHAR(20) NOT NULL DEFAULT 'computer',
  last_seen_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY profiles_access_role_idx (access_role),
  CONSTRAINT profiles_user_fk FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cities (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(160) NOT NULL,
  name VARCHAR(160) NOT NULL,
  region VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(1024) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY cities_slug_uq (slug),
  KEY cities_active_sort_idx (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_categories (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(160) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  icon_key VARCHAR(80) NULL,
  tone VARCHAR(80) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY trip_categories_slug_uq (slug),
  KEY trip_categories_active_sort_idx (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trips (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(200) NOT NULL,
  title VARCHAR(255) NOT NULL,
  city_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  location_label VARCHAR(255) NOT NULL,
  category_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  duration_label VARCHAR(100) NOT NULL,
  duration_minutes INT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(1024) NULL,
  price_from DECIMAL(12,2) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  rating DECIMAL(2,1) NULL,
  review_count INT NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY trips_slug_uq (slug),
  KEY trips_city_idx (city_id),
  KEY trips_category_idx (category_id),
  KEY trips_active_featured_idx (is_active, is_featured),
  CONSTRAINT trips_city_fk FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE SET NULL,
  CONSTRAINT trips_category_fk FOREIGN KEY (category_id) REFERENCES trip_categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stays (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(200) NOT NULL,
  name VARCHAR(255) NOT NULL,
  city_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  location_label VARCHAR(255) NOT NULL,
  stay_type VARCHAR(20) NOT NULL DEFAULT 'hotel',
  description TEXT NOT NULL,
  image_url VARCHAR(1024) NULL,
  price_from DECIMAL(12,2) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  rating DECIMAL(2,1) NULL,
  review_count INT NOT NULL DEFAULT 0,
  amenities JSON NOT NULL,
  max_guests INT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY stays_slug_uq (slug),
  KEY stays_city_idx (city_id),
  KEY stays_active_featured_idx (is_active, is_featured),
  CONSTRAINT stays_city_fk FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicles (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(160) NOT NULL,
  name VARCHAR(255) NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(1024) NULL,
  passenger_capacity INT NOT NULL,
  luggage_capacity INT NULL,
  price_from DECIMAL(12,2) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  with_driver TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY vehicles_slug_uq (slug),
  KEY vehicles_active_type_idx (is_active, vehicle_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  slug VARCHAR(200) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(1024) NULL,
  price DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  stock_quantity INT NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY products_slug_uq (slug),
  KEY products_active_featured_idx (is_active, is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  request_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(80) NULL,
  message TEXT NULL,
  details JSON NOT NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'website',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY inquiries_user_idx (user_id),
  KEY inquiries_status_created_idx (status, created_at),
  CONSTRAINT inquiries_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS car_bookings (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  vehicle_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  pickup_city_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  dropoff_city_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(80) NOT NULL,
  email VARCHAR(255) NULL,
  pickup_label VARCHAR(255) NOT NULL,
  dropoff_label VARCHAR(255) NOT NULL,
  dropoff_details TEXT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NULL,
  return_date DATE NULL,
  return_time TIME NULL,
  passengers INT NOT NULL DEFAULT 1,
  driver_service VARCHAR(120) NOT NULL DEFAULT 'private_driver',
  luggage VARCHAR(120) NULL,
  extras JSON NOT NULL,
  notes TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY car_bookings_user_idx (user_id),
  KEY car_bookings_vehicle_idx (vehicle_id),
  KEY car_bookings_status_created_idx (status, created_at),
  CONSTRAINT car_bookings_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT car_bookings_vehicle_fk FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE SET NULL,
  CONSTRAINT car_bookings_pickup_city_fk FOREIGN KEY (pickup_city_id) REFERENCES cities (id) ON DELETE SET NULL,
  CONSTRAINT car_bookings_dropoff_city_fk FOREIGN KEY (dropoff_city_id) REFERENCES cities (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_bookings (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  trip_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(80) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  guests INT NOT NULL DEFAULT 1,
  notes TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY trip_bookings_user_idx (user_id),
  KEY trip_bookings_trip_idx (trip_id),
  KEY trip_bookings_status_created_idx (status, created_at),
  CONSTRAINT trip_bookings_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT trip_bookings_trip_fk FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stay_bookings (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  stay_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(80) NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  notes TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY stay_bookings_user_idx (user_id),
  KEY stay_bookings_stay_idx (stay_id),
  KEY stay_bookings_status_created_idx (status, created_at),
  CONSTRAINT stay_bookings_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT stay_bookings_stay_fk FOREIGN KEY (stay_id) REFERENCES stays (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_orders (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(80) NULL,
  delivery_country VARCHAR(120) NOT NULL,
  delivery_address TEXT NULL,
  contact_preference VARCHAR(20) NOT NULL DEFAULT 'email',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY product_orders_user_idx (user_id),
  KEY product_orders_status_created_idx (status, created_at),
  CONSTRAINT product_orders_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_order_items (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  order_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  product_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY product_order_items_order_idx (order_id),
  KEY product_order_items_product_idx (product_id),
  CONSTRAINT product_order_items_order_fk FOREIGN KEY (order_id) REFERENCES product_orders (id) ON DELETE CASCADE,
  CONSTRAINT product_order_items_product_fk FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_destinations (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  city_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, city_id),
  CONSTRAINT saved_destinations_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT saved_destinations_city_fk FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_trips (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  trip_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, trip_id),
  CONSTRAINT saved_trips_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT saved_trips_trip_fk FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_stays (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  stay_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, stay_id),
  CONSTRAINT saved_stays_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT saved_stays_stay_fk FOREIGN KEY (stay_id) REFERENCES stays (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_products (
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  product_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT saved_products_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT saved_products_product_fk FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  email VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY newsletter_email_uq (email),
  KEY newsletter_user_idx (user_id),
  CONSTRAINT newsletter_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  full_name VARCHAR(255) NOT NULL,
  city_country VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL,
  journey VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  avatar_url VARCHAR(1024) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  like_count INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY reviews_status_created_idx (status, created_at),
  KEY reviews_user_idx (user_id),
  CONSTRAINT reviews_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_likes (
  review_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  visitor_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (review_id, visitor_key),
  CONSTRAINT review_likes_review_fk FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_day_plans (
  trip_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  day_number INT NOT NULL,
  activities JSON NOT NULL,
  PRIMARY KEY (trip_id, day_number),
  CONSTRAINT trip_day_plans_trip_fk FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_inclusions (
  trip_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  item VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (trip_id, item),
  CONSTRAINT trip_inclusions_trip_fk FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_catalog_reviews (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  trip_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  avatar_url VARCHAR(1024) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY trip_catalog_reviews_trip_idx (trip_id),
  UNIQUE KEY trip_catalog_reviews_uq (trip_id, display_name, comment(191)),
  CONSTRAINT trip_catalog_reviews_trip_fk FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exchange_rates (
  currency_code CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  currency_name VARCHAR(100) NOT NULL,
  symbol VARCHAR(12) NOT NULL,
  rate_to_usd DECIMAL(14,6) NOT NULL,
  decimal_digits TINYINT NOT NULL DEFAULT 2,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_conversations (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assigned_to CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  subject VARCHAR(255) NOT NULL DEFAULT 'AlpNile support',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  last_message_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY chat_conversations_user_idx (user_id),
  KEY chat_conversations_assigned_idx (assigned_to),
  KEY chat_conversations_status_idx (status),
  KEY chat_conversations_last_message_idx (last_message_at),
  CONSTRAINT chat_conversations_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chat_conversations_assigned_fk FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  conversation_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  sender_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  sender_role VARCHAR(12) NOT NULL DEFAULT 'user',
  body TEXT NOT NULL,
  message_type VARCHAR(12) NOT NULL DEFAULT 'text',
  attachment_path VARCHAR(1024) NULL,
  attachment_name VARCHAR(255) NULL,
  attachment_mime VARCHAR(160) NULL,
  attachment_size INT NULL,
  read_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY chat_messages_conversation_idx (conversation_id, created_at),
  KEY chat_messages_sender_idx (sender_id),
  CONSTRAINT chat_messages_conversation_fk FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO exchange_rates (currency_code, currency_name, symbol, rate_to_usd, decimal_digits, is_active)
VALUES
  ('USD', 'US Dollar', '$', 1.000000, 2, 1),
  ('EUR', 'Euro', '€', 0.920000, 2, 1),
  ('GBP', 'Pound Sterling', '£', 0.790000, 2, 1),
  ('EGP', 'Egyptian Pound', 'ج.م', 49.000000, 0, 1),
  ('CHF', 'Swiss Franc', 'CHF', 0.880000, 2, 1)
ON DUPLICATE KEY UPDATE
  currency_name = VALUES(currency_name),
  symbol = VALUES(symbol),
  rate_to_usd = VALUES(rate_to_usd),
  decimal_digits = VALUES(decimal_digits),
  is_active = VALUES(is_active);

INSERT INTO schema_migrations (version)
VALUES ('001_schema')
ON DUPLICATE KEY UPDATE version = VALUES(version);
