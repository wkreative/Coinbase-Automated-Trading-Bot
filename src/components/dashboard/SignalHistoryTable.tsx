"use client";

import { Zap, CheckCircle2, XCircle } from "lucide-react";
import { SignalEntry } from "@/lib/trading/store";

interface SignalHistoryTableProps {
  signals: SignalEntry[];
}

export function SignalHistoryTable({ signals }: SignalHistoryTableProps) {
  return (
    <div className="glass-card p-5 rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" /> Strategy Signal Audit Log
          </h2>
          <p className="text-xs text-slate-400">All Evaluated Strategy Signals (Minimum Score: 75)</p>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <Zap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">No signals generated yet in current session.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3">Symbol</th>
                <th className="pb-3 px-3">Price</th>
                <th className="pb-3 px-3">EMA 20/50</th>
                <th className="pb-3 px-3">RSI</th>
                <th className="pb-3 px-3">Pullback</th>
                <th className="pb-3 px-3">Score</th>
                <th className="pb-3 px-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {signals.map((sig) => (
                <tr key={sig.id} className="hover:bg-slate-900/40 transition-all">
                  <td className="py-3 px-3 text-slate-400">{new Date(sig.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-3 font-bold text-white">{sig.symbol}</td>
                  <td className="py-3 px-3 text-slate-200">${sig.price.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-300">
                    {sig.ema20.toFixed(1)} / {sig.ema50.toFixed(1)}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{sig.rsi.toFixed(1)}</td>
                  <td className="py-3 px-3 text-slate-300">{sig.pullbackPercent.toFixed(2)}%</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{sig.totalScore}/100</td>
                  <td className="py-3 px-3">
                    {sig.decision === "BUY" ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> BUY
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3 text-red-400" /> REJECT
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
