// Webhook / Cron handler for background lookups when the local machine is powered off.
// Can be called via Vercel Cron or external services like cron-job.org, EasyCron, or GitHub Actions.

import searchHandler from './search.js';

export default async function handler(req, res) {
  // Allow GET or POST for cron triggers
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // If query parameters or body provide config, use them, otherwise use environment variables
  const botToken = req.query.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = req.query.chatId || process.env.TELEGRAM_CHAT_ID;
  const curlCommand = req.body?.curlCommand || process.env.TNSTC_CURL_1;

  if (!curlCommand) {
    return res.status(200).json({
      status: 'idle',
      message: 'TNSTC Cron Endpoint ready. To execute automated background checks, send your bookings in the POST body or configure TNSTC_CURL_1 in your Vercel Environment Variables.'
    });
  }

  // Synthesize a search request
  const mockReq = {
    method: 'POST',
    body: {
      bookings: req.body?.bookings || [{ curlCommand, name: 'Background Cron Lookup', active: true }],
      filters: req.body?.filters || {
        allowedBusTypes: [
          'AIR CONDITIONED',
          'AC SLEEPER',
          'AC SLEEPER SEATER',
          'NON AC SLEEPER SEATER',
          'NON AC SLEEPER',
          'NON AC LOWER BERTH SEATER',
          'AC LOWER BERTH SEATER',
          'ULTRA DELUXE',
          'VOLVO MULTI AXLE AC SEMI SLEEPER'
        ],
        startTime: req.query.startTime || '18:00',
        endTime: req.query.endTime || '23:59',
        minSeats: 1
      },
      telegram: {
        enabled: Boolean(botToken && chatId),
        botToken,
        chatId,
        notifyOnlyWhenFound: true
      }
    }
  };

  return searchHandler(mockReq, res);
}

