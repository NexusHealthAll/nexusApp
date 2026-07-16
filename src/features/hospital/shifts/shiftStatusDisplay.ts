import type { BadgeVariant } from "@/shared/components/ui/Badge";
import type { ApiShiftStatus } from "./types";

/**
 * Shared display mapping for shift statuses, matching the redesign's pill
 * colors: In Progress (green), Upcoming/Assigned (blue), Open (orange),
 * Completed (neutral), Cancelled/No Show (red).
 */
export const shiftStatusDisplay: Record<
  ApiShiftStatus,
  { label: string; variant: BadgeVariant }
> = {
  in_progress: { label: "In Progress", variant: "success" },
  upcoming: { label: "Upcoming", variant: "info" },
  assigned: { label: "Assigned", variant: "info" },
  open: { label: "Open", variant: "warning" },
  completed: { label: "Completed", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "error" },
  no_show: { label: "No Show", variant: "error" },
};
