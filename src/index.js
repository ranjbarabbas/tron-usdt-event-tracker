require('dotenv').config();
require("./server");   // start API server
const express = require('express');
const { pollLoop } = require('./usdtWorkerByTronGrid');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Show last processed block
app.get('/last-block', (req, res) => {
  db.get("SELECT last_block FROM state WHERE id = 1", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ last_block: row?.last_block || null });
  });
});

// List last 50 USDT events
app.get('/events', (req, res) => {
  db.all(
    "SELECT * FROM usdt_events ORDER BY id DESC LIMIT 500",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);

  // start worker
  pollLoop().catch(err => console.error("Worker crashed:", err));
});
