import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { Badge, BadgeVariant } from "@/shared/components/ui/Badge";
import { PATHS } from "@/routes/paths";
import { formatDate } from "@/shared/utils/date";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { useCreateShiftModalStore } from "@/features/hospital/shifts/hooks/useCreateShiftModalStore";
import { CreateShiftButton } from "@/features/hospital/shifts/components/CreateShiftButton";
import { useWalletFunding } from "@/features/hospital/hooks/useWalletFunding";
import { useHospitalApprovalStatus } from "@/features/hospital/hooks/useHospitalApprovalStatus";
import { WalletFundingBanner } from "@/features/hospital/components/WalletFundingBanner";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import type { ApiShiftPriority } from "@/features/hospital/shifts/types";

type OpenShiftUi = {
  shiftId: string;
  roleTitle: string;
  dateLabel: string;
  rateLabel: string;
  priority: ApiShiftPriority;
  interestedCount: number;
  topApplicantName?: string;
};

const priorityBadge: Record<ApiShiftPriority, { variant: BadgeVariant; label: string }> = {
  stat: { variant: "error", label: "STAT" },
  urgent: { variant: "warning", label: "Urgent" },
  normal: { variant: "success", label: "Normal" },
  scheduled: { variant: "info", label: "Scheduled" },
};

function formatRate(s: { rate_kobo_per_hour?: number | null; fixed_rate_kobo?: number | null }): string {
  if (typeof s.rate_kobo_per_hour === "number" && s.rate_kobo_per_hour > 0) {
    return `₦${Math.round(s.rate_kobo_per_hour / 100).toLocaleString()}/hr`;
  }
  if (typeof s.fixed_rate_kobo === "number" && s.fixed_rate_kobo > 0) {
    return `₦${Math.round(s.fixed_rate_kobo / 100).toLocaleString()}`;
  }
  return "—";
}

export function OpenShiftsSection() {
  const navigate = useNavigate();
  const { getShifts, getShiftApplications } = useHospitalShift();
  const refreshKey = useCreateShiftModalStore((s) => s.refreshKey);
  const { isLoading: isWalletLoading, isFunded } = useWalletFunding();
  const { isLoading: isApprovalLoading, isApproved } = useHospitalApprovalStatus();

  const [isLoading, setIsLoading] = useState(false);
  const [shifts, setShifts] = useState<OpenShiftUi[]>([]);

  const load = async () => {
    setIsLoading(true);
    try {
      const shiftsRes = await getShifts({ status: "open", page: 1, page_size: 5 });
      const list = shiftsRes.shifts.slice(0, 5);

      const nextShifts: OpenShiftUi[] = await Promise.all(
        list.map(async (s) => {
          const appsRes = await getShiftApplications({
            shift_id: s.id,
            page: 1,
            page_size: 50,
          });

          return {
            shiftId: s.id,
            roleTitle: s.role_title,
            dateLabel: formatDate(s.scheduled_start),
            rateLabel: formatRate(s),
            priority: s.priority,
            interestedCount: appsRes.pagination.total_items,
            topApplicantName: appsRes.applications[0]?.applicant_name,
          } satisfies OpenShiftUi;
        }),
      );

      setShifts(nextShifts);
    } catch {
      setShifts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useMemo(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">Open Shifts</h2>
        <CreateShiftButton className="flex items-center gap-1.5 rounded-lg bg-secondary-600 text-xs font-semibold text-white hover:bg-secondary-700">
          <Plus className="h-3.5 w-3.5" />
          New shift
        </CreateShiftButton>
      </div>

      {!isApprovalLoading && isApproved && !isWalletLoading && !isFunded && (
        <WalletFundingBanner className="mb-4" />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[56px] animate-pulse rounded-xl bg-neutral-50"
            />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <EmptyState
          className="min-h-[220px]"
          icon={
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Clipboard body */}
              <rect x="18" y="22" width="54" height="62" rx="10" fill="#EFF6FF" />
              <rect x="18" y="22" width="54" height="62" rx="10" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Clipboard clip */}
              <rect x="34" y="16" width="22" height="14" rx="5" fill="#BFDBFE" />
              <rect x="38" y="20" width="14" height="6" rx="3" fill="#93C5FD" />
              {/* Lines */}
              <rect x="28" y="44" width="34" height="3.5" rx="1.75" fill="#DBEAFE" />
              <rect x="28" y="53" width="26" height="3.5" rx="1.75" fill="#DBEAFE" />
              <rect x="28" y="62" width="30" height="3.5" rx="1.75" fill="#DBEAFE" />
              {/* Magnifier */}
              <circle cx="66" cy="62" r="18" fill="#EFF6FF" />
              <circle cx="66" cy="62" r="18" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="63" cy="59" r="9" stroke="#3B82F6" strokeWidth="2.5" fill="none" />
              <line x1="69.5" y1="65.5" x2="76" y2="72" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              {/* Magnifier shine */}
              <circle cx="59.5" cy="55.5" r="2" fill="white" fillOpacity="0.7" />
            </svg>
          }
          title="No open shifts"
          description="Open shifts will appear here once you post one."
        />
      ) : (
        <div className="divide-y divide-neutral-50">
          {shifts.map((shift) => {
            const badge = priorityBadge[shift.priority];
            return (
              <button
                key={shift.shiftId}
                type="button"
                onClick={() => navigate(PATHS.hospital.shiftDetail(shift.shiftId))}
                className="flex w-full items-center justify-between gap-3 py-3 text-left first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span className="text-xs text-neutral-400">
                      {shift.interestedCount} interested
                    </span>
                  </div>
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {shift.roleTitle}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {[shift.dateLabel, shift.rateLabel].filter(Boolean).join(" • ")}
                    {shift.topApplicantName ? ` • Top: ${shift.topApplicantName}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-300" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
