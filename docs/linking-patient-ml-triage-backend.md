# Linking the Patients page to the backend

The Patients page (`src/shared/patients/`) is a thin client over the
`nexus-backend` ([`Ndifreke000/nexus`](https://github.com/Ndifreke000/nexus))
patient-intake/ML-triage pipeline. This doc is the checklist for actually
getting the two talking to each other — locally, or when diagnosing why the
page is empty/broken against a deployed backend.

For the full data-flow / architecture writeup (ingest → worker → ml-service →
SSE), see [`nexus`'s `docs/PATIENT_ML_TRIAGE.md`](https://github.com/Ndifreke000/nexus/blob/main/docs/PATIENT_ML_TRIAGE.md).
This doc only covers the frontend↔backend wiring.

## 1. Point the frontend at the backend

```
# .env
VITE_API_BASE_URL=http://localhost:8080
```

`src/lib/apiClient.ts` reads this at build time and falls back to
`http://0.0.0.0:8080` if unset. Every call in `patientService.ts` goes through
this same axios instance, which also attaches
`Authorization: Bearer <accessToken>` from `useAuthStore` automatically — you
don't need to touch headers by hand anywhere in the patients feature.

## 2. The backend must actually expose all three endpoints

`patientService.ts` and `usePatients.ts` call:

| Frontend call | Backend route |
|---|---|
| `PatientService.list()` (on mount, and **Refresh**) | `GET /api/v1/patients` |
| `PatientService.get(id)` (8s poll fallback) | `GET /api/v1/patients/{id}` |
| `PatientService.ingest(payload)` (Add Patient) | `POST /api/v1/ingest/patient` |
| `EventSource` in `usePatients` (live updates) | `GET /api/v1/pipeline/events?token=...` |

**This is not a given.** These four routes have been added and reverted
independently in `nexus-backend`'s history more than once, and `GET
/api/v1/patients` + the SSE route were missing from `main` entirely as late as
[nexus#2](https://github.com/Ndifreke000/nexus/pull/2) — meaning the page
would load empty with an error banner, and live triage updates would never
arrive, purely because of backend drift, with nothing wrong in this repo.

**Before debugging anything on the frontend side**, confirm the backend
actually serves all four:

```bash
TOKEN=<a real JWT for a hospital_admin or health_worker user>

curl -i http://localhost:8080/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"

curl -i "http://localhost:8080/api/v1/pipeline/events?token=$TOKEN" --max-time 2
```

Both should return `200`. A `404` on the first means the backend's `main` is
missing `list_patients` (check `src/routes/app_routes.rs` for a
`GET /api/v1/patients` registration). A `404` or hang with no data on the
second means the `pipeline` handler module isn't wired in (check for
`pub mod pipeline;` in `src/handlers/mod.rs` and a `/api/v1/pipeline/events`
route) — a build with it silently excluded still compiles fine, so `cargo
check` passing on the backend proves nothing about this endpoint existing.

## 3. Why the SSE call passes `?token=` instead of a header

`usePatients.ts` opens the live-update stream with the browser's native
`EventSource`:

```ts
const url = `${apiClient.defaults.baseURL}/api/v1/pipeline/events?token=${encodeURIComponent(accessToken)}`;
const source = new EventSource(url);
```

`EventSource` cannot set custom request headers, so it can't send
`Authorization: Bearer <token>` the way every other call does. The token rides
along as a query param instead. The backend has to explicitly support this —
it decodes the JWT from the header if present, falling back to `?token=`
(`extract_claims_with_query_fallback`). If you ever see the SSE connection
401 in the Network tab while every other request succeeds, this fallback is
the first thing to check on the backend.

## 4. Confirming it's actually live, not just polling

`usePatients.ts` has a deliberate safety net: every `pending`/`processing` row
is re-polled every 8 seconds via `GET /api/v1/patients/{id}`, independent of
SSE. This means **a broken SSE connection can look like it's working** — a
submitted patient's risk badge will still resolve, just up to ~8s slower.

To confirm the real-time path (not the fallback) is working:

1. Open DevTools → Network → filter `pipeline/events`.
2. Submit a patient via **Add Patient**.
3. The request to `pipeline/events` should show status `200` and stay open
   (type `eventsource`), and the row's badge should update in well under a
   second — not on an 8-second cadence.

If the request shows `401`/`404`/`(failed)`, live updates are broken even
though the page still "works" via polling — treat that as a backend bug, not
a frontend one, per the checklist above.

## 5. Running the full stack locally

```bash
# backend (nexus)
cd nexus && cargo run                                  # :8080

# ml-service (nexus/ml-service) — needed for predictions to ever resolve
cd nexus/ml-service && source .venv/bin/activate
uvicorn main:app --port 8001                            # :8001

# this repo
npm run dev                                              # :5173
```

Log in as a `hospital_admin` (or `health_worker`) via the normal email-OTP
flow (`POST /api/v1/auth/otp/send` / `otp/verify`) and open
`/hospital/patients` (or `/medical-staff/patients`, once it has a nav entry —
see nexusApp PR #37's notes).

If `ml-service` isn't running, ingest still succeeds and the row appears with
a permanent "Running AI triage…" state — the Rust worker's poll to
`ML_SERVICE_URL` will keep failing silently in the backend logs until it's up.
