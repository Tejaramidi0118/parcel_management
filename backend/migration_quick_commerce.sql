-- migration_quick_commerce.sql
-- EXTENDS existing schema for hyperlocal quick-commerce
-- Run this AFTER schema.sql
-- WARNING: This is ADDITIVE ONLY - does not drop existing tables

-- ===== STEP 1: Enable PostGIS Extension =====
CREATE EXTENSION IF NOT EXISTS postgis;

-- ===== STEP 2: Add Spatial Columns to Existing Tables =====

-- Add location to hub (stores/warehouses) - uses PostGIS geometry
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hub' AND column_name = 'location'
  ) THEN
    ALTER TABLE hub ADD COLUMN location GEOMETRY(Point, 4326);
  END IF;
END$$;

-- Add location to courier (for delivery partner tracking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courier' AND column_name = 'location'
  ) THEN
    ALTER TABLE courier ADD COLUMN location GEOMETRY(Point, 4326);
  END IF;
  
  -- Add availability status for delivery partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courier' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE courier ADD COLUMN is_available BOOLEAN DEFAULT true;
  END IF;
END$$;

-- Add location to node (optional - for route optimization)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'node' AND column_name = 'location'
  ) THEN
    ALTER TABLE node ADD COLUMN location GEOMETRY(Point, 4326);
  END IF;
END$$;

-- Create spatial indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_hub_location ON hub USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_courier_location ON courier USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_node_location ON node USING GIST(location);

-- ===== STEP 3: Create New Tables for Quick-Commerce =====

-- STORES (use hub as base, add quick-commerce specific fields)
-- Note: We'll use hub table directly and add these fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hub' AND column_name = 'radius_km'
  ) THEN
    ALTER TABLE hub ADD COLUMN radius_km DECIMAL(5,2) DEFAULT 5.0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hub' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE hub ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END$$;

-- PRODUCTS table
CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  unit VARCHAR(50), -- e.g., 'kg', 'piece', 'liter'
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- INVENTORY table (links products to hubs/stores with stock tracking)
CREATE TABLE IF NOT EXISTS inventory (
  inventory_id SERIAL PRIMARY KEY,
  hub_id INTEGER NOT NULL REFERENCES hub(hub_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER DEFAULT 1000,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hub_id, product_id),
  CHECK (reserved_quantity <= stock_quantity)
);
CREATE INDEX IF NOT EXISTS idx_inventory_hub ON inventory(hub_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(hub_id, product_id) WHERE stock_quantity > 0;

-- ORDERS table (quick-commerce orders, different from parcel)
CREATE TABLE IF NOT EXISTS orders (
  order_id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || nextval('orders_order_id_seq'),
  customer_id BIGINT NOT NULL REFERENCES customer(user_id) ON DELETE SET NULL,
  hub_id INTEGER NOT NULL REFERENCES hub(hub_id) ON DELETE SET NULL,
  assigned_courier_id BIGINT REFERENCES courier(user_id) ON DELETE SET NULL,
  
  -- Delivery details
  delivery_address_street VARCHAR(200) NOT NULL,
  delivery_address_area VARCHAR(150),
  delivery_address_city VARCHAR(100) NOT NULL,
  delivery_address_pincode VARCHAR(20),
  delivery_location GEOMETRY(Point, 4326),
  delivery_phone VARCHAR(30),
  
  -- Order details
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee DECIMAL(10,2) DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 
    'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 
    'CANCELLED', 'FAILED'
  )),
  
  -- Payment
  payment_method VARCHAR(50), -- 'COD', 'ONLINE', 'WALLET'
  payment_status VARCHAR(30) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  assigned_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Expected delivery (for quick-commerce, usually 10-30 mins)
  expected_delivery_time TIMESTAMP,
  
  -- Notes
  customer_notes TEXT,
  cancellation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_hub ON orders(hub_id);
