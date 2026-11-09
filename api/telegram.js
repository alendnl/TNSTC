export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { botToken, chatId, message } = req.body || {};

    if (!botToken || !chatId) {
      return res.status(400).json({ error: 'Missing botToken or chatId' });
    }

    const textToSend = message || '🔔 *TNSTC Test Notification*\n\nYour Telegram integration is working perfectly! You will receive bus alerts here.';

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textToSend,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      return res.status(response.status || 400).json({
        error: data.description || 'Telegram API returned an error',
        details: data
      });
    }

    return res.status(200).json({ success: true, result: data });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to send Telegram message',
      message: error.message
    });
  }
}

