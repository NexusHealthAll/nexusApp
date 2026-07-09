import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Header, StatusBadge } from "../DashboardChrome";
import type { PatientRecord } from "../../types";

const FIELDS: { key: keyof NonNullable<PatientRecord["reportNotes"]>; label: string }[] = [
  { key: "chiefComplaint", label: "Chief Complaint" },
  { key: "historyOfPresentIllness", label: "History of Present Illness" },
  { key: "assessment", label: "Assessment" },
  { key: "clinicalPlan", label: "Clinical Plan" },
  { key: "prescriptions", label: "Prescriptions" },
];

export function ClinicalReviewScreen({
  patient,
  onBack,
  onFinalize,
}: {
  patient: PatientRecord;
  onBack: () => void;
  onFinalize: (notes: NonNullable<PatientRecord["reportNotes"]>) => void;
}) {
  const [notes, setNotes] = useState<NonNullable<PatientRecord["reportNotes"]>>(
    patient.reportNotes ?? {
      chiefComplaint: patient.chiefComplaint,
      historyOfPresentIllness: "",
      assessment: "",
      clinicalPlan: "",
      prescriptions: "",
    },
  );

  return (
    <>
      <Header title="Clinical Review" subtitle={patient.name} onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h2 className="font-bold">{patient.name}</h2>
              <p className="text-xs text-neutral-500">
                {patient.age}y • {patient.gender}
              </p>
            </div>
            <StatusBadge tone="amber">Draft — this session only</StatusBadge>
          </CardContent>
        </Card>

        {FIELDS.map((field) => (
          <Card key={field.key}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{field.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <textarea
                rows={3}
                value={notes[field.key]}
                onChange={(e) => setNotes((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full resize-none rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            </CardContent>
          </Card>
        ))}

        <p className="text-center text-xs text-neutral-400">
          There's no clinical-notes backend yet — this saves to this shift session only, not to any
          patient record or EHR.
        </p>

        <Button
          type="button"
          className="w-full bg-brand-700"
          onClick={() => onFinalize(notes)}
        >
          Save to Session
        </Button>
      </main>
    </>
  );
}
