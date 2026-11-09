import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import QuickStats from './components/QuickStats.jsx';
import BookingManager from './components/BookingManager.jsx';
import FilterSettings from './components/FilterSettings.jsx';
import TelegramConfig from './components/TelegramConfig.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import LiveLogs from './components/LiveLogs.jsx';
import CloudCronModal from './components/CloudCronModal.jsx';
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
  const [results, setResults] = useState(loadSavedResults);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [logs, setLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      message: 'TNSTC Tracker ready. Start Search to begin monitoring.',
      level: 'info'
    }
  ]);
  const [showCloudModal, setShowCloudModal] = useState(false);

  // Keep live references to prevent interval restarts when settings change
  const bookingsRef = useRef(bookings);
  bookingsRef.current = bookings;

  const configRef = useRef(config);
  configRef.current = config;

  const telegramRef = useRef(telegram);
  telegramRef.current = telegram;

  const isSearchingRef = useRef(isSearching);
  isSearchingRef.current = isSearching;

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

  const handleUpdateBookings = (updated) => {
    setBookings(updated);
    saveBookings(updated);
  };

  const handleUpdateConfig = (updated) => {
    setConfig(updated);
    saveConfig(updated);
  };

  const handleUpdateTelegram = (updated) => {
    setTelegram(updated);
    saveTelegram(updated);
  };

  const addLog = useCallback((message, level = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-150), { time, message, level }]);
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
  };

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
        setLastScanTime(new Date().toLocaleTimeString());
      } else {
        addLog(`Lookup error: ${data.error || 'Server error'}`, 'error');
      }
    } catch (err) {
      addLog(`Network error: ${err.message}`, 'error');
    } finally {
      setIsCheckingNow(false);
    }
  }, [addLog]);

  // Handle Search Start / Stop Toggle
  const handleToggleSearch = () => {
    if (isSearching) {
      setIsSearching(false);
      saveIsSearching(false);
      addLog('Search stopped.', 'warn');
    } else {
      setIsSearching(true);
      saveIsSearching(true);
      setCountdown(configRef.current.checkInterval || 60);
      addLog(`Search started (every ${configRef.current.checkInterval || 60}s).`, 'success');
      // Execute first check immediately
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

    // Run interval
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

  // If search was active from previous session, run initial lookup
  useEffect(() => {
    if (loadIsSearching()) {
      addLog('Resumed automated search from saved session.', 'info');
      executeLookup();
    }
  }, [executeLookup]);

  const activeCurlsCount = bookings.filter((b) => b && b.active).length;
  const lastMatchesCount = results.length > 0 ? results.reduce((acc, r) => acc + (r.buses?.length || 0), 0) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Top Navigation Bar */}
      <Navbar
        isSearching={isSearching}
        onToggleSearch={handleToggleSearch}
        onManualRun={handleManualRun}
        countdown={countdown}
        isCheckingNow={isCheckingNow}
        onOpenCloudModal={() => setShowCloudModal(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
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
              onUpdateBookings={handleUpdateBookings}
            />

            {/* Filter Settings (Bus types, Time range, Min seats, Interval) */}
            <FilterSettings
              config={config}
              onUpdateConfig={handleUpdateConfig}
            />

            {/* Telegram Alerts Configuration */}
            <TelegramConfig
              telegram={telegram}
              onUpdateTelegram={handleUpdateTelegram}
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
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">TNSTC Pulse Notifier</span>
            <span>&bull;</span>
            <span>Frontend + Vercel Serverless Architecture</span>
          </div>
          <button
            onClick={() => setShowCloudModal(true)}
            className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 underline font-medium cursor-pointer"
          >
            How to run 24/7 when computer is off
          </button>
        </div>
      </footer>

      {/* 24/7 Cloud Cron Guidance Modal */}
      <CloudCronModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
      />
    </div>
  );
}
