import { Activity, AlertTriangle, Bot, Mic, Pill, User } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Header, Metric } from "../DashboardChrome";
import type { PatientRecord } from "../../types";

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

export function PatientDetailScreen({
  patient,
  onBack,
  onStartConsultation,
}: {
  patient: PatientRecord;
  onBack: () => void;
  onStartConsultation: () => void;
}) {
  const prediction = patient.prediction;
  const isRunning = prediction?.status === "pending" || prediction?.status === "processing";

  return (
    <>
      <Header title="Patient Detail" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950">
            <User className="h-7 w-7 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-50">{patient.name}</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {patient.age}y • {patient.gender} • Intake: {new Date(patient.intakeAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {prediction?.risk_level && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskBadge(prediction.risk_level)}`}>
              {prediction.risk_level} Risk
            </span>
          )}
        </section>

        {/* AI Triage Card */}
        <Card className="border-brand-200 bg-brand-50/30 dark:border-brand-900 dark:bg-brand-950/20">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-brand-900 dark:text-brand-300">
              <Bot className="h-5 w-5 text-brand-600" />
              AI Clinical Triage
            </CardTitle>
            {isRunning && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 animate-pulse">
                <Activity className="h-3.5 w-3.5" />
                Analyzing...
              </span>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            {isRunning ? (
              <div className="flex items-center gap-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                Processing 4 ML models (Diagnosis, Risk, Drug Recommendation, Department Routing)...
              </div>
            ) : prediction?.status === "completed" ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-500">Diagnosis Condition:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{prediction.diagnosis_condition || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-500">Recommended Medication:</span>
                  <span className="flex items-center gap-1 font-medium text-brand-700 dark:text-brand-300">
                    <Pill className="h-3.5 w-3.5" />
                    {prediction.drug_recommendation || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-500">Route / Department:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{prediction.department || "General Practice"}</span>
                </div>
              </div>
            ) : prediction?.status === "failed" ? (
              <div className="flex items-center gap-2 text-xs text-error-600">
                <AlertTriangle className="h-4 w-4" />
                AI Triage process error: {prediction.last_error || "Unknown issue"}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                AI Triage prediction pending intake completion.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-neutral-600 dark:text-neutral-400">
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

        <Button type="button" className="w-full bg-brand-700" onClick={onStartConsultation}>
          <Mic className="mr-2 h-4 w-4" />
          Start Consultation
        </Button>
      </main>
    </>
  );
}

