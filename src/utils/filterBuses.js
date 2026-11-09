export const DEFAULT_ALLOWED_BUS_TYPES = [
  'AIR CONDITIONED',
  'AC SLEEPER',
  'AC SLEEPER SEATER',
  'NON AC SLEEPER SEATER',
  'NON AC SLEEPER',
  'NON AC LOWER BERTH SEATER',
  'AC LOWER BERTH SEATER',
  'ULTRA DELUXE',
  'VOLVO MULTI AXLE AC SEMI SLEEPER'
];

export const ALL_KNOWN_BUS_TYPES = [
  ...DEFAULT_ALLOWED_BUS_TYPES,
  'DELUXE 3X2',
  'DELUXE 2X2',
  'POINT TO POINT'
];

/**
 * Checks if a given "HH:MM" string falls within [startTime, endTime].
 * Handles overnight time ranges (e.g., "22:00" to "05:00").
 */
export function isTimeInRange(timeStr, startTime, endTime) {
  if (!timeStr || !startTime || !endTime) return true;

  const toMinutes = (s) => {
    const parts = s.split(':').map((v) => parseInt(v, 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
    return parts[0] * 60 + parts[1];
  };

  const t = toMinutes(timeStr);
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (start > end) {
    // Overnight window: e.g. 21:00 to 06:00
    return t >= start || t <= end;
  }
  return t >= start && t <= end;
}

/**
 * Extracts and filters bus schedules from TNSTC HTML content.
 */
export function processAndFilterHtml(htmlContent, options = {}) {
  const {
    allowedBusTypes = DEFAULT_ALLOWED_BUS_TYPES,
    startTime = '18:00',
    endTime = '23:59',
    minSeats = 1,
    enforceUltraDeluxeMin = true
  } = options;

  if (!htmlContent || typeof htmlContent !== 'string') {
    return { buses: [], totalExtracted: 0, rejectedCounts: { type: 0, time: 0, seats: 0 } };
  }

  // FILTER 1: Pattern Match
  const pattern = /showLayOut\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
  const buses = [];
  let totalExtracted = 0;
  const rejectedCounts = { type: 0, time: 0, seats: 0 };

  let match;
  while ((match = pattern.exec(htmlContent)) !== null) {
    totalExtracted++;
    const parts = match[1].split(',');

    // FILTER 2: Data Structure validation (min 7 parts)
    if (parts.length < 7) {
      continue;
    }

    const serviceId = parts[0]?.trim() || '';
    const busName = parts[2]?.trim() || '';
    const timeStr = parts[6]?.trim() || '';
    const seatNumber = parseInt(match[3]?.trim(), 10);
    const startPlace = parts[7]?.trim() || '';
    const endPlace = parts[9]?.trim() || '';
    const tripCode = parts[10]?.trim() || '';

    // FILTER 3: Bus Type Filter
    if (!allowedBusTypes.includes(busName)) {
      rejectedCounts.type++;
      continue;
    }

    // FILTER 4: Time Range Filter
    if (!isTimeInRange(timeStr, startTime, endTime)) {
      rejectedCounts.time++;
      continue;
    }

    // FILTER 5: Seat Availability Filter
    if (isNaN(seatNumber) || seatNumber <= minSeats) {
      rejectedCounts.seats++;
      continue;
    }

    if (enforceUltraDeluxeMin && busName === 'ULTRA DELUXE' && seatNumber <= 2) {
      rejectedCounts.seats++;
      continue;
    }

    buses.push({
      serviceId,
      bus_name: busName,
      time: timeStr,
      seat_number: seatNumber,
      startPlace,
      endPlace,
      tripCode
    });
  }

  return {
    buses,
    totalExtracted,
    rejectedCounts
  };
}

/**
 * Format telegram markdown message matching original format
 */
export function formatTelegramMessage(buses, bookingDate) {
  let message = `🚌 *TNSTC Bus Update*\n\nDate: ${bookingDate}\n\n`;
  if (!buses || buses.length === 0) {
    return message + 'No buses available matching your criteria at this time.';
  }

  message += 'Available buses:\nBus - Time - Seats\n';

  for (const bus of buses) {
    message += `${bus.bus_name} - ${bus.time} - ${bus.seat_number}\n`;
  }

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
  message += `\n_Updated: ${dateStr}_`;

  return message;
}
