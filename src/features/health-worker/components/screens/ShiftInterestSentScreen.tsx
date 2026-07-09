import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { formatKobo } from "../DashboardChrome";

export function ShiftInterestSentScreen({
  shift,
  onGoToApplications,
  onDashboard,
}: {
  shift: ApiShift;
  onGoToApplications: () => void;
  onDashboard: () => void;
}) {
  const rate =
    shift.pay_type === "fixed_rate"
      ? `${formatKobo(shift.fixed_rate_kobo ?? 0)} fixed`
      : `${formatKobo(shift.rate_kobo_per_hour ?? 0)} / hr`;

  return (
    <main className="flex min-h-screen flex-col px-5 py-8">
      <div className="mt-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-700">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Interest Confirmed!</h1>
        <p className="mt-2 text-sm text-neutral-500">
          We've sent your profile to{" "}
          <span className="font-semibold text-brand-700">
            {shift.hospital_name ?? "the hospital"}
          </span>{" "}
          for review.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="text-xs text-neutral-500">Facility</p>
            <p className="font-bold text-brand-700">{shift.hospital_name ?? "Hospital"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Date</p>
              <p className="font-bold">
                {new Date(shift.scheduled_start).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Time</p>
              <p className="font-bold">
                {new Date(shift.scheduled_start).toLocaleTimeString("en-NG", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Rate</p>
              <p className="font-bold">{rate}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Role</p>
              <p className="font-bold">{shift.role_title}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
        Hospitals typically review applications within a few hours. We'll notify you as soon as
        they respond.
      </div>

      <div className="mt-auto space-y-3 pb-8 pt-8">
        <Button type="button" className="w-full bg-brand-700" onClick={onGoToApplications}>
          Go to My Applications
        </Button>
        <button
          type="button"
          onClick={onDashboard}
          className="w-full text-center text-sm font-semibold text-neutral-500 hover:text-neutral-700"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
