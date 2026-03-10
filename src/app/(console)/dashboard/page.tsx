import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardSyncPanel } from "@/components/dashboard/dashboard-sync-panel";
import { getAssetComparison, getTransferHistory } from "@/services/assetService";
import { getServerSyncOverview } from "@/services/operationServerService";

export default async function DashboardPage() {
  const [comparison, transferHistory, overview] = await Promise.all([
    getAssetComparison(),
    getTransferHistory(),
    getServerSyncOverview(),
  ]);

  const createCount = comparison.filter((row) => row.action === "CREATE").length;
  const updateCount = comparison.filter((row) => row.action === "UPDATE").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Operational overview for asset sync transfer, autosync health, and queue posture."
      />

      <DashboardSyncPanel comparison={comparison} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Kaseya Assets">
          <p className="text-2xl font-bold">{comparison.length}</p>
        </Card>
        <Card title="Pending CREATE">
          <p className="text-2xl font-bold">{createCount}</p>
        </Card>
        <Card title="Pending UPDATE">
          <p className="text-2xl font-bold">{updateCount}</p>
        </Card>
        <Card title="Success Rate (24h)">
          <p className="text-2xl font-bold">{overview.successRate}%</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Sync Health" subtitle="Queue depth, reconcile timing, worker heartbeat">
          <div className="space-y-2 text-sm">
            <p className="flex items-center justify-between">
              <span>Health</span> <StatusBadge status={overview.health} />
            </p>
            <p className="flex items-center justify-between">
              <span>Queue depth</span>
              <span className="font-semibold">{overview.queueDepth}</span>
            </p>
            <p className="flex items-center justify-between">
              <span>Worker heartbeat</span>
              <span className="font-semibold">{new Date(overview.workerHeartbeat).toLocaleString()}</span>
            </p>
            <p className="flex items-center justify-between">
              <span>Last reconcile</span>
              <span className="font-semibold">{new Date(overview.lastReconcile).toLocaleString()}</span>
            </p>
          </div>
        </Card>

        <Card title="Latest Transfers" subtitle="Recent create/update operations">
          <div className="space-y-2">
            {transferHistory.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-lg border bg-[var(--surface-soft)] px-3 py-2 text-sm">
                <p className="font-semibold">{item.kaseyaIdentifier}</p>
                <p className="text-[var(--muted)]">{item.message}</p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-[var(--muted)]">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
