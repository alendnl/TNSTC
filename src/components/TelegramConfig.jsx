import React, { useState } from 'react';
import { Send, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function TelegramConfig({ telegram, onUpdateTelegram }) {
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestNotification = async () => {
    if (!telegram.botToken || !telegram.chatId) {
      setTestResult({
        success: false,
        message: 'Please provide both Bot Token and Chat ID.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegram.botToken,
          chatId: telegram.chatId,
          message: '🚌 *TNSTC Pulse Test Message*\n\nYour Telegram bot configuration is working perfectly! You will receive instant notifications whenever a bus is found.'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: 'Test message delivered to Telegram successfully!'
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.details?.description || 'Failed to send test message'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Network error: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-sky-400" />
            <span>Telegram Notifications</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Instant alerts dispatched directly to your Telegram chat when seats are detected.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={telegram.enabled}
            onChange={(e) => onUpdateTelegram({ ...telegram, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
          <span className="text-xs font-semibold text-zinc-300">
            {telegram.enabled ? 'Enabled' : 'Muted'}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Bot Token */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Telegram Bot Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={telegram.botToken || ''}
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              onChange={(e) => onUpdateTelegram({ ...telegram, botToken: e.target.value })}
              className="w-full pl-3 pr-9 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Chat ID */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Target Chat ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={telegram.chatId || ''}
              placeholder="e.g. 6392154802"
              onChange={(e) => onUpdateTelegram({ ...telegram, chatId: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testing || !telegram.botToken || !telegram.chatId}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-zinc-950 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Test Bot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification options */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={telegram.notifyOnlyWhenFound}
            onChange={(e) => onUpdateTelegram({ ...telegram, notifyOnlyWhenFound: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-sky-500/20"
          />
          <span className="text-xs text-zinc-300">
            Send notification only when matching seats are found (recommended)
          </span>
        </label>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
            testResult.success
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
}

