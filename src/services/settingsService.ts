import { readSafeSettings } from "@/lib/env";
import { RuntimeSetting } from "@/types";

function pause(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRuntimeSettings(): Promise<RuntimeSetting[]> {
  await pause();
  return readSafeSettings();
}
