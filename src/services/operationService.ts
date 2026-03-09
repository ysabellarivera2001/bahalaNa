import { SyncEvent, SyncOverview } from "@/types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
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

async function fetchLiveSync(): Promise<LiveSyncResponse> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/live-sync`, { cache: "no-store" });
  return (await response.json()) as LiveSyncResponse;
}

async function collectSyncState() {
  const data = await fetchLiveSync();
  if (!data.ok || data.source !== "live") {
    throw new Error(data.message ?? "Live sync endpoint unavailable.");
  }

  const strevByIdentifier = new Map(data.strevAssets.map((asset) => [normalize(asset.identifier), asset]));

  const events: SyncEvent[] = [];
  let failedEvents = 0;
  let partialEvents = 0;
  let matchedCount = 0;

  for (const asset of data.kaseyaAssets) {
    const match = strevByIdentifier.get(normalize(asset.identifier));

    if (!match) {
      failedEvents += 1;
      events.push({
        id: `live-missing-${asset.id}`,
        timestamp: asset.modifiedDate ?? new Date().toISOString(),
        identifier: asset.identifier,
        eventType: "create",
        status: "failed",
        attempts: 1,
        detail: "No matching Strev asset for identifier.",
      });
      continue;
    }

    if (normalize(match.name) !== normalize(asset.name)) {
      partialEvents += 1;
      events.push({
        id: `live-mismatch-${asset.id}`,
        timestamp: asset.modifiedDate ?? new Date().toISOString(),
        identifier: asset.identifier,
        eventType: "update",
        status: "partial",
        attempts: 1,
        detail: `Name mismatch: Kaseya "${asset.name}" vs Strev "${match.name}".`,
      });
      continue;
    }

    matchedCount += 1;
  }

  return {
    kaseyaCount: data.kaseyaAssets.length,
    events: events.slice(0, 100),
    failedEvents,
    partialEvents,
    matchedCount,
  };
}

export async function getSyncOverview(): Promise<SyncOverview> {
  try {
    const state = await collectSyncState();
    const total = state.kaseyaCount;
    const successRate = total === 0 ? 0 : Number(((state.matchedCount / total) * 100).toFixed(1));

    return {
      health: state.failedEvents > 0 ? "degraded" : "healthy",
      mode: "LIVE",
      queueDepth: state.failedEvents + state.partialEvents,
      successRate,
      workerHeartbeat: new Date().toISOString(),
      lastReconcile: new Date().toISOString(),
      failedEvents: state.failedEvents,
      partialEvents: state.partialEvents,
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
    const state = await collectSyncState();
    return state.events;
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
