# MixoAds — Campaigns Dashboard

Tech: React + TypeScript + Vite + TanStack Query + Axios + ApexCharts + Tailwind CSS

This README summarizes the current project and the improvements applied so far (migration guides, UI components, runtime fixes and robustness improvements). Use this as a single source of truth for running, debugging and continuing development.

---

## Quick start

1. Install
   - npm install

2. Dev
   - npm run dev
   - Open http://localhost:5173

3. Build
   - npm run build
   - npm run preview

Environment:
- Default API base: `https://mixo-fe-backend-task.vercel.app`
- Optionally override with `.env`:
  ```
  VITE_API_URL=https://mixo-fe-backend-task.vercel.app
  ```

---

## What changed / Why

The project has been updated to address several runtime errors, improve UX, and modernize integrations:

1. Tailwind CSS v4 changes
   - Migrated CSS usage for Tailwind v4:
     - Use `@import "tailwindcss";` in your CSS entry and prefer utilities in JSX.
     - Avoid using v3-style `@tailwind utilities` and global `@apply` for utilities unless explicitly referenced (`@reference utilities`).
   - Files:
     - `src/styles/index.css` updated to follow v4 approach (use `theme()` for global values if needed).

2. TanStack Query v5 migration
   - Hooks were updated to use the v5 single-object signature:
     - `useQuery({ queryKey, queryFn, ...options })`
     - `useMutation({ mutationFn, ...options })`
   - Example hooks updated: `src/hooks/useCampaigns.ts`, `src/hooks/useInsights.ts`.

3. Robust SSE and snapshot handling (Live Metrics)
   - Introduced a safe SSE hook: `src/hooks/useCampaignSSE.ts`
     - Closes previous EventSource before opening a new one.
     - Filters incoming events by `campaign_id`.
     - Accepts an onError handler to surface server errors from the SSE stream.
   - Added a snapshot fetch hook: `src/hooks/useCampaignInsights.ts`
     - Fetches `GET /campaigns/{id}/insights` as an initial snapshot so Live Metrics show immediately (if available) then SSE overrides for real-time updates.
   - Dashboard behavior:
     - Selects the first campaign by default.
     - Shows a skeleton in Live Metrics while waiting for snapshot/SSE.
     - Shows SSE errors and provides Retry controls.
   - Files:
     - `src/hooks/useCampaignSSE.ts` (updated)
     - `src/hooks/useCampaignInsights.ts` (new)
     - `src/pages/Dashboard.tsx` (updated)

4. ApexCharts stability improvements
   - Replace (or provide robust alternative to) `react-apexcharts` to avoid "Element not found" and unmount lifecycle issues in StrictMode.
   - Charts are mounted imperatively using core `apexcharts`:
     - `src/components/ChartOne.tsx` (imperative mount/destroy; updateOptions/updateSeries support; export CSV/PNG)
     - `src/components/DonutChart.tsx` (imperative mount; summary + hover interaction; disabled hover-animation)
   - Benefits:
     - Stable mount/unmount behavior in StrictMode
     - Safer destruction (wrapped in try/catch)
     - Improved export options and responsiveness

5. UI improvements & layout
   - New/updated components with consistent design and responsiveness:
     - `src/components/Layout.tsx` — sticky header, responsive search, avatar, and actions.
     - `src/components/CampaignList.tsx` — scrollable, selectable list, hover and selected styles.
     - `src/components/AggregateInsightsCard.tsx` — compact mini-stat cards (four metrics) used inside the chart card.
     - `src/components/Loading.tsx` — page-level loading skeleton placed inside Layout so the header remains visible.
     - `src/components/LiveMetricSkeleton.tsx` — small skeleton for Live Metrics box while waiting for data.
   - Dashboard layout:
     - `src/pages/Dashboard.tsx` (main page) updated to use the above components and show partial loading and error UI states.

6. Error handling & developer UX
   - API wrapper (`src/api/campaigns.ts`) normalizes axios errors and throws structured errors for UI to act on.
   - SSE errors surfaced to the UI (with retry buttons).
   - Retry buttons added for snapshot and SSE re-subscribe.
   - Helpful console warnings added for duplicate chart IDs or unexpected SSE payloads.

---

## How Live Metrics works now

1. Default selection
   - When campaigns load, the dashboard selects the first campaign automatically and starts working to populate Live Metrics.

2. Snapshot + SSE
   - The dashboard first fetches a snapshot: `GET /campaigns/{id}/insights`.
   - While snapshot is loading, we show a skeleton in the Live Metrics card.
   - Simultaneously, we open SSE: `GET /campaigns/{id}/insights/stream`.
   - When SSE payloads arrive (payload includes `campaign_id`), they override the displayed metrics in real time.

3. Edge cases
   - If SSE returns an error payload (e.g., 503 Service Unavailable), the Live Metrics card shows a clear error block with message and retry controls.
   - If SSE stops working, the last snapshot remains visible (if available) so the user still has useful context.

---

## New / Important files (high-level)

- src/hooks/
  - useCampaignSSE.ts (updated — safe SSE with onError)
  - useCampaignInsights.ts (new — snapshot fetch)
  - useCampaigns.ts, useInsights.ts (migrated to TanStack Query v5)
- src/api/
  - campaigns.ts (API wrapper with friendly errors)
- src/components/
  - Layout.tsx (updated header)
  - CampaignList.tsx (updated list with sticky and scroll)
  - ChartOne.tsx (imperative ApexCharts wrapper)
  - DonutChart.tsx (imperative ApexCharts wrapper with right-side summary)
  - AggregateInsightsCard.tsx (compact four-metric card)
  - Loading.tsx (page-level skeleton inside Layout)
  - LiveMetricSkeleton.tsx (small skeleton for live area)
- src/pages/
  - Dashboard.tsx (updated to use snapshot(+SSE) logic and skeletons)

---

## Troubleshooting

- "Element not found" (ApexCharts/react-apexcharts)
  - Use core `apexcharts` and mount charts imperatively (current setup does this).
  - Make sure each chart ID is unique. The components generate unique IDs by default.

- TanStack Query v5 runtime error:
  - Use new object-based signature: `useQuery({ queryKey, queryFn, ... })`.
  - Update any `useQuery`, `useMutation`, `useInfiniteQuery` usages.

- SSE messages from wrong campaign
  - Ensure only one EventSource per selected campaign is open.
  - The hook closes previous connections and filters events by `campaign_id`.

- API errors (502/503)
  - The UI now surfaces errors in Live Metrics and provides retry actions.
  - You can toggle to mock data locally while backend is down (add a local fixture and a `useMock` state if desired).

---

## Developer notes & next improvements suggested

- Add a small SSE connection indicator (connected / reconnecting / error) near "Live Metrics".
- Implement exponential backoff for SSE auto-reconnect.
- Add count-up animations for metric numbers (e.g., `react-countup`) for initial loads.
- Improve accessibility: keyboard navigation for the campaign list and chart legends; ARIA labels for charts.
- Add a slide-over campaign detail panel (mobile-friendly) for historical timeseries.

---

## Contributing

- Follow repo's lint rules. We recommend enabling type-checked ESLint config for stricter type-aware checks (see `react_ts_vite_setup.md`).
- When adding charts, prefer the existing ChartOne pattern (imperative mount/destroy) to avoid lifecycle issues.