/**
 * SQLite DB helper
 */

const { log } = require('console');
const e = require('express');
const { send } = require('express/lib/response');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const TronWeb = require('tronweb').TronWeb;
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io' // free public endpoint
});


const dbPath = path.join(__dirname, '..', 'data.sqlite');

const db = new sqlite3.Database(dbPath);


// Create tables if not exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_block INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usdt_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      txid TEXT,
      sender TEXT,
      receiver TEXT,
      amount TEXT,
      block_number INTEGER,
      timestamp INTEGER,
        event_name TEXT
    )
  `);
});

module.exports = {
  db,

  getLastBlock() {
    return new Promise((resolve, reject) => {
      db.get(`SELECT last_block FROM state WHERE id = 1`, (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.last_block : null);
      });
    });
  },

  saveLastBlock(block) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO state (id, last_block)
        VALUES (1, ?)
        ON CONFLICT(id) DO UPDATE SET last_block = excluded.last_block
        `,
        [block],
        err => (err ? reject(err) : resolve())
      );
    });
  },

  insertEvent(ev) {
    return new Promise((resolve, reject) => {
      const txid = ev.transaction_id;
      //     from: ,

      const sender = tronWeb.address.fromHex(ev.result.from);
      const receiver = tronWeb.address.fromHex(ev.result.to);
      const amount = ev.result?.value || ev.result?.["2"];
      const block_number = ev.block_number;
      const timestamp = ev.block_timestamp;
      db.run(
        `
        INSERT INTO usdt_events (txid, sender, receiver, amount, block_number, timestamp, event_name)
        VALUES (?, ?, ?, ?, ?, ?,?)
        `,
        [
          txid,
          sender,
          receiver,
          amount,
          block_number,
          timestamp,
          ev.event_name
        ],
        err => (err ? reject(err) : resolve())
      );
    });
  },

  // Read all events from DB
  getEvents() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, txid, sender, receiver, amount, block_number, timestamp, event_name FROM usdt_events ORDER BY id ASC`,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  },
  resetDatabase() {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`DELETE FROM usdt_events`, err => {
          if (err) return reject(err);
          db.run(`UPDATE state SET last_block = NULL WHERE id = 1`, err2 => {
            if (err2) return reject(err2);
            console.log("🗑️ Database reset successfully");
            resolve(true);
          });
        });
      });
    });
  }


};
