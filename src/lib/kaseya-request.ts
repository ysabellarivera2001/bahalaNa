import "server-only";
import { Agent } from "undici";

const ipv4Dispatcher = new Agent({
  connect: {
    family: 4,
  },
});

type DispatcherRequestInit = RequestInit & {
  dispatcher?: Agent;
};

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

export function getKaseyaAssetsUrl(): string | undefined {
  const kaseyaAssetUrl = readEnv("KASEYA_ASSET_URL");
  const kaseyaAssetsUrl = readEnv("KASEYA_ASSETS_URL");
  const defaultKaseyaAssetsUrl = readEnv("DEFAULT_KASEYA_ASSETS_URL");
  const kaseyaBaseUrl = readEnv("KASEYA_BASE_URL");
  const baseUrl = kaseyaBaseUrl ? `${kaseyaBaseUrl.replace(/\/$/, "")}/api/v3/assets/` : "";

  return kaseyaAssetUrl ?? kaseyaAssetsUrl ?? defaultKaseyaAssetsUrl ?? baseUrl;
}

export function getKaseyaAuthHeaders(): HeadersInit {
  const tokenId = readEnv("KASEYA_TOKEN_ID");
  const tokenSecret = readEnv("KASEYA_TOKEN_SECRET");
  const userAgent = readEnv("DEFAULT_USER_AGENT") ?? "vsax-kaseya-client/1.0";

  if (!tokenId || !tokenSecret) {
    throw new Error("Missing KASEYA_TOKEN_ID or KASEYA_TOKEN_SECRET.");
  }

  const basicAuth = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");

  return {
    Authorization: `Basic ${basicAuth}`,
    Accept: "application/json",
    "User-Agent": userAgent,
  };
}

export async function fetchKaseya(url: string, init?: Omit<RequestInit, "dispatcher" | "headers"> & { headers?: HeadersInit }) {
  const requestInit: DispatcherRequestInit = {
    ...init,
    headers: {
      ...getKaseyaAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? "no-store",
    dispatcher: ipv4Dispatcher,
  };

  return fetch(url, requestInit);
}
