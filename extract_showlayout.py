import re
import os
import shlex
import subprocess
import time
from datetime import datetime
from urllib.parse import parse_qs
import requests

# ============================================================================
# CONFIGURATION
# ============================================================================

ALLOWED_BUS_TYPES = [
    'AIR CONDITIONED',
    'AC SLEEPER',
    'AC SLEEPER SEATER',
    'NON AC SLEEPER SEATER',
    'NON AC SLEEPER',
    'NON AC LOWER BERTH SEATER',
    'AC LOWER BERTH SEATER',
    'ULTRA DELUXE',
    'VOLVO MULTI AXLE AC SEMI SLEEPER'
]

TIME_RANGE = ('18:00', '23:59')
MIN_SEATS_AVAILABLE = 1
TIME_INTERVAL = 60

LIST_OF_BOOKINGS = ['new1.txt', 'new2.txt']
# LIST_OF_BOOKINGS = ['new1.txt']


def _get_booking_date(curl_command):
    arguments = shlex.split(curl_command)
    form_data = arguments[arguments.index('--data-raw') + 1]
    date = parse_qs(form_data)['txtdeptDateOtrip'][0]
    return datetime.strptime(date, '%d/%m/%Y').strftime('%d/%m/%Y')


# ============================================================================
# METHOD 1: FETCH BUS DATA (Run CURL and store HTML response)
# ============================================================================

def fetch_bus_data(curl_file):
    """Run curl command and store HTML response."""
    print(f"Fetching bus data from {curl_file}")
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        curl_file = os.path.join(script_dir, curl_file)
        output_file = os.path.join(script_dir, 'bus_details.html')
        
        with open(curl_file, 'r', encoding='utf-8') as f:
            curl_command = f.read().strip()
        booking_date = _get_booking_date(curl_command)
        
        result = subprocess.run(curl_command, shell=True, stdout=subprocess.PIPE, 
                              stderr=subprocess.PIPE, timeout=30)
        
        if result.returncode == 0:
            with open(output_file, 'w', encoding='utf-8', errors='ignore') as f:
                f.write(result.stdout.decode('utf-8', errors='ignore'))
            print("← fetch_bus_data: End (Success)")
            return output_file, booking_date
        print("Retrived the bus data")
        return None
    except Exception:
        print("Error fetching bus data")
        return None


# ============================================================================
# METHOD 2: PROCESS AND FILTER DATA
# ============================================================================

def process_and_filter_data(html_file_path):
    """Extract and filter bus data through 5 filters."""
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except Exception as e:
        print("✗ Error reading HTML: {}".format(str(e)))
        return []
    
    # FILTER 1: Pattern Match - Extract showLayout() calls
    pattern = r"showLayOut\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)"
    matches = re.findall(pattern, html_content, re.DOTALL)
    
    filtered_buses = []
    for match in matches:
        parts = match[0].split(',')
        
        # FILTER 2: Data Structure - Must have minimum 7 parts
        if len(parts) < 7:
            continue
        
        bus_name = parts[2]
        time_str = parts[6]
        seat_number = match[2]
        
        # FILTER 3: Bus Type - Must be in allowed list
        if bus_name not in ALLOWED_BUS_TYPES:
            continue
        
        # FILTER 4: Time Range - Must be within configured hours
        try:
            from datetime import datetime as dt
            t = dt.strptime(time_str, "%H:%M").time()
            start = dt.strptime(TIME_RANGE[0], "%H:%M").time()
            end = dt.strptime(TIME_RANGE[1], "%H:%M").time()
            if start > end:
                if not (t >= start or t <= end):
                    continue
            else:
                if not (start <= t <= end):
                    continue
        except ValueError:
            continue
        
        # FILTER 5: Seat Availability - Must exceed minimum
        try:
            if int(seat_number) <= MIN_SEATS_AVAILABLE:
                continue
            if bus_name == 'ULTRA DELUXE' and int(seat_number) <= 2:
                continue
        except ValueError:
            continue
        
        filtered_buses.append({
            'bus_name': bus_name,
            'time': time_str,
            'seat_number': seat_number
        })
    
    return filtered_buses


