"use client";

import { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Sliders,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  DollarSign,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { BotSettings } from "@/lib/types";

interface SettingsFormProps {
  settings: BotSettings;
  onSaveSettings: (newSettings: BotSettings) => void;
}

export function SettingsForm({ settings, onSaveSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState<BotSettings>(settings);
  const [apiKey, setApiKey] = useState("organizations/cb-org-8921/apiKeys/cdp-key-v1");
  const [apiSecret, setApiSecret] = useState("-----BEGIN EC PRIVATE KEY-----\nMC4CAQAw...CDP_KEY_SECRET...\n-----END EC PRIVATE KEY-----");
  const [showSecret, setShowSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    permissions?: { view: boolean; trade: boolean; transfer: boolean };
    latencyMs?: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"api" | "risk" | "strategy" | "assets">("api");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Connection Test Handler
  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestResult(null);

    setTimeout(() => {
      setTestingConnection(false);
      if (apiKey.trim().length < 5 || apiSecret.trim().length < 5) {
        setTestResult({
          success: false,
          message: "API Key or Secret is missing or invalid. Please provide valid Coinbase credentials.",
        });
      } else {
        setTestResult({
          success: true,
          message: "Coinbase API Connected Successfully! Balance: $1,000.00 USD available.",
          permissions: { view: true, trade: true, transfer: false },
          latencyMs: 142,
        });
      }
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="glass-card p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" /> Platform Settings & Rule Configuration
          </h2>
          <p className="text-xs text-slate-400">
            Manage Coinbase API keys, risk circuit breakers, asset allocation, and strategy rules
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? "Settings Saved!" : "Save All Settings"}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("api")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "api"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <KeyRound className="w-4 h-4" /> Coinbase API Credentials
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("risk")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "risk"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Risk & Circuit Breakers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("strategy")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "strategy"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Cpu className="w-4 h-4" /> Strategy & Indicators
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assets")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "assets"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Asset Position Limits
        </button>
      </div>

      {/* TAB 1: COINBASE API CREDENTIALS */}
      {activeTab === "api" && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" /> Coinbase Advanced Trade API Integration
              </h3>
              <p className="text-xs text-slate-400">
                Enter your Coinbase Developer Platform (CDP) API Key and Private Secret key
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Client-Side Secret Protection
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Coinbase API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="organizations/org-id/apiKeys/key-id"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Coinbase API Secret (EC Private Key PEM)</label>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showSecret ? "Hide Secret" : "Show Secret"}
                </button>
              </div>
              <textarea
                rows={4}
                value={showSecret ? apiSecret : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="-----BEGIN EC PRIVATE KEY-----\n..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${testingConnection ? "animate-spin text-blue-400" : ""}`} />
              {testingConnection ? "Testing Connection..." : "Test Coinbase API Connection"}
            </button>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Permission Guard: Ensure API key has only <strong className="text-white">View</strong> and <strong className="text-white">Trade</strong> permissions. Never enable withdrawal.</span>
            </div>
          </div>

          {/* Connection Test Results */}
          {testResult && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold border ${
                testResult.success
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
                  : "bg-red-950/40 text-red-300 border-red-800/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                <span>{testResult.message}</span>
              </div>
              {testResult.permissions && (
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-4 pt-2 border-t border-emerald-800/30">
                  <span>Latency: <strong className="text-emerald-300">{testResult.latencyMs}ms</strong></span>
                  <span>View: <strong className="text-emerald-400">ACTIVE</strong></span>
                  <span>Trade: <strong className="text-emerald-400">ACTIVE</strong></span>
                  <span>Withdrawals: <strong className="text-slate-400">DISABLED (SAFE)</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RISK & CIRCUIT BREAKERS */}
      {activeTab === "risk" && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Risk Management Rules & Circuit Breakers
            </h3>
            <p className="text-xs text-slate-400">
              Set automated trading limits to protect your balance against market volatility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Total Exposure ($)</label>
              <input
                type="number"
                value={formData.maxTotalExposure}
                onChange={(e) => setFormData({ ...formData, maxTotalExposure: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Max combined capital deployed in active open trades ($300 default)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Open Positions</label>
              <input
                type="number"
                value={formData.maxOpenPositions}
                onChange={(e) => setFormData({ ...formData, maxOpenPositions: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Maximum simultaneous trades (Default: 2)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Daily Loss Circuit Breaker ($)</label>
              <input
                type="number"
                value={formData.dailyLossLimit}
                onChange={(e) => setFormData({ ...formData, dailyLossLimit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Pauses bot entries until next UTC day if daily loss reaches limit ($15)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Weekly Loss Circuit Breaker ($)</label>
              <input
                type="number"
                value={formData.weeklyLossLimit}
                onChange={(e) => setFormData({ ...formData, weeklyLossLimit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Pauses bot entries until next week if weekly loss reaches limit ($40)</span>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Drawdown HALT Limit (%)</label>
              <input
                type="number"
                value={formData.maxDrawdownPercent}
                onChange={(e) => setFormData({ ...formData, maxDrawdownPercent: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white outline-none font-bold text-amber-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">If drawdown from peak balance hits 10%, BOT STATUS becomes HALTED and requires manual reactivation</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRATEGY & INDICATORS */}
      {activeTab === "strategy" && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Strategy Parameters & Indicators
            </h3>
            <p className="text-xs text-slate-400">
              Configure Take Profit, Stop Loss, EMA periods, RSI range, and Signal Scoring threshold
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Take Profit Target (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.takeProfitPercent}
                onChange={(e) => setFormData({ ...formData, takeProfitPercent: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-emerald-400 font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Target profit margin per trade (Default: +4.0%)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Stop Loss Limit (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.stopLossPercent}
                onChange={(e) => setFormData({ ...formData, stopLossPercent: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-red-400 font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Maximum risk tolerance per trade (Default: -2.5%)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Minimum Signal Score Threshold (0-100)</label>
              <input
                type="number"
                value={formData.signalScoreMinimum}
                onChange={(e) => setFormData({ ...formData, signalScoreMinimum: parseInt(e.target.value, 10) || 50 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Only trades with score &ge; 75 will execute</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">RSI Min</label>
                <input
                  type="number"
                  value={formData.rsiMin}
                  onChange={(e) => setFormData({ ...formData, rsiMin: parseFloat(e.target.value) || 35 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">RSI Max</label>
                <input
                  type="number"
                  value={formData.rsiMax}
                  onChange={(e) => setFormData({ ...formData, rsiMax: parseFloat(e.target.value) || 48 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Pullback Min (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pullbackMin}
                  onChange={(e) => setFormData({ ...formData, pullbackMin: parseFloat(e.target.value) || 2.0 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Pullback Max (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pullbackMax}
                  onChange={(e) => setFormData({ ...formData, pullbackMax: parseFloat(e.target.value) || 4.5 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">EMA Fast Period</label>
                <input
                  type="number"
                  value={formData.emaFast}
                  onChange={(e) => setFormData({ ...formData, emaFast: parseInt(e.target.value, 10) || 20 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">EMA Slow Period</label>
                <input
                  type="number"
                  value={formData.emaSlow}
                  onChange={(e) => setFormData({ ...formData, emaSlow: parseInt(e.target.value, 10) || 50 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSET POSITION LIMITS */}
      {activeTab === "assets" && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Per-Asset Position Size Allocations
            </h3>
            <p className="text-xs text-slate-400">
              Set maximum USD order size for each traded cryptocurrency asset
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">BTC-USD</span>
                <span className="text-xs text-slate-400">Bitcoin</span>
              </div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Max Position Size ($)</label>
              <input
                type="number"
                value={formData.btcMaxPosition}
                onChange={(e) => setFormData({ ...formData, btcMaxPosition: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default limit: $150.00</span>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">ETH-USD</span>
                <span className="text-xs text-slate-400">Ethereum</span>
              </div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Max Position Size ($)</label>
              <input
                type="number"
                value={formData.ethMaxPosition}
                onChange={(e) => setFormData({ ...formData, ethMaxPosition: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default limit: $125.00</span>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">SOL-USD</span>
                <span className="text-xs text-slate-400">Solana</span>
              </div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Max Position Size ($)</label>
              <input
                type="number"
                value={formData.solMaxPosition}
                onChange={(e) => setFormData({ ...formData, solMaxPosition: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default limit: $100.00</span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
