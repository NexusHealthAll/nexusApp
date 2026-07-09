import { ChevronRight, UserRound, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { cn } from "@/shared/utils/cn";
import type { ApiShift } from "@/features/hospital/shifts/types";
import type { PatientRecord } from "../../types";
import { Header, StatusBadge } from "../DashboardChrome";

export function ActiveShiftScreen({
  shift,
  seconds,
  patients,
  onPatientSelect,
  onNewPatient,
  onClockOut,
}: {
  shift: ApiShift;
  seconds: number;
  patients: PatientRecord[];
  onPatientSelect: (patient: PatientRecord) => void;
  onNewPatient: () => void;
  onClockOut: () => void;
}) {
  const time = new Date(seconds * 1000).toISOString().substring(11, 19);

  return (
    <>
      <Header title="Current Shift Status" subtitle={shift.role_title} />
      <main className="space-y-5 px-5 py-4">
        <section className="rounded-2xl bg-brand-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-brand-100">Time on shift</p>
              <p className="text-4xl font-bold">{time}</p>
            </div>
            <StatusBadge tone="green">On shift</StatusBadge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-brand-50">
            <p>{shift.hospital_name ?? "Hospital"}</p>
            <p>Duration: {shift.duration_hours}h</p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Patients Seen</h2>
            <StatusBadge>{patients.length} this shift</StatusBadge>
          </div>
          <p className="mb-3 text-xs text-neutral-400">
            Recorded in this session only — not saved to a patient record system.
          </p>
          <div className="space-y-3">
            {patients.length === 0 ? (
              <EmptyState
                className="bg-white"
                icon={<UserRound className="h-10 w-10 text-brand-300" />}
                title="No patients recorded yet"
              />
            ) : (
              patients.map((patient) => (
                <button
                  type="button"
                  key={patient.id}
                  onClick={() => onPatientSelect(patient)}
                  className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm"
                >
                  <div>
                    <p className="font-bold">{patient.name}</p>
                    <p className="text-xs text-neutral-500">
                      {patient.age}y • {patient.gender}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-[10px] font-bold uppercase",
                        patient.status === "waiting" ? "text-warning-600" : "text-success-600",
                      )}
                    >
                      {patient.status.replace("-", " ")}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
              ))
            )}
            <Button type="button" variant="outline" className="w-full" onClick={onNewPatient}>
              <UserPlus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </div>
        </section>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Shift Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 text-sm text-neutral-500">
            <p>
              This session doesn't persist a task checklist — add notes to each patient's report
              instead.
            </p>
          </CardContent>
        </Card>

        <Button
          type="button"
          onClick={onClockOut}
          className="w-full bg-error-600 hover:bg-error-700"
        >
          Clock Out
        </Button>
      </main>
    </>
  );
}
