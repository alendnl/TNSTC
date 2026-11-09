import React, { useState, useEffect, useRef, useCallback } from 'react';
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

function isStateEqual(a, b) {
  if (!a || !b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

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

  // Snapshot of what is currently saved in MongoDB
  const [savedSnapshot, setSavedSnapshot] = useState({
    bookings: loadBookings(),
    config: loadConfig(),
    telegram: loadTelegram()
  });

  // Check if current working state differs from MongoDB saved snapshot
  const hasUnsavedChanges = !isStateEqual(
    { bookings, config, telegram },
    savedSnapshot
  );

  // Live refs for polling interval
  const bookingsRef = useRef(bookings);
  bookingsRef.current = bookings;

  const configRef = useRef(config);
  configRef.current = config;

  const telegramRef = useRef(telegram);
  telegramRef.current = telegram;

  const isSearchingRef = useRef(isSearching);
  isSearchingRef.current = isSearching;

  const lastSearchTimestampRef = useRef(lastSearchTimestamp);
  lastSearchTimestampRef.current = lastSearchTimestamp;

  // Apply theme class to <html> element
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

  // Save current working state to MongoDB (single document: main_user)
  const saveStateToMongo = useCallback(async (overrides = {}) => {
    setIsSaving(true);
    try {
      const targetState = {
        isSearching: overrides.isSearching !== undefined ? overrides.isSearching : isSearchingRef.current,
        bookings: overrides.bookings !== undefined ? overrides.bookings : bookingsRef.current,
        config: overrides.config !== undefined ? overrides.config : configRef.current,
        telegram: overrides.telegram !== undefined ? overrides.telegram : telegramRef.current,
        results,
        lastScanTime,
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
        const errData = await res.json();
        addLog(`Failed to save to MongoDB: ${errData.error || 'Server error'}`, 'error');
        return false;
      }
    } catch (err) {
      addLog(`MongoDB connection error: ${err.message}`, 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [results, lastScanTime, addLog]);

  // Main Lookup Runner
  const executeLookup = useCallback(async () => {
    const currentBookings = bookingsRef.current.filter((b) => b && b.active);
    if (currentBookings.length === 0) {
      addLog('No active booking cURLs enabled.', 'warn');
      return;
    }

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

      const data = await response.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs((prev) => [...prev.slice(-150), ...data.logs]);
      }

      if (response.ok && data.success) {
        setResults(data.results || []);
        saveSavedResults(data.results || []);
        const now = new Date().toLocaleTimeString();
        const nowMs = Date.now();
        setLastScanTime(now);
        setLastSearchTimestamp(nowMs);
        lastSearchTimestampRef.current = nowMs;

        // Update MongoDB with latest scan timestamp & results
        saveStateToMongo({
          lastSearchTimestamp: nowMs,
          lastScanTime: now,
          results: data.results || []
        });
      } else {
        addLog(`Lookup error: ${data.error || 'Server error'}`, 'error');
      }
    } catch (err) {
      addLog(`Network error: ${err.message}`, 'error');
    } finally {
      setIsCheckingNow(false);
    }
  }, [addLog, saveStateToMongo]);

  // Load state from MongoDB document (_id: "main_user") on page load / refresh
  useEffect(() => {
    async function loadMongoState() {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.hasServerState && data.state) {
            const s = data.state;
            if (s.bookings) {
              setBookings(s.bookings);
              saveBookings(s.bookings);
            }
            if (s.config) {
              setConfig(s.config);
              saveConfig(s.config);
            }
            if (s.telegram) {
              setTelegram(s.telegram);
              saveTelegram(s.telegram);
            }
            if (s.results) {
              setResults(s.results);
              saveSavedResults(s.results);
            }
            if (s.lastScanTime) {
              setLastScanTime(s.lastScanTime);
            }
            if (s.lastSearchTimestamp) {
              setLastSearchTimestamp(s.lastSearchTimestamp);
              lastSearchTimestampRef.current = s.lastSearchTimestamp;
            }

            // STALE STATE DETECTION:
            // If state says searching is true, but last searched timestamp is more than
            // (checkInterval + 60s) ago, the browser was closed. Set isSearching = false.
            const intervalSec = Number(s.config?.checkInterval || 60);
            const lastTime = Number(s.lastSearchTimestamp || 0);
            const elapsed = Date.now() - lastTime;
            const isStale = s.isSearching && (lastTime === 0 || elapsed > (intervalSec + 60) * 1000);

            if (isStale) {
              setIsSearching(false);
              isSearchingRef.current = false;
              saveIsSearching(false);
              addLog('Browser was previously closed: search state reset to Idle.', 'info');
              // Update MongoDB with corrected state
              saveStateToMongo({ isSearching: false });
            } else if (s.isSearching) {
              setIsSearching(true);
              isSearchingRef.current = true;
              saveIsSearching(true);
              // Active search within interval window: resume countdown & check
              executeLookup();
            } else {
              setIsSearching(false);
              isSearchingRef.current = false;
              saveIsSearching(false);
            }

            // Set saved snapshot from MongoDB
            setSavedSnapshot({
              bookings: s.bookings || bookingsRef.current,
              config: s.config || configRef.current,
              telegram: s.telegram || telegramRef.current
            });
          }
        }
      } catch (e) {
        console.warn('Could not load state from MongoDB:', e);
      }
    }

    loadMongoState();
  }, [addLog, executeLookup, saveStateToMongo]);

  // Handler: Save button clicked
  const handleSaveChanges = async () => {
    const success = await saveStateToMongo();
    if (success) {
      addLog('Configuration successfully saved to MongoDB (main_user).', 'success');
    }
  };

  // Handler: Restart button clicked (Enabled ONLY when hasUnsavedChanges is true)
  const handleRestartSearch = async () => {
    const nowMs = Date.now();
    setLastSearchTimestamp(nowMs);
    lastSearchTimestampRef.current = nowMs;

    const success = await saveStateToMongo({
      isSearching: true,
      lastSearchTimestamp: nowMs
    });

    if (success) {
      setIsSearching(true);
      isSearchingRef.current = true;
      saveIsSearching(true);
      setCountdown(configRef.current.checkInterval || 60);
      addLog('Changes saved to MongoDB & search restarted with new criteria.', 'success');
      // Trigger immediate lookup with new criteria
      executeLookup();
    }
  };

  // Handle Search Start / Stop Toggle
  const handleToggleSearch = async () => {
    if (isSearching) {
      setIsSearching(false);
      isSearchingRef.current = false;
      saveIsSearching(false);
      await saveStateToMongo({ isSearching: false });
      addLog('Search stopped.', 'warn');
    } else {
      const nowMs = Date.now();
      setIsSearching(true);
      isSearchingRef.current = true;
      saveIsSearching(true);
      setLastSearchTimestamp(nowMs);
      lastSearchTimestampRef.current = nowMs;
      setCountdown(configRef.current.checkInterval || 60);
      await saveStateToMongo({ isSearching: true, lastSearchTimestamp: nowMs });
      addLog(`Search started (every ${configRef.current.checkInterval || 60}s).`, 'success');
      executeLookup();
    }
  };

  // Manual Trigger Check Now
  const handleManualRun = () => {
    addLog('Manual check triggered.', 'info');
    executeLookup();
  };

  // Interval Countdown Effect (Never resets unexpectedly)
  useEffect(() => {
    if (!isSearching) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          executeLookup();
          return configRef.current.checkInterval || 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSearching, executeLookup]);

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
