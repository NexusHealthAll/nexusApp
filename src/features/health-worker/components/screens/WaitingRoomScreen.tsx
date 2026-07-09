import { User, UsersRound, Video } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Header } from "../DashboardChrome";
import type { PatientRecord } from "../../types";

export function WaitingRoomScreen({
  patients,
  onBack,
  onStartConsultation,
  onNewPatient,
}: {
  patients: PatientRecord[];
  onBack: () => void;
  onStartConsultation: (patient: PatientRecord) => void;
  onNewPatient: () => void;
}) {
  const waiting = patients.filter((p) => p.status === "waiting");

  return (
    <>
      <Header title="Waiting Room" subtitle="This shift's queue" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <p className="text-sm text-neutral-600">
          Patients recorded via intake for this shift, in the order they were added.
        </p>

        {waiting.length === 0 ? (
          <EmptyState
            className="bg-white"
            icon={<UsersRound className="h-10 w-10 text-brand-300" />}
            title="No one waiting"
            description="Record a patient intake to add them to the queue."
            action={
              <Button type="button" onClick={onNewPatient} className="bg-brand-700">
                New Patient
              </Button>
            }
          />
        ) : (
          waiting.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold">{patient.name}</h2>
                    <p className="text-xs text-neutral-500">
                      {patient.age}y • {patient.gender}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600">{patient.chiefComplaint}</p>
                <Button
                  type="button"
                  className="w-full bg-brand-700"
                  onClick={() => onStartConsultation(patient)}
                >
                  Start Consultation
                  <Video className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </>
  );
}
