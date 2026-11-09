# TNSTC Bus Notifier

Automated Telegram notifications for TNSTC buses with multi-filter search.

## Quick Start

```bash
pip install requests
python extract_showlayout.py
```

## Run with Docker

Docker and Docker Compose are required.

1. Copy `.env.example` to `.env` and set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
2. Start the notifier:

```bash
docker compose up --build -d
```

View the logs:

```bash
docker compose logs -f tnstc
```

Stop it with:

```bash
docker compose down
```

Set `CHECK_INTERVAL` in `.env` to change the polling interval in seconds. The generated `bus_details.html` remains available in the project directory.

## Configuration

Set `LIST_OF_BOOKINGS` in `extract_showlayout.py` to the curl command files to run in order, for example `['new1.txt', 'new2.txt']`. Add more `new*.txt` files to the list as needed; rebuild the Docker image after adding files.
Telegram messages use the `txtdeptDateOtrip` date from each file's `--data-raw` form data.

Set these environment variables. For Docker, put them in `.env` as described below; for a direct local run, export them in the shell:

```bash
export TELEGRAM_BOT_TOKEN='your_token_here'
export TELEGRAM_CHAT_ID='your_chat_id_here'
export CHECK_INTERVAL=60
```

## Architecture

**Main Loop** calls 3 methods every 10 minutes:

1. **fetch_bus_data()** - Executes curl command, saves HTML response
2. **process_and_filter_data()** - Applies 5 filters:
   - Filter 1: Pattern match (showLayout() extraction)
   - Filter 2: Data structure validation (7+ parts)
   - Filter 3: Bus type (9 premium types)
   - Filter 4: Time range (20:00-23:50)
   - Filter 5: Seat availability (>1 seat)
3. **send_telegram_notification()** - Sends filtered results via Telegram API

## Filters

- **Bus Types**: AC, AC Sleeper, Ultra Deluxe, Volvo Multi Axle, etc.
- **Time**: 20:00 to 23:50
- **Seats**: More than 1 available

## Running in Background

```bash
nohup python extract_showlayout.py > output.log 2>&1 &
```

Stop with: `pkill -f extract_showlayout.py`

## Deployment Options (Free)

**Replit** (Recommended): Upload code → Run → Enable "Always On"  
**PythonAnywhere**: Upload → Schedule task  
**Your Computer**: Run in background with `nohup`

## Files

- `extract_showlayout.py` - Main script
- `bus_details_curl.txt` - TNSTC API curl command
- `bus_details.html` - Auto-generated response cache
