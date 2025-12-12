-- src/migrations/init.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS progress (
  contract TEXT PRIMARY KEY,
  last_block INTEGER
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  contract TEXT,
  block_number INTEGER,
  tx_hash TEXT,
  index_in_block INTEGER,
  event_name TEXT,
  raw TEXT,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_contract_block ON events(contract, block_number);
