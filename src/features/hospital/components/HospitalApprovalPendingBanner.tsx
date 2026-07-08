import { ShieldAlert } from "lucide-react";
import { useHospitalApprovalStatus } from "@/features/hospital/hooks/useHospitalApprovalStatus";

/**
 * Persistent notice shown across every hospital page while the hospital's
 * registration hasn't been approved by an admin yet — the same condition
 * that blocks shift creation server-side (see `useHospitalApprovalStatus`).
 */
export function HospitalApprovalPendingBanner() {
  const { isLoading, isApproved, status } = useHospitalApprovalStatus();

  if (isLoading || isApproved) return null;

  const isRejected = status === "rejected";

  return (
    <div
      className={
        isRejected
          ? "flex items-center gap-3 border-b border-error-200 bg-error-50 px-4 py-2.5 lg:px-6"
          : "flex items-center gap-3 border-b border-warning-200 bg-warning-50 px-4 py-2.5 lg:px-6"
      }
    >
      <ShieldAlert
        className={
          isRejected
            ? "h-4 w-4 flex-shrink-0 text-error-600"
            : "h-4 w-4 flex-shrink-0 text-warning-600"
        }
      />
      <p
        className={
          isRejected
            ? "text-sm font-medium text-error-800"
            : "text-sm font-medium text-warning-800"
        }
      >
        {isRejected
          ? "Your hospital registration was not approved. Contact support for details."
          : "Your hospital registration is pending admin review. Some features, including creating shifts, are unavailable until it's approved."}
      </p>
    </div>
  );
}
