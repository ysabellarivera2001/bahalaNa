# Data Model

This document reflects the current TypeScript domain model and how data is mapped in the app.

## Core Types (src/types/index.ts)

### KaseyaAsset
- `id: string`
- `name: string`
- `identifier: string`
- `modifiedDate: string`
- `detailSource: "unpaged" | "filter" | "specific-device" | "paged"`
- `hasAssetInfo: boolean`
- `assetInfoCount: number`

### RevnueAsset (Strev)
- `id: string`
- `name: string`
- `serialNumber: string`
- `assetTag: string`
- `category: string`
- `lastSynced: string`

### TransferRecord
- `id: string`
- `kaseyaIdentifier: string`
- `action: "CREATE" | "UPDATE"`
- `status: "success" | "partial" | "failed"`
- `message: string`
- `timestamp: string`
- `mappedNonEmptyCount: number`

### SyncOverview
- `health: "healthy" | "degraded" | "critical"`
- `mode: "LIVE" | "OFFLINE"`
- `queueDepth: number`
- `successRate: number`
- `workerHeartbeat: string`
- `lastReconcile: string`
- `failedEvents: number`
- `partialEvents: number`

### SyncEvent
- `id: string`
- `timestamp: string`
- `identifier: string`
- `eventType: "create" | "update" | "delete"`
- `status: "success" | "partial" | "failed"`
- `attempts: number`
- `detail: string`

### ActivityLog
- `id: string`
- `timestamp: string`
- `channel: "notification" | "message"`
- `level: "info" | "warning" | "error"`
- `status: "success" | "partial" | "failed" | "info"`
- `text: string`
- `read: boolean`

### RuntimeSetting
- `key: string`
- `value: string`
- `isSecret?: boolean`

### SupportTicket
- `id: string`
- `createdAt: string`
- `severity: "low" | "medium" | "high" | "critical"`
- `title: string`
- `status: "open" | "in_progress" | "resolved"`
- `summary: string`
- `smaxRef?: string`

### DiagnosticResult
- `kaseyaConnectivity: "pass" | "fail"`
- `revnueConnectivity: "pass" | "fail"`
- `syncEngine: "running" | "degraded"`
- `queueDatabase: "ok" | "error"`
- `checkedAt: string`

## Mapping and Matching Rules

### Identifier Matching (Authoritative)
- Kaseya identifier is matched against Strev serial or asset tag.
- Used to determine CREATE vs UPDATE.
- Evidence: `src/services/assetService.ts`, `src/app/(console)/assets/page.tsx`.

### Live Data Mapping
- `src/lib/live-sync-data.ts` maps raw Kaseya fields to `LiveAsset`:
  - `id`: `Id` / `id` / `AssetId` / `AssetID` / `AssetGuid` / `Identifier`
  - `name`: `Name` / `AssetName` / `DeviceName`
  - `identifier`: preferred from `AssetInfo` (Serial/Asset Tag) or identifier/serial fields
  - `modifiedDate`: `ModifiedDate` / `Modified` / `updated_at` / `LastSeenAt` / `LastSeenOnline`
  - `hasAssetInfo`: boolean based on `AssetInfo` array
  - `assetInfoCount`: length of `AssetInfo`

- Strev mapping picks:
  - `id`: `id` / `Id` / `asset_id`
  - `name`: `name` / `asset_name`
  - `identifier`: `serial_number` / `serialNumber` / `SerialNumber` / `Identifier` / `asset_tag`
  - `modifiedDate`: `modified_date` / `modifiedDate` / `updated_at`

### Transfer Preview Mapping
- Client-side transfer preview builds `TransferRecord` entries with:
  - `status`: success if `hasAssetInfo`, else partial
  - `mappedNonEmptyCount`: derived from `assetInfoCount` or minimum of 3
- Evidence: `src/app/(console)/assets/page.tsx`.

## Note on Persistence
- No persistent storage: these models are produced at runtime from live or mock data.