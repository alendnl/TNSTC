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
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Matching Buses',
      value: lastMatchesCount !== null ? lastMatchesCount : '—',
      subtitle: lastMatchesCount !== null ? (lastMatchesCount > 0 ? 'Seats available!' : 'No matching seats') : 'Pending first scan',
      icon: Bus,
      color: lastMatchesCount > 0 ? 'text-emerald-400' : 'text-zinc-400',
      bgColor: lastMatchesCount > 0 ? 'bg-emerald-500/10' : 'bg-zinc-800/40'
    },
    {
      title: 'Last Looked Up',
      value: lastCheckTime || 'Not run yet',
      subtitle: 'Auto-refreshes on cycle',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      title: 'Telegram Alert',
      value: telegramEnabled ? 'Enabled' : 'Disabled',
      subtitle: telegramEnabled ? 'Alerts on match' : 'Notifications muted',
      icon: Send,
      color: telegramEnabled ? 'text-sky-400' : 'text-zinc-500',
      bgColor: telegramEnabled ? 'bg-sky-500/10' : 'bg-zinc-800/40'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400 truncate">{stat.title}</span>
              <div className={`p-1.5 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-white truncate font-mono">
              {stat.value}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{stat.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}

