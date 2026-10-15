import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import type { ApiShiftType } from "@/features/hospital/shifts/types";

/** Shared color mapping for shift type, reused anywhere a shift type is shown. */
export const shiftTypeDisplay: Record<ApiShiftType, { label: string; variant: BadgeVariant }> = {
  in_person: { label: "In-person", variant: "info" },
  virtual: { label: "Virtual", variant: "purple" },
};

export function ShiftTypeBadge({
  shiftType,
  className,
}: {
  shiftType: ApiShiftType;
  className?: string;
}) {
  const display = shiftTypeDisplay[shiftType];
  return (
    <Badge variant={display.variant} className={className}>
      {display.label}
    </Badge>
  );
}
