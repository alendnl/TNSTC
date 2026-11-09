# TNSTC Bus Tracker & Telegram Notifier

Modern, lightweight web application for tracking Tamil Nadu State Transport Corporation (TNSTC) bus availability in real-time with multi-criteria filtering and instant Telegram alerts.

Built with **React + Vite + Tailwind CSS** frontend and **Vercel Serverless Functions (`/api`)**. Zero heavy backend to maintain, zero Docker required.

---

## Key Features

- **Cross-Device State Synchronization (Laptop <-> Mobile)**:
  - Centralized state persistence via `/api/state`.
  - When you enable routes or start searching on your laptop, opening the site on your phone reflects the exact same active status and settings.
  - Automatically synchronizes across local network in dev mode, and seamlessly pairs with free Vercel KV (Upstash Redis) in cloud production.
- **Frontend Configuration Panel**:
  - **Dynamic Bus Types**: Toggle AC Sleeper, Ultra Deluxe, Non-AC Sleeper, Deluxe 3x2, etc., with one click or add custom types.
  - **Departure Time Range**: Custom time intervals (e.g. 18:00 to 23:59 or overnight ranges like 20:00 to 04:00).
  - **Seat Availability**: Set minimum seats required and strict Ultra Deluxe rules (> 2 seats).
  - **Interval Adjustment**: Choose from 30s, 60s, 2m, 5m, or 10m search intervals.
- **cURL Booking Manager**:
  - Add, edit, or remove booking requests on the fly by pasting raw `curl` commands directly from Chrome DevTools.
  - Automatically parses departure place, destination, booking date, and cookies.
  - Toggle specific routes on or off without deleting them.
- **Start / Stop Controls**:
  - Real-time countdown timer until next scan.
  - Immediate manual "Check Now" button.
- **Live Terminal Console**:
  - Embedded real-time execution logs with status levels (`[INFO]`, `[SUCCESS]`, `[WARN]`, `[ERROR]`).
  - Auto-scroll lock toggle, clear logs, and download log file.
- **Telegram Notifications**:
  - Built-in test bot notification button.
  - Configurable to send alerts only when seats are detected.
- **24/7 Cloud Background Running**:
  - Solves the problem of keeping searches active even when your laptop/computer is powered off.
  - Triggerable via Vercel Cron, GitHub Actions (workflow included), or free external web cron (e.g. [cron-job.org](https://cron-job.org)).

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server (runs on http://localhost:5188)
npm run dev

# 3. Build for production
npm run build
```

---

## Deploy to Vercel (1-Click & 100% Free)

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Complete redesign: Vite + React + Vercel Serverless"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select this GitHub repository. Vercel automatically detects the Vite framework and builds `dist/` while exposing the `/api` directory as serverless endpoints.
4. In Vercel Project Settings &rarr; **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB connection string (e.g. `mongodb+srv://...`)
   - `TELEGRAM_BOT_TOKEN` (optional if configured in UI)
   - `TELEGRAM_CHAT_ID` (optional if configured in UI)
5. Click **Deploy**! Your site is live at `https://<your-project>.vercel.app`.

---

## Running 24/7 When Your Computer Is Powered Off

A browser tab running on your laptop stops when the laptop is closed or turned off. To keep automated searches running in the cloud 24/7:

### Option 1: Free Cron-Job.org (Recommended & Easiest)
1. Sign up for free at [cron-job.org](https://cron-job.org).
2. Create a new cron job scheduled for **every 5 or 10 minutes**.
3. Set the target URL to:
   ```
   https://<your-app>.vercel.app/api/cron
   ```
4. Save! Your Vercel cloud function will execute every 10 minutes and ping your Telegram bot whenever seats open up, even if you are asleep and your computer is off!

### Option 2: GitHub Actions (Built into this repository)
1. Go to your GitHub repository &rarr; **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
2. Add a secret named `VERCEL_APP_URL` with your Vercel deployment URL (e.g. `https://<your-app>.vercel.app`).
3. The included workflow at `.github/workflows/bus_tracker.yml` will automatically ping your Vercel search endpoint every 10 minutes around the clock.

---

## Project Structure

```
├── api/
│   ├── search.js          # Vercel Serverless Function: fetches TNSTC, parses HTML, applies filters
│   ├── telegram.js        # Vercel Serverless Function: verifies credentials & sends Telegram alerts
│   └── cron.js            # Vercel Serverless Function: 24/7 cloud scheduler webhook
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Header, Start/Stop toggle, Countdown timer
│   │   ├── QuickStats.jsx      # Metrics cards
│   │   ├── BookingManager.jsx  # cURL paste, route toggling, auto-parser
│   │   ├── FilterSettings.jsx  # Bus types, time window, seat requirements
│   │   ├── TelegramConfig.jsx  # Bot token, chat ID, live bot test
│   │   ├── ResultsTable.jsx    # Matching buses cards & seat badges
│   │   ├── LiveLogs.jsx        # Terminal console logs
│   │   └── CloudCronModal.jsx  # 24/7 cloud setup guide
│   ├── utils/
│   │   ├── curlParser.js       # Extracts URLs, headers, cookies, dates from bash cURL
│   │   ├── filterBuses.js      # 5-stage filter matching original logic
│   │   └── storage.js          # LocalStorage persistence for user config & curls
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js         # Vite config with local dev server API middleware
├── vercel.json            # Vercel build & route rules
├── package.json
└── README.md
```
