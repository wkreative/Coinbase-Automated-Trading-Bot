"use client";

import { Wallet, TrendingUp, TrendingDown, Award, ShieldAlert } from "lucide-react";
import { BotState, Position } from "@/lib/types";

interface OverviewCardsProps {
  state: BotState;
  positions: Position[];
  closedTrades: Position[];
}

export function OverviewCards({ state, positions, closedTrades }: OverviewCardsProps) {
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter((t) => (t.netPnl || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.netPnl || 0) < 0);

  const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : "0.0";
  const totalNetPnl = closedTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? "∞" : "0.00";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Total Portfolio Balance */}
      <div className="cb-card p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Portfolio Balance</span>
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight font-mono mb-3">
          ${state.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#1e2638]">
          <span>Available: <strong className="text-white">${state.availableBalance.toFixed(2)}</strong></span>
          <span>Reserved: <strong className="text-slate-300">${state.reservedBalance.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Card 2: Net Realized PnL */}
      <div className="cb-card p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Realized PnL</span>
          <div className={`p-2.5 rounded-xl border ${totalNetPnl >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {totalNetPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className={`text-3xl font-extrabold font-mono tracking-tight mb-3 ${totalNetPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {totalNetPnl >= 0 ? "+" : ""}${totalNetPnl.toFixed(2)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#1e2638]">
          <span>Closed Trades: <strong className="text-white">{totalTrades}</strong></span>
          <span>Profit Factor: <strong className="text-white">{profitFactor}</strong></span>
        </div>
      </div>

      {/* Card 3: Win Rate */}
      <div className="cb-card p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategy Win Rate</span>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white font-mono tracking-tight mb-3">
          {winRate}<span className="text-base font-normal text-slate-400">%</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1e2638]">
          <span className="text-emerald-400 font-bold">{winningTrades.length} Wins</span>
          <span className="text-red-400 font-bold">{losingTrades.length} Losses</span>
        </div>
      </div>

      {/* Card 4: Max Drawdown */}
      <div className="cb-card p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Drawdown</span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight mb-3">
          {state.currentDrawdownPercent.toFixed(2)}<span className="text-base font-normal text-slate-400">%</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#1e2638]">
          <span>Limit: <strong className="text-slate-300">10.0%</strong></span>
          <span>Exposure: <strong className="text-white">${state.totalExposure.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
}
