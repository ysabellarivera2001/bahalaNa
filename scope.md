# Scope: Data Operations Console (VSAX)

## In Scope (Current)
- Next.js App Router console UI for GSIS asset sync monitoring
- Side-by-side asset comparison (Kaseya vs Strev/Revnue)
- Transfer action preview (CREATE/UPDATE) and in-memory transfer history
- Sync status overview and event listing (live or mock)
- Activity center UI (log viewer) with empty/mock data
- Settings viewer with secret masking
- Support diagnostics view and connectivity checks
- Theme palette switching with persisted selection
- Live sync data fetch with fallback to mock data

## In Scope (Supported by Env Config)
- Live Kaseya API access via basic auth
- Live Strev/Revnue API access via bearer token
- Connectivity testing for both services

## Out of Scope (Current MVP)
- Persistent database for assets, transfers, logs, or tickets
- Write-back transfer execution to Strev/Revnue
- Autosync engine, queue processing, and webhook ingestion
- SMAX integration and ticket sync
- User authentication/authorization
- Multi-tenant or role-based access controls
- Production-grade observability (metrics/tracing)

## Constraints
- UI relies on in-memory state on client pages
- Live data requires env vars; otherwise uses mock snapshots
- API endpoints are Next.js route handlers only (no external backend)

## Success Criteria (MVP)
- Console runs locally with or without live API credentials
- Operators can compare assets and see sync health
- Connectivity checks surface configuration issues
- UI remains stable even when live APIs fail

## Future Scope Candidates
- Replace mock services with backend API calls
- Persist transfer history, logs, and tickets
- Add real transfer execution and retry workflows
- Introduce autosync engine + reconciliation scheduling
- Add SMAX adapter for support tickets
- Add audit trail and approvals for changes