"use client";

import { useState, createContext, useContext } from "react";
import { Header } from "@/components/dashboard/Header";
import { LiveModeModal } from "@/components/dashboard/LiveModeModal";
import { useTradingBotStore } from "@/lib/trading/store";

const BotStoreContext = createContext<ReturnType<typeof useTradingBotStore> | null>(null);

export function useBotStore() {
  const context = useContext(BotStoreContext);
  if (!context) {
    throw new Error("useBotStore must be used within DashboardLayout Context Provider");
  }
  return context;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const store = useTradingBotStore();
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  return (
    <BotStoreContext.Provider value={store}>
      <div className="min-h-screen flex flex-col bg-[#080b11]">
        {/* Header Toolbar */}
        <Header
          status={store.state.status}
          mode={store.settings.tradingMode}
          apiConnected={true}
          onStart={store.startBot}
          onPause={store.pauseBot}
          onStop={store.stopBot}
          onEmergencyStop={() => store.emergencyStop(true)}
          onRunScan={store.runMarketScan}
          onOpenLiveModal={() => setIsLiveModalOpen(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer with Disclaimer (Requirement #65) */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © 2026 Coinbase Automated Trading Bot. Built with Next.js, Supabase Edge Functions & Deno.
            </p>
            <p className="font-semibold text-amber-500/80">
              ⚠️ Financial Risk Disclaimer: Automated trading involves financial risk. Past or simulated performance does not guarantee future results.
            </p>
          </div>
        </footer>

        {/* Safety Confirmation Modal */}
        <LiveModeModal
          isOpen={isLiveModalOpen}
          onClose={() => setIsLiveModalOpen(false)}
          onConfirmLiveMode={() => store.switchTradingMode("LIVE")}
        />
      </div>
    </BotStoreContext.Provider>
  );
}
