import { runtimeSettings } from "@/data/mockData";
import { RuntimeSetting } from "@/types";

const envKeys = [
  "REVNUE_COMPANY",
  "REVNUE_ASSET_URL",
  "REVNUE_TEST_URL",
  "KASEYA_TOKEN_ID",
  "KASEYA_TOKEN_SECRET",
  "REVNUE_TOKEN",
] as const;

const secretKeys = new Set(["KASEYA_TOKEN_ID", "KASEYA_TOKEN_SECRET", "REVNUE_TOKEN"]);

function mask(value: string): string {
  if (!value) {
    return "";
  }

  if (value.length <= 6) {
    return "******";
  }

  return `${value.slice(0, 3)}${"*".repeat(Math.max(4, value.length - 6))}${value.slice(-3)}`;
}

export function readSafeSettings(): RuntimeSetting[] {
  const fromEnv = envKeys.reduce<RuntimeSetting[]>((acc, key) => {
    const raw = process.env[key];
    if (!raw) {
      return acc;
    }

    acc.push({
      key,
      value: secretKeys.has(key) ? mask(raw) : raw,
      isSecret: secretKeys.has(key),
    });

    return acc;
  }, []);

  return fromEnv.length > 0 ? fromEnv : runtimeSettings;
}
