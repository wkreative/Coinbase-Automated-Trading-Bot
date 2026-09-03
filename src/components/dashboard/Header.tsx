"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play, Pause, Square, ShieldAlert, RefreshCw, Sliders, Activity } from "lucide-react";
import { BotStatus, TradingMode } from "@/lib/types";

interface HeaderProps {
  status: BotStatus;
  mode: TradingMode;
  apiConnected: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onEmergencyStop: () => void;
  onRunScan: () => void;
  onOpenLiveModal: () => void;
}

export function Header({
  status,
  mode,
  apiConnected,
  onStart,
  onPause,
  onStop,
  onEmergencyStop,
  onRunScan,
  onOpenLiveModal,
}: HeaderProps) {
  const pathname = usePathname();

  const getStatusBadge = () => {
    switch (status) {
      case "RUNNING":
        return (
          <span className="cb-badge-green flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> RUNNING
          </span>
        );
      case "PAUSED":
        return (
          <span className="cb-badge-paper flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> PAUSED
          </span>
        );
      case "HALTED":
        return (
          <span className="cb-badge-live flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> HALTED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            STOPPED
          </span>
        );
    }
  };

  return (
    <header className="bg-[#121722] border-b border-[#1e2638] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo & Status */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-all">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white tracking-tight">Coinbase</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                    Quant Bot
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Automated 5M Strategy Engine</p>
              </div>
            </Link>

            <div className="h-6 w-[1px] bg-[#1e2638] hidden md:block"></div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <button
                onClick={() => mode === "PAPER" && onOpenLiveModal()}
                className={`transition-all cursor-pointer ${mode === "PAPER" ? "cb-badge-paper hover:opacity-80" : "cb-badge-live"}`}
              >
                {mode === "PAPER" ? "🟡 PAPER MODE" : "🔴 LIVE MODE"}
              </button>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0b0e14] p-1 rounded-xl border border-[#1e2638]">
            <Link
              href="/dashboard"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/dashboard/trades"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/dashboard/trades"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Trades
            </Link>
            <Link
              href="/dashboard/signals"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/dashboard/signals"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Signals
            </Link>
            <Link
              href="/dashboard/logs"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/dashboard/logs"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Logs
            </Link>
            <Link
              href="/dashboard/settings"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                pathname === "/dashboard/settings"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Settings & API
            </Link>
          </nav>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRunScan}
              title="Force Market Scan Tick"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-[#1e2638] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {status !== "RUNNING" ? (
              <button
                onClick={onStart}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> START BOT
              </button>
            ) : (
              <button
                onClick={onPause}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" /> PAUSE
              </button>
            )}

            <button
              onClick={onStop}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-[#1e2638] transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> STOP
            </button>

            <button
              onClick={onEmergencyStop}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-red-500/30 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Stop
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
