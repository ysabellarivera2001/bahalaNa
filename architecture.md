# Architecture: Data Operations Console (VSAX)

## Overview
A Next.js App Router application that renders an operator console for asset synchronization between Kaseya and Strev/Revnue. The app prioritizes a frontend-first MVP and can optionally call live APIs via environment configuration. Data is fetched per request; no persistence layer exists in this repository.

## High-Level Components
1. UI Console (Next.js App Router)
- Server and client components
- Themed UI shell with sidebar and top bar
- Feature pages for dashboard, assets, transfers, exceptions, activity, settings, and support

2. Service Layer (Typed Data Providers)
- `src/services/*` exposes domain data to pages
- Some services are server-only to call live data on the server
- Several services are placeholders returning mock/empty records

3. Live Data Integration
- `src/lib/live-sync-data.ts` fetches Kaseya and Strev assets
- `src/lib/kaseya-request.ts` handles Kaseya auth + IPv4 dispatch
- `src/lib/env.ts` reads env vars and masks secrets for settings view

4. API Routes (Next.js)
- `/api/live-sync`: returns a snapshot (live or mock)
- `/api/connectivity/test`: verifies Kaseya and Strev reachability

## Runtime Architecture
- `/dashboard` and server-rendered pages load data in server components
- Client pages (like `/assets` and `/sync-status`) fetch data at runtime via API routes
- UI state is managed in React state and cleared on refresh

## Data Flow
1. Page requests data
2. Page calls a service (`src/services/*`)
3. Service calls either:
   - Live data loader (`loadLiveAssetSnapshot`) or
   - Mock data provider / empty list
4. Data is mapped into UI models and rendered

## Core Modules
- `src/app/(console)/layout.tsx`: AppShell wrapper
- `src/components/layout/*`: Sidebar + TopBar
- `src/components/ui/*`: Common UI primitives
- `src/components/dashboard/*`: Live sync preview
- `src/components/tables/data-table.tsx`: Table rendering
- `src/components/theme/*`: Palette provider and selector

## API Integration Details
### Kaseya
- URL is resolved from env vars:
  - `KASEYA_ASSET_URL`, `KASEYA_ASSETS_URL`, `DEFAULT_KASEYA_ASSETS_URL`, or `KASEYA_BASE_URL`
- Basic auth header generated from `KASEYA_TOKEN_ID` + `KASEYA_TOKEN_SECRET`
- Uses `undici` Agent with IPv4 enforcement

### Strev/Revnue
- Uses `REVNUE_ASSET_URL` with optional `REVNUE_COMPANY`
- Auth uses `REVNUE_TOKEN` bearer token
- Uses no-store fetch to avoid caching

## Deployment Model
- Local dev: `npm run dev` or `npm run local`
- Production: `npm run build` then `npm run start`
- No external backend is required for the current MVP

## Persistence
- None in this repo
- All logs, history, and assets are in-memory or fetched from live APIs per request

## Observability
- UI only (status badges and timestamps)
- No metrics, logging, or tracing integrations

## Security
- Secrets are read from environment variables and masked in the UI
- No auth system in place

## Key Limitations
- No write-back transfers or queue processing
- No autosync engine or webhook handling
- No permanent storage of data

## Extension Points
- Replace mock services with backend API calls
- Add database for transfer/log/ticket persistence
- Implement autosync queue + reconciler
- Add auth and role-based access control
- Integrate SMAX for ticketing