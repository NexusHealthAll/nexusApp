import { ButtonHTMLAttributes } from "react";
import { Button } from "@/shared/components/ui/Button";
import { useCreateShiftModalStore } from "../hooks/useCreateShiftModalStore";
import { useWalletFunding } from "@/features/hospital/hooks/useWalletFunding";
import { useHospitalApprovalStatus } from "@/features/hospital/hooks/useHospitalApprovalStatus";

interface CreateShiftButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  size?: "sm" | "md" | "lg";
}

/**
 * "New Shift" trigger button used across the hospital dashboard/shifts
 * pages. Disabled (with an explanatory tooltip) while either:
 * - the hospital's registration hasn't been approved by an admin yet
 *   (`POST /api/v1/shifts` returns 403 Forbidden in that case), or
 * - the hospital's wallet has no funds (`POST /api/v1/shifts` returns 402
 *   Payment Required in that case)
 * so this pre-empts a doomed 4-step wizard submission. See
 * `useHospitalApprovalStatus`, `useWalletFunding`, and `docs/architecture.md`
 * for the backend context. Approval takes priority in the tooltip since it's
 * the more fundamental block — wallet funding is irrelevant until then.
 */
export function CreateShiftButton({
  className,
  children,
  size = "sm",
  ...props
}: CreateShiftButtonProps) {
  const openCreateShift = useCreateShiftModalStore((s) => s.open);
  const { isLoading: isApprovalLoading, isApproved, status } = useHospitalApprovalStatus();
  const { isLoading: isWalletLoading, isFunded } = useWalletFunding();

  const isLoading = isApprovalLoading || isWalletLoading;
  const disabled = isLoading || !isApproved || !isFunded;

  let title: string | undefined;
  if (!isLoading) {
    if (!isApproved) {
      title =
        status === "rejected"
          ? "Your hospital registration was not approved. Contact support for details."
          : "Your hospital registration is pending admin review.";
    } else if (!isFunded) {
      title = "Fund your hospital wallet before creating a shift.";
    }
  }

  return (
    <Button
      size={size}
      onClick={openCreateShift}
      disabled={disabled}
      title={title}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