CREATE INDEX IF NOT EXISTS idx_orders_courier ON orders(assigned_courier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- ORDER_ITEMS table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_order DECIMAL(10,2) NOT NULL CHECK (price_at_order >= 0),
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price_at_order) STORED,
  UNIQUE(order_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ORDER_STATUS_LOG table (audit trail for order status changes)
CREATE TABLE IF NOT EXISTS order_status_log (
  log_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  metadata JSONB -- for storing additional context (e.g., location at status change)
);
CREATE INDEX IF NOT EXISTS idx_order_status_log_order ON order_status_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_log_time ON order_status_log(changed_at DESC);

-- ===== STEP 4: Update Existing Data with Locations (if lat/lng exist) =====

-- Populate hub locations from existing lat/lng in city or manually set
-- This is commented out as it's data-specific. Uncomment and adjust if needed.
/*
UPDATE hub h
SET location = ST_SetSRID(ST_MakePoint(c.longitude, c.latitude), 4326)
FROM city c
WHERE h.city_id = c.city_id 
  AND c.longitude IS NOT NULL 
  AND c.latitude IS NOT NULL 
  AND h.location IS NULL;
*/

-- Populate node locations
/*
UPDATE node
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE longitude IS NOT NULL 
  AND latitude IS NOT NULL 
  AND location IS NULL;
*/

-- ===== STEP 5: Add Triggers for Auto-updating =====

-- Trigger to automatically log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO order_status_log (order_id, old_status, new_status, notes)
    VALUES (NEW.order_id, OLD.status, NEW.status, 'Auto-logged status change');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_status_change ON orders;
CREATE TRIGGER trigger_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Trigger to update inventory.updated_at on stock change
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inventory_update ON inventory;
CREATE TRIGGER trigger_inventory_update
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_timestamp();

-- ===== STEP 6: Create Helper Views (optional but useful) =====

-- View for available products per store
CREATE OR REPLACE VIEW available_products_by_hub AS
SELECT 
  h.hub_id,
  h.name as hub_name,
  h.location,
  p.product_id,
  p.name as product_name,
  p.category,
  p.base_price,
  i.stock_quantity,
  i.stock_quantity - i.reserved_quantity as available_stock
FROM hub h
JOIN inventory i ON h.hub_id = i.hub_id
JOIN products p ON i.product_id = p.product_id
WHERE h.is_active = true 
  AND p.is_active = true 
  AND (i.stock_quantity - i.reserved_quantity) > 0;

-- View for order summary (useful for dashboards)
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.order_id,
  o.order_number,
  o.created_at,
  o.status,
  o.total_amount,
  c.full_name as customer_name,
  c.email as customer_email,
  h.name as hub_name,
  co.full_name as courier_name,
  COUNT(oi.order_item_id) as item_count
FROM orders o
JOIN app_user c ON o.customer_id = c.user_id
JOIN hub h ON o.hub_id = h.hub_id
LEFT JOIN app_user co ON o.assigned_courier_id = co.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_number, o.created_at, o.status, o.total_amount, 
         c.full_name, c.email, h.name, co.full_name;

-- ===== STEP 7: Sample Data Insertion (optional for testing) =====

-- Sample products (uncomment to use)
/*
INSERT INTO products (name, description, category, base_price, unit, is_active) VALUES
('Fresh Milk', 'Full cream fresh milk', 'Dairy', 60.00, '1L', true),
('Bread - White', 'Freshly baked white bread', 'Bakery', 40.00, 'piece', true),
('Eggs - 12pc', 'Farm fresh eggs', 'Dairy', 80.00, 'pack', true),
('Orange Juice', 'Fresh squeezed orange juice', 'Beverages', 120.00, '1L', true),
('Tomato - 1kg', 'Fresh red tomatoes', 'Vegetables', 50.00, 'kg', true)
ON CONFLICT DO NOTHING;
*/

-- ===== END OF MIGRATION =====
-- Summary: Added PostGIS, spatial columns to hub/courier/node, 
-- created products/inventory/orders/order_items/order_status_log tables,
-- added triggers and views for quick-commerce functionality
