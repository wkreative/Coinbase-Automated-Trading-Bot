"use client";

import { useBotStore } from "../layout";
import { TradeHistoryTable } from "@/components/dashboard/TradeHistoryTable";

export default function TradesPage() {
  const store = useBotStore();

  return (
    <div>
      <TradeHistoryTable trades={store.closedTrades} />
    </div>
  );
}
