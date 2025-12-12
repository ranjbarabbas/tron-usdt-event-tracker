const express = require("express");
const path = require("path");
const {
  getEvents,
  getLastBlock,
  resetDatabase
} = require("./db");

const app = express();

// Serve static files if needed
app.use(express.static(path.join(__dirname)));

// ---------------------
// Dashboard HTML Page
// ---------------------
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// ---------------------
// Dashboard Data API
// ---------------------
app.get("/dashboard-data", async (req, res) => {
  try {
    const events = await getEvents();
    const lastBlock = await getLastBlock();

    res.json({
      totalEvents: events.length,
      lastBlock: lastBlock || null,
      recentEvents: events.slice(-20).reverse()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// ---------------------
// Reset Database
// ---------------------
app.delete("/reset-db", async (req, res) => {
  try {
    await resetDatabase();
    res.json({ message: "Database has been reset." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset database" });
  }
});

// ---------------------
// Optional: plain events API
// ---------------------
app.get("/events", async (req, res) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to load events" });
  }
});

// ---------------------
// Reset DB and set custom start block
// ---------------------
app.post("/reset-db-start", express.json(), async (req, res) => {
  try {
    const { startBlock } = req.body; 
    if (!startBlock || isNaN(startBlock)) {
      return res.status(400).json({ error: "Invalid block number" });
    }

    await resetDatabase(); 

    global.CUSTOM_START_BLOCK = parseInt(startBlock);

    res.json({ message: `Database reset. Worker will start from block ${startBlock}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset database" });
  }
});

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
