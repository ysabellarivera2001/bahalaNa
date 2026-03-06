# Data Operations Console (MVP)

A local, multi-page operator console for the GSIS Asset Sync workflow between Kaseya and Strev/Revnue.

## Project Overview

This MVP provides a production-style admin console that supports:

- side-by-side asset comparison
- controlled transfer actions (CREATE/UPDATE decision by identifier)
- autosync health visibility and operations controls
- activity logs and unread visibility
- runtime settings visibility with secret masking
- support diagnostics and ticket history

The app is intentionally frontend-first with typed mock services so it runs locally without requiring backend API availability.

## Features

- `Dashboard`: KPIs, sync health summary, latest transfer outcomes
- `Asset Console`: compare Kaseya vs Strev assets, search/filter, transfer action view, transfer history
- `Sync Status`: queue and health metrics, reconcile and dry-run controls (mock)
- `Activity Center`: operational logs with severity and status
- `Settings`: safe `.env` setting viewer (masked secret values)
- `Support`: diagnostics snapshot, connectivity state, support tickets
- `Palette Cycling`: one-click theme switching across curated floral palettes (persisted per browser)

## Technology

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4

## Installation

```bash
npm install
```

## Running Locally

Single command:

```bash
npm run local
```

Alternative standard dev command:

```bash
npm run dev
```

App URL:

- `http://localhost:3000`

## Build for Production

```bash
npm run build
npm run start
```

## Environment Variables

The app reads environment variables when available and falls back to safe mock settings.

Expected keys:

- `REVNUE_COMPANY`
- `REVNUE_ASSET_URL`
- `REVNUE_TEST_URL`
- `REVNUE_TOKEN`
- `KASEYA_TOKEN_ID`
- `KASEYA_TOKEN_SECRET`

Notes:

- Secret values are masked in the UI.
- `.env*` is already ignored by git.
- Use `.env.local` for local runtime values.

## Project Structure

```txt
src/
  app/
    (console)/
      dashboard/
      assets/
      sync-status/
      activity/
      settings/
      support/
  components/
    layout/
    ui/
    tables/
    logs/
  services/
  data/
  types/
  lib/
```

## Data and API Strategy

- Services in `src/services/*` return typed mock data for MVP reliability.
- Structure mirrors backend endpoints described in context (`/api/transfer`, `/api/sync/status`, `/api/settings/env`, etc.) for straightforward future API integration.
- Mock models and records are centralized in `src/data/mockData.ts`.

## Notes for Next Iteration

- Replace mock services with real API calls to `asset_dashboard.py` backend endpoints.
- Add write actions for settings persistence and ticket creation.
- Add SMAX push adapter and optional status sync.
- Add AI mapping suggestion workflow as separate module.
