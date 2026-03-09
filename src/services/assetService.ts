import "server-only";
import { fetchKaseyaAssets, fetchStrevAssets } from "@/lib/live-sync-data";
import { KaseyaAsset, RevnueAsset, TransferAction, TransferRecord } from "@/types";

export interface AssetCompareRow {
  kaseya: KaseyaAsset;
  revnueMatch?: RevnueAsset;
  action: TransferAction;
}

export async function getAssetComparison(): Promise<AssetCompareRow[]> {
  const [kaseyaAssets, revnueAssets] = await Promise.all([fetchKaseyaAssets(), fetchStrevAssets()]);

  const mappedKaseya: KaseyaAsset[] = kaseyaAssets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    identifier: asset.identifier,
    modifiedDate: asset.modifiedDate ?? new Date(0).toISOString(),
    detailSource: "unpaged",
    hasAssetInfo: asset.hasAssetInfo ?? false,
    assetInfoCount: asset.assetInfoCount ?? 0,
  }));

  const mappedRevnue: RevnueAsset[] = revnueAssets.map((asset) => ({
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
  return [];
}
