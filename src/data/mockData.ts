import {
  ActivityLog,
  DiagnosticResult,
  KaseyaAsset,
  RevnueAsset,
  RuntimeSetting,
  SupportTicket,
  SyncEvent,
  SyncOverview,
  TransferRecord,
} from "@/types";

export const kaseyaAssets: KaseyaAsset[] = [
  {
    id: "k-001",
    name: "GSIS-Laptop-014",
    identifier: "GSIS-014",
    modifiedDate: "2026-03-06T08:20:00Z",
    detailSource: "unpaged",
    hasAssetInfo: true,
    assetInfoCount: 12,
  },
  {
    id: "k-002",
    name: "GSIS-Printer-009",
    identifier: "GSIS-PRN-009",
    modifiedDate: "2026-03-06T07:52:00Z",
    detailSource: "filter",
    hasAssetInfo: true,
    assetInfoCount: 7,
  },
  {
    id: "k-003",
    name: "GSIS-Switch-102",
    identifier: "GSIS-SW-102",
    modifiedDate: "2026-03-06T06:15:00Z",
    detailSource: "specific-device",
    hasAssetInfo: false,
    assetInfoCount: 0,
  },
  {
    id: "k-004",
    name: "GSIS-Desktop-045",
    identifier: "GSIS-DT-045",
    modifiedDate: "2026-03-06T06:01:00Z",
    detailSource: "paged",
    hasAssetInfo: true,
    assetInfoCount: 5,
  },
];

export const revnueAssets: RevnueAsset[] = [
  {
    id: "r-401",
    name: "GSIS-Laptop-014",
    serialNumber: "GSIS-014",
    assetTag: "GSIS-014",
    category: "Devices",
    lastSynced: "2026-03-06T08:22:00Z",
  },
  {
    id: "r-402",
    name: "GSIS-Switch-102",
    serialNumber: "GSIS-SW-102",
    assetTag: "GSIS-SW-102",
    category: "Network",
    lastSynced: "2026-03-06T06:10:00Z",
  },
];

export const transferHistory: TransferRecord[] = [
  {
    id: "t-1001",
    kaseyaIdentifier: "GSIS-014",
    action: "UPDATE",
    status: "success",
    message: "Updated existing Strev record using identifier match.",
    timestamp: "2026-03-06T08:22:00Z",
    mappedNonEmptyCount: 10,
  },
  {
    id: "t-1002",
    kaseyaIdentifier: "GSIS-SW-102",
    action: "UPDATE",
    status: "partial",
    message: "AssetInfo missing. Existing non-empty template fields preserved.",
    timestamp: "2026-03-06T06:11:00Z",
    mappedNonEmptyCount: 4,
  },
  {
    id: "t-1003",
    kaseyaIdentifier: "GSIS-PRN-009",
    action: "CREATE",
    status: "success",
    message: "Created new Strev asset under company 1.",
    timestamp: "2026-03-06T07:54:00Z",
    mappedNonEmptyCount: 8,
  },
];

export const syncOverview: SyncOverview = {
  health: "healthy",
  mode: "LIVE",
  queueDepth: 4,
  successRate: 97.4,
  workerHeartbeat: "2026-03-06T08:24:00Z",
  lastReconcile: "2026-03-06T08:20:00Z",
  failedEvents: 1,
  partialEvents: 2,
};

export const syncEvents: SyncEvent[] = [
  {
    id: "e-901",
    timestamp: "2026-03-06T08:21:00Z",
    identifier: "GSIS-014",
    eventType: "update",
    status: "success",
    attempts: 1,
    detail: "Webhook update processed.",
  },
  {
    id: "e-902",
    timestamp: "2026-03-06T08:12:00Z",
    identifier: "GSIS-PRN-009",
    eventType: "create",
    status: "partial",
    attempts: 1,
    detail: "Mapped with reduced payload from Kaseya.",
  },
  {
    id: "e-903",
    timestamp: "2026-03-06T08:00:00Z",
    identifier: "GSIS-DT-045",
    eventType: "delete",
    status: "failed",
    attempts: 3,
    detail: "Strev API timeout. Retry scheduled.",
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "l-5001",
    timestamp: "2026-03-06T08:22:00Z",
    channel: "notification",
    level: "info",
    status: "success",
    text: "Transfer complete for GSIS-014.",
    read: false,
  },
  {
    id: "l-5002",
    timestamp: "2026-03-06T08:12:00Z",
    channel: "message",
    level: "warning",
    status: "partial",
    text: "GSIS-SW-102 transferred with partial detail payload.",
    read: false,
  },
  {
    id: "l-5003",
    timestamp: "2026-03-06T08:01:00Z",
    channel: "notification",
    level: "error",
    status: "failed",
    text: "Delete sync failed for GSIS-DT-045 after 3 attempts.",
    read: true,
  },
];

export const diagnostics: DiagnosticResult = {
  kaseyaConnectivity: "pass",
  revnueConnectivity: "pass",
  syncEngine: "running",
  queueDatabase: "ok",
  checkedAt: "2026-03-06T08:25:00Z",
};

export const supportTickets: SupportTicket[] = [
  {
    id: "SUP-321",
    createdAt: "2026-03-05T15:40:00Z",
    severity: "high",
    title: "Repeated timeout during delete event",
    status: "in_progress",
    summary: "Queue retries exceed threshold for delete flow.",
    smaxRef: "planned",
  },
  {
    id: "SUP-322",
    createdAt: "2026-03-06T07:30:00Z",
    severity: "medium",
    title: "Partial mapping for switch assets",
    status: "open",
    summary: "AssetInfo returned empty for two device records.",
  },
];

export const runtimeSettings: RuntimeSetting[] = [
  { key: "REVNUE_COMPANY", value: "1" },
  {
    key: "REVNUE_ASSET_URL",
    value: "https://api.dashboard.strev.ai/api/v2/asset",
  },
  {
    key: "REVNUE_TEST_URL",
    value: "https://api.dashboard.strev.ai/api/v2/contractids/?company=1",
  },
  { key: "KASEYA_ASSET_TOP_LIMIT", value: "100" },
  { key: "AUTOSYNC_RECONCILE_MINUTES", value: "15" },
  { key: "KASEYA_TOKEN_ID", value: "********", isSecret: true },
  { key: "KASEYA_TOKEN_SECRET", value: "********", isSecret: true },
  { key: "REVNUE_TOKEN", value: "********", isSecret: true },
];
