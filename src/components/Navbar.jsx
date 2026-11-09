import React from 'react';
import { Play, Square, RefreshCw, Cloud, ShieldCheck, Sun, Moon, Bus } from 'lucide-react';

export default function Navbar({
  isSearching,
  onToggleSearch,
  onManualRun,
  countdown,
  isCheckingNow,
  onOpenCloudModal,
  theme,
  onToggleTheme
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200">
            <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                TNSTC Pulse
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-500" /> Vercel Serverless
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
              TNSTC Seat Availability Monitor & Notifier
            </p>
          </div>
        </div>

        {/* Center: Search State & Cloud Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs">
            <span className="relative flex h-2 w-2">
              {isSearching && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/70 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSearching ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'
                }`}
              ></span>
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
              {isSearching ? (
                <span>
                  Active <span className="text-emerald-700 dark:text-emerald-400/90 font-mono font-medium">({countdown}s)</span>
                </span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400">Idle</span>
              )}
            </span>
          </div>

          {/* 24/7 Cloud Modal Trigger */}
          <button
            onClick={onOpenCloudModal}
            type="button"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>24/7 Cloud Run</span>
          </button>
        </div>

        {/* Right: Controls & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Manual Check Now */}
          <button
            type="button"
            onClick={onManualRun}
            disabled={isCheckingNow}
            title="Check bus availability immediately"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNow ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">{isCheckingNow ? 'Checking...' : 'Check Now'}</span>
          </button>

          {/* Start / Stop Toggle Button (Toned down, pleasant) */}
          <button
            type="button"
            onClick={onToggleSearch}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              isSearching
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
