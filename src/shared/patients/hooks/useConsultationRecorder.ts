import { useCallback, useRef, useState } from "react";
import { appToast } from "@/shared/components/feedback/toast";
import { ConsultationNoteService } from "../services/consultationNoteService";

// Chunks are uploaded and transcribed roughly every CHUNK_INTERVAL_MS — this
// is near-live (the transcript grows in ~10s steps), not true streaming ASR.
// A real streaming transcriber would need a websocket + incremental decoding
// on the ml-service side, which is a materially bigger lift than chunked
// upload-and-transcribe; this is the practical middle ground.
const CHUNK_INTERVAL_MS = 10_000;

export type RecorderStatus =
  | "idle"
  | "starting"
  | "recording"
  | "stopped"
  | "completing"
  | "completed";

export interface TranscriptSegmentState {
  sequence: number;
  text: string;
  failed: boolean;
}

export interface ConsultationNoteFields {
  chief_complaint: string;
  history_of_present_illness: string;
  assessment: string;
  plan: string;
}

const emptyFields: ConsultationNoteFields = {
  chief_complaint: "",
  history_of_present_illness: "",
  assessment: "",
  plan: "",
};

export function useConsultationRecorder(patientId: string) {
  const [noteId, setNoteId] = useState<string | null>(null);
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<TranscriptSegmentState[]>([]);
  const [durationSec, setDurationSec] = useState(0);
  const [fields, setFields] = useState<ConsultationNoteFields>(emptyFields);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sequenceRef = useRef(0);
  const pendingUploadsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const uploadChunk = useCallback((noteIdForUpload: string, blob: Blob) => {
    if (blob.size === 0) return;
    const sequence = sequenceRef.current++;
    pendingUploadsRef.current += 1;
    ConsultationNoteService.uploadAudioChunk(noteIdForUpload, sequence, blob, `chunk_${sequence}.webm`)
      .then((result) => {
        setSegments((prev) =>
          [...prev, { sequence, text: result.transcript_text, failed: result.status === "failed" }].sort(
            (a, b) => a.sequence - b.sequence,
          ),
        );
        setTranscript(result.full_transcript);
      })
      .catch((err) => {
        setSegments((prev) =>
          [...prev, { sequence, text: "", failed: true }].sort((a, b) => a.sequence - b.sequence),
        );
        appToast.fromError(err, "A chunk failed to transcribe — recording continues");
      })
      .finally(() => {
        pendingUploadsRef.current -= 1;
      });
  }, []);

  const start = useCallback(async () => {
    setStatus("starting");
    setError(null);
    try {
      const { id } = await ConsultationNoteService.start(patientId);
      setNoteId(id);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => uploadChunk(id, e.data);
      recorder.start(CHUNK_INTERVAL_MS);

      setStatus("recording");
      timerRef.current = setInterval(() => setDurationSec((d) => d + 1), 1000);
    } catch (err) {
      setStatus("idle");
      const message = err instanceof Error ? err.message : "Could not start recording";
      setError(message);
      appToast.fromError(err, "Could not start recording — check microphone permission");
    }
  }, [patientId, uploadChunk]);

  const stopRecorder = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (!recorder || recorder.state === "inactive") return Promise.resolve();
    return new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.stop();
    });
  }, []);

  const stop = useCallback(async () => {
    await stopRecorder();
    setStatus("stopped");
  }, [stopRecorder]);

  const saveFields = useCallback(
    async (updates: Partial<ConsultationNoteFields>) => {
      if (!noteId) return;
      setIsSaving(true);
      try {
        await ConsultationNoteService.update(noteId, updates);
        setFields((prev) => ({ ...prev, ...updates }));
      } catch (err) {
        appToast.fromError(err, "Failed to save note");
      } finally {
        setIsSaving(false);
      }
    },
    [noteId],
  );

  const complete = useCallback(async () => {
    if (!noteId) return;
    setStatus("completing");
    await stopRecorder();
    // Wait for any chunk uploads still in flight so the final transcript is
    // in before the note is marked complete (bounded — a stuck upload
    // shouldn't block the clinician from finishing forever).
    for (let i = 0; i < 50 && pendingUploadsRef.current > 0; i++) {
      await new Promise((r) => setTimeout(r, 200));
    }
    try {
      await ConsultationNoteService.complete(noteId);
      setStatus("completed");
    } catch (err) {
      setStatus("stopped");
      appToast.fromError(err, "Failed to complete consultation note");
    }
  }, [noteId, stopRecorder]);

  return {
    noteId,
    status,
    transcript,
    segments,
    durationSec,
    fields,
    isSaving,
    error,
    start,
    stop,
    saveFields,
    complete,
  };
}
