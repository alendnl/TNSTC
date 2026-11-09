import React from 'react';
import { Bus, Clock, Users, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function ResultsTable({ results, lastScanTime }) {
  const hasResults = results && results.length > 0;
  const totalBuses = results?.reduce((acc, r) => acc + (r.buses?.length || 0), 0) || 0;

  const getBadgeColor = (busName) => {
    if (busName.includes('AC') && busName.includes('SLEEPER')) {
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
    }
    if (busName.includes('AC')) {
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20';
    }
    if (busName.includes('SLEEPER')) {
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20';
    }
    if (busName.includes('ULTRA DELUXE')) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
    }
    return 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60';
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span>Matching Buses Found</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                totalBuses > 0
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {totalBuses} available
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Schedules matching your active filters.
          </p>
        </div>
        {lastScanTime && (
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            Updated: <span className="text-zinc-600 dark:text-zinc-300 font-medium">{lastScanTime}</span>
          </div>
        )}
      </div>

      {!hasResults || totalBuses === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Bus className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No matching buses at this moment</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Checks continue on every interval. As soon as seats open up, they will appear here and dispatch a Telegram alert.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((group, groupIdx) => {
            if (!group.buses || group.buses.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-2">
                {/* Route Header Banner */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {group.route || group.bookingName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400/90 font-mono">
                      <Calendar className="w-3 h-3" />
                      {group.bookingDate}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-medium">
                      {group.buses.length}
                    </span>
                  </div>
                </div>

                {/* Symmetrical, perfectly aligned row cards */}
                <div className="space-y-1.5">
                  {group.buses.map((bus, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/90 dark:border-zinc-800/70 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                    >
                      {/* Left: Departure Time & Route Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                            <span className="text-sm font-semibold font-mono text-zinc-900 dark:text-white tracking-tight">
                              {bus.time}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[140px] sm:max-w-[200px]">
                            {bus.startPlace && bus.endPlace ? `${bus.startPlace} → ${bus.endPlace}` : 'TNSTC Service'}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Bus Type Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${getBadgeColor(bus.bus_name)}`}>
                          {bus.bus_name}
                        </span>
                        {bus.serviceId && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono hidden sm:inline">
                            #{bus.serviceId}
                          </span>
                        )}
                      </div>

                      {/* Right: Available Seats Badge (Refined, calm) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <div className={`px-2 py-1 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 ${
                          bus.seat_number > 2
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400/90 border-emerald-500/20'
                            : 'bg-amber-500/10 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400/90 border-amber-500/20'
                        }`}>
                          <Users className="w-3 h-3 opacity-80" />
                          <span>{bus.seat_number} {bus.seat_number === 1 ? 'seat' : 'seats'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
