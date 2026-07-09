import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import type { ApiShift } from "@/features/hospital/shifts/types";
import type { NdprConsent } from "../../hooks/useHealthWorkerShifts";
import { Header, formatKobo } from "../DashboardChrome";

const CONSENT_ITEMS: { key: keyof NdprConsent; label: string }[] = [
  { key: "ndpr_compliance", label: "I agree to comply with NDPR (Nigeria Data Protection Regulation)." },
  { key: "no_patient_capture", label: "I will not record or photograph patients without consent." },
  { key: "hospital_systems_only", label: "I will only use hospital-provided systems for clinical records." },
  { key: "complete_handover", label: "I will complete handover documentation before clocking out." },
  { key: "understand_violation", label: "I understand a violation may result in account suspension." },
];

const emptyConsent: NdprConsent = {
  ndpr_compliance: false,
  no_patient_capture: false,
  hospital_systems_only: false,
  complete_handover: false,
  understand_violation: false,
};

export function ConfirmShiftScreen({
  shift,
  onBack,
  onConfirm,
  isSubmitting,
  submitError,
}: {
  shift: ApiShift;
  onBack: () => void;
  onConfirm: (consent: NdprConsent) => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [consent, setConsent] = useState<NdprConsent>(emptyConsent);
  const allChecked = Object.values(consent).every(Boolean);

  return (
    <>
      <Header title="Confirm Shift" subtitle="Review and accept" onBack={onBack} />
      <main className="space-y-5 px-5 py-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="font-bold">{shift.role_title}</h2>
            <p className="text-sm text-neutral-500">{shift.hospital_name ?? "Hospital"}</p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
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
                <p className="text-xs text-neutral-500">Rate</p>
                <p className="font-bold">
                  {shift.pay_type === "fixed_rate"
                    ? formatKobo(shift.fixed_rate_kobo ?? 0)
                    : `${formatKobo(shift.rate_kobo_per_hour ?? 0)}/hr`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <h3 className="text-sm font-bold uppercase text-neutral-500">
              Compliance Acknowledgement
            </h3>
            {CONSENT_ITEMS.map((item) => (
              <label key={item.key} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={consent[item.key]}
                  onChange={(e) =>
                    setConsent((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {submitError && (
          <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">{submitError}</p>
        )}

        <Button
          type="button"
          className="w-full bg-brand-700"
          disabled={!allChecked || isSubmitting}
          isLoading={isSubmitting}
          onClick={() => onConfirm(consent)}
        >
          Confirm & Accept Shift
        </Button>
      </main>
    </>
  );
}
