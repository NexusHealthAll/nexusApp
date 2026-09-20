import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { AttachmentGallery } from "@/shared/components/AttachmentGallery";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { useAuthStore } from "@/shared/auth/store/authStore";
import type {
  ApiQualificationMatch,
  ApiShiftDetail,
} from "@/features/hospital/shifts/types";
import { Header, InfoTile, StatusBadge, formatKobo } from "../DashboardChrome";

/** Clock-in from the details screen opens 5 min before start, closes 10 min after. */
const CLOCK_IN_OPENS_BEFORE_MS = 5 * 60 * 1000;
const CLOCK_IN_CLOSES_AFTER_MS = 10 * 60 * 1000;

function shiftRateLabel(shift: ApiShiftDetail): string {
  if (shift.pay_type === "fixed_rate") {
    return `${formatKobo(shift.fixed_rate_kobo ?? 0)} fixed`;
  }
  return formatKobo((shift.rate_kobo_per_hour ?? 0) * shift.duration_hours);
}

type StatusKey =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

function normalizeStatus(shift: ApiShiftDetail): StatusKey {
  const raw = String(
    shift.status ?? (shift as unknown as { shift_status?: string }).shift_status ?? "",
  )
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  if (raw === "inprogress") return "in_progress";
  if (raw === "completed") return "completed";
  if (raw === "cancelled" || raw === "canceled") return "cancelled";
  if (raw === "noshow") return "no_show";
  if (raw === "assigned" || raw === "upcoming") return "assigned";
  return "open";
}

const STATUS_DISPLAY: Record<
  StatusKey,
  { label: string; tone: "blue" | "green" | "red" | "amber"; header: string } | null
> = {
  open: null,
  assigned: { label: "Filled", tone: "blue", header: "Shift Details" },
  in_progress: { label: "In Progress", tone: "amber", header: "Shift In Progress" },
  completed: { label: "Completed", tone: "green", header: "Shift Summary" },
  cancelled: { label: "Cancelled", tone: "red", header: "Shift Details" },
  no_show: { label: "No-show", tone: "red", header: "Shift Details" },
};

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}

type EligibilityTone = "match" | "partial" | "low" | "neutral";

type Eligibility = {
  tone: EligibilityTone;
  title: string;
  detail: string;
  score: string | null;
};

function getEligibility(
  total: number,
  met: number,
  hasMatchData: boolean,
): Eligibility {
  if (total === 0) {
    return {
      tone: "neutral",
      title: "No specific requirements",
      detail:
        "This shift lists no required qualifications — you're free to express interest.",
      score: null,
    };
  }
  if (!hasMatchData) {
    return {
      tone: "neutral",
      title: `${total} requirement${total === 1 ? "" : "s"} listed`,
      detail:
        "Sign in with a completed clinical profile to see how you match this shift.",
      score: null,
    };
  }

  const pct = Math.round((met / total) * 100);
  const score = `${met}/${total} · ${pct}%`;

  if (met === total) {
    return {
      tone: "match",
      title: "Strong match — you're eligible",
      detail: `Your profile meets all ${total} of this shift's requirements.`,
      score,
    };
  }
  if (met === 0) {
    return {
      tone: "low",
      title: "Low match",
      detail: `Your profile doesn't list any of this shift's ${total} requirements yet. You can still express interest.`,
      score,
    };
  }
  return {
    tone: "partial",
    title: "Partial match",
    detail: `You meet ${met} of ${total} requirements. Hospitals may still consider you.`,
    score,
  };
}

const ELIGIBILITY_STYLE: Record<EligibilityTone, string> = {
  match:
    "border-success-200 bg-success-50 text-success-800 dark:border-success-900 dark:bg-success-950 dark:text-success-300",
  partial:
    "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-900 dark:bg-warning-950 dark:text-warning-300",
  low: "border-error-200 bg-error-50 text-error-700 dark:border-error-900 dark:bg-error-950 dark:text-error-300",
  neutral:
    "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300",
};

