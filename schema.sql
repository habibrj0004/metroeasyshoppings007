-- Metro Shoes relational model (SQLite dialect, portable to PostgreSQL/MySQL with minor changes).
-- One stock record per product variant: available = on_hand - reserved.
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  user_id      TEXT PRIMARY KEY,
  role         TEXT NOT NULL CHECK (role IN ('customer','handler','warehouse','admin')),
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE CHECK (email LIKE '%_@_%.__%'),
  mobile       TEXT NOT NULL CHECK (mobile LIKE '+92 3%' OR mobile LIKE '+44 7%'),
  region       TEXT CHECK (region IN ('PK','UK')),
  pw_hash      TEXT NOT NULL,
  spend_12m    REAL NOT NULL DEFAULT 0 CHECK (spend_12m >= 0),
  failed_logins INTEGER NOT NULL DEFAULT 0 CHECK (failed_logins >= 0),
  locked_until INTEGER
);
CREATE TABLE addresses (
  address_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  line       TEXT NOT NULL
);
CREATE TABLE products (
  product_id TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL CHECK (category IN ('Shoes','Handbags','Accessories')),
  subcategory TEXT NOT NULL,
  price_pkr  REAL NOT NULL CHECK (price_pkr > 0),
  sale_pkr   REAL CHECK (sale_pkr IS NULL OR (sale_pkr > 0 AND sale_pkr < price_pkr)),
  rating     REAL CHECK (rating BETWEEN 0 AND 5)
);
CREATE TABLE variants (
  variant_id TEXT PRIMARY KEY,                       -- product-colour-size
  product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  colour     TEXT NOT NULL,
  size       TEXT NOT NULL,
  on_hand    INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  reserved   INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  UNIQUE (product_id, colour, size),
  CHECK (reserved <= on_hand)
);
CREATE TABLE orders (
  order_id   TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES users(user_id),
  placed_at  INTEGER NOT NULL,
  stage      TEXT NOT NULL CHECK (stage IN ('Placed','Awaiting confirmation','Confirmed','Picking','Packed','Ready for dispatch','Dispatched','Out for delivery','Delivered','Cancelled','Returned')),
  currency   TEXT NOT NULL CHECK (currency IN ('PKR','GBP')),
  payment    TEXT NOT NULL CHECK (payment IN ('CARD','COD','BANK')),
  fx_rate    REAL NOT NULL CHECK (fx_rate > 0),
  goods      REAL NOT NULL, discounts REAL NOT NULL DEFAULT 0, delivery REAL NOT NULL DEFAULT 0, cod_fee REAL NOT NULL DEFAULT 0,
  total      REAL NOT NULL CHECK (total >= 0),
  tax        REAL NOT NULL CHECK (tax >= 0),
  CHECK (NOT (currency = 'GBP' AND payment IN ('COD','BANK')))
);
CREATE TABLE order_items (
  order_id   TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL REFERENCES variants(variant_id),
  qty        INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 5),
  PRIMARY KEY (order_id, variant_id)
);
CREATE TABLE order_status_log (
  log_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  stage    TEXT NOT NULL,
  changed_at INTEGER NOT NULL,
  changed_by TEXT NOT NULL
);
CREATE TABLE contact_log (
  contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  method   TEXT NOT NULL CHECK (method IN ('Phone','WhatsApp','Email')),
  outcome  TEXT NOT NULL,
  note     TEXT,
  contacted_at INTEGER NOT NULL
);
CREATE TABLE stock_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id TEXT NOT NULL REFERENCES variants(variant_id),
  kind TEXT NOT NULL CHECK (kind IN ('reserve','release','sale','return','receive','adjust')),
  qty INTEGER NOT NULL,
  order_id TEXT REFERENCES orders(order_id),
  at INTEGER NOT NULL
);
CREATE TABLE promo_codes (
  code TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN ('pct','fixed')), value REAL NOT NULL CHECK (value > 0),
  min_spend_pkr REAL NOT NULL DEFAULT 0, max_uses INTEGER, per_user INTEGER, valid_to INTEGER
);
CREATE TABLE exchange_rates (
  rate_id INTEGER PRIMARY KEY AUTOINCREMENT, pkr_per_gbp REAL NOT NULL CHECK (pkr_per_gbp > 0), margin_pct REAL NOT NULL DEFAULT 2, fetched_at INTEGER NOT NULL, source TEXT NOT NULL
);
CREATE TABLE notifications (
  note_id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT REFERENCES orders(order_id), channel TEXT NOT NULL CHECK (channel IN ('email','whatsapp')),
  recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE fire_checks (
  check_id INTEGER PRIMARY KEY AUTOINCREMENT, zone TEXT NOT NULL, item TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('Pass','Action')), note TEXT, checked_by TEXT NOT NULL, checked_at INTEGER NOT NULL
);
CREATE TABLE activity_log (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, actor TEXT NOT NULL, event TEXT NOT NULL
);
CREATE INDEX ix_orders_user ON orders(user_id);
CREATE INDEX ix_orders_stage ON orders(stage, placed_at);
CREATE INDEX ix_variants_product ON variants(product_id);
CREATE INDEX ix_status_order ON order_status_log(order_id);

-- Views used by the dashboards
CREATE VIEW v_available_stock AS
  SELECT v.variant_id, p.name, v.colour, v.size, v.on_hand, v.reserved, v.on_hand - v.reserved AS available FROM variants v JOIN products p USING (product_id);
CREATE VIEW v_low_stock AS SELECT * FROM v_available_stock WHERE available <= 5;
CREATE VIEW v_best_sellers AS
  SELECT p.product_id, p.name, SUM(i.qty) AS units FROM order_items i JOIN orders o USING (order_id) JOIN variants v USING (variant_id) JOIN products p USING (product_id)
  WHERE o.stage NOT IN ('Cancelled','Returned') GROUP BY p.product_id ORDER BY units DESC;
CREATE VIEW v_sales_by_day AS
  SELECT date(placed_at/1000,'unixepoch') AS day, COUNT(*) AS orders, ROUND(SUM(CASE currency WHEN 'GBP' THEN total*fx_rate ELSE total END),2) AS sales_pkr
  FROM orders WHERE stage NOT IN ('Cancelled','Returned') GROUP BY day;

-- Triggers: every stage change is logged; a cancelled or returned order cannot be moved again.
CREATE TRIGGER trg_order_stage_log AFTER UPDATE OF stage ON orders WHEN NEW.stage <> OLD.stage
BEGIN INSERT INTO order_status_log (order_id, stage, changed_at, changed_by) VALUES (NEW.order_id, NEW.stage, strftime('%s','now')*1000, 'system'); END;
CREATE TRIGGER trg_order_final BEFORE UPDATE OF stage ON orders WHEN OLD.stage IN ('Cancelled','Returned')
BEGIN SELECT RAISE(ABORT, 'Cancelled or returned orders cannot change stage'); END;
