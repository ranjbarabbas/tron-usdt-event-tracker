# TRON USDT Event Tracker

A simple Node.js project to track USDT (Tether) transfers on the TRON blockchain using the TRONGrid API.  
It includes a Worker to fetch transactions, a SQLite database to store them, and a dashboard to monitor events.

---

## 📁 Project Structure

```
tron-events/
│
├── src/
│   ├── db.js             # SQLite database management
│   ├── workerTx.js       # Worker to fetch USDT events from TRONGrid
│   ├── index.js          # Entry point to start worker & server
│   ├── server.js         # Express server for API and dashboard
│   ├── dashboard.html    # HTML dashboard for monitoring events
│
├── data.sqlite           # SQLite database file (created automatically)
├── package.json
├── .env                  # Environment variables (like PORT)
├── README.md
```

---

## ⚡ Features

- Fetch USDT Transfer events from TRON blockchain via TRONGrid
- Store events in SQLite database
- Track last processed block to continue after restart
- Dashboard with:
  - Total events count
  - Last processed block
  - Latest 20 transactions
  - Reset database button
- Auto-refresh dashboard every 10 seconds

---

## 🛠 Installation

1. Clone the repository:

```bash
git clone https://github.com/ranjbarabbas/tron-usdt-event-tracker.git
cd tron-events
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional, default port is 3000):

```env
PORT=3000
```

---

## 🚀 Running the Project

Start the server and the worker:

```bash
npm start
```

- Worker fetches USDT events continuously from the last processed block.
- Server provides dashboard and API endpoints.

---

## 🌐 Dashboard

Visit the dashboard:

```
http://localhost:3000/dashboard
```

- Shows total events
- Shows last processed block
- Shows latest 20 USDT transactions
- Includes a "Reset Database" button

---

## 📦 API Endpoints

| Method | Endpoint        | Description                        |
|--------|----------------|------------------------------------|
| GET    | /dashboard-data | JSON data for dashboard            |
| GET    | /events         | List all stored events (JSON)      |
| DELETE | /reset-db       | Clear the database                 |

---

## 📂 Database Schema

### `usdt_events`

| Column        | Type    |
|---------------|---------|
| id            | INTEGER PRIMARY KEY AUTOINCREMENT |
| txid          | TEXT    |
| sender        | TEXT    |
| receiver      | TEXT    |
| amount        | TEXT    |
| block_number  | INTEGER |
| timestamp     | INTEGER |

### `state`

| Column       | Type    |
|--------------|---------|
| id           | INTEGER PRIMARY KEY |
| last_block   | INTEGER |

---

## 💡 Notes

- Worker automatically resumes from the last processed block stored in the database.
- Dashboard auto-refreshes every 10 seconds.
- Database reset clears both events and last processed block.

---

## 🔧 License

MIT License

