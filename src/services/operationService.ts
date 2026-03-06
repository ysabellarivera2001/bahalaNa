import { syncEvents, syncOverview } from "@/data/mockData";
import { SyncEvent, SyncOverview } from "@/types";

function pause(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSyncOverview(): Promise<SyncOverview> {
  await pause();
  return syncOverview;
}

export async function getSyncEvents(): Promise<SyncEvent[]> {
  await pause();
  return syncEvents;
}

export async function runReconcile(): Promise<{ ok: true; message: string }> {
  await pause(280);
  return { ok: true, message: "Reconcile job queued successfully." };
}

export async function runDryRun(): Promise<{ ok: true; message: string }> {
  await pause(280);
  return { ok: true, message: "Dry-run completed. No write operations executed." };
}
