import { LogViewer } from "@/components/logs/log-viewer";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getActivityLogs } from "@/services/logService";

export default async function ActivityPage() {
  const logs = await getActivityLogs();
  const unread = logs.filter((log) => !log.read).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Activity Center"
        description="Notifications and message logs for transfers, warnings, and failed operations."
      />
      <Card title="Unread" subtitle="Equivalent to unread badge tracking">
        <p className="text-2xl font-bold">{unread}</p>
      </Card>
      <Card title="Operational Logs">
        <LogViewer logs={logs} />
      </Card>
    </div>
  );
}
