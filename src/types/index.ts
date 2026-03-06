export type HealthState = "healthy" | "degraded" | "critical";
export type SyncMode = "LIVE" | "OFFLINE";
export type TransferAction = "CREATE" | "UPDATE";
export type TransferStatus = "success" | "partial" | "failed";
export type LogLevel = "info" | "warning" | "error";

export interface KaseyaAsset {
  id: string;
  name: string;
  identifier: string;
  modifiedDate: string;
  detailSource: "unpaged" | "filter" | "specific-device" | "paged";
  hasAssetInfo: boolean;
  assetInfoCount: number;
}

export interface RevnueAsset {
  id: string;
  name: string;
  serialNumber: string;
  assetTag: string;
  category: string;
  lastSynced: string;
}

export interface TransferRecord {
  id: string;
  kaseyaIdentifier: string;
  action: TransferAction;
  status: TransferStatus;
  message: string;
  timestamp: string;
  mappedNonEmptyCount: number;
}

export interface SyncOverview {
  health: HealthState;
  mode: SyncMode;
  queueDepth: number;
  successRate: number;
  workerHeartbeat: string;
  lastReconcile: string;
  failedEvents: number;
  partialEvents: number;
}

export interface SyncEvent {
  id: string;
  timestamp: string;
  identifier: string;
  eventType: "create" | "update" | "delete";
  status: TransferStatus;
  attempts: number;
  detail: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  channel: "notification" | "message";
  level: LogLevel;
  status: TransferStatus | "info";
  text: string;
  read: boolean;
}

export interface RuntimeSetting {
  key: string;
  value: string;
  isSecret?: boolean;
}

export interface SupportTicket {
  id: string;
  createdAt: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  status: "open" | "in_progress" | "resolved";
  summary: string;
  smaxRef?: string;
}

export interface DiagnosticResult {
  kaseyaConnectivity: "pass" | "fail";
  revnueConnectivity: "pass" | "fail";
  syncEngine: "running" | "degraded";
  queueDatabase: "ok" | "error";
  checkedAt: string;
}
