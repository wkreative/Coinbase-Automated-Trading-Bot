"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck, X, KeyRound, Check } from "lucide-react";

interface LiveModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLiveMode: () => boolean;
}

export function LiveModeModal({ isOpen, onClose, onConfirmLiveMode }: LiveModeModalProps) {
  const [typedPhrase, setTypedPhrase] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (typedPhrase !== "TYPE ENABLE LIVE TRADING") {
      setErrorMsg("Confirmation phrase does not match. Please type exactly 'TYPE ENABLE LIVE TRADING'.");
      return;
    }

    if (!acknowledged) {
      setErrorMsg("You must acknowledge the financial risk checkbox.");
      return;
    }

    const success = onConfirmLiveMode();
    if (!success) {
      setErrorMsg("LIVE mode activation rejected: LIVE_TRADING_ENABLED is set to false in server environment settings.");
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-red-500/40 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 text-red-400 mb-4">
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Enable Real-Money LIVE Trading</h3>
            <p className="text-xs text-red-400 font-semibold">CRITICAL SAFETY CONFIRMATION</p>
          </div>
        </div>

        <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-4 mb-5 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-red-300">
            ⚠️ You are about to enable real-money trading on your Coinbase Advanced account.
          </p>
          <p>
            Real trades will execute automatically with actual USD balance using your strategy parameters.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>Coinbase API Key and Private Secret must be configured.</li>
            <li>Spot market orders will be submitted to the Coinbase order matching engine.</li>
            <li>Circuit breakers will monitor drawdown and daily losses.</li>
          </ul>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4 text-xs mb-6">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Type <span className="text-red-400 select-all font-mono font-bold">TYPE ENABLE LIVE TRADING</span> to confirm:
            </label>
            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => {
                setTypedPhrase(e.target.value);
                setErrorMsg("");
              }}
              placeholder="TYPE ENABLE LIVE TRADING"
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 bg-slate-950 text-red-500 focus:ring-red-500"
            />
            <span>
              I understand that automated trading involves financial risk and I accept responsibility for any profits or losses.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all cursor-pointer"
          >
            Cancel (Remain in PAPER)
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> CONFIRM LIVE TRADING
          </button>
        </div>
      </div>
    </div>
  );
}
