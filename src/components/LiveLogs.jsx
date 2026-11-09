import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, Download, ArrowDown } from 'lucide-react';

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
        return 'text-emerald-400 font-medium';
      case 'error':
        return 'text-rose-400 font-medium';
      case 'warn':
        return 'text-amber-400 font-medium';
      default:
        return 'text-zinc-300';
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      {/* Console Header */}
      <div className="px-3.5 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mac-style window controls */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-zinc-200">Execution Logs</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {logs.length}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
              autoScroll ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle auto-scroll"
          >
            <ArrowDown className="w-3 h-3" />
            <span className="hidden sm:inline">Scroll</span>
          </button>

          <button
            type="button"
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 cursor-pointer"
            title="Download log history"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors disabled:opacity-30 cursor-pointer"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-3 font-mono text-[11px] max-h-64 sm:max-h-72 overflow-y-auto space-y-1 select-text bg-zinc-950">
        {logs.length === 0 ? (
          <div className="text-zinc-600 py-6 text-center italic">
            Console ready. Waiting for lookup triggers...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-baseline gap-2 leading-relaxed">
              <span className="text-zinc-600 text-[10px] shrink-0 select-none">
                {log.time}
              </span>
              <span
                className={`text-[9px] px-1 rounded uppercase tracking-wider shrink-0 font-bold ${
                  log.level === 'error'
                    ? 'bg-rose-500/20 text-rose-300'
                    : log.level === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : log.level === 'warn'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {log.level === 'success' ? 'MATCH' : log.level === 'error' ? 'ERR' : log.level === 'warn' ? 'WARN' : 'INFO'}
              </span>
              <span className={`break-words ${getLevelStyle(log.level)}`}>
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
