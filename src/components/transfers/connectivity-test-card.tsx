"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

type ServiceTarget = "strev" | "kaseya";

type ConnectivityResult = {
  service: ServiceTarget;
  ok: boolean;
  statusCode?: number;
  message: string;
  checkedAt: string;
};

type ApiResponse = {
  results: ConnectivityResult[];
};

export function ConnectivityTestCard() {
  const [results, setResults] = useState<ConnectivityResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");

  async function runTest(target: "all" | ServiceTarget) {
    setIsRunning(true);
    setMessage("");

    try {
      const query = target === "all" ? "" : `?target=${target}`;
      const response = await fetch(`/api/connectivity/test${query}`, { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse;
      setResults(payload.results);
      setMessage("Connectivity test completed.");
    } catch {
      setMessage("Failed to run connectivity test.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card title="API Connectivity Test" subtitle="Validate live access to Kaseya and Strev endpoints.">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg border bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void runTest("all")}
          disabled={isRunning}
        >
          Test All
        </button>
        <button
          type="button"
          className="rounded-lg border bg-[var(--golden-clover)] px-3 py-2 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void runTest("kaseya")}
          disabled={isRunning}
        >
          Test Kaseya
        </button>
        <button
          type="button"
          className="rounded-lg border bg-[var(--rose-blush)] px-3 py-2 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void runTest("strev")}
          disabled={isRunning}
        >
          Test Strev
        </button>
        <p className="text-sm text-[var(--muted)]">{isRunning ? "Running test..." : message}</p>
      </div>

      <div className="mt-3 space-y-2">
        {results.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No checks run yet.</p>
        ) : (
          results.map((result) => (
            <div key={result.service} className="rounded-lg border bg-[var(--surface-soft)] px-3 py-2 text-sm">
              <p className="font-semibold">
                {result.service === "kaseya" ? "Kaseya" : "Strev"}: {result.ok ? "Connected" : "Failed"}
                {typeof result.statusCode === "number" ? ` (HTTP ${result.statusCode})` : ""}
              </p>
              <p className="text-[var(--muted)]">{result.message}</p>
              <p className="text-xs text-[var(--muted)]">Checked: {new Date(result.checkedAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
