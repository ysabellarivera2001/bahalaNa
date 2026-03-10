# Testing

This repository currently has no explicit automated test suite configured. The guidance below reflects how to validate behavior based on existing code.

## Manual Test Checklist

### 1. App Boot
- Run `npm install`
- Start dev server: `npm run dev` or `npm run local`
- Confirm app loads at `http://localhost:3000` and redirects to `/dashboard`

### 2. Live Sync Fallback
- Without env vars, confirm `/dashboard` and `/assets` load mock data.
- Refresh `/assets` and confirm selections/history reset (expected behavior).

### 3. Live Sync With Env Vars
- Set env vars:
  - `KASEYA_TOKEN_ID`, `KASEYA_TOKEN_SECRET`, and one of `KASEYA_ASSET_URL` or `KASEYA_BASE_URL`
  - `REVNUE_TOKEN`, `REVNUE_ASSET_URL`
- Load `/dashboard` and `/assets`
- Verify API source shows `LIVE` in the dashboard sync panel

### 4. Connectivity Tests
- Navigate to `/support`
- Run connectivity tests for Kaseya and Strev
- Confirm status messages reflect API reachability and HTTP status codes

### 5. Sync Status
- Navigate to `/sync-status`
- Verify events list and overview values update
- Run `Reconcile` and `Dry-Run` actions; confirm action message

### 6. Settings View
- Navigate to `/settings`
- Verify env keys are displayed and secrets are masked

## Known Gaps
- No unit/integration tests
- No mocking framework configured
- No e2e testing configured

## Suggested Future Tests
- Unit tests for mapping functions in `src/lib/live-sync-data.ts`
- API route handler tests for `/api/live-sync` and `/api/connectivity/test`
- Component tests for `DataTable`, `DashboardSyncPanel`, and theme system
- E2E smoke tests for core routes