import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  Filter,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";

type WorkerUi = {
  id: string;
  name: string;
  role: string;
  rating: number;
  distanceKm: number;
  online: boolean;
};

type TimelineEventUi = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
};

type ShiftApprovalUi = {
  role: string;
  timingStart: string;
  timingEnd: string;
  dateLabel: string;
  department: string;
  hourlyRate: string;
  qualifications: string[];
  specialNotes: string;
  avgRating: number;
  avgDistanceKm: number;
  urgencyLevel: string;
  facilityLabel: string;
  networkLabel: string;
  timeline: TimelineEventUi[];
};

const fallbackShift: ShiftApprovalUi = {
  role: "Nurse (RN)",
  timingStart: "20:00",
  timingEnd: "06:00",
  dateLabel: "Fri, Oct 25",
  department: "Emergency",
  hourlyRate: "$68.50/hr",
  qualifications: [
    "Active ACLS Certification",
    "Min. 5 years Critical Care experience",
    "State RN Licensure (Active/Clean)",
  ],
  specialNotes:
    "High-volume Friday evening expected. Previous experience with EPIC EMR and level-one trauma center triage protocols required.",
  avgRating: 4.8,
  avgDistanceKm: 1.8,
  urgencyLevel: "High",
  facilityLabel: "Main Entrance, Block B",
  networkLabel: "the Lagos General Network",
  timeline: [
    {
      id: "created",
      label: "Shift Created",
      detail: "10:15 AM • Admin Sarah L.",
      done: true,
    },
    {
      id: "opened",
      label: "Applications Opened",
      detail: "10:16 AM • Automated System",
      done: true,
    },
    {
      id: "pending",
      label: "Staff Selection Pending",
      detail: "Awaiting Selection",
      done: false,
    },
  ],
};

const avatarPalette = [
  "bg-secondary-100 text-secondary-700",
  "bg-warning-100 text-warning-700",
  "bg-primary-100 text-primary-700",
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ShiftApprovalPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const { getShiftDetails, getInterestedClinicians, assignClinician } =
    useHospitalShift();

  const [shift, setShift] = useState<ShiftApprovalUi>(fallbackShift);
  const [workers, setWorkers] = useState<WorkerUi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [detailsRes, interested] = await Promise.all([
          getShiftDetails(shiftId!),
          getInterestedClinicians(shiftId!),
        ]);

        const d = detailsRes as any;
        if (d) {
          setShift((prev) => ({
            ...prev,
            role: d?.role_title ?? prev.role,
            department: d?.department ?? d?.specialty ?? prev.department,
            hourlyRate:
              typeof d?.rate_kobo_per_hour === "number" && d.rate_kobo_per_hour > 0
                ? `₦${(d.rate_kobo_per_hour / 100).toLocaleString()}/hr`
                : typeof d?.fixed_rate_kobo === "number" && d.fixed_rate_kobo > 0
                  ? `₦${(d.fixed_rate_kobo / 100).toLocaleString()}`
                  : prev.hourlyRate,
            specialNotes: d?.notes || d?.job_description || prev.specialNotes,
            urgencyLevel: d?.priority ?? prev.urgencyLevel,
          }));
        }

        const mapped: WorkerUi[] = interested.map((c) => ({
          id: c.clinician_id,
          name: c.display_name,
          role: d?.role_title ?? "Clinician",
          rating: c.rating,
          distanceKm: c.distance_km ?? 0,
          online: false,
        }));

        if (!cancelled) {
          setWorkers(mapped.sort((a, b) => b.rating - a.rating));
        }
      } catch {
        if (!cancelled) setWorkers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shiftId, getShiftDetails, getInterestedClinicians]);

  const mapsUrl = useMemo(
    () =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shift.facilityLabel)}`,
    [shift.facilityLabel],
  );

  const handleApprove = async (worker: WorkerUi) => {
    if (!shiftId) return;
    setApprovingId(worker.id);
    try {
      await assignClinician({ shift_id: shiftId, clinician_id: worker.id });
      appToast.success(
        "Worker approved",
        `${worker.name} has been assigned to this shift.`,
      );
      setWorkers((prev) => prev.filter((w) => w.id !== worker.id));
    } catch (error) {
      appToast.fromError(error, "Failed to approve worker. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Shifts Approvals
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Review and authorize healthcare practitioner shifts for{" "}
            {shift.networkLabel}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-none bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter By Dept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-none bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
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
                  {shift.role}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Timing</p>
                <p className="text-sm font-bold text-neutral-900">
                  {shift.timingStart} – {shift.timingEnd}
                </p>
                <p className="text-xs text-neutral-500">{shift.dateLabel}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Department</p>
                <p className="text-sm font-bold text-neutral-900">
                  {shift.department}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-neutral-500">Hourly Rate</p>
                <p className="text-sm font-bold text-secondary-700">
                  {shift.hourlyRate}
                </p>
              </div>
            </div>
          </div>

          {/* Requirements & Competencies */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Requirements &amp; Competencies
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <ul className="space-y-3">
                {shift.qualifications.map((q) => (
                  <li key={q} className="flex items-start gap-2 text-sm text-neutral-800">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-600" />
                    {q}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="mb-1.5 text-sm font-semibold text-neutral-900">
                  Special Notes
                </p>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {shift.specialNotes}
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
              <p className="text-xs text-neutral-500">
                Sorted by Compatibility Rating
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[76px] animate-pulse rounded-2xl border border-neutral-100 bg-white"
                  />
                ))}
              </div>
            ) : workers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center text-sm text-neutral-500">
                No interested workers yet.
              </div>
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
                          {initials(worker.name)}
                        </div>
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                            worker.online ? "bg-success-500" : "bg-warning-400",
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-neutral-900">
                            {worker.name}
                          </p>
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-neutral-700">
                            <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                            {worker.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {worker.role} • {worker.distanceKm}km away
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Review Profile
                      </Button>
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
                  {shift.avgRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-secondary-600"
                  style={{ width: `${(shift.avgRating / 5) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
              <span className="text-sm text-neutral-600">Avg. Distance</span>
              <span className="text-sm font-bold text-neutral-900">
                {shift.avgDistanceKm}km
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-3">
              <span className="text-sm text-neutral-600">Urgency Level</span>
              <span className="text-sm font-bold text-error-600">
                {shift.urgencyLevel}
              </span>
            </div>
          </div>

          {/* Facility Location */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Facility Location
            </p>
            <p className="mb-3 text-sm font-bold text-neutral-900">
              {shift.facilityLabel}
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
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-secondary-700 hover:text-secondary-900"
            >
              View in Maps
            </a>
          </div>

          {/* Shift Timeline */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Shift Timeline
            </p>
            <ul className="space-y-4">
              {shift.timeline.map((event, i) => (
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
                    {i < shift.timeline.length - 1 && (
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
    </div>
  );
}
