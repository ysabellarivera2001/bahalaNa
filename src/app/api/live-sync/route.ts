import { NextResponse } from "next/server";
import { loadLiveAssetSnapshot, LiveAsset } from "@/lib/live-sync-data";

type LiveSyncSummary = {
  kaseyaCount: number;
  strevCount: number;
  outOfSyncCount: number;
  matchedCount: number;
};

type LiveSyncResponse = {
  ok: boolean;
  checkedAt: string;
  source: "live" | "mock";
  summary: LiveSyncSummary;
  kaseyaAssets: LiveAsset[];
  strevAssets: LiveAsset[];
  message?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function fallbackResponse(message: string): LiveSyncResponse {
  return {
    ok: false,
    checkedAt: new Date().toISOString(),
    source: "mock",
    summary: {
      kaseyaCount: 0,
      strevCount: 0,
      outOfSyncCount: 0,
      matchedCount: 0,
    },
    kaseyaAssets: [],
    strevAssets: [],
    message,
  };
}

function buildSummary(kaseyaAssets: LiveAsset[], strevAssets: LiveAsset[]): LiveSyncSummary {
  const strevByIdentifier = new Map<string, LiveAsset>();

  for (const asset of strevAssets) {
    strevByIdentifier.set(normalize(asset.identifier), asset);
  }

  let outOfSyncCount = 0;
  let matchedCount = 0;

  for (const asset of kaseyaAssets) {
    const match = strevByIdentifier.get(normalize(asset.identifier));

    if (!match) {
      outOfSyncCount += 1;
      continue;
    }

    if (normalize(match.name) === normalize(asset.name)) {
      matchedCount += 1;
      continue;
    }

    outOfSyncCount += 1;
  }

  return {
    kaseyaCount: kaseyaAssets.length,
    strevCount: strevAssets.length,
    outOfSyncCount,
    matchedCount,
  };
}

export async function GET() {
  const snapshot = await loadLiveAssetSnapshot();

  if (snapshot.source === "mock") {
    const fallback = fallbackResponse(snapshot.message ?? "Live sync endpoint is unavailable.");
    fallback.kaseyaAssets = snapshot.kaseyaAssets;
    fallback.strevAssets = snapshot.strevAssets;
    fallback.summary = buildSummary(snapshot.kaseyaAssets, snapshot.strevAssets);
    return NextResponse.json<LiveSyncResponse>(fallback, { status: 200 });
  }

  return NextResponse.json<LiveSyncResponse>({
    ok: true,
    checkedAt: new Date().toISOString(),
    source: "live",
    summary: buildSummary(snapshot.kaseyaAssets, snapshot.strevAssets),
    kaseyaAssets: snapshot.kaseyaAssets,
    strevAssets: snapshot.strevAssets,
  });
}
