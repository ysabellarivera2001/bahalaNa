import "server-only";
import { DiagnosticResult, SupportTicket } from "@/types";

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function withTopLimit(url: string): string {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("$top")) {
    parsed.searchParams.set("$top", "1");
  }
  return parsed.toString();
}

async function checkStrev(): Promise<boolean> {
  const url = readEnv("REVNUE_TEST_URL");
  const token = readEnv("REVNUE_TOKEN");

  if (!url || !token) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkKaseya(): Promise<boolean> {
  const tokenId = readEnv("KASEYA_TOKEN_ID");
  const tokenSecret = readEnv("KASEYA_TOKEN_SECRET");
  const kaseyaAssetUrl = readEnv("KASEYA_ASSET_URL");
  const kaseyaAssetsUrl = readEnv("KASEYA_ASSETS_URL");
  const defaultKaseyaAssetsUrl = readEnv("DEFAULT_KASEYA_ASSETS_URL");
  const kaseyaBaseUrl = readEnv("KASEYA_BASE_URL");
  const userAgent = readEnv("DEFAULT_USER_AGENT") ?? "vsax-kaseya-client/1.0";

  if (!tokenId || !tokenSecret) {
    return false;
  }

  const baseUrl = kaseyaBaseUrl ? `${kaseyaBaseUrl.replace(/\/$/, "")}/api/v3/assets/` : "";
  const url = kaseyaAssetUrl ?? kaseyaAssetsUrl ?? defaultKaseyaAssetsUrl ?? baseUrl;

  if (!url) {
    return false;
  }

  const basicAuth = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");

  try {
    const response = await fetch(withTopLimit(url), {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
        "User-Agent": userAgent,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getDiagnostics(): Promise<DiagnosticResult> {
  const [kaseyaOk, strevOk] = await Promise.all([checkKaseya(), checkStrev()]);

  return {
    kaseyaConnectivity: kaseyaOk ? "pass" : "fail",
    revnueConnectivity: strevOk ? "pass" : "fail",
    syncEngine: kaseyaOk && strevOk ? "running" : "degraded",
    queueDatabase: "ok",
    checkedAt: new Date().toISOString(),
  };
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  return [];
}
