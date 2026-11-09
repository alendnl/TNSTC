/**
 * Parses a raw cURL command copied from browser developer tools.
 * Extracts the target URL, HTTP headers, Cookies, POST body,
 * and travel metadata (booking date, departure, destination).
 */
export function parseCurlCommand(rawCurl) {
  if (!rawCurl || typeof rawCurl !== 'string') {
    throw new Error('Please provide a valid cURL command.');
  }

  // Normalize line endings and joined lines
  const cleaned = rawCurl.replace(/\\\r?\n/g, ' ').trim();

  // Extract URL
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

  if (!url) {
    throw new Error('Could not identify a valid URL in the cURL command.');
  }

  // Extract Headers
  const headers = {};
  const headerRegex = /-H\s+(?:'([^']+)'|"([^"]+)")/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(cleaned)) !== null) {
    const headerStr = hMatch[1] || hMatch[2];
    const colonIdx = headerStr.indexOf(':');
    if (colonIdx > 0) {
      const key = headerStr.slice(0, colonIdx).trim();
      const val = headerStr.slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }

  // Extract Cookie (-b or --cookie)
  const cookieMatch = cleaned.match(/(?:-b|--cookie)\s+(?:'([^']+)'|"([^"]+)")/);
  if (cookieMatch) {
    headers['Cookie'] = cookieMatch[1] || cookieMatch[2];
  }

  // Extract POST body (--data-raw, --data, -d, --data-binary)
  let body = '';
  const dataMatch = cleaned.match(/(?:--data-raw|--data-binary|--data|-d)\s+(?:'([\s\S]*?)'|"([\s\S]*?)")/);
  if (dataMatch) {
    body = dataMatch[1] || dataMatch[2] || '';
  }

  // Extract metadata from POST form fields
  let bookingDate = '';
  let startPlace = '';
  let endPlace = '';

  if (body) {
    try {
      const params = new URLSearchParams(body);
      bookingDate = params.get('txtdeptDateOtrip') || params.get('txtJourneyDate') || '';
      startPlace = params.get('hiddenStartPlaceName') || params.get('matchStartPlace') || params.get('selectStartPlace') || '';
      endPlace = params.get('hiddenEndPlaceName') || params.get('matchEndPlace') || params.get('selectEndPlace') || '';
    } catch {
      // ignore
    }
  }

  // Format date if possible
  let formattedDate = bookingDate;
  if (bookingDate && bookingDate.includes('/')) {
    const [d, m, y] = bookingDate.split('/');
    if (d && m && y) {
      formattedDate = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }

  return {
    url,
    headers,
    body,
    bookingDate: formattedDate || 'Unknown Date',
    startPlace: startPlace || 'Departure',
    endPlace: endPlace || 'Destination',
    hasCookie: Boolean(headers['Cookie'] || headers['cookie'])
  };
}

