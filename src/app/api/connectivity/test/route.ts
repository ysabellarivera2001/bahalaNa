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
  const tokenId = process.env.KASEYA_TOKEN_ID;
  const tokenSecret = process.env.KASEYA_TOKEN_SECRET;
  const kaseyaAssetUrl = process.env.KASEYA_ASSET_URL;
  const kaseyaAssetsUrl = process.env.KASEYA_ASSETS_URL;
  const kaseyaBaseUrl = process.env.KASEYA_BASE_URL;

  if (!tokenId || !tokenSecret) {
    return {
      service: "kaseya",
      ok: false,
      message: "Missing KASEYA_TOKEN_ID or KASEYA_TOKEN_SECRET in environment settings.",
      checkedAt: nowIso(),
    };
  }

  const url =
    kaseyaAssetUrl ??
    kaseyaAssetsUrl ??
    (kaseyaBaseUrl ? `${kaseyaBaseUrl.replace(/\/$/, "")}/api/v3/assets/?$top=1` : "");

  if (!url) {
    return {
      service: "kaseya",
      ok: false,
      message: "Missing KASEYA_ASSET_URL, KASEYA_ASSETS_URL, or KASEYA_BASE_URL in environment settings.",
      checkedAt: nowIso(),
    };
  }

  const basicAuth = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
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
