# Decisions (ADR Summary)

This file captures key architectural decisions reflected in the current codebase.

## 1) Frontend-First MVP With Optional Live Data
- Decision: Build a Next.js App Router UI that runs without backend dependencies, but can call live APIs when env vars exist.
- Rationale: Allows local demo and development even when upstream systems are unavailable.
- Evidence: `src/services/*` return mock/empty data; `src/lib/live-sync-data.ts` falls back to mock snapshots.

## 2) Live Data via Next.js API Routes (No External Backend)
- Decision: Use `/api/live-sync` and `/api/connectivity/test` route handlers for live data and checks.
- Rationale: Keeps integration contained in the Next.js app for MVP simplicity.
- Evidence: `src/app/api/live-sync/route.ts`, `src/app/api/connectivity/test/route.ts`.

## 3) Kaseya Fetch via Basic Auth + IPv4 Enforcement
- Decision: Use Basic auth headers and an `undici` Agent with IPv4 only.
- Rationale: Align with Kaseya auth and ensure connectivity in environments that require IPv4.
- Evidence: `src/lib/kaseya-request.ts`.

## 4) Asset Matching by Identifier, Not Name
- Decision: Match Kaseya and Strev assets using identifier equality (serial/asset tag), not name.
- Rationale: Names can drift; identifiers are stable for sync decisions.
- Evidence: `getAssetComparison()` in `src/services/assetService.ts`, comparisons in `src/app/(console)/assets/page.tsx`, sync event generation in `src/services/operationService.ts`.

## 5) Non-Persistent Client State
- Decision: UI state (transfer history, selections) is in-memory only.
- Rationale: MVP scope without persistence; refresh resets state.
- Evidence: `src/app/(console)/assets/page.tsx` uses React state and resets `history` on load.

## 6) Theming via CSS Variables + Local Storage
- Decision: Use a palette-based theme system that stores selected palette in `localStorage`.
- Rationale: Lightweight personalization without global state management.
- Evidence: `src/components/theme/theme-palette-provider.tsx`, `src/components/theme/theme-preferences.tsx`.

## 7) Server vs Client Data Fetching Split
- Decision: Server components fetch data for dashboard-like pages; client pages call APIs on mount.
- Rationale: SSR for overview pages; client fetching for interactive pages and refresh behavior.
- Evidence: Server pages (`/dashboard`, `/transfers`, `/exceptions`, `/activity`, `/settings`, `/support`) vs client pages (`/assets`, `/sync-status`).