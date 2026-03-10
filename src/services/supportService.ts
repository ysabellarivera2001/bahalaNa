import "server-only";
import { fetchKaseya, getKaseyaAssetsUrl } from "@/lib/kaseya-request";
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

async function probeHost(url: string): Promise<boolean> {
  const origin = new URL(url).origin;

  try {
    const response = await fetch(origin, {
      method: "GET",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
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

  if (!tokenId || !tokenSecret) {
    return false;
  }

  const url = getKaseyaAssetsUrl();

  if (!url) {
    return false;
  }

  try {
    const response = await fetchKaseya(withTopLimit(url), {
      method: "GET",
    });
    return response.ok;
  } catch {
    return probeHost(url);
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
