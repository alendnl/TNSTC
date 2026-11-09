import React from 'react';
import { Play, Square, RefreshCw, Sun, Moon, Bus, Save, RotateCw, Database } from 'lucide-react';

export default function Navbar({
  isSearching,
  onToggleSearch,
  onManualRun,
  countdown,
  isCheckingNow,
  theme,
  onToggleTheme,
  hasUnsavedChanges,
  onSaveChanges,
  onRestartSearch,
  isSaving
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200">
            <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                TNSTC Pulse
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Database className="w-2.5 h-2.5" /> MongoDB
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Single-User Cloud State
            </p>
          </div>
        </div>

        {/* Center: Search Status */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs">
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
                  Active <span className="text-emerald-700 dark:text-emerald-400/90 font-mono">({countdown}s)</span>
                </span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400">Idle</span>
              )}
            </span>
          </div>

          {/* Unsaved changes pill indicator */}
          {hasUnsavedChanges && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Unsaved Edits
            </span>
          )}
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Save Changes Button (Present when changes are made) */}
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={onSaveChanges}
              disabled={isSaving}
              title="Save changes to MongoDB"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-colors shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}

          {/* Restart Button: Present and ENABLED ONLY when there is some config change made */}
          <button
            type="button"
            onClick={onRestartSearch}
            disabled={!hasUnsavedChanges || isSaving}
            title={
              hasUnsavedChanges
                ? 'Save changes & restart search with new criteria'
                : 'Enabled only when configuration changes are made'
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200/60 dark:border-zinc-800/60 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Restart</span>
          </button>

          {/* Manual Run Once */}
          <button
            type="button"
            onClick={onManualRun}
            disabled={isCheckingNow}
            title="Check bus availability immediately"
            className="inline-flex items-center justify-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNow ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`} />
            <span className="hidden lg:inline">{isCheckingNow ? 'Checking...' : 'Check Now'}</span>
          </button>

          {/* Start / Stop Toggle Button */}
          <button
            type="button"
            onClick={onToggleSearch}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              isSearching
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSearching ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 sm:p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
