"use client";

import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { Zap, CheckCircle2, AlertCircle, BarChart2 } from "lucide-react";
import { MarketAssetMetric } from "@/lib/trading/store";
import { Position, TradingSymbol } from "@/lib/types";

interface MarketChartProps {
  marketAssets: MarketAssetMetric[];
  positions: Position[];
}

export function MarketChart({ marketAssets, positions }: MarketChartProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<TradingSymbol>("BTC-USD");

  const currentAsset = marketAssets.find((a) => a.symbol === selectedSymbol) || marketAssets[0];
  const activePosition = positions.find((p) => p.symbol === selectedSymbol);

  // Historical data generator
  const generateChartData = () => {
    const data = [];
    const base = currentAsset.price;
    const now = Date.now();

    for (let i = 30; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const trendNoise = (Math.sin(i / 3) * 0.003 + (Math.random() - 0.48) * 0.002) * base;
      const price = Number((base - trendNoise).toFixed(2));
      const ema20 = Number((price * 0.998).toFixed(2));
      const ema50 = Number((price * 0.994).toFixed(2));

      data.push({ time, price, ema20, ema50 });
    }
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="cb-card p-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1e2638]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Coinbase Advanced Spot Terminal</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                5M Candles
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Live technical overlays & strategy evaluation</p>
          </div>
        </div>

        {/* Pair Selector */}
        <div className="flex items-center gap-1.5 bg-[#0b0e14] p-1.5 rounded-xl border border-[#1e2638]">
          {marketAssets.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedSymbol(asset.symbol)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedSymbol === asset.symbol
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {asset.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Price Header & Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 px-1">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {selectedSymbol} Spot Price
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  ${currentAsset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md ${
                    currentAsset.pullbackPercent < 0
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  Pullback: {currentAsset.pullbackPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Signal Score
              </span>
              <div className="flex items-center gap-1.5 justify-end font-mono">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className={`text-2xl font-extrabold ${currentAsset.score >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
                  {currentAsset.score}<span className="text-xs font-normal text-slate-500">/100</span>
                </span>
              </div>
            </div>
          </div>

          {/* Chart Viewport */}
          <div className="h-72 w-full bg-[#0b0e14] rounded-xl p-4 border border-[#1e2638]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" opacity={0.8} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121722", borderColor: "#1e2638", borderRadius: "0.75rem", fontSize: "12px" }}
                  formatter={(val: any, name: any) => [`$${Number(val || 0).toLocaleString()}`, String(name || "").toUpperCase()]}
                />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#chartGrad)" name="Price" />
                <Area type="monotone" dataKey="ema20" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="EMA 20" />
                <Area type="monotone" dataKey="ema50" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="EMA 50" />

                {activePosition && (
                  <>
                    <ReferenceLine y={activePosition.takeProfitPrice} stroke="#10b981" strokeWidth={1.5} label={{ value: "TP", fill: "#10b981", fontSize: 11 }} />
                    <ReferenceLine y={activePosition.stopLossPrice} stroke="#ef4444" strokeWidth={1.5} label={{ value: "SL", fill: "#ef4444", fontSize: 11 }} />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Indicator Status Gauges */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Signal Score Meter */}
          <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#1e2638]">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-semibold text-slate-300">Strategy Score Match</span>
              <span className="font-bold font-mono text-blue-400">{currentAsset.score}/100</span>
            </div>
            <div className="w-full bg-[#161c2a] h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-blue-500 transition-all duration-500"
                style={{ width: `${currentAsset.score}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentAsset.score >= 75
                ? "✅ High quality setup signal. Target threshold (75) met."
                : "⏳ Scanning... Score below 75 threshold."}
            </p>
          </div>

          {/* EMA Trend */}
          <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#1e2638] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">EMA Trend (20 vs 50)</span>
              <span className="text-sm font-bold text-white font-mono">
                {currentAsset.ema20.toFixed(1)} / {currentAsset.ema50.toFixed(1)}
              </span>
            </div>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                currentAsset.ema20 > currentAsset.ema50 ? "cb-badge-green" : "cb-badge-live"
              }`}
            >
              {currentAsset.ema20 > currentAsset.ema50 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {currentAsset.ema20 > currentAsset.ema50 ? "BULLISH" : "BEARISH"}
            </span>
          </div>

          {/* RSI Gauge */}
          <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#1e2638] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">RSI (14) Target [35-48]</span>
              <span className="text-sm font-bold text-white font-mono">{currentAsset.rsi.toFixed(1)}</span>
            </div>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                currentAsset.rsi >= 35 && currentAsset.rsi <= 48 ? "cb-badge-green" : "bg-slate-800 text-slate-400"
              }`}
            >
              {currentAsset.rsi >= 35 && currentAsset.rsi <= 48 ? "OPTIMAL" : "OUT OF RANGE"}
            </span>
          </div>

          {/* Position Status */}
          <div className="bg-[#0b0e14] p-4 rounded-xl border border-[#1e2638] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Order Status</span>
              <span className="text-sm font-bold text-white">
                {activePosition ? `POSITION OPEN (${activePosition.mode})` : "NO POSITION"}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${activePosition ? "cb-badge-paper" : "bg-slate-800 text-slate-400"}`}>
              {activePosition ? "ACTIVE" : "MONITORING"}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
