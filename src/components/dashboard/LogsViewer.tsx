"use client";

import { useState } from "react";
import { Terminal, Filter, AlertTriangle, Info, AlertOctagon, ShieldAlert } from "lucide-react";
import { LogEntry } from "@/lib/trading/store";

interface LogsViewerProps {
  logs: LogEntry[];
}

export function LogsViewer({ logs }: LogsViewerProps) {
  const [levelFilter, setLevelFilter] = useState<string>("ALL");

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
    return true;
  });

  const getLogIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "CRITICAL":
        return <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case "ERROR":
        return <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />;
    }
  };

  const getLevelBadgeClass = (level: LogEntry["level"]) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-950 text-red-400 border-red-800 font-extrabold";
      case "ERROR":
        return "bg-red-900/40 text-red-300 border-red-700/50";
      case "WARNING":
        return "bg-amber-900/40 text-amber-300 border-amber-700/50";
      default:
        return "bg-blue-900/30 text-blue-300 border-blue-700/40";
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" /> System Audit & Event Console Log
          </h2>
          <p className="text-xs text-slate-400">Real-time system events, trades, and risk breaker logs</p>
        </div>

        {/* Level Filter */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-semibold"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 font-mono text-xs max-h-[500px] overflow-y-auto space-y-2.5">
        {filteredLogs.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No log entries matching level filter.</p>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-900/60 transition-all border border-transparent hover:border-slate-800">
              {getLogIcon(log.level)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getLevelBadgeClass(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-slate-400 font-semibold text-[11px] bg-slate-800/80 px-2 py-0.5 rounded">
                    [{log.category}]
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{log.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
