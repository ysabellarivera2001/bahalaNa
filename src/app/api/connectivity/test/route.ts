import { NextResponse } from "next/server";

type ServiceTarget = "strev" | "kaseya";

type ConnectivityResult = {
  service: ServiceTarget;
  ok: boolean;
  statusCode?: number;
  message: string;
  checkedAt: string;
};

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
  const tokenId = readEnv("KASEYA_TOKEN_ID");
  const tokenSecret = readEnv("KASEYA_TOKEN_SECRET");
  const kaseyaAssetUrl = readEnv("KASEYA_ASSET_URL");
  const kaseyaAssetsUrl = readEnv("KASEYA_ASSETS_URL");
  const defaultKaseyaAssetsUrl = readEnv("DEFAULT_KASEYA_ASSETS_URL");
  const kaseyaBaseUrl = readEnv("KASEYA_BASE_URL");
  const userAgent = readEnv("DEFAULT_USER_AGENT") ?? "vsax-kaseya-client/1.0";

  if (!tokenId || !tokenSecret) {
    return {
      service: "kaseya",
      ok: false,
      message: "Missing KASEYA_TOKEN_ID or KASEYA_TOKEN_SECRET in environment settings.",
      checkedAt: nowIso(),
    };
  }

  const baseUrl = kaseyaBaseUrl ? `${kaseyaBaseUrl.replace(/\/$/, "")}/api/v3/assets/` : "";
  const url = kaseyaAssetUrl ?? kaseyaAssetsUrl ?? defaultKaseyaAssetsUrl ?? baseUrl;

  if (!url) {
    return {
      service: "kaseya",
      ok: false,
      message:
        "Missing KASEYA_ASSET_URL, KASEYA_ASSETS_URL, DEFAULT_KASEYA_ASSETS_URL, or KASEYA_BASE_URL in environment settings.",
      checkedAt: nowIso(),
    };
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

    return {
      service: "kaseya",
      ok: response.ok,
      statusCode: response.status,
      message: response.ok
        ? "Connected to Kaseya assets endpoint successfully."
        : `Kaseya assets endpoint returned HTTP ${response.status}.`,
      checkedAt: nowIso(),
    };
  } catch (error) {
    return {
      service: "kaseya",
      ok: false,
      message: error instanceof Error ? error.message : "Unexpected error while testing Kaseya API.",
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
