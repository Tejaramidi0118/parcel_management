-- schema.sql (REPLACEMENT)
-- Safe recreate: drops existing tables, creates schema in dependency order
-- WARNING: This will drop tables if they exist (data loss). Back up if needed.

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- ===== Drop existing tables (dependents first) =====
-- DROP TABLE IF EXISTS user_phone CASCADE;
-- DROP TABLE IF EXISTS route_point CASCADE;
-- DROP TABLE IF EXISTS tracking_event CASCADE;
-- DROP TABLE IF EXISTS parcel_item CASCADE;
-- DROP TABLE IF EXISTS parcel CASCADE;
-- DROP TABLE IF EXISTS vehicle CASCADE;
-- DROP TABLE IF EXISTS edge CASCADE;
-- DROP TABLE IF EXISTS hub CASCADE;
-- DROP TABLE IF EXISTS node CASCADE;
-- DROP TABLE IF EXISTS city CASCADE;
-- DROP TABLE IF EXISTS state CASCADE;
-- DROP TABLE IF EXISTS courier CASCADE;
-- DROP TABLE IF EXISTS customer CASCADE;
-- DROP TABLE IF EXISTS admin CASCADE;
-- DROP TABLE IF EXISTS app_user CASCADE;
-- DROP TABLE IF EXISTS audit_log CASCADE;

