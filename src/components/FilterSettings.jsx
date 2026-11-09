import React, { useState } from 'react';
import { Sliders, Clock, Users, Bus, Plus, RotateCcw, Check } from 'lucide-react';
import { DEFAULT_ALLOWED_BUS_TYPES, ALL_KNOWN_BUS_TYPES } from '../utils/filterBuses.js';

export default function FilterSettings({ config, onUpdateConfig, isSearching }) {
  const [customTypeInput, setCustomTypeInput] = useState('');

  const toggleBusType = (type) => {
    const current = config.allowedBusTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onUpdateConfig({ ...config, allowedBusTypes: updated });
  };

  const handleAddCustomType = () => {
    const trimmed = customTypeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!config.allowedBusTypes.includes(trimmed)) {
      onUpdateConfig({
        ...config,
        allowedBusTypes: [...config.allowedBusTypes, trimmed]
      });
    }
    setCustomTypeInput('');
  };

  const setPresetBusTypes = (preset) => {
    if (preset === 'all') {
      onUpdateConfig({ ...config, allowedBusTypes: [...DEFAULT_ALLOWED_BUS_TYPES] });
    } else if (preset === 'ac') {
      onUpdateConfig({
        ...config,
        allowedBusTypes: DEFAULT_ALLOWED_BUS_TYPES.filter((t) => t.includes('AC'))
      });
    } else if (preset === 'sleeper') {
      onUpdateConfig({
        ...config,
        allowedBusTypes: DEFAULT_ALLOWED_BUS_TYPES.filter((t) => t.includes('SLEEPER'))
      });
    } else if (preset === 'clear') {
      onUpdateConfig({ ...config, allowedBusTypes: [] });
    }
  };

  const setTimePreset = (start, end) => {
    onUpdateConfig({ ...config, startTime: start, endTime: end });
  };

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Search & Filter Criteria</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time filter controls matching original script criteria. Changes take effect on the next scan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onUpdateConfig({
              allowedBusTypes: DEFAULT_ALLOWED_BUS_TYPES,
              startTime: '18:00',
              endTime: '23:59',
              minSeats: 1,
              enforceUltraDeluxeMin: true,
              checkInterval: 60
            });
          }}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Reset to default filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Defaults</span>
        </button>
      </div>

      {/* 1. Bus Types Filter */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Bus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Allowed Bus Types ({config.allowedBusTypes?.length || 0} active)</span>
          </label>
          {/* Quick Presets */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPresetBusTypes('all')}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setPresetBusTypes('ac')}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              AC Only
            </button>
            <button
              type="button"
              onClick={() => setPresetBusTypes('sleeper')}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Sleepers
            </button>
            <button
              type="button"
              onClick={() => setPresetBusTypes('clear')}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Bus Chips */}
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {Array.from(new Set([...ALL_KNOWN_BUS_TYPES, ...(config.allowedBusTypes || [])])).map((busType) => {
            const isSelected = config.allowedBusTypes?.includes(busType);
            return (
              <button
                key={busType}
                type="button"
                onClick={() => toggleBusType(busType)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                <span>{busType}</span>
              </button>
            );
          })}
        </div>

        {/* Add Custom Bus Type */}
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add custom bus type (e.g. POINT TO POINT)"
            value={customTypeInput}
            onChange={(e) => setCustomTypeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomType()}
            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleAddCustomType}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. Time Range & Minimum Seats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-800/80">
        {/* Time Range */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Departure Time Range</span>
            </label>
            {/* Quick time presets */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTimePreset('18:00', '23:59')}
                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                Evening
              </button>
              <button
                type="button"
                onClick={() => setTimePreset('20:00', '04:00')}
                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                Night
              </button>
              <button
                type="button"
                onClick={() => setTimePreset('00:00', '23:59')}
                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                All Day
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] text-zinc-500 mb-0.5 font-medium">From (HH:MM)</span>
              <input
                type="time"
                value={config.startTime}
                onChange={(e) => onUpdateConfig({ ...config, startTime: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <span className="block text-[10px] text-zinc-500 mb-0.5 font-medium">To (HH:MM)</span>
              <input
                type="time"
                value={config.endTime}
                onChange={(e) => onUpdateConfig({ ...config, endTime: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Seat Requirements */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Seat Availability Requirements</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">Minimum seats needed:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onUpdateConfig({ ...config, minSeats: num })}
                    className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      config.minSeats === num
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Ultra Deluxe strict check */}
            <label className="flex items-center gap-2 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={config.enforceUltraDeluxeMin}
                onChange={(e) => onUpdateConfig({ ...config, enforceUltraDeluxeMin: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20"
              />
              <span className="text-[11px] text-zinc-300">
                Enforce strict Ultra Deluxe filter (&gt; 2 seats required)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Polling Interval Selector */}
      <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300">Polling Interval:</span>
          <span className="text-xs text-zinc-400">Scan TNSTC every</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { label: '30s', value: 30 },
            { label: '60s', value: 60 },
            { label: '2m', value: 120 },
            { label: '5m', value: 300 },
            { label: '10m', value: 600 }
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onUpdateConfig({ ...config, checkInterval: item.value })}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                config.checkInterval === item.value
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
