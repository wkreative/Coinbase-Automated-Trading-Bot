"use client";

import { useBotStore } from "../layout";
import { SignalHistoryTable } from "@/components/dashboard/SignalHistoryTable";

export default function SignalsPage() {
  const store = useBotStore();

  return (
    <div>
      <SignalHistoryTable signals={store.signals} />
    </div>
  );
}
