"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { Position } from "@/lib/types";

interface EquityChartProps {
  closedTrades: Position[];
  startingBalance: number;
}

export function EquityChart({ closedTrades, startingBalance }: EquityChartProps) {
  // Build cumulative equity points
  let currentVal = startingBalance;

  const data = [
    { time: "Start", equity: startingBalance, pnl: 0 },
    ...closedTrades
      .slice()
      .reverse()
      .map((t, idx) => {
        currentVal += t.netPnl || 0;
        return {
          time: `Trade #${idx + 1}`,
          equity: Number(currentVal.toFixed(2)),
          pnl: Number((t.netPnl || 0).toFixed(2)),
        };
      }),
  ];

  return (
    <div className="glass-card p-5 rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Account Equity Growth Curve
          </h2>
          <p className="text-xs text-slate-400">Simulated / Realized Capital Performance</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Peak Balance</span>
          <span className="text-sm font-bold text-emerald-400">${Math.max(...data.map((d) => d.equity)).toFixed(2)}</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem" }}
              labelStyle={{ color: "#94a3b8", fontSize: "12px" }}
              formatter={(val: any) => [`$${Number(val || 0).toFixed(2)}`, "Balance"]}
            />
            <Area type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
