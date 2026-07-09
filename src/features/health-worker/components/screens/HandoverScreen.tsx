import { useState } from "react";
import { Clock, User } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import type { ApiShift } from "@/features/hospital/shifts/types";
import type { PatientRecord } from "../../types";
import type { HandoverResponse } from "../../hooks/useHealthWorkerShifts";
import { Header, Metric } from "../DashboardChrome";

export function HandoverScreen({
  shift,
  seconds,
  patients,
  handover,
  isSubmitting,
  isClockingOut,
  submitError,
  onBack,
  onSubmitHandover,
  onClockOut,
}: {
  shift: ApiShift;
  seconds: number;
  patients: PatientRecord[];
  handover: HandoverResponse | null;
  isSubmitting: boolean;
  isClockingOut: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmitHandover: (instructions: string) => void;
  onClockOut: () => void;
}) {
  const [instructions, setInstructions] = useState("");
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return (
    <>
      <Header title="Shift Completion" subtitle="Review handover summary" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <section className="rounded-2xl bg-brand-700 p-5 text-white">
          <p className="text-xs text-brand-100">Time on shift</p>
          <p className="text-4xl font-bold">
            {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-brand-100">{shift.role_title}</p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Metric label="Duration" value={`${hours}h ${minutes}m`} icon={Clock} />
          <Metric label="Patients Seen" value={String(patients.length)} icon={User} />
        </div>

        {!handover ? (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Handover Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <textarea
                rows={5}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Summarize patient status and anything the next clinician needs to know..."
                className="w-full resize-none rounded-lg bg-neutral-50 px-3 py-2 text-sm outline-none"
              />
              {submitError && <p className="text-sm text-error-600">{submitError}</p>}
              <Button
                type="button"
                className="w-full bg-brand-700"
                disabled={!instructions.trim() || isSubmitting}
                isLoading={isSubmitting}
                onClick={() => onSubmitHandover(instructions.trim())}
              >
                Submit Handover
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Handover Submitted</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0 text-sm text-neutral-600">
                <p>{handover.instructions}</p>
                <p className="text-xs text-neutral-400">
                  Editable until{" "}
                  {new Date(handover.editable_until).toLocaleTimeString("en-NG", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  . Auto-approves for payout within 48 hours if the hospital doesn't act first.
                </p>
              </CardContent>
            </Card>
            {submitError && (
              <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">
                {submitError}
              </p>
            )}
            <Button
              type="button"
              className="w-full bg-brand-700"
              isLoading={isClockingOut}
              onClick={onClockOut}
            >
              Confirm Handover & Clock-Out
            </Button>
          </>
        )}
      </main>
    </>
  );
}
