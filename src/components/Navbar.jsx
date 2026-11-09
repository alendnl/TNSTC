import React from 'react';
import { Play, Square, RefreshCw, Radio, Cloud, ShieldCheck } from 'lucide-react';

export default function Navbar({
  isSearching,
  onToggleSearch,
  onManualRun,
  countdown,
  checkInterval,
  isCheckingNow,
  onOpenCloudModal
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <span className="text-xl">🚌</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">TNSTC Pulse</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Vercel Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">Automated Bus Seat Monitor & Telegram Notifier</p>
          </div>
        </div>

        {/* Central Status Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              {isSearching && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isSearching ? 'bg-emerald-500' : 'bg-zinc-500'
                }`}
              ></span>
            </span>
            <span className="font-medium text-zinc-300">
              {isSearching ? (
                <span>
                  Active <span className="text-emerald-400 font-mono">({countdown}s)</span>
                </span>
              ) : (
                <span className="text-zinc-400">Idle</span>
              )}
            </span>
          </div>

          {/* 24/7 Cloud Guidance Button */}
          <button
            onClick={onOpenCloudModal}
            type="button"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>24/7 Cloud Run</span>
          </button>
        </div>

        {/* Main Search Controls */}
        <div className="flex items-center gap-2">
          {/* Run Once / Refresh */}
          <button
            onClick={onManualRun}
            disabled={isCheckingNow}
            title="Check availability right now"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-600 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNow ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{isCheckingNow ? 'Checking...' : 'Check Now'}</span>
          </button>

          {/* Main Start / Stop Button */}
          <button
            onClick={onToggleSearch}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
              isSearching
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-950/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-950/50'
            }`}
          >
            {isSearching ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Search</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Search</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

