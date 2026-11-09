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
    <div className="rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Telegram Notifications</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Instant alerts dispatched directly to your Telegram chat.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={telegram.enabled}
            onChange={(e) => onUpdateTelegram({ ...telegram, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {telegram.enabled ? 'Enabled' : 'Muted'}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Bot Token */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Telegram Bot Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={telegram.botToken || ''}
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              onChange={(e) => onUpdateTelegram({ ...telegram, botToken: e.target.value })}
              className="w-full pl-3 pr-9 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Chat ID */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Target Chat ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={telegram.chatId || ''}
              placeholder="e.g. 6392154802"
              onChange={(e) => onUpdateTelegram({ ...telegram, chatId: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testing || !telegram.botToken || !telegram.chatId}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
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
            className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-600 focus:ring-emerald-500/20"
          />
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Send notification only when matching seats are found (recommended)
          </span>
        </label>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
            testResult.success
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
}
