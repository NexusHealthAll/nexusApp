import { AlertTriangle, ExternalLink, FileText, Mic, MicOff, Stethoscope, User, Video } from "lucide-react";
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
}) {
  return (
    <>
      <Header title={patient.name} subtitle={`${patient.age}y • ${patient.gender}`} onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white">
          <div className="flex h-80 items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-950">
            <User className="h-20 w-20 text-neutral-300" />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button
              type="button"
              onClick={onToggleMic}
              className={cn("rounded-full p-3", isMicOn ? "bg-error-600" : "bg-white/20 backdrop-blur")}
            >
              {isMicOn ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={onToggleCam}
              className={cn("rounded-full p-3", isCamOn ? "bg-error-600" : "bg-white/20 backdrop-blur")}
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        </section>

        {shift.shift_type === "virtual" && shift.virtual_link && (
          <a
            href={shift.virtual_link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl bg-white p-4 text-sm font-bold shadow-sm"
          >
            <span>Open shift meeting link</span>
            <ExternalLink className="h-4 w-4 text-brand-700" />
          </a>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onViewPatient}
            className="rounded-2xl bg-white p-4 text-sm font-bold shadow-sm"
          >
            <FileText className="mx-auto mb-2 h-5 w-5 text-brand-700" />
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
              className="cursor-not-allowed rounded-2xl bg-white p-4 text-sm font-bold text-neutral-400 shadow-sm"
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
              <div key={item} className="rounded-xl bg-neutral-50 px-3 py-2 text-sm">
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
