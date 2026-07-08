import { useEffect, useState } from "react";
import { Info, MapPin, Monitor, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { cn } from "@/shared/utils/cn";
import { roleToCategory, useHospitalShift } from "../hooks/useHospitalShift";
import type { ShiftFormData } from "../types";

const ROLES = [
  "Doctor",
  "Nurse",
  "Lab Technician",
  "Pharmacist",
  "Radiographer",
];

const SPECIALTIES = [
  "Emergency Medicine",
  "Cardiology",
  "General Practice",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Obstetrics & Gynecology",
  "Radiology",
];

const URGENCY_LEVELS = [
  { value: "stat", label: "STAT (within 1 hour) - +20% bonus" },
  { value: "urgent", label: "URGENT (within 4 hours) - +10% bonus" },
  { value: "standard", label: "Standard" },
  { value: "elective", label: "Elective" },
];

interface Props {
  data: ShiftFormData;
  onUpdate: (patch: Partial<ShiftFormData>) => void;
  onNext: () => void;
}

export function Step1BasicInfo({ data, onUpdate, onNext }: Props) {
  const isStatUrgency = data.urgencyLevel === "stat";

  const canProceed =
    data.roleNeeded &&
    data.specialty &&
    data.startDate &&
    data.startTime &&
    data.duration > 0 &&
    data.urgencyLevel;

  const handleDurationChange = (raw: string) => {
    if (raw === "") {
      onUpdate({ duration: 0 });
      return;
    }
    const val = Number(raw);
    if (Number.isNaN(val) || val <= 0) return;
    onUpdate({ duration: val });
  };

  const { getMatchedProfessionalsCount } = useHospitalShift();
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [matchedLoading, setMatchedLoading] = useState(false);
  const [matchedError, setMatchedError] = useState(false);

  useEffect(() => {
    if (!data.roleNeeded) {
      setMatchedCount(null);
      setMatchedError(false);
      return;
    }
    let cancelled = false;
    setMatchedLoading(true);
    setMatchedError(false);
    getMatchedProfessionalsCount({
      role_category: roleToCategory[data.roleNeeded] ?? data.roleNeeded,
      specialty: data.specialty || undefined,
    })
      .then((count) => {
        if (!cancelled) setMatchedCount(count);
      })
      .catch(() => {
        if (!cancelled) {
          setMatchedError(true);
          setMatchedCount(null);
        }
      })
      .finally(() => {
        if (!cancelled) setMatchedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data.roleNeeded, data.specialty, getMatchedProfessionalsCount]);

  return (
    <div className="space-y-6">
        {/* Form card */}
        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8">
          {/* Role + Specialty */}
          <div className="grid grid-cols-2 gap-6">
            <Select
              label="Role Needed"
              required
              value={data.roleNeeded}
              onChange={(value) => onUpdate({ roleNeeded: value })}
              placeholder="Select role..."
              options={ROLES.map((role) => ({ value: role, label: role }))}
            />
            <Select
              label="Specialty"
              required
              value={data.specialty}
              onChange={(value) => onUpdate({ specialty: value })}
              placeholder="Select specialty..."
              options={SPECIALTIES.map((specialty) => ({
                value: specialty,
                label: specialty,
              }))}
            />
          </div>

          {/* Shift Type */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Shift Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(["in-person", "virtual"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onUpdate({ shiftType: type })}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-sm font-medium transition-all",
                    data.shiftType === type
                      ? "border-secondary-600 bg-secondary-50 text-secondary-800"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2",
                      data.shiftType === type
                        ? "border-secondary-600"
                        : "border-neutral-300",
                    )}
                  >
                    {data.shiftType === type && (
                      <div className="h-2 w-2 rounded-full bg-secondary-600" />
                    )}
                  </div>
                  {type === "in-person" ? (
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Monitor className="h-4 w-4 flex-shrink-0" />
                  )}
                  {type === "in-person" ? "In-person" : "Virtual"}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date & Time + Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Start Date & Time <span className="text-error-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={data.startDate}
                  onChange={(e) => onUpdate({ startDate: e.target.value })}
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                <input
                  type="time"
                  value={data.startTime}
                  onChange={(e) => onUpdate({ startTime: e.target.value })}
                  className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Duration (hours) <span className="text-error-500">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-secondary-500">
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={data.duration || ""}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full bg-transparent text-sm text-neutral-900 focus:outline-none"
                />
                <span className="text-sm text-neutral-500">hrs</span>
              </div>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <Select
              label="Urgency Level"
              value={data.urgencyLevel}
              onChange={(value) => onUpdate({ urgencyLevel: value })}
              placeholder="Select urgency level..."
              options={URGENCY_LEVELS}
            />
            {isStatUrgency && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border-l-4 border-secondary-500 bg-secondary-50 px-4 py-3">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-600" />
                <p className="text-sm text-secondary-800">
                  STAT shifts attract a premium rate to ensure immediate
                  coverage of high-priority clinical needs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: info cards + NEXT button */}
        <div className="mt-6 flex items-stretch gap-4">
          <div className="flex flex-1 gap-4">
            {/* Compliance Reminder */}
            <div className="flex-1 rounded-xl border border-secondary-200 bg-secondary-50 px-5 py-4">
              <div className="mb-1 flex items-center gap-2">
                <Info className="h-4 w-4 text-secondary-600" />
                <p className="text-sm font-semibold text-secondary-800">
                  Compliance Reminder
                </p>
              </div>
              <p className="text-xs leading-relaxed text-secondary-700">
                All emergency medicine shifts require a verified trauma
                certification on file for the assigned doctor. LUTH staffing
                automatically filters for eligible personnel.
              </p>
            </div>

            {/* Matched professionals */}
            <div className="flex min-w-[140px] flex-shrink-0 flex-col items-center justify-center rounded-xl bg-secondary-700 px-6 py-4 text-white">
              <div className="mb-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
                  Available Now
                </p>
              </div>
              <p className="text-4xl font-bold">
                {matchedLoading ? "…" : matchedError ? "—" : (matchedCount ?? "—")}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest opacity-70">
                Matched Professionals
              </p>
            </div>
          </div>

          {/* Next button */}
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="self-end rounded-xl bg-secondary-700 px-8 font-semibold uppercase tracking-wide text-white hover:bg-secondary-800 disabled:opacity-50"
          >
            NEXT →
          </Button>
        </div>
    </div>
  );
}
