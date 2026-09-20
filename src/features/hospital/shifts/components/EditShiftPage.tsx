import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info, Lock } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { AttachmentGallery } from "@/shared/components/AttachmentGallery";
import { appToast } from "@/shared/components/feedback/toast";
import { ApiError } from "@/lib/apiError";
import { PATHS } from "@/routes/paths";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import type { ApiShiftDetail } from "@/features/hospital/shifts/types";

/**
 * Standalone "Edit Shift" screen.
 *
 * NOTE (2026-09-08): nexus-backend has NO general shift-edit endpoint. The only
 * post-creation mutations it exposes are `POST /shifts/{id}/cancel` and
 * `POST /shifts/{id}/reschedule` (start time + duration only). So this screen
 * only *persists* a reschedule; role, pay, description, tasks and requirements
 * are shown read-only. It is intentionally NOT linked from the shift-details
 * page — it's a scaffold to extend once an edit endpoint exists.
 *
 * Route: /hospital/shifts/:shiftId/edit
 */

const RESCHEDULABLE_STATUSES = new Set(["open", "upcoming"]);

function toDateInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function toTimeInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function naira(kobo?: number | null): string {
  if (typeof kobo !== "number") return "—";
  return `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
        <Lock className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
      </p>
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        {value || "—"}
      </div>
    </div>
  );
}

export function EditShiftPage() {
  const navigate = useNavigate();
  const { shiftId = "" } = useParams<{ shiftId: string }>();
  const { getShiftDetails, rescheduleShift } = useHospitalShift();

  const [shift, setShift] = useState<ApiShiftDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!shiftId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getShiftDetails(shiftId)
      .then((data) => {
        if (cancelled) return;
        setShift(data);
        setStartDate(toDateInput(data.scheduled_start));
        setStartTime(toTimeInput(data.scheduled_start));
        setDurationHours(String(data.duration_hours ?? ""));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError ? err.message : "Failed to load this shift.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shiftId, getShiftDetails]);

  const canReschedule = shift
    ? RESCHEDULABLE_STATUSES.has(shift.status)
    : false;

  const dirty = useMemo(() => {
    if (!shift) return false;
    return (
      startDate !== toDateInput(shift.scheduled_start) ||
      startTime !== toTimeInput(shift.scheduled_start) ||
      Number(durationHours) !== Number(shift.duration_hours)
    );
  }, [shift, startDate, startTime, durationHours]);

  const durationValid = useMemo(() => {
    const n = Number(durationHours);
    return Number.isFinite(n) && n >= 0.5 && n <= 24;
  }, [durationHours]);

  const handleSave = async () => {
    if (!shift || !startDate || !startTime || !durationValid) return;
    setIsSaving(true);
    try {
      const scheduledStart = new Date(`${startDate}T${startTime}`).toISOString();
      await rescheduleShift({
        shift_id: shift.id,
        scheduled_start: scheduledStart,
        duration_hours: Number(durationHours),
      });
      appToast.success("Shift rescheduled", "The new time has been saved.");
      navigate(PATHS.hospital.shifts);
    } catch (err) {
      if (err instanceof ApiError) {
        appToast.error("Couldn't reschedule", err.message);
      } else {
        appToast.fromError(err, "Couldn't reschedule this shift.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="-mx-4 -mt-4 mb-8 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:-mx-8 lg:-mt-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
          Edit Shift
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mx-auto max-w-2xl pb-10">
        {isLoading && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading shift…
          </p>
        )}

        {loadError && !isLoading && (
          <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-950 dark:text-error-300">
            {loadError}
          </div>
        )}

        {shift && !isLoading && (
          <>
            <div className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Only the date, start time and duration can be changed today —
                the platform doesn't yet support editing a shift's role, pay,
                description or requirements after it's posted.
              </p>
            </div>

            {!canReschedule && (
              <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-300">
                This shift is <strong>{shift.status.replace("_", " ")}</strong>{" "}
                and can no longer be rescheduled. Cancel it instead if the time
                no longer works.
              </div>
            )}

            {/* Editable: schedule */}
            <section className="mt-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-5 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Schedule
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!canReschedule}
                  required
                />
                <Input
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!canReschedule}
                  required
                />
                <Input
                  label="Duration (hours)"
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  disabled={!canReschedule}
                  hint={
                    durationHours && !durationValid
                      ? "Must be between 0.5 and 24 hours"
                      : undefined
                  }
                  required
                />
              </div>
            </section>

            {/* Read-only: everything the backend can't change yet */}
            <section className="mt-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-5 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Shift Details
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <ReadOnlyField label="Role" value={shift.role_title} />
                <ReadOnlyField
                  label="Department"
                  value={shift.department ?? ""}
                />
                <ReadOnlyField
                  label="Specialty"
                  value={shift.specialty ?? ""}
                />
                <ReadOnlyField
                  label="Shift Type"
                  value={shift.shift_type === "virtual" ? "Virtual" : "In-Person"}
                />
                <ReadOnlyField
                  label="Priority"
                  value={shift.priority}
                />
                <ReadOnlyField
                  label="Pay"
                  value={
                    shift.pay_type === "fixed_rate"
                      ? `${naira(shift.fixed_rate_kobo)} fixed`
                      : `${naira(shift.rate_kobo_per_hour)} / hr`
                  }
                />
              </div>

              <div className="mt-5">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Job Description
                  <Lock className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                </p>
                <Textarea
                  value={shift.job_description ?? ""}
                  readOnly
                  rows={3}
                  className="bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                />
              </div>

              {shift.tasks.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Tasks
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                    {shift.tasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {shift.requirements.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Requirements
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                    {shift.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(shift.attachment_urls?.length ?? 0) > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Attachments
                  </p>
                  <AttachmentGallery urls={shift.attachment_urls ?? []} />
                </div>
              )}
            </section>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                className="bg-brand-800 hover:bg-brand-900 active:bg-brand-900 px-6"
                isLoading={isSaving}
                disabled={
                  !canReschedule ||
                  !dirty ||
                  !startDate ||
                  !startTime ||
                  !durationValid
                }
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
