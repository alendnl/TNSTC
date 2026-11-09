import React from 'react';
import { Layers, Bus, Clock, Send } from 'lucide-react';

export default function QuickStats({
  activeCurlsCount,
  totalCurlsCount,
  lastMatchesCount,
  lastCheckTime,
  telegramEnabled
}) {
  const stats = [
    {
      title: 'Active Bookings',
      value: `${activeCurlsCount} / ${totalCurlsCount}`,
      subtitle: `${activeCurlsCount} route(s) in lookup`,
      icon: Layers,
      color: 'text-zinc-600 dark:text-zinc-300'
    },
    {
      title: 'Matching Buses',
      value: lastMatchesCount !== null ? lastMatchesCount : '—',
      subtitle: lastMatchesCount !== null ? (lastMatchesCount > 0 ? 'Seats detected' : '0 matching seats') : 'Pending scan',
      icon: Bus,
      color: lastMatchesCount > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
    },
    {
      title: 'Last Looked Up',
      value: lastCheckTime || 'Not run yet',
      subtitle: 'Auto-refreshes on cycle',
      icon: Clock,
      color: 'text-zinc-600 dark:text-zinc-300'
    },
    {
      title: 'Telegram Alert',
      value: telegramEnabled ? 'Enabled' : 'Muted',
      subtitle: telegramEnabled ? 'Alerts active' : 'Notifications off',
      icon: Send,
      color: telegramEnabled ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-400 dark:text-zinc-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</span>
              <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className={`text-lg sm:text-xl font-semibold tracking-tight truncate font-mono ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
