import { DataTable } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAssetComparison } from "@/services/assetService";
import { getSyncEvents } from "@/services/operationService";

export default async function ExceptionsPage() {
  const [comparison, events] = await Promise.all([getAssetComparison(), getSyncEvents()]);

  const assetExceptions = comparison.filter((row) => row.action === "CREATE" || !row.kaseya.hasAssetInfo);
  const eventExceptions = events.filter((row) => row.status === "failed" || row.status === "partial");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Exceptions"
        description="Assets and sync events that need attention before production automation."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Asset Exceptions">
          <p className="text-2xl font-bold">{assetExceptions.length}</p>
        </Card>
        <Card title="Partial Events">
          <p className="text-2xl font-bold">{eventExceptions.filter((item) => item.status === "partial").length}</p>
        </Card>
        <Card title="Failed Events">
          <p className="text-2xl font-bold">{eventExceptions.filter((item) => item.status === "failed").length}</p>
        </Card>
      </div>

      <Card title="Asset Exceptions" subtitle="CREATE actions or Kaseya assets with missing AssetInfo payload">
        <DataTable
          rows={assetExceptions}
          columns={[
            { key: "identifier", title: "Identifier", render: (row) => row.kaseya.identifier },
            { key: "name", title: "Kaseya Name", render: (row) => row.kaseya.name },
            { key: "action", title: "Action", render: (row) => row.action },
            {
              key: "detail",
              title: "Data Quality",
              render: (row) => (row.kaseya.hasAssetInfo ? `AssetInfo count: ${row.kaseya.assetInfoCount}` : "Missing AssetInfo"),
            },
            {
              key: "strev",
              title: "Strev Match",
              render: (row) => (row.revnueMatch ? row.revnueMatch.name : "No identifier match"),
            },
          ]}
        />
      </Card>

      <Card title="Sync Event Exceptions" subtitle="Recent partial or failed events from sync monitoring">
        <DataTable
          rows={eventExceptions}
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
