import { useEffect, useState } from "react";
import { Calendar, Check, Clock, Navigation, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { Header, InfoTile, StatusBadge, formatKobo } from "../DashboardChrome";

function shiftRateLabel(shift: ApiShift): string {
  if (shift.pay_type === "fixed_rate") {
    return `${formatKobo(shift.fixed_rate_kobo ?? 0)} fixed`;
  }
  return formatKobo((shift.rate_kobo_per_hour ?? 0) * shift.duration_hours);
}

export function ShiftDetailScreen({
  shiftId,
  onBack,
  onInterested,
  onLoaded,
  isSubmitting,
}: {
  shiftId: string;
  onBack: () => void;
  onInterested: () => void;
  onLoaded?: (shift: ApiShift) => void;
  isSubmitting: boolean;
}) {
  const { getShiftDetails } = useHospitalShift();
  const [shift, setShift] = useState<ApiShift | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setShift(null);
    setLoadError(null);
    getShiftDetails(shiftId)
      .then((data) => {
        if (!cancelled) {
          setShift(data);
          onLoaded?.(data);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("This shift couldn't be loaded — it may no longer be available.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftId]);

  if (loadError) {
    return (
      <>
        <Header title="Shift Details" onBack={onBack} />
        <main className="px-5 py-8 text-center text-sm text-neutral-500">{loadError}</main>
      </>
    );
  }

  if (!shift) {
    return (
      <>
        <Header title="Shift Details" onBack={onBack} />
        <main className="px-5 py-8 text-center text-sm text-neutral-500">Loading...</main>
      </>
    );
  }

  return (
    <>
      <Header title="Shift Details" onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="h-28 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100" />
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{shift.hospital_name ?? "Hospital"}</h2>
              <p className="text-xs text-neutral-500">{shift.department ?? shift.specialty ?? ""}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge>{shift.role_title}</StatusBadge>
                {shift.priority === "stat" && <StatusBadge tone="red">STAT Need</StatusBadge>}
                {shift.priority === "urgent" && <StatusBadge tone="amber">Urgent</StatusBadge>}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-brand-700 p-4 text-white">
          <p className="text-xs text-brand-100">Estimated Pay</p>
          <p className="text-3xl font-bold">{shiftRateLabel(shift)}</p>
          <p className="text-xs text-brand-100">
            {shift.shift_type === "virtual" ? "Virtual shift" : "In-person"}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InfoTile
            icon={Calendar}
            label="Date"
            value={new Date(shift.scheduled_start).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
          <InfoTile
            icon={Clock}
            label="Duration"
            value={`${shift.duration_hours}h`}
          />
        </section>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Shift Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 text-sm text-neutral-600">
            <p>{shift.job_description || "No description provided for this shift."}</p>
            {shift.notes && (
              <div className="rounded-xl bg-neutral-50 px-3 py-2 font-medium text-neutral-700">
                <Check className="mr-2 inline h-4 w-4 text-success-600" />
                {shift.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {shift.shift_type === "in_person" && (
          <section className="rounded-2xl bg-neutral-900 p-4 text-white">
            <div className="flex h-36 items-center justify-center rounded-xl bg-neutral-800">
              <Navigation className="h-10 w-10 text-brand-300" />
            </div>
            <p className="mt-3 text-sm font-bold">On-site — exact address shown after assignment</p>
          </section>
        )}

        <div className="grid grid-cols-[1fr_2fr] gap-3 pb-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            onClick={onInterested}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="bg-brand-700"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            I'm Interested
          </Button>
        </div>
      </main>
    </>
  );
}
