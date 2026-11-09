import React from 'react';
import { Bus, Clock, Users, MapPin, Calendar } from 'lucide-react';

export default function ResultsTable({ results, lastScanTime }) {
  const hasResults = results && results.length > 0;
  const totalBuses = results?.reduce((acc, r) => acc + (r.buses?.length || 0), 0) || 0;

  const getBadgeColor = (busName) => {
    if (busName.includes('AC') && busName.includes('SLEEPER')) {
      return 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30';
    }
    if (busName.includes('AC')) {
      return 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30';
    }
    if (busName.includes('SLEEPER')) {
      return 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30';
    }
    if (busName.includes('ULTRA DELUXE')) {
      return 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
    }
    return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Bus className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Matching Buses Found</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                totalBuses > 0
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {totalBuses} available
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Schedules meeting all 5 filter rules.
          </p>
        </div>
        {lastScanTime && (
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            Updated: <span className="text-zinc-700 dark:text-zinc-200 font-semibold">{lastScanTime}</span>
          </div>
        )}
      </div>

      {!hasResults || totalBuses === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Bus className="w-9 h-9 text-zinc-400 dark:text-zinc-600 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No matching buses at this moment</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-md mx-auto mt-1">
            The scanner checks on every interval. As soon as seats open up within your configured time range and bus types, they will appear here and trigger a Telegram alert.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((group, groupIdx) => {
            if (!group.buses || group.buses.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-2.5">
                {/* Route Group Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-wide">
                      {group.route || group.bookingName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-mono font-medium">
                      <Calendar className="w-3 h-3" />
                      {group.bookingDate}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                      {group.buses.length} buses
                    </span>
                  </div>
                </div>

                {/* Buses Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.buses.map((bus, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                    >
                      {/* Top: Bus Type & Available Seats */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-semibold truncate ${getBadgeColor(
                            bus.bus_name
                          )}`}
                        >
                          {bus.bus_name}
                        </span>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold whitespace-nowrap">
                          <Users className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          <span>{bus.seat_number} seat(s)</span>
                        </div>
                      </div>

                      {/* Middle: Departure Time */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                          <Clock className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                          <span className="text-sm font-bold font-mono tracking-tight">{bus.time}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Departure</span>
                        </div>

                        {bus.serviceId && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            #{bus.serviceId}
                          </span>
                        )}
                      </div>

                      {/* Bottom Route Details */}
                      {(bus.startPlace || bus.endPlace) && (
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-900 pt-2 flex items-center justify-between">
                          <span className="truncate">{bus.startPlace || 'Origin'}</span>
                          <span className="text-zinc-400 dark:text-zinc-600 px-1">→</span>
                          <span className="truncate">{bus.endPlace || 'Destination'}</span>
                        </div>
                      )}
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
