"use client";

import { Activity, Flame, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { MarketAssetMetric } from "@/lib/trading/store";

interface MarketAssetsGridProps {
  assets: MarketAssetMetric[];
}

export function MarketAssetsGrid({ assets }: MarketAssetsGridProps) {
  const getAssetStatusBadge = (status: MarketAssetMetric["status"]) => {
    switch (status) {
      case "READY":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded cb-badge-green flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> READY
          </span>
        );
      case "POSITION OPEN":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#0052FF]/15 text-[#0052FF] border border-[#0052FF]/30 flex items-center gap-1">
            <Flame className="w-3 h-3" /> POSITION OPEN
          </span>
        );
      case "RISK OFF":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded cb-badge-live flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> RISK OFF
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#1E2538] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> SCANNING
          </span>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0052FF]" /> Coinbase Spot Market Scan (5M Candles)
        </h2>
        <span className="text-xs text-slate-400">Ticks every 6s</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const isEmaBullish = asset.ema20 > asset.ema50;

          return (
            <div key={asset.symbol} className="cb-panel p-4 hover:border-[#0052FF]/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono tracking-tight">{asset.symbol}</h3>
                  <p className="text-[10px] text-slate-400 uppercase">Coinbase Spot</p>
                </div>
                {getAssetStatusBadge(asset.status)}
              </div>

              {/* Price & Score */}
              <div className="flex items-baseline justify-between mb-3 pb-2.5 border-b border-[#1E2538]">
                <div>
                  <span className="text-2xl font-black text-white font-mono tracking-tight">
                    ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase">Signal Score</span>
                  <span
                    className={`text-base font-black ${
                      asset.score >= 75 ? "text-[#05B169]" : asset.score >= 50 ? "text-amber-400" : "text-slate-400"
                    }`}
                  >
                    {asset.score}<span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </span>
                </div>
              </div>

              {/* Technical Indicator Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#0A0D14] p-2 rounded border border-[#1E2538]">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">EMA 20/50</span>
                  <span className={`font-bold ${isEmaBullish ? "text-[#05B169]" : "text-[#DF2040]"}`}>
                    {asset.ema20.toFixed(1)} / {asset.ema50.toFixed(1)}
                  </span>
                </div>

                <div className="bg-[#0A0D14] p-2 rounded border border-[#1E2538]">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">RSI (14)</span>
                  <span
                    className={`font-bold ${
                      asset.rsi >= 35 && asset.rsi <= 48 ? "text-[#05B169]" : "text-slate-300"
                    }`}
                  >
                    {asset.rsi.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
