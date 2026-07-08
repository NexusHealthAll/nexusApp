import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Modal } from "@/shared/components/ui/Modal";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { formatDateTime } from "@/shared/utils/date";
import {
  useHospitalShift,
  type RankedInterestedClinician,
} from "@/features/hospital/shifts/hooks/useHospitalShift";
import type {
  ApiShift,
  ApiShiftPriority,
  ApiShiftStatus,
} from "@/features/hospital/shifts/types";

type WorkerUi = RankedInterestedClinician & { id: string };

type TimelineEventUi = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
};

const avatarPalette = [
  "bg-secondary-100 text-secondary-700",
  "bg-warning-100 text-warning-700",
  "bg-primary-100 text-primary-700",
];

const priorityBadge: Record<ApiShiftPriority, { variant: BadgeVariant; label: string }> = {
  stat: { variant: "error", label: "STAT" },
  urgent: { variant: "warning", label: "Urgent" },
  normal: { variant: "success", label: "Normal" },
  scheduled: { variant: "info", label: "Scheduled" },
};

const statusBadge: Record<ApiShiftStatus, { variant: BadgeVariant; label: string }> = {
  open: { variant: "warning", label: "Open" },
  assigned: { variant: "info", label: "Assigned" },
  upcoming: { variant: "info", label: "Upcoming" },
  in_progress: { variant: "success", label: "In Progress" },
  completed: { variant: "neutral", label: "Completed" },
  cancelled: { variant: "error", label: "Cancelled" },
  no_show: { variant: "error", label: "No Show" },
};

const nonEditableStatuses: ApiShiftStatus[] = ["completed", "cancelled", "no_show"];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatRate(shift: ApiShift): string {
  if (typeof shift.rate_kobo_per_hour === "number" && shift.rate_kobo_per_hour > 0) {
    return `₦${Math.round(shift.rate_kobo_per_hour / 100).toLocaleString()}/hr`;
  }
  if (typeof shift.fixed_rate_kobo === "number" && shift.fixed_rate_kobo > 0) {
    return `₦${Math.round(shift.fixed_rate_kobo / 100).toLocaleString()}`;
  }
  return "—";
}

function buildTimeline(shift: ApiShift): TimelineEventUi[] {
  const events: TimelineEventUi[] = [
    {
      id: "created",
      label: "Shift Created",
      detail: formatDateTime(shift.created_at).dateLabel,
      done: true,
    },
    {
      id: "broadcast",
      label: "Broadcast to Marketplace",
      detail: shift.broadcast_at
        ? formatDateTime(shift.broadcast_at).dateLabel
        : "Not yet broadcast",
      done: Boolean(shift.broadcast_at),
    },
    {
      id: "assigned",
      label: "Clinician Assigned",
      detail: shift.assigned_clinician_id ? "Assigned" : "Awaiting selection",
      done: Boolean(shift.assigned_clinician_id),
    },
  ];

  if (shift.status === "cancelled") {
    events.push({
      id: "cancelled",
      label: "Shift Cancelled",
      detail: formatDateTime(shift.updated_at).dateLabel,
      done: true,
    });
    return events;
  }

  events.push(
    {
      id: "clocked-in",
      label: "Clinician Clocked In",
      detail: shift.actual_start ? formatDateTime(shift.actual_start).dateLabel : "Pending",
      done: Boolean(shift.actual_start),
    },
    {
      id: "clocked-out",
      label: "Shift Completed",
      detail: shift.actual_end ? formatDateTime(shift.actual_end).dateLabel : "Pending",
      done: Boolean(shift.actual_end),
    },
  );

  return events;
}

