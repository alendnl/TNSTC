// Serverless API endpoint for TNSTC bus lookup and Telegram alerts

const DEFAULT_ALLOWED_BUS_TYPES = [
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

function parseCurl(rawCurl) {
  if (!rawCurl || typeof rawCurl !== 'string') {
    throw new Error('Curl command must be a non-empty string');
  }

  const cleaned = rawCurl.replace(/\\\r?\n/g, ' ').trim();

  let url = '';
  const urlMatch = cleaned.match(/--url\s+(?:'([^']+)'|"([^"]+)"|(\S+))/i) ||
                    cleaned.match(/curl\s+(?:'([^']+)'|"([^"]+)"|(\S+))/i);
  if (urlMatch) {
    url = urlMatch[1] || urlMatch[2] || urlMatch[3] || '';
  }
  if (!url || !url.startsWith('http')) {
    const httpMatch = cleaned.match(/https?:\/\/[^\s'"]+/);
    if (httpMatch) url = httpMatch[0];
  }

  const headers = {};
  const headerRegex = /-H\s+(?:'([^']+)'|"([^"]+)")/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(cleaned)) !== null) {
    const headerStr = hMatch[1] || hMatch[2];
    const colonIdx = headerStr.indexOf(':');
    if (colonIdx > 0) {
      headers[headerStr.slice(0, colonIdx).trim()] = headerStr.slice(colonIdx + 1).trim();
    }
  }

  const cookieMatch = cleaned.match(/(?:-b|--cookie)\s+(?:'([^']+)'|"([^"]+)")/);
  if (cookieMatch) {
    headers['Cookie'] = cookieMatch[1] || cookieMatch[2];
  }

  let body = '';
  const dataMatch = cleaned.match(/(?:--data-raw|--data-binary|--data|-d)\s+(?:'([\s\S]*?)'|"([\s\S]*?)")/);
  if (dataMatch) {
    body = dataMatch[1] || dataMatch[2] || '';
  }

  let bookingDate = '';
  let startPlace = '';
  let endPlace = '';

  if (body) {
    try {
      const params = new URLSearchParams(body);
      bookingDate = params.get('txtdeptDateOtrip') || params.get('txtJourneyDate') || '';
      startPlace = params.get('hiddenStartPlaceName') || params.get('matchStartPlace') || '';
      endPlace = params.get('hiddenEndPlaceName') || params.get('matchEndPlace') || '';
    } catch {
      // ignore
    }
  }

  return { url, headers, body, bookingDate, startPlace, endPlace };
}

function isTimeInRange(timeStr, startTime, endTime) {
  if (!timeStr || !startTime || !endTime) return true;
  const toMinutes = (s) => {
    const [h, m] = s.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const t = toMinutes(timeStr);
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start > end) {
    return t >= start || t <= end;
  }
  return t >= start && t <= end;
}

function processAndFilterHtml(htmlContent, filters) {
  const {
    allowedBusTypes = DEFAULT_ALLOWED_BUS_TYPES,
    startTime = '18:00',
    endTime = '23:59',
    minSeats = 1,
    enforceUltraDeluxeMin = true
  } = filters;

  const pattern = /showLayOut\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
  const buses = [];
  let totalExtracted = 0;

  let match;
  while ((match = pattern.exec(htmlContent)) !== null) {
    totalExtracted++;
    const parts = match[1].split(',');
    if (parts.length < 7) continue;

    const serviceId = parts[0]?.trim() || '';
    const busName = parts[2]?.trim() || '';
    const timeStr = parts[6]?.trim() || '';
    const seatNumber = parseInt(match[3]?.trim(), 10);
    const startPlace = parts[7]?.trim() || '';
    const endPlace = parts[9]?.trim() || '';
    const tripCode = parts[10]?.trim() || '';

    if (!allowedBusTypes.includes(busName)) continue;
    if (!isTimeInRange(timeStr, startTime, endTime)) continue;
    if (isNaN(seatNumber) || seatNumber <= minSeats) continue;
    if (enforceUltraDeluxeMin && busName === 'ULTRA DELUXE' && seatNumber <= 2) continue;

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

  return { buses, totalExtracted };
}

function formatTelegramMessage(buses, bookingDate) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const timestamp = new Date().toLocaleTimeString();
  const logs = [];
  const addLog = (msg, level = 'info') => {
    logs.push({ time: new Date().toLocaleTimeString(), message: msg, level });
  };

  try {
    const {
      bookings = [],
      singleBooking = null,
      filters = {},
      telegram = {}
    } = req.body || {};

    // Normalize bookings list
    const targets = singleBooking ? [singleBooking] : bookings.filter((b) => b && b.active !== false);

    if (targets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active bookings provided for lookup.',
        logs
      });
    }

    const results = [];
    let totalBusesFound = 0;

    for (let i = 0; i < targets.length; i++) {
      const item = targets[i];
      const itemTitle = item.name || `Route ${i + 1}`;

      try {
        const parsed = parseCurl(item.curlCommand);
        if (!parsed.url) {
          throw new Error('Missing URL in cURL command');
        }

        const bookingDate = parsed.bookingDate || item.date || 'Date N/A';
        const route = parsed.startPlace && parsed.endPlace
          ? `${parsed.startPlace} → ${parsed.endPlace}`
          : item.route || itemTitle;

        const response = await fetch(parsed.url, {
          method: 'POST',
          headers: parsed.headers,
          body: parsed.body,
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const { buses, totalExtracted } = processAndFilterHtml(html, {
          allowedBusTypes: filters.allowedBusTypes,
          startTime: filters.startTime,
          endTime: filters.endTime,
          minSeats: Number(filters.minSeats ?? 1),
          enforceUltraDeluxeMin: filters.enforceUltraDeluxeMin !== false
        });

        totalBusesFound += buses.length;

        if (buses.length > 0) {
          addLog(`${route} (${bookingDate}): ${buses.length} matching bus(es) found! (${totalExtracted} checked)`, 'success');
        } else {
          addLog(`${route} (${bookingDate}): ${totalExtracted} checked → 0 matched`, 'info');
        }

        let telegramSent = false;
        let telegramError = null;

        // Telegram Notification
        if (telegram.enabled && telegram.botToken && telegram.chatId) {
          const shouldSend = !telegram.notifyOnlyWhenFound || buses.length > 0;
          if (shouldSend) {
            const tgMessage = formatTelegramMessage(buses, bookingDate);
            try {
              const tgRes = await fetch(`https://api.telegram.org/bot${telegram.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: telegram.chatId,
                  text: tgMessage,
                  parse_mode: 'Markdown'
                })
              });
              const tgData = await tgRes.json();
              if (tgRes.ok && tgData.ok) {
                telegramSent = true;
                addLog(`Telegram alert delivered (${buses.length} bus(es))`, 'success');
              } else {
                telegramError = tgData.description || 'API error';
                addLog(`Telegram alert failed: ${telegramError}`, 'error');
              }
            } catch (tgErr) {
              telegramError = tgErr.message;
              addLog(`Telegram error: ${tgErr.message}`, 'error');
            }
          }
        }

        results.push({
          bookingId: item.id || `b-${i}`,
          bookingName: itemTitle,
          bookingDate,
          route,
          totalExtracted,
          matchedCount: buses.length,
          buses,
          telegramSent,
          telegramError
        });
      } catch (itemErr) {
        addLog(`${itemTitle}: Check failed (${itemErr.message})`, 'error');
        results.push({
          bookingId: item.id || `b-${i}`,
          bookingName: itemTitle,
          error: itemErr.message,
          buses: [],
          matchedCount: 0
        });
      }
    }

    return res.status(200).json({
      success: true,
      timestamp,
      totalBusesFound,
      results,
      logs
    });
  } catch (error) {
    addLog(`Global handler error: ${error.message}`, 'error');
    return res.status(500).json({
      success: false,
      error: error.message,
      logs
    });
  }
}

