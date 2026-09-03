"use client";

import { useBotStore } from "../layout";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function SettingsPage() {
  const store = useBotStore();

  return (
    <div>
      <SettingsForm settings={store.settings} onSaveSettings={store.setSettings} />
    </div>
  );
}