export function ShiftApprovalPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const {
    getShiftDetails,
    getInterestedClinicians,
    assignClinician,
    cancelShift,
    rescheduleShift,
  } = useHospitalShift();

  const [shift, setShift] = useState<ApiShift | null>(null);
  const [workers, setWorkers] = useState<WorkerUi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleDuration, setRescheduleDuration] = useState(0);
  const [rescheduling, setRescheduling] = useState(false);

  const loadShift = async (id: string, opts: { showSpinner: boolean }) => {
    if (opts.showSpinner) setIsLoading(true);
    setLoadError(null);
    try {
      const [details, interested] = await Promise.all([
        getShiftDetails(id),
        getInterestedClinicians(id),
      ]);
      setShift(details);
      setWorkers(
        interested
          .map((c) => ({ ...c, id: c.clinician_id }))
          .sort((a, b) => b.score - a.score),
      );
    } catch (err) {
      setShift(null);
      appToast.fromError(err, "Failed to load shift details.");
      setLoadError("This shift could not be loaded. It may not exist, or you may not have access to it.");
    } finally {
      if (opts.showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!shiftId) return;
    loadShift(shiftId, { showSpinner: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftId]);

  const mapsUrl = useMemo(
    () =>
      shift?.hospital_name
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shift.hospital_name)}`
        : undefined,
    [shift?.hospital_name],
  );

  const timeline = useMemo(() => (shift ? buildTimeline(shift) : []), [shift]);

  const avgRating =
    workers.length > 0
      ? workers.reduce((sum, w) => sum + w.rating, 0) / workers.length
      : 0;
  const avgDistanceKm =
    workers.filter((w) => typeof w.distance_km === "number").length > 0
      ? workers.reduce((sum, w) => sum + (w.distance_km ?? 0), 0) /
        workers.filter((w) => typeof w.distance_km === "number").length
      : null;

  const handleApprove = async (worker: WorkerUi) => {
    if (!shiftId) return;
    setApprovingId(worker.id);
    try {
      await assignClinician({ shift_id: shiftId, clinician_id: worker.id });
      appToast.success(
        "Worker approved",
        `${worker.display_name} has been assigned to this shift.`,
      );
      await loadShift(shiftId, { showSpinner: false });
    } catch (error) {
      appToast.fromError(error, "Failed to approve worker. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const openReschedule = () => {
    if (!shift) return;
    const start = new Date(shift.scheduled_start);
    if (!Number.isNaN(start.getTime())) {
      setRescheduleDate(start.toISOString().slice(0, 10));
      setRescheduleTime(start.toISOString().slice(11, 16));
    }
    setRescheduleDuration(shift.duration_hours || 0);
    setRescheduleOpen(true);
  };

  const handleReschedule = async () => {
    if (!shiftId || !rescheduleDate || !rescheduleTime || rescheduleDuration <= 0) return;
    setRescheduling(true);
    try {
      await rescheduleShift({
        shift_id: shiftId,
        duration_hours: rescheduleDuration,
        scheduled_start: `${rescheduleDate}T${rescheduleTime}`,
      });
      appToast.success("Shift rescheduled", "The new schedule has been saved.");
      setRescheduleOpen(false);
      await loadShift(shiftId, { showSpinner: false });
    } catch (error) {
      appToast.fromError(error, "Failed to reschedule shift. Please try again.");
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!shiftId || !cancelReason.trim()) return;
    setCancelling(true);
    try {
      await cancelShift({ shift_id: shiftId, reason: cancelReason.trim() });
      appToast.success("Shift cancelled", "The shift has been cancelled.");
      setCancelOpen(false);
      setCancelReason("");
      await loadShift(shiftId, { showSpinner: false });
    } catch (error) {
      appToast.fromError(error, "Failed to cancel shift. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-neutral-100" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
            <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
        </div>
      </div>
    );
  }

  if (loadError || !shift) {
    return (
      <EmptyState
        className="bg-white"
        title="Shift not found"
        description={loadError ?? "This shift could not be loaded."}
      />
    );
  }

  const canEdit = !nonEditableStatuses.includes(shift.status);
  const { dateLabel, timeLabel } = formatDateTime(shift.scheduled_start, shift.scheduled_end);
  const status = statusBadge[shift.status];
  const priority = priorityBadge[shift.priority];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              {shift.shift_label || shift.role_title}
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {shift.hospital_name
              ? `Review and manage this shift for ${shift.hospital_name}.`
              : "Review and manage this shift."}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openReschedule}
              className="gap-1.5 border-none bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Reschedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelOpen(true)}
              className="gap-1.5 border-none bg-error-50 text-error-700 hover:bg-error-100"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel Shift
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Shift Information */}
          <div className="rounded-2xl border border-neutral-200 border-l-4 border-l-secondary-600 bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Shift Information
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="mb-1 text-xs text-neutral-500">Role</p>
                <p className="text-sm font-bold text-neutral-900">
                  {shift.role_title}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Timing</p>
                <p className="text-sm font-bold text-neutral-900">{timeLabel}</p>
                <p className="text-xs text-neutral-500">{dateLabel}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Department</p>
                <p className="text-sm font-bold text-neutral-900">
                  {shift.department || shift.specialty || "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Rate</p>
                <p className="text-sm font-bold text-secondary-700">
                  {formatRate(shift)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Duration</p>
                <p className="text-sm font-bold text-neutral-900">
                  {shift.duration_hours} hrs
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Priority</p>
                <Badge variant={priority.variant}>{priority.label}</Badge>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Shift Type</p>
                <p className="text-sm font-bold text-neutral-900">
                  {shift.shift_type === "in_person" ? "In-person" : "Virtual"}
                </p>
              </div>
              {typeof shift.grand_total_kobo === "number" && (
                <div>
                  <p className="mb-1 text-xs text-neutral-500">Grand Total</p>
                  <p className="text-sm font-bold text-neutral-900">
                    ₦{Math.round(shift.grand_total_kobo / 100).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description & Notes */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Description &amp; Notes
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-sm font-semibold text-neutral-900">
                  Job Description
                </p>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {shift.job_description || "No description provided."}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="mb-1.5 text-sm font-semibold text-neutral-900">
                  Special Notes
                </p>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {shift.notes || "No special notes."}
                </p>
              </div>
            </div>
          </div>

          {/* Interested Workers */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                Interested Workers
              </h2>
              <p className="text-xs text-neutral-500">Sorted by Match Score</p>
            </div>

            {shift.assigned_clinician_id ? (
              <EmptyState
                className="bg-white"
                icon={<CheckCircle2 className="h-10 w-10 text-secondary-400" />}
                title="A clinician has already been assigned to this shift."
              />
            ) : workers.length === 0 ? (
              <EmptyState className="bg-white" title="No interested workers yet." />
            ) : (
              <div className="space-y-3">
                {workers.map((worker, i) => (
                  <div
                    key={worker.id}
                    className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
                            avatarPalette[i % avatarPalette.length],
                          )}
                        >
                          {initials(worker.display_name)}
                        </div>
                        <span
                          title={worker.quals_match ? "Meets all qualifications" : "Missing a required qualification"}
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                            worker.quals_match ? "bg-success-500" : "bg-warning-400",
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-neutral-900">
                            {worker.display_name}
                          </p>
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-neutral-700">
                            <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                            {worker.rating.toFixed(1)} ({worker.rating_count})
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {worker.completed_shifts} shifts completed
                          {typeof worker.distance_km === "number" &&
                            ` • ${worker.distance_km.toFixed(1)}km away`}
                          {typeof worker.acceptance_rate_pct === "number" &&
                            ` • ${Math.round(worker.acceptance_rate_pct)}% acceptance`}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isLoading={approvingId === worker.id}
                        onClick={() => handleApprove(worker)}
                        className="bg-secondary-800 text-white hover:bg-secondary-900"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Applicant Insights */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Applicant Insights
            </p>
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-neutral-600">Avg. Rating</span>
                <span className="text-sm font-bold text-neutral-900">
                  {workers.length > 0 ? `${avgRating.toFixed(1)} / 5.0` : "—"}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-secondary-600"
                  style={{ width: `${(avgRating / 5) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
              <span className="text-sm text-neutral-600">Avg. Distance</span>
              <span className="text-sm font-bold text-neutral-900">
                {avgDistanceKm !== null ? `${avgDistanceKm.toFixed(1)}km` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-3">
              <span className="text-sm text-neutral-600">Interested</span>
              <span className="text-sm font-bold text-neutral-900">
                {workers.length}
              </span>
            </div>
          </div>

          {/* Hospital */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Hospital
            </p>
            <p className="mb-3 text-sm font-bold text-neutral-900">
              {shift.hospital_name || "—"}
            </p>
            <div className="relative mb-3 h-32 overflow-hidden rounded-xl bg-secondary-50">
              <svg
                viewBox="0 0 260 130"
                className="h-full w-full"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <rect width="260" height="130" fill="#ECFEFF" />
                <path d="M0 40 H260 M0 90 H260" stroke="#BAE6FD" strokeWidth="3" />
                <path d="M60 0 V130 M190 0 V130" stroke="#BAE6FD" strokeWidth="3" />
                <rect x="70" y="50" width="110" height="30" rx="4" fill="#A5F3FC" opacity="0.6" />
              </svg>
              <MapPin className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-full fill-secondary-700 text-secondary-700" />
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-secondary-700 hover:text-secondary-900"
              >
                View in Maps
              </a>
            )}
          </div>

          {/* Shift Timeline */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Shift Timeline
            </p>
            <ul className="space-y-4">
              {timeline.map((event, i) => (
                <li key={event.id} className="relative flex gap-3 pl-1">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                        event.done
                          ? "bg-secondary-600"
                          : "border-2 border-neutral-300 bg-white",
                      )}
                    />
                    {i < timeline.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-neutral-200" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        event.done ? "text-neutral-900" : "text-neutral-400",
                      )}
                    >
                      {event.label}
                    </p>
                    <p className="text-xs text-neutral-400">{event.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cancel Shift modal */}
      <Modal
        isOpen={cancelOpen}
        onClose={() => !cancelling && setCancelOpen(false)}
        title="Cancel Shift"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            This will cancel the shift and notify any assigned or interested
            clinicians. Please provide a reason.
          </p>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Reason <span className="text-error-500">*</span>
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Staffing need resolved internally"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-error-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
            >
              Keep Shift
            </Button>
            <Button
              onClick={handleCancel}
              isLoading={cancelling}
              disabled={!cancelReason.trim()}
              className="bg-error-600 text-white hover:bg-error-700"
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Shift modal */}
      <Modal
        isOpen={rescheduleOpen}
        onClose={() => !rescheduling && setRescheduleOpen(false)}
        title="Reschedule Shift"
        size="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Date
              </label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Time
              </label>
              <input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Duration (hours)
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
              <input
                type="number"
                min={1}
                step={0.5}
                value={rescheduleDuration || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setRescheduleDuration(0);
                    return;
                  }
                  const val = Number(raw);
                  if (Number.isNaN(val) || val <= 0) return;
                  setRescheduleDuration(val);
                }}
                className="w-full bg-transparent text-sm text-neutral-900 focus:outline-none"
              />
              <span className="text-sm text-neutral-500">hrs</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setRescheduleOpen(false)}
              disabled={rescheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              isLoading={rescheduling}
              disabled={!rescheduleDate || !rescheduleTime || rescheduleDuration <= 0}
              className="bg-secondary-800 text-white hover:bg-secondary-900"
            >
              Save New Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
