import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConnectivityTestCard } from "@/components/transfers/connectivity-test-card";
import { getDiagnostics, getSupportTickets } from "@/services/supportService";

export default async function SupportPage() {
  const [diag, tickets] = await Promise.all([getDiagnostics(), getSupportTickets()]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Support"
        description="Diagnostics, connectivity checks, and ticket history. SMAX push remains planned backend extension."
      />

      <Card title="Diagnostics Snapshot">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p className="flex items-center justify-between rounded border bg-[var(--surface-soft)] px-3 py-2">
            <span>Kaseya connectivity</span>
            <StatusBadge status={diag.kaseyaConnectivity === "pass" ? "success" : "failed"} />
          </p>
          <p className="flex items-center justify-between rounded border bg-[var(--surface-soft)] px-3 py-2">
            <span>Strev connectivity</span>
            <StatusBadge status={diag.revnueConnectivity === "pass" ? "success" : "failed"} />
          </p>
          <p className="flex items-center justify-between rounded border bg-[var(--surface-soft)] px-3 py-2">
            <span>Sync engine</span>
            <StatusBadge status={diag.syncEngine === "running" ? "success" : "partial"} />
          </p>
          <p className="flex items-center justify-between rounded border bg-[var(--surface-soft)] px-3 py-2">
            <span>Queue database</span>
            <StatusBadge status={diag.queueDatabase === "ok" ? "success" : "failed"} />
          </p>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">Checked at: {new Date(diag.checkedAt).toLocaleString()}</p>
      </Card>

      <ConnectivityTestCard />

      <Card title="Support Tickets" subtitle="Local support log with future SMAX adapter hook">
        <DataTable
          rows={tickets}
          columns={[
            { key: "id", title: "Ticket", render: (row) => row.id },
            { key: "severity", title: "Severity", render: (row) => row.severity },
            { key: "title", title: "Title", render: (row) => row.title },
            { key: "status", title: "Status", render: (row) => row.status },
            { key: "summary", title: "Summary", render: (row) => row.summary },
          ]}
        />
      </Card>
    </div>
  );
}
