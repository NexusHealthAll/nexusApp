import { Info, MapPin, Monitor, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
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

const DURATIONS = ["4 hours", "6 hours", "8 hours", "12 hours", "24 hours"];

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
    data.duration &&
    data.urgencyLevel;

  return (
    <div className="space-y-6">
        {/* Form card */}
        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8">
          {/* Role + Specialty */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Role Needed <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={data.roleNeeded}
                  onChange={(e) => onUpdate({ roleNeeded: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 pr-10 text-sm text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="">Select role...</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  ▾
                </span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Specialty <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={data.specialty}
                  onChange={(e) => onUpdate({ specialty: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 pr-10 text-sm text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  ▾
                </span>
              </div>
            </div>
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
                Duration <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={data.duration}
                  onChange={(e) => onUpdate({ duration: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="">Select duration...</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  ▾
                </span>
              </div>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Urgency Level
            </label>
            <div className="relative">
              <select
                value={data.urgencyLevel}
                onChange={(e) => onUpdate({ urgencyLevel: e.target.value })}
                className="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                <option value="">Select urgency level...</option>
                {URGENCY_LEVELS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                ▾
              </span>
            </div>
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
              <p className="text-4xl font-bold">14</p>
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
