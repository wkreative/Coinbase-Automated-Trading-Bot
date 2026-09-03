"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Play,
  Pause,
  Square,
  ShieldAlert,
  RefreshCw,
  Sliders,
  Activity,
  Menu,
  X,
  User,
  LineChart,
  History,
  Radio,
  FileText,
} from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
      <header className="bg-[#121722] border-b border-[#1e2638] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* Left: Mobile Menu Toggle Button + Brand Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-[#1e2638] focus:outline-none"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Brand Logo */}
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-all">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white tracking-tight">Coinbase</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md hidden sm:inline-block">
                      Quant Bot
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 hidden lg:block">Automated 5M Strategy Engine</p>
                </div>
              </Link>

              <div className="h-6 w-[1px] bg-[#1e2638] hidden md:block"></div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <button
                  onClick={() => mode === "PAPER" && onOpenLiveModal()}
                  className={`transition-all cursor-pointer text-xs ${mode === "PAPER" ? "cb-badge-paper hover:opacity-80" : "cb-badge-live"}`}
                >
                  {mode === "PAPER" ? "🟡 PAPER" : "🔴 LIVE"}
                </button>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#0b0e14] p-1 rounded-xl border border-[#1e2638]">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/dashboard"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/trades"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/dashboard/trades"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Trades
              </Link>
              <Link
                href="/dashboard/signals"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/dashboard/signals"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Signals
              </Link>
              <Link
                href="/dashboard/logs"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/dashboard/logs"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Logs
              </Link>
              <Link
                href="/dashboard/settings"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  pathname === "/dashboard/settings"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Settings
              </Link>
            </nav>

            {/* Action Control Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
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
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> START
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" /> PAUSE
                </button>
              )}

              <button
                onClick={onStop}
                className="hidden sm:flex px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs items-center gap-1.5 border border-[#1e2638] transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> STOP
              </button>

              <button
                onClick={onEmergencyStop}
                title="Emergency Halt"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-red-500/30 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">Emergency</span>
              </button>

              <Link
                href="/dashboard/settings"
                className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all text-xs font-semibold flex items-center gap-1"
                title="Account Settings"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer from Left */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#0d111a] border-r border-[#1e2638] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header Top */}
        <div className="p-4 border-b border-[#1e2638] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Coinbase Quant</span>
              <p className="text-[10px] text-slate-400">Automated Bot Portal</p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <LineChart className="w-4 h-4" /> Overview Terminal
          </Link>

          <Link
            href="/dashboard/trades"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/trades"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <History className="w-4 h-4" /> Trades History
          </Link>

          <Link
            href="/dashboard/signals"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/signals"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <Radio className="w-4 h-4" /> Signal Engine
          </Link>

          <Link
            href="/dashboard/logs"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/logs"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4" /> System Logs
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/settings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <Sliders className="w-4 h-4" /> Settings & Rules
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/settings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <User className="w-4 h-4" /> Account & Settings
          </Link>
        </nav>

        {/* Mobile Drawer Bottom Quick Controls */}
        <div className="p-4 border-t border-[#1e2638] bg-[#090c12] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Bot Engine:</span>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {status !== "RUNNING" ? (
              <button
                onClick={() => {
                  onStart();
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> START
              </button>
            ) : (
              <button
                onClick={() => {
                  onPause();
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/25"
              >
                <Pause className="w-3.5 h-3.5 fill-current" /> PAUSE
              </button>
            )}

            <button
              onClick={() => {
                onStop();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> STOP
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
