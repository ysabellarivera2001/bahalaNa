"use client";

import { SyncMode } from "@/types";

interface TopBarProps {
  mode: SyncMode;
}

export function TopBar({ mode }: TopBarProps) {
  const modeClass =
    mode === "LIVE"
      ? "bg-[var(--golden-clover)] text-[var(--accent-contrast)]"
      : "bg-[var(--rose-blush)] text-[var(--accent-contrast)]";

  return (
    <header className="flex items-center justify-between rounded-xl border bg-[var(--surface)] px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Operations</p>
        <p className="text-base font-semibold">Kaseya -&gt; Strev/Revnue Sync</p>
      </div>
      <div className={`rounded-full px-3 py-1 text-xs font-bold ${modeClass}`}>Autosync: {mode}</div>
    </header>
  );
}
