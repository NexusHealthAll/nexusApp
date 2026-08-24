import { useEffect, useRef } from "react";
import { AlertTriangle, ExternalLink, FileText, Mic, MicOff, Stethoscope, User, Video, VideoOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import type { ApiShift } from "@/features/hospital/shifts/types";
import type { PatientRecord } from "../../types";
import { Header, StatusBadge } from "../DashboardChrome";

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

  useEffect(() => {
    if (isCamOn && videoTrack && videoRef.current) {
      const stream = new MediaStream([videoTrack]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [isCamOn, videoTrack]);

  return (
    <>
      <Header title={patient.name} subtitle={`${patient.age}y • ${patient.gender}`} onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
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

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onViewPatient}
            className="rounded-2xl bg-white p-4 text-sm font-bold shadow-sm dark:bg-neutral-900"
          >
            <FileText className="mx-auto mb-2 h-5 w-5 text-brand-700 dark:text-brand-300" />
            View Patient Detail
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
              <div key={item} className="rounded-xl bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-900">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <section className="rounded-3xl bg-brand-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="font-bold">AI Live Transcriber</p>
            <StatusBadge tone="amber">Preview — not connected</StatusBadge>
          </div>
          <p className="mt-4 rounded-2xl bg-brand-800 p-4 text-sm text-brand-50">
            This app doesn't have a speech-to-text service connected yet — this is a placeholder of
            what the transcript panel will look like once it is.
          </p>
        </section>

        <Button type="button" className="w-full bg-brand-700" onClick={onReview}>
          Finish Consultation
        </Button>
      </main>
    </>
  );
}
