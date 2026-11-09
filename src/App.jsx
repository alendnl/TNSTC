import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import QuickStats from './components/QuickStats.jsx';
import BookingManager from './components/BookingManager.jsx';
import FilterSettings from './components/FilterSettings.jsx';
import TelegramConfig from './components/TelegramConfig.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import LiveLogs from './components/LiveLogs.jsx';
import {
  loadBookings,
  saveBookings,
  loadConfig,
  saveConfig,
  loadTelegram,
  saveTelegram,
  loadIsSearching,
  saveIsSearching,
  loadTheme,
  saveTheme,
  loadSavedResults,
  saveSavedResults
} from './utils/storage.js';

export default function App() {
  const [theme, setTheme] = useState(loadTheme);
  const [bookings, setBookings] = useState(loadBookings);
  const [config, setConfig] = useState(loadConfig);
  const [telegram, setTelegram] = useState(loadTelegram);

  const [isSearching, setIsSearching] = useState(loadIsSearching);
  const [countdown, setCountdown] = useState(config.checkInterval || 60);
  const [isCheckingNow, setIsCheckingNow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState(loadSavedResults);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [lastSearchTimestamp, setLastSearchTimestamp] = useState(null);
  const [logs, setLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      message: 'TNSTC Tracker ready. Connected to MongoDB single user state.',
      level: 'info'
    }
  ]);

  // Snapshot of what is saved in MongoDB document (main_user)
  const [savedSnapshot, setSavedSnapshot] = useState({
    bookings: loadBookings(),
    config: loadConfig(),
    telegram: loadTelegram()
  });

  // Accurate change detection between working state and MongoDB snapshot
  const hasUnsavedChanges = useMemo(() => {
    if (!savedSnapshot) return false;
    return (
      JSON.stringify(bookings) !== JSON.stringify(savedSnapshot.bookings) ||
      JSON.stringify(config) !== JSON.stringify(savedSnapshot.config) ||
      JSON.stringify(telegram) !== JSON.stringify(savedSnapshot.telegram)
    );
  }, [bookings, config, telegram, savedSnapshot]);

  // Synchronized refs for background timer callbacks
  const bookingsRef = useRef(bookings);
  bookingsRef.current = bookings;

  const configRef = useRef(config);
  configRef.current = config;

  const telegramRef = useRef(telegram);
  telegramRef.current = telegram;

  const isSearchingRef = useRef(isSearching);
  isSearchingRef.current = isSearching;

  const resultsRef = useRef(results);
  resultsRef.current = results;

  const lastScanTimeRef = useRef(lastScanTime);
  lastScanTimeRef.current = lastScanTime;

  const lastSearchTimestampRef = useRef(lastSearchTimestamp);
  lastSearchTimestampRef.current = lastSearchTimestamp;

  // Concurrency guard ref to prevent overlapping searches
  const isCheckingRef = useRef(false);

  // Countdown timer tracker ref
  const countdownRef = useRef(Number(config.checkInterval || 60));

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addLog = useCallback((message, level = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-150), { time, message, level }]);
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Save state to MongoDB (single document: main_user)
  // Stable reference that reads current values from refs or passed overrides
  const saveStateToMongo = useCallback(async (overrides = {}) => {
    setIsSaving(true);
    try {
      const targetState = {
        isSearching: overrides.isSearching !== undefined ? overrides.isSearching : isSearchingRef.current,
        bookings: overrides.bookings !== undefined ? overrides.bookings : bookingsRef.current,
        config: overrides.config !== undefined ? overrides.config : configRef.current,
        telegram: overrides.telegram !== undefined ? overrides.telegram : telegramRef.current,
        results: overrides.results !== undefined ? overrides.results : resultsRef.current,
        lastScanTime: overrides.lastScanTime !== undefined ? overrides.lastScanTime : lastScanTimeRef.current,
        lastSearchTimestamp: overrides.lastSearchTimestamp !== undefined ? overrides.lastSearchTimestamp : lastSearchTimestampRef.current
      };

      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: targetState })
      });

      if (res.ok) {
        setSavedSnapshot({
          bookings: targetState.bookings,
          config: targetState.config,
          telegram: targetState.telegram
        });
        saveBookings(targetState.bookings);
        saveConfig(targetState.config);
        saveTelegram(targetState.telegram);
        saveIsSearching(targetState.isSearching);
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        addLog(`Failed to save to MongoDB: ${errData.error || 'Server error'}`, 'error');
        return false;
      }
    } catch (err) {
      addLog(`MongoDB connection error: ${err.message}`, 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [addLog]);

  // Main Lookup Runner with concurrency lock & in-flight cancel guard
  const executeLookup = useCallback(async () => {
    // Concurrency guard: reject if a check is already underway
    if (isCheckingRef.current) {
      return;
    }

    const currentBookings = bookingsRef.current.filter((b) => b && b.active);
    if (currentBookings.length === 0) {
      addLog('No active booking cURLs enabled.', 'warn');
      return;
    }

    isCheckingRef.current = true;
    setIsCheckingNow(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookings: currentBookings,
          filters: configRef.current,
          telegram: telegramRef.current
        })
      });

      const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

      if (data.logs && Array.isArray(data.logs)) {
        setLogs((prev) => [...prev.slice(-150), ...data.logs]);
      }

      if (response.ok && data.success) {
        const newResults = data.results || [];
        const now = new Date().toLocaleTimeString();
        const nowMs = Date.now();

        setResults(newResults);
        resultsRef.current = newResults;
        saveSavedResults(newResults);

        setLastScanTime(now);
        lastScanTimeRef.current = now;

        setLastSearchTimestamp(nowMs);
        lastSearchTimestampRef.current = nowMs;

        // If the user stopped searching while the HTTP request was in flight,
        // respect their choice and persist isSearching: false.
        const stillSearching = isSearchingRef.current;
        saveStateToMongo({
          isSearching: stillSearching,
          lastSearchTimestamp: nowMs,
          lastScanTime: now,
          results: newResults
        });
      } else {
        addLog(`Lookup error: ${data.error || 'Server error'}`, 'error');
      }
    } catch (err) {
      addLog(`Network error: ${err.message}`, 'error');
    } finally {
      isCheckingRef.current = false;
      setIsCheckingNow(false);
    }
  }, [addLog, saveStateToMongo]);

  // Hydrate initial state from MongoDB document ONCE on mount
  useEffect(() => {
    let isMounted = true;

    async function loadMongoStateOnMount() {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted || !data.hasServerState || !data.state) return;

        const s = data.state;
        if (s.bookings) {
          setBookings(s.bookings);
          bookingsRef.current = s.bookings;
          saveBookings(s.bookings);
        }
        if (s.config) {
          setConfig(s.config);
          configRef.current = s.config;
          saveConfig(s.config);
        }
        if (s.telegram) {
          setTelegram(s.telegram);
          telegramRef.current = s.telegram;
          saveTelegram(s.telegram);
        }
        if (s.results) {
          setResults(s.results);
          resultsRef.current = s.results;
          saveSavedResults(s.results);
        }
        if (s.lastScanTime) {
          setLastScanTime(s.lastScanTime);
          lastScanTimeRef.current = s.lastScanTime;
        }
        if (s.lastSearchTimestamp) {
          setLastSearchTimestamp(s.lastSearchTimestamp);
          lastSearchTimestampRef.current = s.lastSearchTimestamp;
        }

        // Establish clean baseline snapshot for unsaved changes detection
        setSavedSnapshot({
          bookings: s.bookings || bookingsRef.current,
          config: s.config || configRef.current,
          telegram: s.telegram || telegramRef.current
        });

        // If searching is active (and was verified non-stale by /api/state), resume search
        if (s.isSearching) {
          setIsSearching(true);
          isSearchingRef.current = true;
          saveIsSearching(true);

          const intervalSec = Number(s.config?.checkInterval || 60);
          const lastTime = Number(s.lastSearchTimestamp || 0);
          const elapsedSec = lastTime > 0 ? Math.floor((Date.now() - lastTime) / 1000) : 0;
          const remainingSec = Math.max(1, intervalSec - elapsedSec);

          countdownRef.current = remainingSec;
          setCountdown(remainingSec);
          addLog('Active search session restored from MongoDB.', 'info');
        } else {
          setIsSearching(false);
          isSearchingRef.current = false;
          saveIsSearching(false);
        }
      } catch (err) {
        console.warn('Could not load MongoDB state on mount:', err);
      }
    }

    loadMongoStateOnMount();

    return () => {
      isMounted = false;
    };
  }, [addLog]);

  // Interval Countdown Effect: Runs ONLY when searching is active.
  // Completely isolated from state-updater side-effects.
  useEffect(() => {
    if (!isSearching) {
      return;
    }

    const intervalSec = Number(configRef.current?.checkInterval || 60);
    countdownRef.current = intervalSec;
    setCountdown(intervalSec);

    const timerId = setInterval(() => {
      countdownRef.current -= 1;

      if (countdownRef.current <= 0) {
        const nextInterval = Number(configRef.current?.checkInterval || 60);
        countdownRef.current = nextInterval;
        setCountdown(nextInterval);

        if (isSearchingRef.current && !isCheckingRef.current) {
          executeLookup();
        }
      } else {
        setCountdown(countdownRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [isSearching, executeLookup]);

  // Save changes explicitly to MongoDB
  const handleSaveChanges = async () => {
    const success = await saveStateToMongo();
    if (success) {
      addLog('Configuration successfully saved to MongoDB (main_user).', 'success');
    }
  };

  // Restart search (enabled ONLY when changes are detected)
  const handleRestartSearch = async () => {
    const nowMs = Date.now();
    setLastSearchTimestamp(nowMs);
    lastSearchTimestampRef.current = nowMs;

    const intervalSec = Number(configRef.current?.checkInterval || 60);
    countdownRef.current = intervalSec;
    setCountdown(intervalSec);

    const success = await saveStateToMongo({
      isSearching: true,
      lastSearchTimestamp: nowMs
    });

    if (success) {
      setIsSearching(true);
      isSearchingRef.current = true;
      saveIsSearching(true);
      addLog('Changes saved to MongoDB & search restarted with new criteria.', 'success');
      executeLookup();
    }
  };

  // Start / Stop Toggle
  const handleToggleSearch = async () => {
    if (isSearchingRef.current) {
      // User clicked STOP: Immediately shut down
      setIsSearching(false);
      isSearchingRef.current = false;
      saveIsSearching(false);
      addLog('Search stopped.', 'warn');
      await saveStateToMongo({ isSearching: false });
    } else {
      // User clicked START: Start search loop
      const nowMs = Date.now();
      const intervalSec = Number(configRef.current?.checkInterval || 60);

      setIsSearching(true);
      isSearchingRef.current = true;
      saveIsSearching(true);

      setLastSearchTimestamp(nowMs);
      lastSearchTimestampRef.current = nowMs;

      countdownRef.current = intervalSec;
      setCountdown(intervalSec);

      addLog(`Search started (every ${intervalSec}s).`, 'success');
      await saveStateToMongo({ isSearching: true, lastSearchTimestamp: nowMs });
      executeLookup();
    }
  };

  // Manual trigger "Check Now"
  const handleManualRun = () => {
    addLog('Manual check triggered.', 'info');
    executeLookup();
  };

  const activeCurlsCount = bookings.filter((b) => b && b.active).length;
  const lastMatchesCount = results.length > 0 ? results.reduce((acc, r) => acc + (r.buses?.length || 0), 0) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased transition-colors duration-200 selection:bg-emerald-500/15 selection:text-emerald-700 dark:selection:text-emerald-400">
      {/* Top Navigation Bar */}
      <Navbar
        isSearching={isSearching}
        onToggleSearch={handleToggleSearch}
        onManualRun={handleManualRun}
        countdown={countdown}
        isCheckingNow={isCheckingNow}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveChanges={handleSaveChanges}
        onRestartSearch={handleRestartSearch}
        isSaving={isSaving}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Stats Overview */}
        <QuickStats
          activeCurlsCount={activeCurlsCount}
          totalCurlsCount={bookings.length}
          lastMatchesCount={lastMatchesCount}
          lastCheckTime={lastScanTime}
          telegramEnabled={telegram.enabled}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Configuration & Bookings (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Booking cURL Manager */}
            <BookingManager
              bookings={bookings}
              onUpdateBookings={(updated) => setBookings(updated)}
            />

            {/* Filter Settings (Bus types, Time range, Min seats, Interval) */}
            <FilterSettings
              config={config}
              onUpdateConfig={(updated) => setConfig(updated)}
            />

            {/* Telegram Alerts Configuration */}
            <TelegramConfig
              telegram={telegram}
              onUpdateTelegram={(updated) => setTelegram(updated)}
            />
          </div>

          {/* Right Column: Live Results & Terminal Logs (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Matching Buses Card Table */}
            <ResultsTable
              results={results}
              lastScanTime={lastScanTime}
            />

            {/* Terminal Live Logs */}
            <LiveLogs
              logs={logs}
              onClearLogs={handleClearLogs}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-4 mt-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">TNSTC Pulse</span>
            <span>&bull;</span>
            <span>MongoDB Database: <code className="font-mono text-zinc-600 dark:text-zinc-400">tnstc.config [main_user]</code></span>
          </div>
          <div className="text-zinc-400 dark:text-zinc-500 text-[11px]">
            Refresh page anytime to fetch latest state
          </div>
        </div>
      </footer>
    </div>
  );
}
