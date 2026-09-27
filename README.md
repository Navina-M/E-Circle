# E-Circle — Recycler + Admin Web Portal 

Frontend-only build per spec: React + Vite + Tailwind v4 + React Router + Framer Motion + Recharts + Lucide.
All 26 pages implemented. No sidebar anywhere — top nav only, collapses to a top dropdown on mobile.

## Run it
    npm install
    npm run dev

## Login (mock accounts)
- Admin: `admin` / `admin123`
- Recycler: `REC-2026-000001` / `password123` (any REC-2026-0000xx id works, see src/api/mockData.js)

## Architecture — built to swap onto a real FastAPI backend
- `src/api/mockData.js` — deterministic mock dataset (recyclers, collectors, lots, transactions, traceability, prices, activity). This is the ONLY file you delete once real data exists.
- `src/services/api.js` — the service layer. Every function name matches a spec'd FastAPI endpoint (getAdminDashboard → GET /api/admin/dashboard, getRecyclerLots → GET /api/recyclers/lots, etc). Components only ever import from here. Swap each function body for a `fetch(import.meta.env.VITE_API_URL + '/...')` call and nothing else in the app changes.
- `src/contexts/AuthContext.jsx` — mock JWT-like session (token + role + profile) in localStorage with expiry simulation. Swap `login()`'s body for a real `/api/auth/login` call; the shape it returns (`{ token, role, profile }`) is what the rest of the app expects.
- Recycler data isolation is enforced in this layer today by filtering on `recyclerId` client-side — call this out clearly to whoever builds the backend: **the real enforcement must happen server-side, keyed off the JWT**, per the spec's own requirement. The frontend filtering here is only a stand-in so the UI behaves correctly against mock data.
- `.env.example` — VITE_API_URL / VITE_MAPS_API_KEY placeholders, per spec section 44.

## What's real vs. stubbed
- Real: routing, protected routes + role gating, top nav (incl. mobile hamburger, active-page indicator), full CRUD flow for recyclers (add/activate/deactivate/delete with confirmation), lot accept/reject, status-driven traceability timelines, all charts wired to (mock) data, search/filter/pagination/debounce on every list page, notifications dropdown, session-expiry redirect.
- Stubbed pending real integrations: Maps (placeholder panel — wire up Google Maps/Mapbox with VITE_MAPS_API_KEY), AI classification result display (shows AI Verified + confidence from mock data — wire to POST /api/ai/classify-material), FairRoute ranking (service function exists in api.js, not yet surfaced in a page), image upload/display (placeholder tile).

## Not built (by design, per your scope choice)
FastAPI backend, PostgreSQL schema/migrations, JWT issuance, password hashing, recycler dataset import job. The service layer is shaped so building these against it is mechanical — see api.js.
