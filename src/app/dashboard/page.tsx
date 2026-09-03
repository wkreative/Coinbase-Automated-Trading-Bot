"use client";

import { useBotStore } from "./layout";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { MarketChart } from "@/components/charts/MarketChart";
import { MarketAssetsGrid } from "@/components/dashboard/MarketAssetsGrid";
import { OpenPositionsTable } from "@/components/dashboard/OpenPositionsTable";
import { EquityChart } from "@/components/charts/EquityChart";

export default function DashboardOverviewPage() {
  const store = useBotStore();

  return (
    <div className="space-y-6">
      {/* Top Overview KPI Cards */}
      <OverviewCards
        state={store.state}
        positions={store.positions}
        closedTrades={store.closedTrades}
      />

      {/* Real-time Technical Market Chart & Technical Gauges */}
      <MarketChart
        marketAssets={store.marketAssets}
        positions={store.positions}
      />

      {/* Scanned Market Asset Tickers */}
      <MarketAssetsGrid assets={store.marketAssets} />

      {/* Active Open Positions */}
      <OpenPositionsTable
        positions={store.positions}
        marketAssets={store.marketAssets}
        onClosePosition={store.closePosition}
      />

      {/* Account Performance & Equity Growth Chart */}
      <EquityChart
        closedTrades={store.closedTrades}
        startingBalance={store.settings.startingCapital}
      />
    </div>
  );
}
