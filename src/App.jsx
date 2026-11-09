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
  saveTelegram
} from './utils/storage.js';

export default function App() {
  const [bookings, setBookings] = useState(loadBookings);
  const [config, setConfig] = useState(loadConfig);
  const [telegram, setTelegram] = useState(loadTelegram);

  const [isSearching, setIsSearching] = useState(false);
  const [countdown, setCountdown] = useState(config.checkInterval || 60);
  const [isCheckingNow, setIsCheckingNow] = useState(false);
  const [results, setResults] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [logs, setLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      message: 'TNSTC Bus Tracker initialized. Configure your criteria and click Start Search.',
      level: 'info'
    }
  ]);
  const [showCloudModal, setShowCloudModal] = useState(false);

  // Sync state to LocalStorage
  const handleUpdateBookings = (updated) => {
    setBookings(updated);
    saveBookings(updated);
    addLog(`Updated bookings: ${updated.length} route(s) registered.`, 'info');
  };

  const handleUpdateConfig = (updated) => {
    setConfig(updated);
    saveConfig(updated);
    setCountdown(updated.checkInterval || 60);
  };

  const handleUpdateTelegram = (updated) => {
    setTelegram(updated);
    saveTelegram(updated);
  };

  const addLog = useCallback((message, level = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-300), { time, message, level }]);
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Main Lookup Runner
  const executeLookup = useCallback(async () => {
    const activeBookings = bookings.filter((b) => b && b.active);
    if (activeBookings.length === 0) {
      addLog('Scan skipped: No active booking cURLs enabled.', 'warn');
      return;
    }

    setIsCheckingNow(true);
    addLog(`Initiating lookup across ${activeBookings.length} active route(s)...`, 'info');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookings: activeBookings,
          filters: config,
          telegram
        })
      });

      const data = await response.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs((prev) => [...prev.slice(-250), ...data.logs]);
      }

      if (response.ok && data.success) {
        setResults(data.results || []);
        const nowFormatted = new Date().toLocaleTimeString();
        setLastScanTime(nowFormatted);
        if (data.totalBusesFound > 0) {
          addLog(`✓ Found ${data.totalBusesFound} matching bus schedule(s)!`, 'success');
        } else {
          addLog('No matching buses found in this cycle.', 'info');
        }
      } else {
        addLog(`Lookup failed: ${data.error || 'Server error'}`, 'error');
      }
    } catch (err) {
      addLog(`Network lookup error: ${err.message}`, 'error');
    } finally {
      setIsCheckingNow(false);
    }
  }, [bookings, config, telegram, addLog]);

  // Handle Search Start / Stop Toggle
  const handleToggleSearch = () => {
    if (isSearching) {
      setIsSearching(false);
      addLog('Automated search paused.', 'warn');
    } else {
      setIsSearching(true);
      setCountdown(config.checkInterval || 60);
      addLog(`Automated search activated. Polling interval: ${config.checkInterval}s.`, 'success');
      // Run first check immediately on start
      executeLookup();
    }
  };

  // Manual Trigger Check Now
  const handleManualRun = () => {
    addLog('Manual check requested by user.', 'info');
    executeLookup();
  };

  // Interval Countdown Effect
  useEffect(() => {
    if (!isSearching) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          executeLookup();
          return config.checkInterval || 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSearching, config.checkInterval, executeLookup]);

  const activeCurlsCount = bookings.filter((b) => b && b.active).length;
  const lastMatchesCount = results.length > 0 ? results.reduce((acc, r) => acc + (r.buses?.length || 0), 0) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation Bar */}
      <Navbar
        isSearching={isSearching}
        onToggleSearch={handleToggleSearch}
        onManualRun={handleManualRun}
        countdown={countdown}
        checkInterval={config.checkInterval}
        isCheckingNow={isCheckingNow}
        onOpenCloudModal={() => setShowCloudModal(true)}
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
              isSearching={isSearching}
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
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">TNSTC Pulse Notifier</span>
            <span>&bull;</span>
            <span>Frontend + Vercel Serverless Architecture</span>
          </div>
          <button
            onClick={() => setShowCloudModal(true)}
            className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
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

