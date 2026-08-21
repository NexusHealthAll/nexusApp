import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Plus, RefreshCcw, Users } from "lucide-react";
import { formatDate } from "@/shared/utils/date";
import { usePatients } from "../hooks/usePatients";
import { AddPatientModal } from "./AddPatientModal";
import type { PatientDetailResponse, PredictionResponse } from "../services/patientService";

function riskBadgeVariant(level: PredictionResponse["risk_level"]): BadgeVariant {
  if (level === "High") return "error";
  if (level === "Medium") return "warning";
  if (level === "Low") return "success";
  return "neutral";
}

function PredictionCell({ prediction }: { prediction: PatientDetailResponse["prediction"] }) {
  if (!prediction || prediction.status === "pending" || prediction.status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
        Running AI triage…
      </span>
    );
  }

  if (prediction.status === "failed") {
    return (
      <span className="text-xs font-medium text-error-600 dark:text-error-400" title={prediction.last_error ?? undefined}>
        Triage failed
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {prediction.risk_level && (
        <Badge variant={riskBadgeVariant(prediction.risk_level)}>{prediction.risk_level} risk</Badge>
      )}
      {prediction.diagnosis_condition && <Badge variant="info">{prediction.diagnosis_condition}</Badge>}
    </div>
  );
}

export function PatientList() {
  const { patients, isLoading, isIngesting, error, ingestPatient, refresh } = usePatients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Patients</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Intake and AI-assisted triage — diagnosis, risk, drug recommendation, and routing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 dark:bg-error-950 dark:text-error-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Patients ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">Loading patients…</div>
          ) : patients.length === 0 ? (
            <EmptyState
              icon={<EmptyStateIcon icon={Users} />}
              title="No patients yet"
              description="Submit your first patient to run AI-assisted triage."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Symptoms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      AI Triage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Recommendation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Intake
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                              {patient.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                              {patient.full_name}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {patient.age}y · {patient.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-xs px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                        {patient.symptoms || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-50">
                        {patient.severity_level}
                      </td>
                      <td className="px-6 py-4">
                        <PredictionCell prediction={patient.prediction} />
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                        {patient.prediction?.status === "completed"
                          ? [patient.prediction.drug_recommendation, patient.prediction.department]
                              .filter(Boolean)
                              .join(" · ") || "—"
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-50">
                        {formatDate(patient.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={ingestPatient}
        isSubmitting={isIngesting}
      />
    </div>
  );
}
