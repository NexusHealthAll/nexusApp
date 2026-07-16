import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  UserSearch,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { appToast } from "@/shared/components/feedback/toast";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import {
  useHospitalShift,
  type RankedInterestedClinician,
  type ShiftApplication,
} from "@/features/hospital/shifts/hooks/useHospitalShift";

type ReviewDecision = "accepted" | "rejected";

/**
 * Full-screen applicant review flow (Figma "Review Application" / "Confirm
 * Application"): one applicant at a time with Prev/Next, and
 * Reject / Message / Accept & Assign actions. Accepting calls the real
 * `POST /shifts/{id}/assign`; rejection is client-side only for now — the
 * backend has no reject-application endpoint yet.
 */
export function ReviewApplicationsPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { getShiftApplications, getInterestedClinicians, assignClinician } =
    useHospitalShift();

  const [applications, setApplications] = useState<ShiftApplication[]>([]);
  const [ranked, setRanked] = useState<RankedInterestedClinician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>({});
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!shiftId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [apps, interested] = await Promise.all([
          getShiftApplications({ shift_id: shiftId!, page: 1, page_size: 50 }),
          getInterestedClinicians(shiftId!).catch(
            () => [] as RankedInterestedClinician[],
          ),
        ]);
        if (cancelled) return;
        setApplications(apps.applications);
        setRanked(interested);
      } catch {
        if (!cancelled) setApplications([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [shiftId, getShiftApplications, getInterestedClinicians]);

  const current = applications[index];

  const rankedInfo = useMemo(
    () =>
      current
        ? ranked.find((r) => r.clinician_id === current.clinician_id)
        : undefined,
    [current, ranked],
  );

  const decision: ReviewDecision | undefined = current
    ? decisions[current.id] ??
      (current.status === "accepted" || current.status === "assigned"
        ? "accepted"
        : current.status === "rejected"
          ? "rejected"
          : undefined)
    : undefined;

  const backToShift = () =>
    navigate(shiftId ? PATHS.hospital.shiftDetail(shiftId) : PATHS.hospital.shifts);

  const handleAccept = async () => {
    if (!shiftId || !current) return;
    setIsAssigning(true);
    try {
      await assignClinician({
        shift_id: shiftId,
        clinician_id: current.clinician_id,
      });
      setDecisions((prev) => ({ ...prev, [current.id]: "accepted" }));
      appToast.success(`${current.applicant_name} assigned to this shift`);
    } catch (err) {
      appToast.fromError(err, "Unable to assign this applicant");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReject = () => {
    if (!current) return;
    setDecisions((prev) => ({ ...prev, [current.id]: "rejected" }));
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-neutral-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex h-14 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
        <button
          onClick={backToShift}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-800 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shift
        </button>

        {applications.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">
              Applicant {Math.min(index + 1, applications.length)} of{" "}
              {applications.length}
            </span>
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="flex h-8 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() =>
                setIndex((i) => Math.min(applications.length - 1, i + 1))
              }
              disabled={index >= applications.length - 1}
              className="flex h-8 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {isLoading ? (
          <Skeleton className="h-[480px] w-full rounded-2xl" />
        ) : !current ? (
          <EmptyState
            icon={<EmptyStateIcon icon={UserSearch} />}
            title="No applications yet"
            description="Applicants for this shift will appear here for review."
            action={
              <button
                onClick={backToShift}
                className="mt-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Back to Shift
              </button>
            }
          />
        ) : (
          <>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft">
              {/* Identity */}
              <div className="flex items-start gap-4">
                <AvatarInitials
                  name={current.applicant_name}
                  className="h-14 w-14 bg-secondary-600 text-lg font-bold text-white"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-neutral-900">
                    {current.applicant_name}
                  </h1>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {current.role} • {current.years_experience} yrs experience
                  </p>
                </div>
                {decision === "accepted" ? (
                  <Badge variant="success">Accepted</Badge>
                ) : decision === "rejected" ? (
                  <Badge variant="error">Rejected</Badge>
                ) : (
                  <Badge variant="warning" className="uppercase tracking-wide">
                    Pending Review
                  </Badge>
                )}
              </div>

              {/* Stats strip */}
              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 sm:grid-cols-4">
                {[
                  {
                    label: "Rating",
                    value: rankedInfo ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
                        {rankedInfo.rating.toFixed(2)}
                      </span>
                    ) : (
                      "—"
                    ),
                  },
                  {
                    label: "Distance",
                    value:
                      rankedInfo?.distance_km != null
                        ? `${rankedInfo.distance_km.toFixed(1)} km`
                        : "—",
                  },
                  {
                    label: "Shifts Done",
                    value: rankedInfo?.completed_shifts ?? "—",
                  },
                  {
                    label: "License",
                    value: current.license_number ? (
                      <span className="font-semibold text-success-600">
                        Verified
                      </span>
                    ) : (
                      <span className="font-semibold text-warning-600">
                        Pending
                      </span>
                    ),
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-neutral-50/80 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      {stat.label}
                    </p>
                    <div className="mt-1 text-sm font-bold text-neutral-900">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Application note */}
              {current.experience_summary && (
                <div className="mt-6">
                  <h2 className="text-sm font-bold text-neutral-900">
                    Application Note
                  </h2>
                  <div className="mt-2 rounded-xl bg-neutral-50 px-4 py-3.5 text-sm leading-relaxed text-neutral-600">
                    {current.experience_summary}
                  </div>
                </div>
              )}

              {/* License */}
              {current.license_number && (
                <div className="mt-6">
                  <h2 className="text-sm font-bold text-neutral-900">
                    Certificates & Qualifications
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      License {current.license_number}
                    </span>
                    {rankedInfo?.quals_match && (
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                        Meets shift qualifications
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions / confirmation */}
            {decision === "accepted" ? (
              <div className="mt-6 rounded-xl bg-success-50 px-6 py-4 text-center text-sm font-semibold text-success-700">
                {current.applicant_name} has been accepted for this shift.
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={handleReject}
                  disabled={decision === "rejected"}
                  className={cn(
                    "h-12 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-error-600 transition-colors hover:bg-error-50",
                    decision === "rejected" && "opacity-50",
                  )}
                >
                  {decision === "rejected" ? "Rejected" : "Reject Applicant"}
                </button>
                <button
                  onClick={() => navigate(PATHS.hospital.messages)}
                  className="h-12 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-50"
                >
                  Message
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isAssigning || decision === "rejected"}
                  className="h-12 rounded-xl bg-secondary-700 text-sm font-bold text-white transition-colors hover:bg-secondary-800 disabled:opacity-50"
                >
                  {isAssigning ? "Assigning..." : "Accept & Assign to Shift"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
