import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mic, Square, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { appToast } from "@/shared/components/feedback/toast";
import { useConsultationRecorder } from "../hooks/useConsultationRecorder";
import { PatientService, type PatientResponse } from "../services/patientService";

function formatDuration(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Voice-recorded consultation note. Records audio in ~10s chunks, sends each
 * to the backend for Whisper transcription (self-hosted in ml-service — see
 * ml-service/voice.py), and grows a running transcript the clinician
 * references while filling in Chief Complaint / History / Assessment / Plan
 * by hand. There is no AI-generated summary here — a deliberate scope
 * decision, not a gap; see nexus-backend's docs/CONSULTATION_NOTES.md.
 */
export function ConsultationRecorder() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientResponse | null>(null);

  const {
    status,
    transcript,
    segments,
    durationSec,
    fields,
    isSaving,
    start,
    stop,
    saveFields,
    complete,
  } = useConsultationRecorder(patientId ?? "");

  const [draft, setDraft] = useState(fields);
  useEffect(() => setDraft(fields), [fields]);

  useEffect(() => {
    if (!patientId) return;
    PatientService.get(patientId)
      .then((detail) => setPatient(detail))
      .catch((err) => appToast.fromError(err, "Failed to load patient"));
  }, [patientId]);

  if (!patientId) {
    return <div className="p-6 text-sm text-error-600">No patient specified.</div>;
  }

  const isRecording = status === "recording";
  const isDone = status === "completed";

  async function handleComplete() {
    await saveFields(draft);
    await complete();
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Consultation Recording
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {patient ? `${patient.full_name} · ${patient.age}y · ${patient.gender}` : "Loading patient…"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {formatDuration(durationSec)}
            </span>
            {isRecording && <div className="h-2 w-2 animate-pulse rounded-full bg-error-500" />}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <Card>
          <CardContent className="flex items-center justify-center gap-4 p-6">
            {status === "idle" || status === "starting" ? (
              <Button size="lg" onClick={start} disabled={status === "starting"}>
                <Mic className="mr-2 h-5 w-5" />
                {status === "starting" ? "Starting…" : "Start Recording"}
              </Button>
            ) : isRecording ? (
              <Button size="lg" variant="danger" onClick={() => stop()}>
                <Square className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            ) : isDone ? (
              <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Consultation note completed</span>
              </div>
            ) : (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Recording stopped</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto rounded-lg bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
              {transcript ? (
                <p className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">{transcript}</p>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-500">
                  {isRecording
                    ? "Listening — transcript updates every ~10 seconds as chunks are transcribed…"
                    : "Start recording to build a transcript."}
                </p>
              )}
              {segments.some((s) => s.failed) && (
                <p className="mt-2 text-xs text-error-600 dark:text-error-400">
                  One or more chunks failed to transcribe — the rest of the transcript is unaffected.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clinical Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Fill these in yourself, referencing the transcript above — nothing here is
              auto-generated.
            </p>
            {(
              [
                ["chief_complaint", "Chief Complaint"],
                ["history_of_present_illness", "History of Present Illness"],
                ["assessment", "Assessment"],
                ["plan", "Plan"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {label}
                </label>
                <textarea
                  className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
                  rows={key === "history_of_present_illness" || key === "plan" ? 4 : 2}
                  value={draft[key]}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                  disabled={isDone}
                />
              </div>
            ))}

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <Button variant="outline" onClick={() => saveFields(draft)} isLoading={isSaving} disabled={isDone}>
                <Save className="mr-2 h-4 w-4" />
                Save Notes
              </Button>
              <Button onClick={handleComplete} disabled={isDone || status === "completing"} isLoading={status === "completing"}>
                Complete Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
