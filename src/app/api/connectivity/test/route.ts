import { NextResponse } from "next/server";
import { fetchKaseya, getKaseyaAssetsUrl } from "@/lib/kaseya-request";

type ServiceTarget = "strev" | "kaseya";

type ConnectivityResult = {
  service: ServiceTarget;
  ok: boolean;
  statusCode?: number;
  message: string;
  checkedAt: string;
};

async function probeHost(url: string): Promise<{ ok: boolean; statusCode?: number }> {
  const origin = new URL(url).origin;

  try {
    const response = await fetch(origin, {
      method: "GET",
      cache: "no-store",
    });

    return { ok: response.ok, statusCode: response.status };
  } catch {
    return { ok: false };
  }
}

function nowIso() {
  return new Date().toISOString();
}

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

async function runStrevTest(): Promise<ConnectivityResult> {
  const url = process.env.REVNUE_TEST_URL;
  const token = process.env.REVNUE_TOKEN;

  if (!url || !token) {
    return {
      service: "strev",
      ok: false,
      message: "Missing REVNUE_TEST_URL or REVNUE_TOKEN in environment settings.",
      checkedAt: nowIso(),
    };
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return {
      service: "strev",
      ok: response.ok,
      statusCode: response.status,
      message: response.ok
        ? "Connected to Strev API successfully."
        : `Strev API returned HTTP ${response.status}.`,
      checkedAt: nowIso(),
    };
  } catch (error) {
    return {
      service: "strev",
      ok: false,
      message: error instanceof Error ? error.message : "Unexpected error while testing Strev API.",
      checkedAt: nowIso(),
    };
  }
}

async function runKaseyaTest(): Promise<ConnectivityResult> {
  if (!readEnv("KASEYA_TOKEN_ID") || !readEnv("KASEYA_TOKEN_SECRET")) {
    return {
      service: "kaseya",
      ok: false,
      message: "Missing KASEYA_TOKEN_ID or KASEYA_TOKEN_SECRET in environment settings.",
      checkedAt: nowIso(),
    };
  }

  const url = getKaseyaAssetsUrl();

  if (!url) {
    return {
      service: "kaseya",
      ok: false,
      message:
        "Missing KASEYA_ASSET_URL, KASEYA_ASSETS_URL, DEFAULT_KASEYA_ASSETS_URL, or KASEYA_BASE_URL in environment settings.",
      checkedAt: nowIso(),
    };
  }

  try {
    const response = await fetchKaseya(withTopLimit(url), {
      method: "GET",
    });

    return {
      service: "kaseya",
      ok: response.ok,
      statusCode: response.status,
      message: response.ok
        ? "Connected to Kaseya assets endpoint successfully."
        : `Kaseya host is reachable, but the assets endpoint returned HTTP ${response.status}. Verify tenant API health, route availability, and token scope.`,
      checkedAt: nowIso(),
    };
  } catch (error) {
    const hostProbe = await probeHost(url);

    return {
      service: "kaseya",
      ok: false,
      statusCode: hostProbe.statusCode,
      message: hostProbe.ok
        ? `Kaseya host is reachable, but the API request failed. ${error instanceof Error ? error.message : "Unexpected error while testing Kaseya API."}`
        : error instanceof Error
          ? error.message
          : "Unexpected error while testing Kaseya API.",
      checkedAt: nowIso(),
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");

  if (target === "strev") {
    return NextResponse.json({ results: [await runStrevTest()] });
  }

  if (target === "kaseya") {
    return NextResponse.json({ results: [await runKaseyaTest()] });
  }

  return NextResponse.json({
    results: await Promise.all([runStrevTest(), runKaseyaTest()]),
  });
}
