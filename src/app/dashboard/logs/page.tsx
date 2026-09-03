"use client";

import { useBotStore } from "../layout";
import { LogsViewer } from "@/components/dashboard/LogsViewer";

export default function LogsPage() {
  const store = useBotStore();

  return (
    <div>
      <LogsViewer logs={store.logs} />
    </div>
  );
}
