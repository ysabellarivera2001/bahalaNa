"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/tables/data-table";
import { AssetCompareRow, getAssetComparison, getTransferHistory } from "@/services/assetService";
import { TransferRecord } from "@/types";

export default function AssetsPage() {
  const [rows, setRows] = useState<AssetCompareRow[]>([]);
  const [history, setHistory] = useState<TransferRecord[]>([]);
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [selectedIdentifiers, setSelectedIdentifiers] = useState<string[]>([]);
  const [transferMessage, setTransferMessage] = useState("");

  useEffect(() => {
    void getAssetComparison().then(setRows);
    void getTransferHistory().then(setHistory);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (onlyMissing && row.action !== "CREATE") {
        return false;
      }

      const target = `${row.kaseya.name} ${row.kaseya.identifier}`.toLowerCase();
      return target.includes(search.toLowerCase());
    });
  }, [onlyMissing, rows, search]);

  const selectedCount = selectedIdentifiers.length;

  function toggleSelection(identifier: string, checked: boolean) {
    setSelectedIdentifiers((current) => {
      if (checked) {
        if (current.includes(identifier)) {
          return current;
        }
        return [...current, identifier];
      }

      return current.filter((item) => item !== identifier);
    });
  }

  function runMockTransfer() {
    if (selectedIdentifiers.length === 0) {
      setTransferMessage("Select at least one asset before running transfer.");
      return;
    }

    const selectedRows = rows.filter((row) => selectedIdentifiers.includes(row.kaseya.identifier));
    const now = new Date().toISOString();

    const newRecords: TransferRecord[] = selectedRows.map((row, index) => ({
      id: `t-mock-${Date.now()}-${index}`,
      kaseyaIdentifier: row.kaseya.identifier,
      action: row.action,
      status: row.kaseya.hasAssetInfo ? "success" : "partial",
      message: row.kaseya.hasAssetInfo
        ? `${row.action} prepared and queued in mock mode.`
        : `${row.action} queued with partial detail payload.`,
      timestamp: now,
      mappedNonEmptyCount: row.kaseya.hasAssetInfo ? Math.max(4, row.kaseya.assetInfoCount) : 3,
    }));

    setHistory((current) => [...newRecords, ...current]);
    setSelectedIdentifiers([]);
    setTransferMessage(`Mock transfer executed for ${newRecords.length} asset(s).`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Asset Console"
        description="Compare Kaseya and Strev assets side-by-side and determine CREATE or UPDATE per identifier match."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="min-w-[260px] rounded-lg border bg-[var(--artic-daisy)] px-3 py-2 text-sm outline-none focus:border-[var(--peach-blossom)]"
            placeholder="Search Kaseya name or identifier"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(event) => setOnlyMissing(event.target.checked)}
            />
            Show only records not found in Strev
          </label>
          <button
            onClick={runMockTransfer}
            disabled={selectedCount === 0}
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-contrast)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Transfer Selected (Mock) {selectedCount > 0 ? `(${selectedCount})` : ""}
          </button>
          <p className="text-sm text-[var(--muted)]">{transferMessage}</p>
        </div>
      </Card>

      <Card title="Asset Comparison">
        <DataTable
          rows={filtered}
          columns={[
            {
              key: "select",
              title: "Select",
              render: (row) => (
                <input
                  type="checkbox"
                  checked={selectedIdentifiers.includes(row.kaseya.identifier)}
                  onChange={(event) => toggleSelection(row.kaseya.identifier, event.target.checked)}
                  aria-label={`Select ${row.kaseya.identifier}`}
                />
              ),
            },
            {
              key: "kaseya",
              title: "Kaseya",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.kaseya.name}</p>
                  <p className="font-mono text-xs text-[var(--muted)]">{row.kaseya.identifier}</p>
                </div>
              ),
            },
            {
              key: "detail",
              title: "Detail Quality",
              render: (row) => (
                <div className="text-xs">
                  <p>source: {row.kaseya.detailSource}</p>
                  <p>
                    has_assetinfo: {row.kaseya.hasAssetInfo ? "true" : "false"} ({row.kaseya.assetInfoCount})
                  </p>
                </div>
              ),
            },
            {
              key: "revnue",
              title: "Strev Match",
              render: (row) =>
                row.revnueMatch ? (
                  <div>
                    <p className="font-semibold">{row.revnueMatch.name}</p>
                    <p className="font-mono text-xs text-[var(--muted)]">{row.revnueMatch.serialNumber}</p>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--muted)]">No identifier match found</span>
                ),
            },
            {
              key: "action",
              title: "Transfer Action",
              render: (row) => (
                <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-bold">
                  {row.action}
                </span>
              ),
            },
            {
              key: "modified",
              title: "Modified Date",
              render: (row) => new Date(row.kaseya.modifiedDate).toLocaleString(),
            },
          ]}
        />
      </Card>

      <Card title="Transfer History" subtitle="Recent row-level transfer outcomes">
        <DataTable
          rows={history}
          columns={[
            { key: "id", title: "Identifier", render: (row) => row.kaseyaIdentifier },
            { key: "action", title: "Action", render: (row) => row.action },
            { key: "status", title: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "map", title: "Mapped Fields", render: (row) => row.mappedNonEmptyCount },
            { key: "message", title: "Message", render: (row) => row.message },
          ]}
        />
      </Card>
    </div>
  );
}
