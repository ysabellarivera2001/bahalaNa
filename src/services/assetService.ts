import "server-only";
import { loadLiveAssetSnapshot } from "@/lib/live-sync-data";
import { KaseyaAsset, RevnueAsset, TransferAction, TransferRecord } from "@/types";

export interface AssetCompareRow {
  kaseya: KaseyaAsset;
  revnueMatch?: RevnueAsset;
  action: TransferAction;
}

export async function getAssetComparison(): Promise<AssetCompareRow[]> {
  const { kaseyaAssets, strevAssets } = await loadLiveAssetSnapshot();

  const mappedKaseya: KaseyaAsset[] = kaseyaAssets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    identifier: asset.identifier,
    modifiedDate: asset.modifiedDate ?? new Date(0).toISOString(),
    detailSource: "unpaged",
    hasAssetInfo: asset.hasAssetInfo ?? false,
    assetInfoCount: asset.assetInfoCount ?? 0,
  }));

  const mappedRevnue: RevnueAsset[] = strevAssets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    serialNumber: asset.identifier,
    assetTag: asset.identifier,
    category: "Unknown",
    lastSynced: asset.modifiedDate ?? new Date().toISOString(),
  }));

  return mappedKaseya.map((kaseya) => {
    const match = mappedRevnue.find(
      (revnue) =>
        revnue.serialNumber === kaseya.identifier ||
        revnue.assetTag === kaseya.identifier,
    );

    return {
      kaseya,
      revnueMatch: match,
      action: match ? "UPDATE" : "CREATE",
    };
  });
}

export async function getTransferHistory(): Promise<TransferRecord[]> {
  return [
    {
      id: "transfer-1",
      kaseyaIdentifier: "SN-HQ-001",
      action: "UPDATE",
      status: "success",
      message: "Identifier match confirmed and payload queued.",
      timestamp: "2026-03-09T09:25:00.000Z",
      mappedNonEmptyCount: 6,
    },
    {
      id: "transfer-2",
      kaseyaIdentifier: "SN-HQ-002",
      action: "UPDATE",
      status: "partial",
      message: "Name mismatch detected. Review before final push.",
      timestamp: "2026-03-09T10:12:00.000Z",
      mappedNonEmptyCount: 5,
    },
    {
      id: "transfer-3",
      kaseyaIdentifier: "PR-007",
      action: "CREATE",
      status: "failed",
      message: "No Strev match and asset detail payload is incomplete.",
      timestamp: "2026-03-08T13:45:00.000Z",
      mappedNonEmptyCount: 3,
    },
  ];
}
