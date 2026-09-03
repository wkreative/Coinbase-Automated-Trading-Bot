"use client";

import { Layers, XCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Position } from "@/lib/types";
import { MarketAssetMetric } from "@/lib/trading/store";

interface OpenPositionsTableProps {
  positions: Position[];
  marketAssets: MarketAssetMetric[];
  onClosePosition: (id: string, reason: Position["exitReason"], exitPrice: number) => void;
}

export function OpenPositionsTable({ positions, marketAssets, onClosePosition }: OpenPositionsTableProps) {
  return (
    <div className="cb-panel p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E2538]">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0052FF]" /> Active Coinbase Positions ({positions.length}/2)
        </h2>
        <span className="text-xs text-slate-400 font-mono">Target TP: +4.0% | SL: -2.5%</span>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#1E2538] rounded-lg bg-[#0A0D14]/50">
          <Layers className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-400">No active positions open.</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Scanning 5M candles for high-probability setup signals (Score &ge; 75).</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-[#1E2538] uppercase tracking-wider text-[11px]">
                <th className="pb-2.5 px-3">Pair</th>
                <th className="pb-2.5 px-3">Mode</th>
                <th className="pb-2.5 px-3">Entry Price</th>
                <th className="pb-2.5 px-3">Mark Price</th>
                <th className="pb-2.5 px-3">Size ($)</th>
                <th className="pb-2.5 px-3">Take Profit / Stop Loss</th>
                <th className="pb-2.5 px-3">Unrealized PnL</th>
                <th className="pb-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2538] font-medium">
              {positions.map((pos) => {
                const asset = marketAssets.find((a) => a.symbol === pos.symbol);
                const currentPrice = asset ? asset.price : pos.entryPrice;
                const pnlDollar = (currentPrice - pos.entryPrice) * pos.quantity - pos.entryFee;
                const pnlPercent = (pnlDollar / pos.quoteAmount) * 100;
                const isProfitable = pnlDollar >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-[#171D2C] transition-all">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse"></span>
                      {pos.symbol}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.mode === "PAPER" ? "cb-badge-paper" : "cb-badge-live"}`}>
                        {pos.mode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">${pos.entryPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-white font-bold">${currentPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300">${pos.quoteAmount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-400">
                      <span className="text-[#05B169] font-bold">${pos.takeProfitPrice.toLocaleString()}</span> /{" "}
                      <span className="text-[#DF2040] font-bold">${pos.stopLossPrice.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className={`flex items-center gap-1 ${isProfitable ? "text-[#05B169]" : "text-[#DF2040]"}`}>
                        {isProfitable ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isProfitable ? "+" : ""}${pnlDollar.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onClosePosition(pos.id, "MANUAL", currentPrice)}
                        className="px-2.5 py-1 rounded bg-[#DF2040]/15 hover:bg-[#DF2040] text-[#DF2040] hover:text-white border border-[#DF2040]/30 flex items-center gap-1 text-[11px] font-bold ml-auto transition-all cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" /> Cancel / Close
                      </button>
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
