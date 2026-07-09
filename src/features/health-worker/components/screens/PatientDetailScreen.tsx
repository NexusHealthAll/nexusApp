import { Mic, User } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Header, Metric } from "../DashboardChrome";
import type { PatientRecord } from "../../types";

export function PatientDetailScreen({
  patient,
  onBack,
  onStartConsultation,
}: {
  patient: PatientRecord;
  onBack: () => void;
  onStartConsultation: () => void;
}) {
  return (
    <>
      <Header title="Patient Detail" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200">
            <User className="h-7 w-7 text-neutral-500" />
          </div>
          <div>
            <h2 className="font-bold">{patient.name}</h2>
            <p className="text-xs text-neutral-500">
              {patient.age}y • {patient.gender}
            </p>
          </div>
        </section>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-neutral-600">
            {patient.chiefComplaint}
          </CardContent>
        </Card>

        <section>
          <p className="mb-3 text-sm font-bold">Vital Signs</p>
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="Blood Pressure"
              value={`${patient.vitals.bloodPressureSystolic}/${patient.vitals.bloodPressureDiastolic}`}
              icon={User}
            />
            <Metric label="Heart Rate" value={`${patient.vitals.heartRateBpm} BPM`} icon={User} />
            <Metric label="Temperature" value={`${patient.vitals.temperatureC}°C`} icon={User} />
          </div>
        </section>

        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
          No clinical history or medication records are available — this app doesn't have a patient
          records system connected yet. This detail reflects only what was entered at intake.
        </p>

        <Button type="button" className="w-full bg-brand-700" onClick={onStartConsultation}>
          <Mic className="mr-2 h-4 w-4" />
          Start Consultation
        </Button>
      </main>
    </>
  );
}
