# Linking consultation notes to the backend

The consultation-recording page (`src/shared/patients/components/ConsultationRecorder.tsx`,
reached from the Patients page's "Record" button) is a thin client over
`nexus-backend`'s voice-recorded consultation notes feature. This doc is the
checklist for getting the two talking to each other. For the full
architecture — schema, audio flow, Whisper config — see
[`nexus`'s `docs/CONSULTATION_NOTES.md`](https://github.com/Ndifreke000/nexus/blob/main/docs/CONSULTATION_NOTES.md).
This doc only covers the frontend↔backend wiring.

## 1. The backend must expose all five endpoints

`consultationNoteService.ts` calls:

| Frontend call | Backend route |
|---|---|
| `ConsultationNoteService.start()` | `POST /api/v1/patients/{patientId}/consultation-notes` |
| `ConsultationNoteService.uploadAudioChunk()` | `POST /api/v1/consultation-notes/{id}/audio-chunk` |
| `ConsultationNoteService.update()` | `PATCH /api/v1/consultation-notes/{id}` |
| `ConsultationNoteService.complete()` | `POST /api/v1/consultation-notes/{id}/complete` |
| `ConsultationNoteService.get()` / `listForPatient()` | `GET /api/v1/consultation-notes/{id}` / `GET /api/v1/patients/{patientId}/consultation-notes` |

If any of these 404, check `src/routes/app_routes.rs` on the backend for the
corresponding `.route(...)` registration and `src/handlers/mod.rs` for
`pub mod consultation_notes;` — this backend has a history of module
declarations quietly going missing across merges (see nexus PR #4's "Also
fixed" section for a concrete instance), so a 404 here doesn't necessarily
mean the frontend is wrong.

## 2. Audio upload is multipart, not JSON

`uploadAudioChunk()` in `consultationNoteService.ts` explicitly sets
`headers: { "Content-Type": undefined }` on that one request — `apiClient`'s
default `application/json` header would otherwise stop the browser from
setting the correct multipart boundary. If you see the backend reject an
audio-chunk upload with a body-parsing error, check that header override is
still in place before assuming the backend is broken.

## 3. Microphone permission

`useConsultationRecorder.ts` calls `navigator.mediaDevices.getUserMedia({audio:true})`
when "Start Recording" is clicked. This requires:

- A secure context (`https://` or `localhost` — plain HTTP on a non-localhost
  host will silently fail to even prompt).
- The user granting the browser's microphone permission prompt.

If recording gets stuck on "Starting…" indefinitely with no error, the
`getUserMedia` promise is most likely waiting on that permission prompt —
check the browser's address-bar permission indicator, not just the page.
(This is exactly what happened when testing this feature in a remote/headless
browser automation session with no virtual microphone device — the API call
to start the note still succeeds, only the mic capture hangs.)

## 4. Running the full stack locally

```bash
# backend + ml-service (one command now — see nexus's README Quick Start)
cd nexus && cargo run

# this repo
npm run dev
```

Log in as a `hospital_admin` or `health_worker`, open `/medical-staff/patients`,
and click **Record** on any patient row.

## 5. Confirming the transcript is real, not stalled

Every ~10 seconds during recording, a new chunk uploads and the transcript
in the "Live Transcript" panel should grow. If it never grows past the
initial "Listening…" placeholder even though recording is active:

1. Open DevTools → Network → filter `audio-chunk`.
2. Each request should return `200` with a body like
   `{"sequence":0,"transcript_text":"...","status":"completed","full_transcript":"..."}`.
3. A `status: "failed"` in that response (with empty `transcript_text`) means
   ml-service's `/transcribe` errored on that chunk — check the backend's
   logs for `Transcription failed for note ... chunk ...`. This doesn't stop
   the recording; the next chunk gets its own chance.
