import { SyncEvent, SyncOverview } from "@/types";

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  const port = process.env.PORT?.trim() || "3000";
  return `http://localhost:${port}`;
}

type LiveAsset = {
  id: string;
  name: string;
  identifier: string;
  modifiedDate?: string;
};

type LiveSyncResponse = {
  ok: boolean;
  checkedAt: string;
  source: "live" | "mock";
  summary: {
    kaseyaCount: number;
    strevCount: number;
    outOfSyncCount: number;
    matchedCount: number;
  };
  kaseyaAssets: LiveAsset[];
  strevAssets: LiveAsset[];
  message?: string;
};

async function fetchLiveSync(): Promise<LiveSyncResponse> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/live-sync`, { cache: "no-store" });
  return (await response.json()) as LiveSyncResponse;
}

export async function getSyncOverview(): Promise<SyncOverview> {
  try {
    const data = await fetchLiveSync();
    if (!data.ok || data.source !== "live") {
      throw new Error(data.message ?? "Live sync endpoint unavailable.");
    }

    const failedEvents = data.summary.outOfSyncCount - (data.kaseyaAssets.length - data.summary.matchedCount - data.summary.outOfSyncCount);

    return {
      health: data.summary.outOfSyncCount > 0 ? "degraded" : "healthy",
      mode: "LIVE",
      queueDepth: data.summary.outOfSyncCount,
      successRate: data.summary.kaseyaCount === 0 ? 0 : Number(((data.summary.matchedCount / data.summary.kaseyaCount) * 100).toFixed(1)),
      workerHeartbeat: data.checkedAt,
      lastReconcile: data.checkedAt,
      failedEvents: Math.max(failedEvents, 0),
      partialEvents: Math.max(data.summary.outOfSyncCount - Math.max(failedEvents, 0), 0),
    };
  } catch {
    return {
      health: "critical",
      mode: "OFFLINE",
      queueDepth: 0,
      successRate: 0,
      workerHeartbeat: new Date().toISOString(),
      lastReconcile: new Date().toISOString(),
      failedEvents: 0,
      partialEvents: 0,
    };
  }
}

export async function getSyncEvents(): Promise<SyncEvent[]> {
  try {
    const data = await fetchLiveSync();
    if (!data.ok || data.source !== "live") {
      return [];
    }

    const strevByIdentifier = new Map(data.strevAssets.map((asset) => [asset.identifier.trim().toLowerCase(), asset]));
    const events: SyncEvent[] = [];

    for (const asset of data.kaseyaAssets) {
      const match = strevByIdentifier.get(asset.identifier.trim().toLowerCase());
      if (!match) {
        events.push({
          id: `live-missing-${asset.id}`,
          timestamp: asset.modifiedDate ?? data.checkedAt,
          identifier: asset.identifier,
          eventType: "create",
          status: "failed",
          attempts: 1,
          detail: "No matching Strev asset for identifier.",
        });
        continue;
      }

      if (match.name.trim().toLowerCase() !== asset.name.trim().toLowerCase()) {
        events.push({
          id: `live-mismatch-${asset.id}`,
          timestamp: asset.modifiedDate ?? data.checkedAt,
          identifier: asset.identifier,
          eventType: "update",
          status: "partial",
          attempts: 1,
          detail: `Name mismatch: Kaseya "${asset.name}" vs Strev "${match.name}".`,
        });
      }
    }

    return events;
  } catch {
    return [];
  }
}

export async function runReconcile(): Promise<{ ok: true; message: string }> {
  return { ok: true, message: "Reconcile request accepted." };
}

export async function runDryRun(): Promise<{ ok: true; message: string }> {
  return { ok: true, message: "Dry-run request accepted." };
}
