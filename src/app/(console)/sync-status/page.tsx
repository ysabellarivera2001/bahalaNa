"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/tables/data-table";
import { getSyncEvents, getSyncOverview, runDryRun, runReconcile } from "@/services/operationService";
import { SyncEvent, SyncOverview } from "@/types";

export default function SyncStatusPage() {
  const [overview, setOverview] = useState<SyncOverview | null>(null);
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [actionMessage, setActionMessage] = useState<string>("");

  useEffect(() => {
    void getSyncOverview().then(setOverview);
    void getSyncEvents().then(setEvents);
  }, []);

  if (!overview) {
    return <p className="text-sm text-[var(--muted)]">Loading sync status...</p>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sync Status"
        description="Monitor autosync worker health, queue behavior, and failed or partial events."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card title="Health">
          <StatusBadge status={overview.health} />
        </Card>
        <Card title="Queue Depth">
          <p className="text-2xl font-bold">{overview.queueDepth}</p>
        </Card>
        <Card title="Failed Events">
          <p className="text-2xl font-bold">{overview.failedEvents}</p>
        </Card>
        <Card title="Partial Events">
          <p className="text-2xl font-bold">{overview.partialEvents}</p>
        </Card>
      </div>

      <Card title="Controls" subtitle="Operational controls mapped to /api/sync/reconcile and /api/sync/dry-run">
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-contrast)]"
            onClick={async () => {
              const result = await runReconcile();
              setActionMessage(result.message);
            }}
          >
            Run Reconcile
          </button>
          <button
            className="rounded-lg border px-3 py-2 text-sm font-semibold"
            onClick={async () => {
              const result = await runDryRun();
              setActionMessage(result.message);
            }}
          >
            Run Dry-Run
          </button>
          <p className="text-sm text-[var(--muted)]">{actionMessage}</p>
        </div>
      </Card>

      <Card title="Recent Events">
        <DataTable
          rows={events}
          columns={[
            { key: "time", title: "Time", render: (row) => new Date(row.timestamp).toLocaleString() },
            { key: "identifier", title: "Identifier", render: (row) => row.identifier },
            { key: "type", title: "Type", render: (row) => row.eventType },
            { key: "status", title: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "attempts", title: "Attempts", render: (row) => row.attempts },
            { key: "detail", title: "Detail", render: (row) => row.detail },
          ]}
        />
      </Card>
    </div>
  );
}
