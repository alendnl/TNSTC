import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, Download, ArrowDown, Shield } from 'lucide-react';

export default function LiveLogs({ logs, onClearLogs }) {
  const terminalEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleExportLogs = () => {
    if (!logs || logs.length === 0) return;
    const content = logs.map((l) => `[${l.time}] [${l.level?.toUpperCase() || 'INFO'}] ${l.message}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tnstc-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400 font-semibold';
      case 'error':
        return 'text-rose-400 font-semibold';
      case 'warn':
        return 'text-amber-400 font-semibold';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-md overflow-hidden flex flex-col">
      {/* Console Header */}
      <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mac-style window controls */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-zinc-200">Live Execution Logs</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {logs.length} lines
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
              autoScroll ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Auto-scroll on new log lines"
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-scroll</span>
          </button>

          <button
            type="button"
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            title="Download log history"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 font-mono text-xs max-h-72 sm:max-h-80 overflow-y-auto space-y-1.5 select-text bg-zinc-950/90">
        {logs.length === 0 ? (
          <div className="text-zinc-600 py-6 text-center italic">
            Console initialized. Waiting for lookup triggers...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 leading-relaxed">
              <span className="text-zinc-600 text-[11px] select-none shrink-0 font-mono">
                {log.time}
              </span>
              <span
                className={`text-[10px] px-1 rounded uppercase tracking-wider shrink-0 font-semibold ${
                  log.level === 'error'
                    ? 'bg-rose-500/20 text-rose-300'
                    : log.level === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : log.level === 'warn'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-zinc-800/80 text-zinc-400'
                }`}
              >
                {log.level || 'info'}
              </span>
              <span className={`break-all ${getLevelStyle(log.level)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