function EligibilityBanner({
  eligibility,
  missing,
}: {
  eligibility: Eligibility;
  missing: string[];
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-sm ${ELIGIBILITY_STYLE[eligibility.tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-bold">
          {eligibility.tone === "match" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : eligibility.tone === "low" ? (
            <X className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          )}
          {eligibility.title}
        </div>
        {eligibility.score && (
          <span className="flex-shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold dark:bg-black/20">
            {eligibility.score}
          </span>
        )}
      </div>
      <p className="mt-1.5 leading-relaxed">{eligibility.detail}</p>
      {missing.length > 0 && (
        <p className="mt-1.5 text-xs">
          <span className="font-semibold">Missing:</span> {missing.join(", ")}
        </p>
      )}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
        >
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ShiftDetailScreen({
  shiftId,
  onBack,
  onInterested,
  onLoaded,
  isSubmitting,
  alreadyExpressedInterest = false,
  onClockIn,
}: {
  shiftId: string;
  onBack: () => void;
  onInterested: () => void;
  onLoaded?: (shift: ApiShiftDetail) => void;
  isSubmitting: boolean;
  /** True when the worker has already expressed interest in this shift. */
  alreadyExpressedInterest?: boolean;
  /** Opens the clock-in / call-entry flow for a shift assigned to this worker. */
  onClockIn?: (shiftId: string) => void;
}) {
  const { getShiftDetails } = useHospitalShift();
  const myClinicianId = useAuthStore((s) => s.clinicianId);
  const [shift, setShift] = useState<ApiShiftDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Re-render every 15s so the clock-in window opens/closes on time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

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
        if (!cancelled)
          setLoadError(
            "This shift couldn't be loaded — it may no longer be available.",
          );
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
        <main className="px-5 py-8 text-center text-sm text-neutral-500 dark:text-neutral-500">
          {loadError}
        </main>
      </>
    );
  }

  if (!shift) {
    return (
      <>
        <Header title="Shift Details" onBack={onBack} />
        <main className="px-5 py-8 text-center text-sm text-neutral-500 dark:text-neutral-500">
          Loading...
        </main>
      </>
    );
  }

  const statusKey = normalizeStatus(shift);
  const statusDisplay = STATUS_DISPLAY[statusKey];
  const isCompleted = statusKey === "completed";
  const isOpen = statusKey === "open";
  const canExpressInterest = isOpen && !alreadyExpressedInterest;

  const tasks = shift.tasks ?? [];
  const requirements = shift.requirements ?? [];
  const deliverables = shift.deliverables ?? [];
  const equipment = shift.equipment ?? [];
  const attachmentUrls = shift.attachment_urls ?? [];
  const matchByReq = new Map<string, boolean>(
    (shift.qualification_match ?? []).map((m: ApiQualificationMatch) => [
      m.requirement,
      m.met,
    ]),
  );

  // Client-side eligibility summary, derived from the per-requirement
  // qualification match the backend returns for the calling clinician.
  // Informational only — the hospital still decides who it offers the shift to.
  const hasMatchData = (shift.qualification_match ?? []).length > 0;
  const metRequirements = requirements.filter(
    (r) => matchByReq.get(r) === true,
  );
  const unmetRequirements = requirements.filter(
    (r) => matchByReq.get(r) === false,
  );
  const eligibility = getEligibility(
    requirements.length,
    metRequirements.length,
    hasMatchData,
  );

  // Time-gated clock-in CTA (shift assigned to this worker only).
  const isVirtual = shift.shift_type === "virtual";
  const isAssignedToMe =
    !!shift.assigned_clinician_id &&
    !!myClinicianId &&
    shift.assigned_clinician_id.toLowerCase() === myClinicianId.toLowerCase();
  const startMs = new Date(shift.scheduled_start).getTime();
  const opensAt = startMs - CLOCK_IN_OPENS_BEFORE_MS;
  const closesAt = startMs + CLOCK_IN_CLOSES_AFTER_MS;
  const clockInWindowOpen =
    Number.isFinite(startMs) && now >= opensAt && now <= closesAt;
  const clockInBeforeWindow = Number.isFinite(startMs) && now < opensAt;
  const showClockInCta = Boolean(onClockIn) && isAssignedToMe;

  const detailRows: { label: string; value: string }[] = [
    { label: "Specialty", value: shift.specialty || "—" },
    { label: "Department", value: shift.department || "—" },
    {
      label: "Type",
      value: shift.shift_type === "virtual" ? "Virtual" : "In-person",
    },
    { label: "Priority", value: shift.priority ?? "normal" },
    { label: "Start", value: timeLabel(shift.scheduled_start) },
    { label: "End", value: timeLabel(shift.scheduled_end) },
  ];

  return (
    <>
      <Header title={statusDisplay?.header ?? "Shift Details"} onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-neutral-900">
          <div className="h-28 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900" />
          <div className="mt-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{shift.hospital_name ?? "Hospital"}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {shift.department ?? shift.specialty ?? ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge>{shift.role_title}</StatusBadge>
                {statusDisplay && (
                  <StatusBadge tone={statusDisplay.tone}>
                    {statusDisplay.label}
                  </StatusBadge>
                )}
                {statusKey === "open" && shift.priority === "stat" && (
                  <StatusBadge tone="red">STAT Need</StatusBadge>
                )}
                {statusKey === "open" && shift.priority === "urgent" && (
                  <StatusBadge tone="amber">Urgent</StatusBadge>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-brand-700 p-4 text-white">
          <p className="text-xs text-brand-100">
            {isCompleted ? "Total Earned" : "Estimated Pay"}
          </p>
          <p className="text-3xl font-bold">{shiftRateLabel(shift)}</p>
          <p className="text-xs text-brand-100">
            {shift.shift_type === "virtual" ? "Virtual shift" : "In-person"}
          </p>
        </section>

        {isOpen && (
          <EligibilityBanner
            eligibility={eligibility}
            missing={unmetRequirements}
          />
        )}

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
          <CardContent className="space-y-3 p-4 pt-0 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {detailRows.map((row) => (
                <div key={row.label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {row.label}
                  </p>
                  <p className="font-medium capitalize text-neutral-700 dark:text-neutral-300">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
            <p>{shift.job_description || "No description provided for this shift."}</p>
            {shift.notes && (
              <div className="rounded-xl bg-neutral-50 px-3 py-2 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                <Check className="mr-2 inline h-4 w-4 text-success-600 dark:text-success-400" />
                {shift.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {tasks.length > 0 && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Bullets items={tasks} />
            </CardContent>
          </Card>
        )}

        {deliverables.length > 0 && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Bullets items={deliverables} />
            </CardContent>
          </Card>
        )}

        {equipment.length > 0 && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Equipment Provided</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Bullets items={equipment} />
            </CardContent>
          </Card>
        )}

        {attachmentUrls.length > 0 && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Attachments</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <AttachmentGallery urls={attachmentUrls} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Requirements &amp; Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {requirements.length === 0 ? (
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                No specific qualifications listed for this shift.
              </p>
            ) : (
              <ul className="space-y-2">
                {requirements.map((req, i) => {
                  const met = matchByReq.get(req);
                  return (
                    <li
                      key={`${req}-${i}`}
                      className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      {met === undefined ? (
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                      ) : met ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-600 dark:text-success-400" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-error-500 dark:text-error-400" />
                      )}
                      {req}
                    </li>
                  );
                })}
              </ul>
            )}
            {shift.qualification_match && shift.qualification_match.length > 0 && (
              <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                Ticks show how your profile matches this shift's requirements.
              </p>
            )}
          </CardContent>
        </Card>

        {shift.shift_type === "in_person" && (
          <section className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-brand-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white">
            <div className="flex h-36 items-center justify-center rounded-xl bg-brand-100/60 dark:bg-neutral-800">
              <Navigation className="h-10 w-10 text-brand-700 dark:text-brand-300" />
            </div>
            <p className="mt-3 text-sm font-bold">
              {isCompleted
                ? "Completed On-site Shift"
                : shift.hospital_location?.place_label ||
                  "On-site — exact address shown after assignment"}
            </p>
          </section>
        )}

        <div className="pb-4">
          {canExpressInterest ? (
            <div className="grid grid-cols-[1fr_2fr] gap-3">
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
          ) : isOpen && alreadyExpressedInterest ? (
            <div className="space-y-3">
              <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                Interest expressed — pending hospital selection. You'll be
                notified if you're offered this shift.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-full"
              >
                Back
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {statusKey === "in_progress" && (
                <>
                  <p className="rounded-xl bg-warning-50 px-4 py-3 text-sm font-medium text-warning-800 dark:bg-warning-950 dark:text-warning-300">
                    This shift is currently in progress.
                  </p>
                  {showClockInCta && onClockIn && (
                    <Button
                      type="button"
                      onClick={() => onClockIn(shift.id)}
                      className="h-14 w-full bg-brand-700 text-base hover:bg-brand-800"
                    >
                      {isVirtual ? (
                        <Video className="mr-2 h-5 w-5" />
                      ) : (
                        <Clock className="mr-2 h-5 w-5" />
                      )}
                      Resume shift
                    </Button>
                  )}
                </>
              )}
              {statusKey === "assigned" &&
                (showClockInCta && onClockIn ? (
                  clockInWindowOpen ? (
                    <Button
                      type="button"
                      onClick={() => onClockIn(shift.id)}
                      className={`h-14 w-full text-base ${
                        isVirtual
                          ? "bg-brand-600 hover:bg-brand-700"
                          : "bg-error-600 hover:bg-error-700"
                      }`}
                    >
                      {isVirtual ? (
                        <Video className="mr-2 h-5 w-5" />
                      ) : (
                        <Clock className="mr-2 h-5 w-5" />
                      )}
                      {isVirtual ? "Join Call" : "Clock In"}
                    </Button>
                  ) : clockInBeforeWindow ? (
                    <p className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {isVirtual
                        ? "You can join the call from 5 minutes before the shift starts"
                        : "Clock-in opens 5 minutes before the shift starts"}{" "}
                      ({timeLabel(shift.scheduled_start)}).
                    </p>
                  ) : (
                    <p className="rounded-xl bg-warning-50 px-4 py-3 text-sm font-medium text-warning-800 dark:bg-warning-950 dark:text-warning-300">
                      The {isVirtual ? "call" : "clock-in"} window has closed — it
                      stayed open until 10 minutes after the start time. Contact
                      the hospital if you still need to start this shift.
                    </p>
                  )
                ) : (
                  <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    This shift has already been filled.
                  </p>
                ))}
              {(statusKey === "cancelled" || statusKey === "no_show") && (
                <p className="rounded-xl bg-error-50 px-4 py-3 text-sm font-medium text-error-700 dark:bg-error-950 dark:text-error-300">
                  {statusKey === "cancelled"
                    ? "This shift was cancelled."
                    : "This shift was closed as a no-show."}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-full"
              >
                {isCompleted ? "Back to Schedule" : "Back"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
