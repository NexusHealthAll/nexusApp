import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronUp,
  MapPin,
  Radio,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { formatNaira } from "@/shared/utils/currency";
import { useHospitalShift } from "../hooks/useHospitalShift";
import { useShiftDraftStore } from "../hooks/useShiftDraftStore";
import type { ShiftFormData } from "../types";

interface Props {
  data: ShiftFormData;
  onBack: () => void;
  onBroadcast: () => void;
}

function scheduleDisplay(
  startDate: string,
  startTime: string,
  duration: string,
): string {
  if (!startDate || !startTime || !duration) return "TBD";
  const hours = parseInt(duration) || 0;
  const [h] = startTime.split(":").map(Number);
  const endHour = (h + hours) % 24;
  const fmt = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}${period}`;
  };
  const today = new Date().toISOString().split("T")[0];
  const label =
    startDate === today
      ? "Today"
      : new Date(startDate + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
  return `${label} ${fmt(h)}-${fmt(endHour)}`;
}

function rateDisplay(data: ShiftFormData): string {
  if (data.payType === "hourly")
    return `₦${data.hourlyRate.toLocaleString()}/hr`;
  return formatNaira(data.fixedRate) + " fixed";
}

function urgencyLabel(level: string): string {
  const map: Record<string, string> = {
    stat: "STAT",
    urgent: "URGENT",
    standard: "Standard",
    elective: "Elective",
  };
  return map[level] ?? level;
}

function AccordionSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
      >
        <span className="text-sm font-bold text-neutral-900">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-neutral-100 px-6 pb-6 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-neutral-800 text-right">
        {value || "—"}
      </span>
    </div>
  );
}

export function ShiftPreview({ data, onBack, onBroadcast }: Props) {
  const [broadcasting, setBroadcasting] = useState(false);
  const { createShift } = useHospitalShift();
  const { clearDraft } = useShiftDraftStore();

  const isStatUrgency = data.urgencyLevel === "stat";

  const baseEarnings =
    data.payType === "hourly"
      ? data.hourlyRate * data.expectedHours
      : data.fixedRate;
  const bonusTotal = data.bonuses.reduce((sum, b) => sum + b.amount, 0);
  const grandTotal = baseEarnings + bonusTotal;

  const handleBroadcast = async () => {
    setBroadcasting(true);
    try {
      await createShift(data);
      clearDraft();
      setBroadcasting(false);
      onBroadcast();
    } catch (error) {
      setBroadcasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Step 5 of 5
            </p>
            <h1 className="text-2xl font-bold text-neutral-900">Preview</h1>
          </div>
          <div className="flex gap-1.5 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[3px] w-7 rounded-full bg-secondary-600"
              />
            ))}
          </div>
        </div>
        <div className="mb-8 h-px bg-neutral-200" />

        {/* Shift preview card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex gap-2">
                {isStatUrgency && (
                  <span className="flex items-center gap-1 rounded-full bg-error-100 px-2.5 py-1 text-[11px] font-bold text-error-600">
                    <Zap className="h-3 w-3" />
                    STAT
                  </span>
                )}
              </div>
              <button className="text-neutral-400 hover:text-neutral-600">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mb-0.5 text-lg font-bold text-neutral-900">
              {data.roleNeeded
                ? `${data.specialty ? data.specialty + " " : ""}${data.roleNeeded}`
                : "Emergency Doctor"}
            </h2>
            <p className="mb-4 text-sm font-medium text-secondary-600">
              LUTH &bull; 1.2km
            </p>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Rate
                </p>
                <p className="text-sm font-bold text-neutral-900">
                  {rateDisplay(data)}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Schedule
                </p>
                <p className="text-sm font-bold text-neutral-900">
                  {scheduleDisplay(
                    data.startDate,
                    data.startTime,
                    data.duration,
                  )}
                </p>
              </div>
            </div>

            <div className="mb-1 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-secondary-400 to-secondary-600"
                  />
                ))}
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                +45
              </span>
              <span className="text-xs text-neutral-500">
                Eligible clinicians nearby
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-5 py-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>Idi-Araba, Lagos</span>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-3 mb-8">
          <AccordionSection title="Basic Information">
            <div className="divide-y divide-neutral-100">
              <InfoRow label="Role" value={data.roleNeeded} />
              <InfoRow label="Specialty" value={data.specialty} />
              <InfoRow
                label="Shift Type"
                value={data.shiftType === "in-person" ? "In-person" : "Virtual"}
              />
              <InfoRow
                label="Date"
                value={
                  data.startDate
                    ? new Date(data.startDate + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )
                    : ""
                }
              />
              <InfoRow
                label="Time"
                value={
                  data.startTime
                    ? new Date(
                        `1970-01-01T${data.startTime}`,
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : ""
                }
              />
              <InfoRow label="Duration" value={data.duration} />
              <InfoRow
                label="Urgency"
                value={urgencyLabel(data.urgencyLevel)}
              />
            </div>
          </AccordionSection>

          <AccordionSection title="Compensation">
            <div className="divide-y divide-neutral-100">
              <InfoRow
                label="Pay Type"
                value={data.payType === "hourly" ? "Hourly Rate" : "Fixed Rate"}
              />
              {data.payType === "hourly" && (
                <>
                  <InfoRow
                    label="Hourly Rate"
                    value={`₦${data.hourlyRate.toLocaleString()}`}
                  />
                  <InfoRow
                    label="Expected Hours"
                    value={`${data.expectedHours} hrs`}
                  />
                  <InfoRow label="Base Pay" value={formatNaira(baseEarnings)} />
                </>
              )}
              {data.payType === "fixed" && (
                <InfoRow
                  label="Fixed Rate"
                  value={formatNaira(data.fixedRate)}
                />
              )}
              {data.bonuses.map((b) => (
                <InfoRow
                  key={b.id}
                  label={b.name}
                  value={formatNaira(b.amount)}
                />
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary-700">
                  Grand Total
                </span>
                <span className="text-base font-bold text-secondary-700">
                  {formatNaira(grandTotal)}
                </span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Description">
            {data.jobDescription && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Job Description
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {data.jobDescription}
                </p>
              </div>
            )}
            {data.tasks.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Tasks
                </p>
                <ul className="space-y-1.5">
                  {data.tasks.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.deliverables.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Deliverables
                </p>
                <ul className="space-y-1.5">
                  {data.deliverables.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary-500" />
                      {d.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.equipment.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Equipment Provided
                </p>
                <ul className="space-y-1.5">
                  {data.equipment.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary-500" />
                      {e.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!data.jobDescription &&
              !data.tasks.length &&
              !data.deliverables.length &&
              !data.equipment.length && (
                <p className="text-sm text-neutral-400 italic">
                  No description provided.
                </p>
              )}
          </AccordionSection>

          <AccordionSection title="Requirements">
            {data.qualifications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.qualifications.map((q) => (
                  <span
                    key={q}
                    className="rounded-full bg-secondary-700 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    {q}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                No qualifications specified.
              </p>
            )}
          </AccordionSection>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleBroadcast}
            isLoading={broadcasting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-secondary-700 to-secondary-600 py-4 text-base font-bold uppercase tracking-widest text-white hover:from-secondary-600 hover:to-secondary-500"
          >
            <Radio className="h-5 w-5" />
            Broadcast Shift
          </Button>
          <button
            onClick={onBack}
            className="w-full rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Back to Schedule Details
          </button>
          <p className="text-center text-xs text-neutral-400">
            By clicking broadcast, this position will be immediately published
            to the clinician marketplace. Charges will only apply once a
            clinician is successfully booked.
          </p>
        </div>
      </div>
    </div>
  );
}