# ============================================================================
# METHOD 3: SEND TELEGRAM NOTIFICATION
# ============================================================================

def send_telegram_notification(filtered_data, bot_token, chat_id, booking_date):
    """Send filtered data via Telegram bot."""
    print("→ send_telegram_notification: Start")
    if not bot_token or not chat_id:
        return False
    
    message = _format_telegram_message(filtered_data, booking_date)
    
    try:
        url = "https://api.telegram.org/bot{}/sendMessage".format(bot_token)
        data = {'chat_id': chat_id, 'text': message, 'parse_mode': 'Markdown'}
        response = requests.post(url, data=data, timeout=10)
        print("→ send_telegram_notification: Sent")
        return response.status_code == 200
    except Exception:
        print("→ send_telegram_notification: Not Sent")
        return False


def _format_telegram_message(buses, booking_date):
    """Format bus data for Telegram message."""
    message = f"🚌 *TNSTC Bus Update*\n\nDate: {booking_date}\n\n"
    if not buses:
        return message + "No buses available matching your criteria at this time."
    
    message += "Available buses:\nBus - Time - Seats\n"
    
    for bus in buses:
        message += "{} - {} - {}\n".format(
            bus['bus_name'], 
            bus['time'], 
            bus['seat_number']
        )
    
    message += "\n_Updated: {}_".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    return message


# ============================================================================
# MAIN: Orchestrates all methods on each interval
# ============================================================================

def main(bot_token=None, chat_id=None, check_interval=600):
    """Orchestrates all sub-methods on each interval."""
    print("TNSTC Bus Notifier - Interval: {} min\n".format(check_interval / 60))
    
    while True:
        try:
            print("[{}]".format(datetime.now().strftime("%H:%M:%S")))
            
            for curl_file in LIST_OF_BOOKINGS:
                # METHOD 1: Fetch bus data (curl + save HTML)
                fetched_data = fetch_bus_data(curl_file)
                if not fetched_data:
                    continue
                html_file, booking_date = fetched_data
                
                # METHOD 2: Process and filter data (5 filters)
                filtered_buses = process_and_filter_data(html_file)
                _display_results_table(filtered_buses)
                
                # METHOD 3: Send Telegram notification
                if filtered_buses:
                    send_telegram_notification(filtered_buses, bot_token, chat_id, booking_date)
            
            print("Sleeping for {} minutes...\n".format(check_interval/60))
            time.sleep(check_interval)
            
        except KeyboardInterrupt:
            print("\nShutdown")
            break
        except Exception as e:
            print("Error: {}".format(str(e)))
            time.sleep(check_interval)


def _display_results_table(buses):
    """Display filtered results."""
    if not buses:
        print("No buses found\n")
        return
    
    print("{:<40} {:<10} {:<10}".format("Bus Type", "Time", "Seats"))
    for bus in buses:
        print("{:<40} {:<10} {:<10}".format(bus['bus_name'], bus['time'], bus['seat_number']))
    # print("Total: {}\n".format(len(buses)))
# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    TELEGRAM_BOT_TOKEN = '8563966764:AAGWksngyRor5Fj93XvYDa4whm3sxtoAZ40'
    TELEGRAM_CHAT_ID = '6392154802'
    CHECK_INTERVAL = TIME_INTERVAL
    # TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
    # TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
    # CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', str(TIME_INTERVAL)))
    
    main(bot_token=TELEGRAM_BOT_TOKEN, chat_id=TELEGRAM_CHAT_ID, check_interval=CHECK_INTERVAL)



# Run the script directly with Python
# python extract_showlayout.py


# Run the script with Docker Compose
# docker compose up --build -d


# View the logs for the tnstc service in real-time
# docker compose logs -f tnstc
