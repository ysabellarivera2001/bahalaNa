import { DataTable } from "@/components/tables/data-table";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTransferHistory } from "@/services/assetService";

export default async function TransfersPage() {
  const history = await getTransferHistory();
  const successCount = history.filter((item) => item.status === "success").length;
  const partialCount = history.filter((item) => item.status === "partial").length;
  const failedCount = history.filter((item) => item.status === "failed").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transfers"
        description="Record of Kaseya -> Strev transfer runs and row-level outcomes."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Success">
          <p className="text-2xl font-bold">{successCount}</p>
        </Card>
        <Card title="Partial">
          <p className="text-2xl font-bold">{partialCount}</p>
        </Card>
        <Card title="Failed">
          <p className="text-2xl font-bold">{failedCount}</p>
        </Card>
      </div>

      <Card title="Transfer History" subtitle="Most recent outcomes first based on current mock dataset order">
        <DataTable
          rows={history}
          columns={[
            { key: "time", title: "Time", render: (row) => new Date(row.timestamp).toLocaleString() },
            { key: "identifier", title: "Identifier", render: (row) => row.kaseyaIdentifier },
            { key: "action", title: "Action", render: (row) => row.action },
            { key: "status", title: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "mapped", title: "Mapped Fields", render: (row) => row.mappedNonEmptyCount },
            { key: "message", title: "Message", render: (row) => row.message },
          ]}
        />
      </Card>
    </div>
  );
}
