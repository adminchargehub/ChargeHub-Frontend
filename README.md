# ChargeHub Frontend

React + TypeScript + Vite. Customer-facing portal for finding and booking
outlets at ChargeHub stations.

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript 5.6 |
| Build | Vite 5 |
| Routing | react-router-dom 6 |
| Server state | TanStack Query 5 |
| API types | generated from the backend's OpenAPI document |

## Quick start

Start the backend first (see `../Chargehub Backend/README.md`), then:

```bash
npm install
```

```bash
npm run dev
```

Opens on <http://localhost:5173>. Seeded demo login is `demo@chargehub.ng` /
`chargehub123` (pre-filled on the sign-in form).

The dev server proxies `/api` to `http://localhost:8000`, so the browser stays
same-origin and CORS only has to be right in deployed environments.

## API types are generated, not hand-written

```bash
npm run gen:api
```

This reads the running backend's `/openapi.json` and rewrites
`src/api/schema.d.ts`. **Re-run it whenever a backend schema changes** — a
mismatch then fails `tsc`, at build time, instead of silently at runtime.

That is not ceremony. The single worst defect in the 2016 prototype was exactly
this class of bug: the firmware sent `?type=`, the PHP handler read
`$_GET['msgType']`, and every device status event was silently discarded for
nine years because nothing checked the two sides agreed. `src/api/client.ts`
declares no field names of its own — every shape comes from `schema.d.ts`.

## Scripts

| | |
|---|---|
| `npm run dev` | dev server with HMR |
| `npm run build` | typecheck then production build |
| `npm run preview` | serve the built output |
| `npm run lint` | `tsc --noEmit` |
| `npm run gen:api` | regenerate API types from the backend |

## Layout

```
src/
├─ api/
│  ├─ client.ts     typed fetch wrapper, token handling, error normalisation
│  └─ schema.d.ts   GENERATED — do not edit by hand
├─ auth/            AuthProvider + useAuth, revalidates stored token on boot
├─ components/      Layout (top bar, outlet)
├─ pages/           LoginPage, StationsPage, StationDetailPage
└─ index.css        design tokens, light + dark via prefers-color-scheme
```

## Notes

- Token lives in `localStorage` and every read/write is wrapped in try/catch, so
  private-browsing or blocked storage degrades to an in-memory session rather
  than throwing.
- A 401 anywhere clears the token and bounces to `/login`; TanStack Query is
  configured not to retry auth failures.
- Station detail polls every 10 s. That is a placeholder — the design doc targets
  <2 s live status, which needs the WebSocket/IoT Core feed.

## Not built yet

Booking confirmation, payments, session monitoring, PIN display, admin and
technician portals, and the map view. This is the walking skeleton: auth →
stations → outlets → availability, wired end to end and nothing more.
