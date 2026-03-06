import { HealthState, TransferStatus } from "@/types";

interface StatusBadgeProps {
  status: HealthState | TransferStatus | "info";
}

const styles: Record<StatusBadgeProps["status"], string> = {
  healthy: "bg-[var(--golden-clover)] text-[var(--accent-contrast)]",
  degraded: "bg-[var(--rose-blush)] text-[var(--accent-contrast)]",
  critical: "bg-[var(--peach-blossom)] text-[var(--artic-daisy)]",
  success: "bg-[var(--golden-clover)] text-[var(--accent-contrast)]",
  partial: "bg-[var(--rose-blush)] text-[var(--accent-contrast)]",
  failed: "bg-[var(--peach-blossom)] text-[var(--artic-daisy)]",
  info: "bg-[var(--olive-petal)] text-[var(--artic-daisy)]",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
