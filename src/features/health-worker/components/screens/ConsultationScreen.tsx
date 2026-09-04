import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  ExternalLink,
  FileText,
  Languages,
  Mic,
  MicOff,
  Pill,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Square,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import type { ApiShift } from "@/features/hospital/shifts/types";
import type { PatientRecord } from "../../types";
import { Header, StatusBadge } from "../DashboardChrome";

interface TranscriptSegment {
  id: string;
  timestamp: string;
  speaker: "Health Worker" | "Patient";
  text: string;
  isFinal: boolean;
}

function getRiskBadge(risk: string | null | undefined) {
  switch (risk) {
    case "High":
      return "bg-error-100 text-error-800 dark:bg-error-950 dark:text-error-300";
    case "Medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "Low":
      return "bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-300";
    default:
      return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
  }
}

export function ConsultationScreen({
  shift,
  patient,
  onBack,
  onViewPatient,
  onReview,
  onToggleMic,
  onToggleCam,
  isMicOn,
  isCamOn,
  videoTrack,
}: {
  shift: ApiShift;
  patient: PatientRecord;
  onBack: () => void;
  onViewPatient: () => void;
  onReview: () => void;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  isMicOn?: boolean;
  isCamOn?: boolean;
  videoTrack?: MediaStreamTrack | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prediction = patient.prediction;
  const isMlRunning = prediction?.status === "pending" || prediction?.status === "processing";

  // ─── Web Speech Recognition State ───────────────────────────────────────────
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([
    {
      id: "init-1",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      speaker: "Health Worker",
      text: `Consultation started for ${patient.name}. Reviewing intake vitals and symptoms...`,
      isFinal: true,
    },
  ]);
  const [currentInterimText, setCurrentInterimText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isCamOn && videoTrack && videoRef.current) {
      const stream = new MediaStream([videoTrack]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [isCamOn, videoTrack]);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const newSegment: TranscriptSegment = {
              id: `${Date.now()}-${Math.random()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              speaker: "Health Worker",
              text: transcript.trim(),
              isFinal: true,
            };
            setTranscripts((prev) => [...prev, newSegment]);
            setCurrentInterimText("");
          } else {
            interim += transcript;
          }
        }
        if (interim) {
          setCurrentInterimText(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsTranscribing(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user still wants active transcription
        if (recognitionRef.current?.shouldContinue) {
          try {
            recognition.start();
          } catch {
            setIsTranscribing(false);
          }
        } else {
          setIsTranscribing(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Failed to initialize Speech Recognition:", err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.shouldContinue = false;
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleTranscription = () => {
    if (!recognitionRef.current) {
      // Fallback demo simulation if Web Speech API isn't available in browser
      if (!isTranscribing) {
        setIsTranscribing(true);
        const demoSegment: TranscriptSegment = {
          id: `${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          speaker: "Patient",
          text: `Patient reports mild symptoms. Vitals captured at intake: BP ${patient.vitals.bloodPressureSystolic}/${patient.vitals.bloodPressureDiastolic}, HR ${patient.vitals.heartRateBpm} BPM.`,
          isFinal: true,
        };
        setTranscripts((prev) => [...prev, demoSegment]);
      } else {
        setIsTranscribing(false);
      }
      return;
    }

    if (isTranscribing) {
      recognitionRef.current.shouldContinue = false;
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsTranscribing(false);
    } else {
      recognitionRef.current.shouldContinue = true;
      try {
        recognitionRef.current.start();
        setIsTranscribing(true);
      } catch (err) {
        console.error("Could not start speech recognition:", err);
      }
    }
  };

  const handleClearTranscript = () => {
    setTranscripts([]);
    setCurrentInterimText("");
  };

  return (
    <>
      <Header title={patient.name} subtitle={`${patient.age}y • ${patient.gender}`} onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        {/* Video Session Container */}
        <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-inner">
          <div className="relative flex h-80 items-center justify-center bg-neutral-950">
            {isCamOn && videoTrack ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
                <div className="rounded-full bg-neutral-800 p-6">
                  <User className="h-16 w-16 text-neutral-400" />
                </div>
                <p className="text-xs font-medium text-neutral-400">Camera is turned off</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button
              type="button"
              onClick={onToggleMic}
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              className={cn("rounded-full p-3 transition-colors", isMicOn ? "bg-neutral-800 hover:bg-neutral-700 text-white" : "bg-error-600 hover:bg-error-700 text-white")}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={onToggleCam}
              title={isCamOn ? "Turn Off Camera" : "Turn On Camera"}
              className={cn("rounded-full p-3 transition-colors", isCamOn ? "bg-brand-600 hover:bg-brand-700 text-white" : "bg-neutral-800 hover:bg-neutral-700 text-white")}
            >
              {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          </div>
        </section>

        {shift.shift_type === "virtual" && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 shadow-sm dark:border-brand-900 dark:bg-brand-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-600 p-2.5 text-white shadow">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Virtual Consultation Session</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">In-app live video room ready</p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => {
                  if (!isCamOn) {
                    onToggleCam?.();
                  }
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2"
              >
                {isCamOn ? "Live Video Active" : "Start In-App Video"}
              </Button>
            </div>
            {shift.virtual_link && !shift.virtual_link.includes("nexuscare.com") && (
              <div className="mt-3 border-t border-brand-200/60 pt-3 dark:border-brand-900/60">
                <a
                  href={shift.virtual_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
                >
                  <span>Open external provider link ({shift.virtual_link})</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Quick Action Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onViewPatient}
            className="rounded-2xl bg-white p-4 text-sm font-bold shadow-sm dark:bg-neutral-900 hover:border-brand-500 transition border border-transparent"
          >
            <FileText className="mx-auto mb-2 h-5 w-5 text-brand-700 dark:text-brand-300" />
            View Full Patient Record
          </button>
          {[
            { label: "Prescribe Meds", icon: Stethoscope },
            { label: "Mark STAT Follow-up", icon: AlertTriangle },
          ].map((action) => (
            <button
              type="button"
              key={action.label}
              disabled
              title="Not connected to a backend yet"
              className="cursor-not-allowed rounded-2xl bg-white p-4 text-sm font-bold text-neutral-400 shadow-sm dark:bg-neutral-900 dark:text-neutral-500"
            >
              <action.icon className="mx-auto mb-2 h-5 w-5" />
              {action.label}
            </button>
          ))}
        </div>

        {/* ─── 1. AI Clinical Decision Support (ML Service Integration) ─────────────── */}
        <Card className="border-brand-300 bg-gradient-to-br from-brand-50/50 via-white to-brand-50/20 shadow-md dark:border-brand-800 dark:from-brand-950/40 dark:to-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base text-brand-900 dark:text-brand-200 font-bold">
              <div className="rounded-lg bg-brand-600 p-1.5 text-white">
                <Bot className="h-4 w-4" />
              </div>
              AI Clinical Decision Support
            </CardTitle>
            {isMlRunning ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 animate-pulse bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200">
                <Activity className="h-3.5 w-3.5" />
                ML Pipeline Running...
              </span>
            ) : prediction?.risk_level ? (
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getRiskBadge(prediction.risk_level)}`}>
                {prediction.risk_level} Risk
              </span>
            ) : (
              <StatusBadge tone="blue">4 ML Models Active</StatusBadge>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            {isMlRunning ? (
              <div className="flex items-center gap-3 py-3 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                Executing 4 clinical models (Diagnosis, Risk, Drug Recommendation, Triage Routing)...
              </div>
            ) : prediction?.status === "completed" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-3 border border-brand-100 dark:border-neutral-800 shadow-xs">
                  <span className="font-semibold text-neutral-500 block mb-1">Predicted Diagnosis</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {prediction.diagnosis_condition || "Pending Assessment"}
                  </span>
                </div>
                <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-3 border border-brand-100 dark:border-neutral-800 shadow-xs">
                  <span className="font-semibold text-neutral-500 block mb-1">Drug Recommendation</span>
                  <span className="flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300 text-sm">
                    <Pill className="h-4 w-4" />
                    {prediction.drug_recommendation || "Pending Recommendation"}
                  </span>
                </div>
                <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-3 border border-brand-100 dark:border-neutral-800 shadow-xs">
                  <span className="font-semibold text-neutral-500 block mb-1">Triage Department</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    {prediction.department || "General Practice"}
                  </span>
                </div>
              </div>
            ) : prediction?.status === "failed" ? (
              <div className="flex items-center gap-2 text-xs text-error-600 bg-error-50 p-3 rounded-xl border border-error-200">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>ML Pipeline Notice: {prediction.last_error || "Model execution returned fallback response."}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-3 border border-brand-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-500 block mb-1">Diagnosis Model</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">Acute Triage Pending</span>
                </div>
                <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-3 border border-brand-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-500 block mb-1">Mortality Risk Model</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">Standard Priority</span>
                </div>
                <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-3 border border-brand-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-500 block mb-1">Drug Recommender</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">Decision Tree Ready</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Vitals Display */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Patient Vitals (from intake)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {[
              `Heart Rate ${patient.vitals.heartRateBpm} BPM`,
              `Temp ${patient.vitals.temperatureC}°C`,
              `Blood Pressure ${patient.vitals.bloodPressureSystolic}/${patient.vitals.bloodPressureDiastolic}`,
            ].map((item) => (
              <div key={item} className="rounded-xl bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-900 font-medium text-neutral-800 dark:text-neutral-200">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ─── 2. AI Live Transcriber & Voice Note Component ─────────────────────────── */}
        <section className="rounded-3xl bg-neutral-900 p-5 text-white border border-neutral-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-brand-600 p-2 text-white shadow-sm">
                <Sparkles className="h-5 w-5 animate-pulse text-brand-200" />
              </div>
              <div>
                <p className="font-bold text-base text-white">AI Live Transcriber & Speech Notes</p>
                <p className="text-xs text-neutral-400">
                  {speechSupported ? "Browser Speech Engine Connected" : "Interactive Speech Note Simulator"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isTranscribing && (
                <span className="flex items-center gap-1.5 rounded-full bg-error-950 px-3 py-1 text-xs font-bold text-error-400 border border-error-800 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-error-500" />
                  REC ACTIVE
                </span>
              )}
              <Button
                type="button"
                size="sm"
                onClick={toggleTranscription}
                className={cn(
                  "font-bold text-xs px-4 py-2 transition-all shadow-md",
                  isTranscribing
                    ? "bg-error-600 hover:bg-error-700 text-white"
                    : "bg-brand-600 hover:bg-brand-500 text-white"
                )}
              >
                {isTranscribing ? (
                  <>
                    <Square className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Stop Transcribing
                  </>
                ) : (
                  <>
                    <Mic className="mr-1.5 h-3.5 w-3.5" />
                    Start Live Transcriber
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Transcript Display Box */}
          <div className="min-h-[160px] max-h-[260px] overflow-y-auto rounded-2xl bg-neutral-950/80 p-4 border border-neutral-800/80 space-y-3 font-sans">
            {transcripts.map((segment) => (
              <div key={segment.id} className="text-xs space-y-1 bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 font-semibold text-[11px]">
                  <span className="text-brand-400 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {segment.speaker}
                  </span>
                  <span>{segment.timestamp}</span>
                </div>
                <p className="text-neutral-200 text-sm leading-relaxed">{segment.text}</p>
              </div>
            ))}

            {currentInterimText && (
              <div className="text-xs space-y-1 bg-brand-950/40 p-3 rounded-xl border border-brand-800/50 animate-pulse">
                <div className="text-brand-400 font-semibold text-[11px]">Transcribing Live...</div>
                <p className="text-brand-100 text-sm italic">{currentInterimText}</p>
              </div>
            )}

            {transcripts.length === 0 && !currentInterimText && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-500 text-xs">
                <Mic className="h-8 w-8 mb-2 text-neutral-600" />
                Click "Start Live Transcriber" to record live audio notes during consultation.
              </div>
            )}
          </div>

          {/* Footer Tools */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-400">
              <Languages className="h-3.5 w-3.5 text-brand-400" />
              <span>Language: English (US)</span>
            </div>
            {transcripts.length > 0 && (
              <button
                type="button"
                onClick={handleClearTranscript}
                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 text-xs transition"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Notes
              </button>
            )}
          </div>
        </section>

        <Button type="button" className="w-full bg-brand-700 text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-brand-800" onClick={onReview}>
          Finish Consultation
        </Button>
      </main>
    </>
  );
}

