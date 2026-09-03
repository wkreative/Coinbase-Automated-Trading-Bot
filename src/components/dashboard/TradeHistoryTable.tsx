"use client";

import { useState } from "react";
import { History, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Position } from "@/lib/types";

interface TradeHistoryTableProps {
  trades: Position[];
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const [symbolFilter, setSymbolFilter] = useState<string>("ALL");
  const [modeFilter, setModeFilter] = useState<string>("ALL");
  const [resultFilter, setResultFilter] = useState<string>("ALL");

  const filteredTrades = trades.filter((t) => {
    if (symbolFilter !== "ALL" && t.symbol !== symbolFilter) return false;
    if (modeFilter !== "ALL" && t.mode !== modeFilter) return false;
    if (resultFilter === "WIN" && (t.netPnl || 0) <= 0) return false;
    if (resultFilter === "LOSS" && (t.netPnl || 0) >= 0) return false;
    return true;
  });

  return (
    <div className="glass-card p-5 rounded-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" /> Completed Trade Execution Log
          </h2>
          <p className="text-xs text-slate-400">Audited Paper & Live Executions</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Assets</option>
              <option value="BTC-USD">BTC-USD</option>
              <option value="ETH-USD">ETH-USD</option>
              <option value="SOL-USD">SOL-USD</option>
            </select>
          </div>

          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              <option value="PAPER">PAPER</option>
              <option value="LIVE">LIVE</option>
            </select>
          </div>

          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Results</option>
              <option value="WIN">Wins Only</option>
              <option value="LOSS">Losses Only</option>
            </select>
          </div>
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">No completed trades recorded matching filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Symbol</th>
                <th className="pb-3 px-3">Mode</th>
                <th className="pb-3 px-3">Entry</th>
                <th className="pb-3 px-3">Exit</th>
                <th className="pb-3 px-3">Size ($)</th>
                <th className="pb-3 px-3">Net PnL</th>
                <th className="pb-3 px-3">PnL %</th>
                <th className="pb-3 px-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTrades.map((t) => {
                const isWin = (t.netPnl || 0) >= 0;
                return (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-all">
                    <td className="py-3 px-3 text-slate-400">
                      {t.closedAt ? new Date(t.closedAt).toLocaleTimeString() : "-"}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{t.symbol}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${t.mode === "PAPER" ? "badge-paper" : "badge-live"}`}>
                        {t.mode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">${t.entryPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-white font-bold">${(t.exitPrice || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300">${t.quoteAmount.toFixed(2)}</td>
                    <td className={`py-3 px-3 font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                      {isWin ? "+" : ""}${(t.netPnl || 0).toFixed(2)}
                    </td>
                    <td className={`py-3 px-3 font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                      {isWin ? "+" : ""}${(t.pnlPercent || 0).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.exitReason === "TAKE_PROFIT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                        {t.exitReason}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
