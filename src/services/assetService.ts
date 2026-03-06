import { kaseyaAssets, revnueAssets, transferHistory } from "@/data/mockData";
import { KaseyaAsset, RevnueAsset, TransferAction, TransferRecord } from "@/types";

export interface AssetCompareRow {
  kaseya: KaseyaAsset;
  revnueMatch?: RevnueAsset;
  action: TransferAction;
}

function pause(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAssetComparison(): Promise<AssetCompareRow[]> {
  await pause();

  return kaseyaAssets.map((kaseya) => {
    const match = revnueAssets.find(
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
  await pause();
  return transferHistory;
}
