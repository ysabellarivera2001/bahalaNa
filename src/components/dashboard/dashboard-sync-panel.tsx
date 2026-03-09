"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";

type DashboardComparisonRow = {
  kaseya: {
    id: string;
    name: string;
    identifier: string;
  };
  revnueMatch?: {
    id: string;
    name: string;
    serialNumber: string;
    assetTag: string;
  };
};

interface DashboardSyncPanelProps {
  comparison: DashboardComparisonRow[];
}

type AssetView = {
  id: string;
  name: string;
  identifier: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function DashboardSyncPanel({ comparison }: DashboardSyncPanelProps) {
  const kaseyaAssets = useMemo<AssetView[]>(
    () =>
      comparison.map((row) => ({
        id: row.kaseya.id,
        name: row.kaseya.name,
        identifier: row.kaseya.identifier,
      })),
    [comparison],
  );

  const [strevAssets, setStrevAssets] = useState<AssetView[]>(
    comparison
      .filter((row) => row.revnueMatch)
      .map((row) => ({
        id: row.revnueMatch!.id,
        name: row.revnueMatch!.name,
        identifier: row.revnueMatch!.serialNumber || row.revnueMatch!.assetTag,
      })),
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const strevByIdentifier = useMemo(() => {
    const map = new Map<string, AssetView>();
    for (const asset of strevAssets) {
      map.set(normalize(asset.identifier), asset);
    }
    return map;
  }, [strevAssets]);

  const outOfSyncCount = useMemo(() => {
    return kaseyaAssets.reduce((count, asset) => {
      const right = strevByIdentifier.get(normalize(asset.identifier));
      if (!right) {
        return count + 1;
      }

      return normalize(right.name) === normalize(asset.name) ? count : count + 1;
    }, 0);
  }, [kaseyaAssets, strevByIdentifier]);

  const previewRows = kaseyaAssets.slice(0, 8);

  return (
    <Card
      title="Live Asset Sync (MVP)"
      subtitle="Visual one-way sync from Kaseya assets (left) to Strev assets (right)."
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-[var(--muted)]">
          Sync state: <span className="font-semibold text-[var(--text)]">{outOfSyncCount === 0 ? "In sync" : "Out of sync"}</span>
        </p>
        <p className="text-[var(--muted)]">{lastSyncedAt ? `Last sync: ${new Date(lastSyncedAt).toLocaleString()}` : "Last sync: not yet"}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="rounded-lg border bg-[var(--surface-soft)] p-3">
          <h4 className="text-sm font-semibold">Kaseya Assets</h4>
          <div className="mt-2 space-y-2">
            {previewRows.map((asset) => (
              <div key={asset.id} className="rounded-md border bg-[var(--surface)] px-2 py-1.5 text-sm">
                <p className="font-semibold">{asset.name}</p>
                <p className="font-mono text-xs text-[var(--muted)]">{asset.identifier}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="mx-auto rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-contrast)]"
          onClick={() => {
            setStrevAssets(
              kaseyaAssets.map((asset) => ({
                ...asset,
                id: `strev-${asset.id}`,
              })),
            );
            setLastSyncedAt(new Date().toISOString());
          }}
        >
          Sync -&gt;
        </button>

        <div className="rounded-lg border bg-[var(--surface-soft)] p-3">
          <h4 className="text-sm font-semibold">Strev Assets</h4>
          <div className="mt-2 space-y-2">
            {previewRows.map((asset) => {
              const right = strevByIdentifier.get(normalize(asset.identifier));
              const synced = !!right && normalize(right.name) === normalize(asset.name);

              return (
                <div key={asset.id} className="rounded-md border bg-[var(--surface)] px-2 py-1.5 text-sm">
                  {right ? (
                    <>
                      <p className="font-semibold">{right.name}</p>
                      <p className="font-mono text-xs text-[var(--muted)]">{right.identifier}</p>
                    </>
                  ) : (
                    <p className="text-xs text-[var(--muted)]">No matching asset</p>
                  )}
                  <p className={`mt-1 text-xs font-semibold ${synced ? "text-emerald-700" : "text-amber-700"}`}>
                    {synced ? "Synced" : "Out of sync"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
