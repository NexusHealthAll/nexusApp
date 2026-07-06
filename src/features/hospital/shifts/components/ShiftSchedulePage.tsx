import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge, BadgeVariant } from "@/shared/components/ui/Badge";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { PATHS } from "@/routes/paths";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { useCreateShiftModalStore } from "@/features/hospital/shifts/hooks/useCreateShiftModalStore";
import type { ApiShiftPriority, ApiShiftStatus } from "@/features/hospital/shifts/types";

type ShiftTab = "all" | "in_progress" | "open" | "upcoming" | "completed";

type ShiftRow = {
  id: string;
  roleTitle: string;
  specialty?: string;
  dateLabel: string;
  timeLabel: string;
  rateLabel: string;
  priority: ApiShiftPriority;
  interested: number;
  status: ApiShiftStatus;
  isAssigned: boolean;
};

const tabOptions: { label: string; value: ShiftTab }[] = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in_progress" },
  { label: "Open", value: "open" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
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

function formatDateTime(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const validStart = !Number.isNaN(s.getTime()) ? s : undefined;
  const validEnd = !Number.isNaN(e.getTime()) ? e : undefined;

  const dateLabel = validStart
    ? validStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const fmtTime = (d?: Date) =>
    d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : undefined;

  const timeLabel = validStart
    ? `${fmtTime(validStart)}${validEnd ? `–${fmtTime(validEnd)}` : ""}`
    : "—";

  return { dateLabel, timeLabel };
}

function formatRate(s: { rate_kobo_per_hour?: number | null; fixed_rate_kobo?: number | null }): string {
  if (typeof s.rate_kobo_per_hour === "number" && s.rate_kobo_per_hour > 0) {
    return `₦${Math.round(s.rate_kobo_per_hour / 100).toLocaleString()}/hr`;
  }
  if (typeof s.fixed_rate_kobo === "number" && s.fixed_rate_kobo > 0) {
    return `₦${Math.round(s.fixed_rate_kobo / 100).toLocaleString()}`;
  }
  return "—";
}

export function ShiftSchedulePage() {
  const navigate = useNavigate();
  const { getShifts, getShiftApplications } = useHospitalShift();
  const openCreateShift = useCreateShiftModalStore((s) => s.open);
  const refreshKey = useCreateShiftModalStore((s) => s.refreshKey);

  const [activeTab, setActiveTab] = useState<ShiftTab>("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ShiftRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const res = await getShifts({ page: 1, page_size: 50 });

        const mapped: ShiftRow[] = await Promise.all(
          res.shifts.map(async (s) => {
            const { dateLabel, timeLabel } = formatDateTime(
              s.scheduled_start,
              s.scheduled_end,
            );

            let interested = 0;
            try {
              const appsRes = await getShiftApplications({
                shift_id: s.id,
                page: 1,
                page_size: 1,
              });
              interested = appsRes.pagination.total_items;
            } catch {
              interested = 0;
            }

            return {
              id: s.id,
              roleTitle: s.role_title,
              specialty: s.specialty ?? s.department ?? undefined,
              dateLabel,
              timeLabel,
              rateLabel: formatRate(s),
              priority: s.priority,
              interested,
              status: s.status,
              isAssigned: Boolean(s.assigned_clinician_id),
            } satisfies ShiftRow;
          }),
        );

        if (!cancelled) setRows(mapped);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [getShifts, getShiftApplications, refreshKey]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (activeTab !== "all" && row.status !== activeTab) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${row.roleTitle} ${row.specialty ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, activeTab, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Shift Management</h1>
          <p className="text-sm text-neutral-400">{rows.length} total shifts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-lg text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={openCreateShift}
            className="flex items-center gap-1.5 rounded-lg bg-secondary-600 text-xs font-semibold text-white hover:bg-secondary-700"
          >
            <Plus className="h-3.5 w-3.5" />
            New Shift
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <FilterTabs options={tabOptions} value={activeTab} onChange={setActiveTab} />
          <SearchInput
            placeholder="Search shifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="ml-auto w-full max-w-xs"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-10 text-center">
            <p className="text-sm font-semibold text-neutral-800">No shifts found</p>
            <p className="max-w-[240px] text-xs text-neutral-400">
              Try a different filter or search term, or create a new shift.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-neutral-400">
                  <th className="pb-3 font-medium">Shift ID</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Rate</th>
                  <th className="pb-3 font-medium">Urgency</th>
                  <th className="pb-3 font-medium">Interested</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Worker</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const urgency = priorityBadge[row.priority];
                  const status = statusBadge[row.status];
                  return (
                    <tr key={row.id} className="border-t border-neutral-50">
                      <td className="py-3 pr-4 font-medium text-neutral-500">
                        {row.id.slice(0, 8)}…
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-neutral-900">
                          {row.roleTitle}
                        </p>
                        {row.specialty && (
                          <p className="text-xs text-neutral-400">
                            {row.specialty}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-neutral-600">
                        <p>{row.dateLabel}</p>
                        <p className="text-xs text-neutral-400">{row.timeLabel}</p>
                      </td>
                      <td className="py-3 pr-4 font-medium text-neutral-800">
                        {row.rateLabel}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={urgency.variant}>{urgency.label}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-neutral-600">
                        {row.interested}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {row.isAssigned ? (
                          <Badge variant="info">Assigned</Badge>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(PATHS.hospital.shiftDetail(row.id))}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-secondary-700 hover:text-secondary-900"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
