import { NextResponse } from "next/server";

type LiveAsset = {
  id: string;
  name: string;
  identifier: string;
};

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

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

function pickArrayFromObject(payload: Record<string, unknown>): unknown[] {
  const candidates = [
    payload.items,
    payload.data,
    payload.results,
    payload.result,
    payload.assets,
    payload.value,
    payload.Rows,
    payload.Result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function toObjectRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
}

function toText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toIsoDate(value: unknown): string {
  const text = toText(value);
  if (!text) {
    return new Date(0).toISOString();
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

function mapKaseyaAssets(rawAssets: unknown[]): LiveAsset[] {
  return rawAssets
    .map((entry) => {
      const item = toObjectRecord(entry);
      const id = toText(item.Id || item.id || item.AssetId || item.AssetID || item.AssetGuid);
      const name = toText(item.Name || item.name || item.AssetName || item.DeviceName);
      const identifier = toText(item.Identifier || item.identifier || item.SerialNumber || item.serial_number || item.asset_tag);
      const modifiedDate = toIsoDate(item.ModifiedDate || item.Modified || item.updated_at || item.LastSeenAt);

      if (!id || !name || !identifier) {
        return null;
      }

      return { id, name, identifier, modifiedDate };
    })
    .filter((item): item is LiveAsset & { modifiedDate: string } => item !== null)
    .sort((a, b) => (a.modifiedDate < b.modifiedDate ? 1 : -1))
    .map(({ id, name, identifier }) => ({ id, name, identifier }));
}

function mapStrevAssets(rawAssets: unknown[]): LiveAsset[] {
  return rawAssets
    .map((entry) => {
      const item = toObjectRecord(entry);
      const id = toText(item.id || item.Id || item.asset_id);
      const name = toText(item.name || item.Name || item.asset_name);
      const serial = toText(item.serial_number || item.serialNumber || item.SerialNumber || item.Identifier);
      const tag = toText(item.asset_tag || item.assetTag || item.AssetTag);
      const identifier = serial || tag;

      if (!id || !name || !identifier) {
        return null;
      }

      return { id, name, identifier };
    })
    .filter((item): item is LiveAsset => item !== null);
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

function withTopLimit(url: string): string {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("$top")) {
    parsed.searchParams.set("$top", "100");
  }
  return parsed.toString();
}

function withCompany(url: string, company?: string): string {
  const parsed = new URL(url);
  if (company && !parsed.searchParams.has("company")) {
    parsed.searchParams.set("company", company);
  }
  return parsed.toString();
}

async function fetchKaseyaAssets(): Promise<LiveAsset[]> {
  const tokenId = readEnv("KASEYA_TOKEN_ID");
  const tokenSecret = readEnv("KASEYA_TOKEN_SECRET");
  const kaseyaAssetUrl = readEnv("KASEYA_ASSET_URL");
  const kaseyaAssetsUrl = readEnv("KASEYA_ASSETS_URL");
  const kaseyaBaseUrl = readEnv("KASEYA_BASE_URL");
  const userAgent = readEnv("DEFAULT_USER_AGENT") ?? "vsax-kaseya-client/1.0";

  if (!tokenId || !tokenSecret) {
    throw new Error("Missing KASEYA_TOKEN_ID or KASEYA_TOKEN_SECRET.");
  }

  const baseUrl = kaseyaBaseUrl ? `${kaseyaBaseUrl.replace(/\/$/, "")}/api/v3/assets/` : "";
  const url = kaseyaAssetUrl ?? kaseyaAssetsUrl ?? baseUrl;

  if (!url) {
    throw new Error("Missing KASEYA_ASSET_URL, KASEYA_ASSETS_URL, or KASEYA_BASE_URL.");
  }

  const basicAuth = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");
  const response = await fetch(withTopLimit(url), {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Kaseya assets endpoint returned HTTP ${response.status}.`);
  }

  const json = (await response.json()) as unknown;
  const assets = Array.isArray(json) ? asArray(json) : pickArrayFromObject(toObjectRecord(json));
  return mapKaseyaAssets(assets);
}

async function fetchStrevAssets(): Promise<LiveAsset[]> {
  const token = readEnv("REVNUE_TOKEN");
  const baseAssetUrl = readEnv("REVNUE_ASSET_URL");
  const company = readEnv("REVNUE_COMPANY");

  if (!token) {
    throw new Error("Missing REVNUE_TOKEN.");
  }

  if (!baseAssetUrl) {
    throw new Error("Missing REVNUE_ASSET_URL.");
  }

  const url = withCompany(baseAssetUrl, company);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Strev assets endpoint returned HTTP ${response.status}.`);
  }

  const json = (await response.json()) as unknown;
  const assets = Array.isArray(json) ? asArray(json) : pickArrayFromObject(toObjectRecord(json));
  return mapStrevAssets(assets);
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
  try {
    const [kaseyaAssets, strevAssets] = await Promise.all([fetchKaseyaAssets(), fetchStrevAssets()]);

    return NextResponse.json<LiveSyncResponse>({
      ok: true,
      checkedAt: new Date().toISOString(),
      source: "live",
      summary: buildSummary(kaseyaAssets, strevAssets),
      kaseyaAssets,
      strevAssets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while loading live sync assets.";
    return NextResponse.json<LiveSyncResponse>(fallbackResponse(message), { status: 200 });
  }
}
