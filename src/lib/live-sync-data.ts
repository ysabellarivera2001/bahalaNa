import "server-only";
import { fetchKaseya, getKaseyaAssetsUrl } from "@/lib/kaseya-request";

type RawRecord = Record<string, unknown>;

export type LiveAsset = {
  id: string;
  name: string;
  identifier: string;
  modifiedDate?: string;
  hasAssetInfo?: boolean;
  assetInfoCount?: number;
};

export type LiveAssetSnapshot = {
  kaseyaAssets: LiveAsset[];
  strevAssets: LiveAsset[];
  source: "live" | "mock";
  message?: string;
};

const mockKaseyaAssets: LiveAsset[] = [
  {
    id: "kas-1001",
    name: "HQ-Laptop-001",
    identifier: "SN-HQ-001",
    modifiedDate: "2026-03-09T09:15:00.000Z",
    hasAssetInfo: true,
    assetInfoCount: 6,
  },
  {
    id: "kas-1002",
    name: "HQ-Laptop-002",
    identifier: "SN-HQ-002",
    modifiedDate: "2026-03-09T10:00:00.000Z",
    hasAssetInfo: true,
    assetInfoCount: 5,
  },
  {
    id: "kas-1003",
    name: "Branch-Printer-007",
    identifier: "PR-007",
    modifiedDate: "2026-03-08T13:30:00.000Z",
    hasAssetInfo: false,
    assetInfoCount: 0,
  },
  {
    id: "kas-1004",
    name: "Warehouse-Scanner-12",
    identifier: "WH-SCN-12",
    modifiedDate: "2026-03-07T08:45:00.000Z",
    hasAssetInfo: true,
    assetInfoCount: 4,
  },
];

const mockStrevAssets: LiveAsset[] = [
  {
    id: "str-2001",
    name: "HQ-Laptop-001",
    identifier: "SN-HQ-001",
    modifiedDate: "2026-03-09T09:20:00.000Z",
  },
  {
    id: "str-2002",
    name: "HQ-Laptop-002-Renamed",
    identifier: "SN-HQ-002",
    modifiedDate: "2026-03-09T10:10:00.000Z",
  },
  {
    id: "str-2003",
    name: "Warehouse-Scanner-12",
    identifier: "WH-SCN-12",
    modifiedDate: "2026-03-07T08:50:00.000Z",
  },
];

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toObjectRecord(value: unknown): RawRecord {
  if (value && typeof value === "object") {
    return value as RawRecord;
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

function toIsoDate(value: unknown): string {
  const text = toText(value);
  if (!text) {
    return new Date(0).toISOString();
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

function pickArrayFromObject(payload: RawRecord): unknown[] {
  const candidates = [
    payload.items,
    payload.data,
    payload.Data,
    payload.results,
    payload.result,
    payload.assets,
    payload.Assets,
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

function findAssetInfoIdentifier(assetInfo: unknown): string {
  if (!Array.isArray(assetInfo)) {
    return "";
  }

  const preferredKeys = ["Serial Number", "SerialNumber", "Serial", "Asset Tag", "AssetTag", "Service Tag"];

  for (const entry of assetInfo) {
    const item = toObjectRecord(entry);
    const categoryData = toObjectRecord(item.CategoryData);

    for (const key of preferredKeys) {
      const value = toText(categoryData[key]);
      if (value) {
        return value;
      }
    }
  }

  return "";
}

function mapKaseyaAssets(rawAssets: unknown[]): LiveAsset[] {
  return rawAssets
    .map((entry) => {
      const item = toObjectRecord(entry);
      const assetInfo = asArray(item.AssetInfo);
      const id = toText(item.Id || item.id || item.AssetId || item.AssetID || item.AssetGuid || item.Identifier || item.identifier);
      const name = toText(item.Name || item.name || item.AssetName || item.DeviceName);
      const identifier = toText(
        findAssetInfoIdentifier(assetInfo) ||
          item.Identifier ||
          item.identifier ||
          item.SerialNumber ||
          item.serial_number ||
          item.asset_tag,
      );
      const modifiedDate = toIsoDate(item.ModifiedDate || item.Modified || item.updated_at || item.LastSeenAt || item.LastSeenOnline);

      if (!id || !name || !identifier) {
        return null;
      }

      return {
        id,
        name,
        identifier,
        modifiedDate,
        hasAssetInfo: assetInfo.length > 0,
        assetInfoCount: assetInfo.length,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => (a.modifiedDate ?? "") < (b.modifiedDate ?? "") ? 1 : -1);
}

function mapStrevAssets(rawAssets: unknown[]): LiveAsset[] {
  return rawAssets
    .map((entry) => {
      const item = toObjectRecord(entry);
      const id = toText(item.id || item.Id || item.asset_id);
      const name = toText(item.name || item.Name || item.asset_name);
      const serial = toText(item.serial_number || item.serialNumber || item.SerialNumber || item.Identifier);
      const tag = toText(item.asset_tag || item.assetTag || item.AssetTag);
      const modifiedDate = toIsoDate(item.modified_date || item.modifiedDate || item.updated_at);
      const identifier = serial || tag;

      if (!id || !name || !identifier) {
        return null;
      }

      return { id, name, identifier, modifiedDate };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => (a.modifiedDate ?? "") < (b.modifiedDate ?? "") ? 1 : -1);
}

export async function fetchKaseyaAssets(): Promise<LiveAsset[]> {
  const url = getKaseyaAssetsUrl();

  if (!url) {
    throw new Error(
      "Missing KASEYA_ASSET_URL, KASEYA_ASSETS_URL, DEFAULT_KASEYA_ASSETS_URL, or KASEYA_BASE_URL.",
    );
  }

  const response = await fetchKaseya(withTopLimit(url), {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Kaseya assets endpoint returned HTTP ${response.status}.`);
  }

  const json = (await response.json()) as unknown;
  const assets = Array.isArray(json) ? asArray(json) : pickArrayFromObject(toObjectRecord(json));
  return mapKaseyaAssets(assets);
}

export async function fetchStrevAssets(): Promise<LiveAsset[]> {
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

export function getMockKaseyaAssets(): LiveAsset[] {
  return mockKaseyaAssets.map((asset) => ({ ...asset }));
}

export function getMockStrevAssets(): LiveAsset[] {
  return mockStrevAssets.map((asset) => ({ ...asset }));
}

export async function loadLiveAssetSnapshot(): Promise<LiveAssetSnapshot> {
  try {
    const [kaseyaAssets, strevAssets] = await Promise.all([fetchKaseyaAssets(), fetchStrevAssets()]);

    return {
      kaseyaAssets,
      strevAssets,
      source: "live",
    };
  } catch (error) {
    return {
      kaseyaAssets: getMockKaseyaAssets(),
      strevAssets: getMockStrevAssets(),
      source: "mock",
      message: error instanceof Error ? error.message : "Unexpected error while loading live sync assets.",
    };
  }
}
