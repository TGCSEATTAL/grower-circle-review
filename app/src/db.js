// Database layer — SQLite via Node's built-in node:sqlite (no native deps).
// Every table is region-aware where it matters so a new market is a data change, not a rebuild.
"use strict";
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES regions(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  pickup_location INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(region_id, name)
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  name TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(brand_id, name)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  preferred_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('dealer','admin')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','suspended')),
  region_id INTEGER REFERENCES regions(id),
  home_store_id INTEGER REFERENCES stores(id),
  password_hash TEXT,
  invite_token_hash TEXT,
  invite_expires_at TEXT,
  instagram TEXT NOT NULL DEFAULT '',
  discord TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Reward stock: the physical items handed out at pickup.
CREATE TABLE IF NOT EXISTS reward_items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL DEFAULT '',
  unit_cost_cents INTEGER NOT NULL DEFAULT 0,
  on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS reward_tiers (
  id INTEGER PRIMARY KEY,
  min_units INTEGER NOT NULL UNIQUE CHECK (min_units > 0),
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

-- Bill of materials: which stock items make up each tier.
CREATE TABLE IF NOT EXISTS tier_items (
  tier_id INTEGER NOT NULL REFERENCES reward_tiers(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES reward_items(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  PRIMARY KEY (tier_id, item_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  ref TEXT NOT NULL UNIQUE,
  dealer_id INTEGER NOT NULL REFERENCES users(id),
  store_id INTEGER NOT NULL REFERENCES stores(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  sale_date TEXT NOT NULL,
  sale_time TEXT NOT NULL DEFAULT '',
  receipt_number TEXT NOT NULL DEFAULT '',
  receipt_norm TEXT NOT NULL DEFAULT '',
  proof_type TEXT NOT NULL,
  proof_file TEXT,
  proof_mime TEXT,
  proof_hash TEXT,
  ba_name TEXT NOT NULL DEFAULT '',
  ba_time TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('submitted','under_review','flagged','more_info','approved','rejected','withdrawn','reversed')),
  admin_message TEXT NOT NULL DEFAULT '',
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_sub_dealer ON submissions(dealer_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sub_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_sub_receipt ON submissions(store_id, receipt_norm);
CREATE INDEX IF NOT EXISTS idx_sub_txn ON submissions(store_id, sale_date, sale_time, product_id);
CREATE INDEX IF NOT EXISTS idx_sub_hash ON submissions(proof_hash);

CREATE TABLE IF NOT EXISTS submission_flags (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  message TEXT NOT NULL,
  related_submission_id INTEGER REFERENCES submissions(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  cleared_by INTEGER REFERENCES users(id),
  cleared_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_flags_sub ON submission_flags(submission_id);

-- Append-only XP ledger. Reversals are negative rows; history is never rewritten.
CREATE TABLE IF NOT EXISTS xp_ledger (
  id INTEGER PRIMARY KEY,
  dealer_id INTEGER NOT NULL REFERENCES users(id),
  submission_id INTEGER REFERENCES submissions(id),
  month TEXT NOT NULL,             -- YYYY-MM of the sale (region local time)
  units INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_ledger_dealer ON xp_ledger(dealer_id, month);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY,
  dealer_id INTEGER NOT NULL REFERENCES users(id),
  month TEXT NOT NULL,
  tier_id INTEGER NOT NULL REFERENCES reward_tiers(id),
  status TEXT NOT NULL CHECK (status IN ('earned','prepared','ready','picked_up','expired','flagged')),
  pickup_store_id INTEGER REFERENCES stores(id),
  prepared_by INTEGER REFERENCES users(id),
  prepared_at TEXT,
  ready_at TEXT,
  fulfilled_by INTEGER REFERENCES users(id),
  picked_up_at TEXT,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(dealer_id, month)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES reward_items(id),
  delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('receive','adjust','pull','return')),
  reward_id INTEGER REFERENCES rewards(id),
  user_id INTEGER REFERENCES users(id),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_inv_item ON inventory_movements(item_id, created_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  detail TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);
`;

const DEFAULT_SETTINGS = {
  xp_per_unit: "10",
  submission_window_days: "7",     // how far back a sale can be logged
  allow_midmonth_fulfillment: "0", // 0 = rewards lock in when the month closes
  max_units_per_submission: "50",
};

function open(file) {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  const ins = db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) ins.run(k, v);
  return db;
}

// Run fn inside a transaction; nested calls join the outer one.
function tx(db, fn) {
  if (db.__inTx) return fn();
  db.exec("BEGIN IMMEDIATE");
  db.__inTx = true;
  try {
    const out = fn();
    db.exec("COMMIT");
    return out;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  } finally {
    db.__inTx = false;
  }
}

function getSetting(db, key) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? row.value : DEFAULT_SETTINGS[key];
}

function audit(db, actorId, action, entity, entityId, detail = {}) {
  db.prepare("INSERT INTO audit_log(actor_id, action, entity, entity_id, detail) VALUES (?,?,?,?,?)")
    .run(actorId ?? null, action, entity, entityId ?? null, JSON.stringify(detail));
}

module.exports = { open, tx, getSetting, audit, DEFAULT_SETTINGS };
