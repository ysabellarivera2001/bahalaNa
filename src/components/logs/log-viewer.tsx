import { ActivityLog } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface LogViewerProps {
  logs: ActivityLog[];
}

export function LogViewer({ logs }: LogViewerProps) {
  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="rounded-lg border bg-[var(--surface)] px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-[var(--text)]">{log.text}</p>
            <StatusBadge status={log.status} />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {new Date(log.timestamp).toLocaleString()} | {log.channel} | {log.level}
          </p>
        </div>
      ))}
    </div>
  );
}