-- ===== Create base/location tables =====
CREATE TABLE IF NOT EXISTS state (
  state_id SERIAL PRIMARY KEY,
  name     VARCHAR(120) NOT NULL UNIQUE,
  code     VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS city (
  city_id   SERIAL PRIMARY KEY,
  name      VARCHAR(150) NOT NULL,
  latitude  DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  state_id  INTEGER REFERENCES state(state_id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_city_state ON city(state_id);

-- node before hub (hub may reference node)
CREATE TABLE IF NOT EXISTS node (
  node_id   SERIAL PRIMARY KEY,
  city_id   INTEGER REFERENCES city(city_id) ON DELETE SET NULL,
  node_type VARCHAR(50),
  latitude  DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);
CREATE INDEX IF NOT EXISTS idx_node_city ON node(city_id);

-- hub references node and city
CREATE TABLE IF NOT EXISTS hub (
  hub_id   SERIAL PRIMARY KEY,
  node_id  INTEGER, -- FK added later to avoid ordering issue
  city_id  INTEGER REFERENCES city(city_id) ON DELETE SET NULL,
  name     VARCHAR(150) NOT NULL,
  capacity INTEGER,
  contact  VARCHAR(120)
);
CREATE INDEX IF NOT EXISTS idx_hub_city ON hub(city_id);

-- ===== User / specialization tables =====
CREATE TABLE IF NOT EXISTS app_user (
  user_id        BIGSERIAL PRIMARY KEY,
  username       VARCHAR(50)  NOT NULL UNIQUE,
  password_hash  TEXT         NOT NULL,
  full_name      VARCHAR(120) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  address_street VARCHAR(200),
  address_area   VARCHAR(150),
  address_city   VARCHAR(100),
  address_pincode VARCHAR(20),
  phone          VARCHAR(30),
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  role           VARCHAR(20)  NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','courier','admin'))
);
CREATE INDEX IF NOT EXISTS idx_app_user_username ON app_user(username);
CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user(email);

CREATE TABLE IF NOT EXISTS customer (
  user_id BIGINT PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courier (
  user_id            BIGINT PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
  current_vehicle_id BIGINT, -- FK added later
  current_hub_id     INTEGER REFERENCES hub(hub_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin (
  user_id BIGINT PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE
);

-- multi-valued phone table
CREATE TABLE IF NOT EXISTS user_phone (
  user_id BIGINT REFERENCES app_user(user_id) ON DELETE CASCADE,
  phone   VARCHAR(30) NOT NULL,
  PRIMARY KEY (user_id, phone)
);

-- ===== Vehicle (create before adding FK to courier) =====
CREATE TABLE IF NOT EXISTS vehicle (
  vehicle_id    BIGSERIAL PRIMARY KEY,
  courier_id    BIGINT, -- FK to courier.user_id added later
  capacity_kg   DOUBLE PRECISION,
  license_plate VARCHAR(50) UNIQUE,
  status        VARCHAR(30) DEFAULT 'idle'
);
CREATE INDEX IF NOT EXISTS idx_vehicle_license ON vehicle(license_plate);

-- ===== Parcel & related entities =====
CREATE TABLE IF NOT EXISTS parcel (
  parcel_id           BIGSERIAL PRIMARY KEY,
  tracking_code       UUID DEFAULT uuid_generate_v4() UNIQUE,
  sender_id           BIGINT REFERENCES customer(user_id) ON DELETE SET NULL,
  recipient_id        BIGINT REFERENCES customer(user_id) ON DELETE SET NULL,
  pickup_city_id      INTEGER REFERENCES city(city_id) ON DELETE SET NULL,
  delivery_city_id    INTEGER REFERENCES city(city_id) ON DELETE SET NULL,
  assigned_hub_id     INTEGER REFERENCES hub(hub_id) ON DELETE SET NULL,
  assigned_courier_id BIGINT, -- FK added later to courier.user_id
  weight_kg           DOUBLE PRECISION,
  length_cm           DOUBLE PRECISION,
  width_cm            DOUBLE PRECISION,
  height_cm           DOUBLE PRECISION,
  status              VARCHAR(30) NOT NULL DEFAULT 'created',
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  expected_delivery_date DATE
);
CREATE INDEX IF NOT EXISTS idx_parcel_sender ON parcel(sender_id);
CREATE INDEX IF NOT EXISTS idx_parcel_recipient ON parcel(recipient_id);

CREATE TABLE IF NOT EXISTS parcel_item (
  item_id        BIGSERIAL PRIMARY KEY,
  parcel_id      BIGINT REFERENCES parcel(parcel_id) ON DELETE CASCADE,
  description    TEXT,
  quantity       INTEGER DEFAULT 1 NOT NULL,
  declared_value DOUBLE PRECISION DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_parcel_item_parcel ON parcel_item(parcel_id);

CREATE TABLE IF NOT EXISTS tracking_event (
  event_id   BIGSERIAL PRIMARY KEY,
  parcel_id  BIGINT REFERENCES parcel(parcel_id) ON DELETE CASCADE,
  seq        INTEGER NOT NULL DEFAULT 0,
  event_time TIMESTAMP NOT NULL DEFAULT NOW(),
  event_type VARCHAR(100),
  hub_id     INTEGER REFERENCES hub(hub_id) ON DELETE SET NULL,
  actor_id   BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
  note       TEXT,
  proof      JSONB,
  CONSTRAINT uq_tracking_seq UNIQUE(parcel_id, seq)
);
CREATE INDEX IF NOT EXISTS idx_tracking_parcel ON tracking_event(parcel_id);

CREATE TABLE IF NOT EXISTS route_point (
  route_point_id    BIGSERIAL PRIMARY KEY,
  parcel_id         BIGINT REFERENCES parcel(parcel_id) ON DELETE CASCADE,
  seq               INTEGER NOT NULL,
  node_id           INTEGER REFERENCES node(node_id) ON DELETE SET NULL,
  dist_from_prev_km DOUBLE PRECISION,
  CONSTRAINT uq_route_seq UNIQUE(parcel_id, seq)
);
CREATE INDEX IF NOT EXISTS idx_route_parcel ON route_point(parcel_id);

-- ===== Edge (graph) =====
CREATE TABLE IF NOT EXISTS edge (
  edge_id          BIGSERIAL PRIMARY KEY,
  from_node_id     INTEGER NOT NULL REFERENCES node(node_id) ON DELETE CASCADE,
  to_node_id       INTEGER NOT NULL REFERENCES node(node_id) ON DELETE CASCADE,
  distance_km      DOUBLE PRECISION,
  travel_time_min  INTEGER,
  is_bidirectional BOOLEAN DEFAULT TRUE,
  CONSTRAINT chk_edge_not_self CHECK (from_node_id <> to_node_id)
);
CREATE INDEX IF NOT EXISTS idx_edge_from ON edge(from_node_id);
CREATE INDEX IF NOT EXISTS idx_edge_to   ON edge(to_node_id);

-- ===== Audit log =====
CREATE TABLE IF NOT EXISTS audit_log (
  audit_id    BIGSERIAL PRIMARY KEY,
  entity_name VARCHAR(120) NOT NULL,
  entity_id   VARCHAR(120),
  action      VARCHAR(60) NOT NULL,
  actor_id    BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
  details     JSONB,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_name);

-- ===== Add missing/circular FKs using guarded DO blocks =====

-- hub.node_id -> node.node_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_hub_node'
  ) THEN
    ALTER TABLE hub
      ADD CONSTRAINT fk_hub_node
      FOREIGN KEY (node_id) REFERENCES node(node_id) ON DELETE SET NULL;
  END IF;
END$$;

-- vehicle.courier_id -> courier.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_vehicle_courier'
  ) THEN
    ALTER TABLE vehicle
      ADD CONSTRAINT fk_vehicle_courier
      FOREIGN KEY (courier_id) REFERENCES courier(user_id) ON DELETE SET NULL;
  END IF;
END$$;

-- courier.current_vehicle_id -> vehicle.vehicle_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_courier_current_vehicle'
  ) THEN
    ALTER TABLE courier
      ADD CONSTRAINT fk_courier_current_vehicle
      FOREIGN KEY (current_vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE SET NULL;
  END IF;
END$$;

-- parcel.assigned_courier_id -> courier.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_parcel_assigned_courier'
  ) THEN
    ALTER TABLE parcel
      ADD CONSTRAINT fk_parcel_assigned_courier
      FOREIGN KEY (assigned_courier_id) REFERENCES courier(user_id) ON DELETE SET NULL;
  END IF;
END$$;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_courier ON vehicle(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_vehicle ON courier(current_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parcel_assigned_courier ON parcel(assigned_courier_id);

-- End of schema
-- Make every customer-role user have a row in customer
-- INSERT INTO customer (user_id)
-- SELECT u.user_id
-- FROM app_user u
-- LEFT JOIN customer c ON c.user_id = u.user_id
-- WHERE u.role = 'customer' AND c.user_id IS NULL;

-- -- Same for couriers
-- INSERT INTO courier (user_id)
-- SELECT u.user_id
-- FROM app_user u
-- LEFT JOIN courier c ON c.user_id = u.user_id
-- WHERE u.role = 'courier' AND c.user_id IS NULL;

-- -- Same for admins
-- INSERT INTO admin (user_id)
-- SELECT u.user_id
-- FROM app_user u
-- LEFT JOIN admin a ON a.user_id = u.user_id
-- WHERE u.role = 'admin' AND a.user_id IS NULL;
