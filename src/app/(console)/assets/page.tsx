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
          <button className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-contrast)]">
            Transfer Selected (Mock)
          </button>
        </div>
      </Card>

      <Card title="Asset Comparison">
        <DataTable
          rows={filtered}
          columns={[
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
              render: (row) => <StatusBadge status={row.action === "CREATE" ? "info" : "success"} />,
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
