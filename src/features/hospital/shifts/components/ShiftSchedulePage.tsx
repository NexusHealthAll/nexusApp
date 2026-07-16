import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  ChevronDown,
  Download,
  Eye,
  MoreVertical,
  Plus,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Dropdown, DropdownItem } from "@/shared/components/ui/Dropdown";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Modal } from "@/shared/components/ui/Modal";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Pagination } from "@/shared/components/ui/Pagination";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { appToast } from "@/shared/components/feedback/toast";
import { PATHS } from "@/routes/paths";
import { cn } from "@/shared/utils/cn";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { useWalletFunding } from "@/features/hospital/hooks/useWalletFunding";
import { useHospitalApprovalStatus } from "@/features/hospital/hooks/useHospitalApprovalStatus";
import { WalletFundingBanner } from "@/features/hospital/components/WalletFundingBanner";
import { shiftStatusDisplay } from "@/features/hospital/shifts/shiftStatusDisplay";
import type {
  ApiShift,
  ApiShiftPriority,
  ApiShiftStatus,
} from "@/features/hospital/shifts/types";

type ShiftTab =
  | "all"
  | "active"
  | "upcoming"
  | "open"
  | "completed"
  | "cancelled";

type SortKey = "date_desc" | "date_asc" | "rate_desc" | "rate_asc";

const PAGE_SIZE = 8;

const tabStatuses: Record<Exclude<ShiftTab, "all">, ApiShiftStatus[]> = {
  active: ["in_progress"],
  upcoming: ["upcoming", "assigned"],
  open: ["open"],
  completed: ["completed"],
  cancelled: ["cancelled", "no_show"],
};

const priorityLabel: Record<ApiShiftPriority, string> = {
  stat: "STAT",
  urgent: "Urgent",
  normal: "Scheduled",
  scheduled: "Scheduled",
};

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "Date (Newest)", value: "date_desc" },
  { label: "Date (Oldest)", value: "date_asc" },
  { label: "Rate (High–Low)", value: "rate_desc" },
  { label: "Rate (Low–High)", value: "rate_asc" },
];

interface ShiftRow {
  shift: ApiShift;
  applicants: number;
}

function shiftRateKobo(s: ApiShift): number {
  if (typeof s.grand_total_kobo === "number" && s.grand_total_kobo > 0) {
    return s.grand_total_kobo;
  }
  const rate = s.effective_rate_kobo_per_hour ?? s.rate_kobo_per_hour;
  if (typeof rate === "number" && rate > 0) {
    return Math.round(rate * s.duration_hours);
  }
  return s.fixed_rate_kobo ?? 0;
}

function rateLabel(s: ApiShift): string {
  const kobo = shiftRateKobo(s);
  return kobo > 0 ? `₦${Math.round(kobo / 100).toLocaleString()}` : "—";
}

function dateTimeLabels(s: ApiShift): { date: string; time: string } {
  const start = new Date(s.scheduled_start);
  const end = new Date(s.scheduled_end);
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  return {
    date: start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: `${fmtTime(start)} - ${fmtTime(end)}`,
  };
}

const CANCELLABLE_STATUSES: ApiShiftStatus[] = ["open", "assigned", "upcoming"];

/** Shift Management list page matching the Figma redesign. */
export function ShiftSchedulePage() {
  const navigate = useNavigate();
  const { getShifts, getShiftApplications, cancelShift } = useHospitalShift();
  const { isLoading: isWalletLoading, isFunded } = useWalletFunding();
  const { isLoading: isApprovalLoading, isApproved } = useHospitalApprovalStatus();

  const [rows, setRows] = useState<ShiftRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [activeTab, setActiveTab] = useState<ShiftTab>("all");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cancelTarget, setCancelTarget] = useState<string[] | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const res = await getShifts({ page: 1, page_size: 100 });
        const mapped = await Promise.all(
          res.shifts.map(async (shift) => {
            let applicants = 0;
            try {
              const apps = await getShiftApplications({
                shift_id: shift.id,
                page: 1,
                page_size: 1,
              });
              applicants = apps.pagination.total_items;
            } catch {
              applicants = 0;
            }
            return { shift, applicants } satisfies ShiftRow;
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
  }, [getShifts, getShiftApplications, reloadKey]);

  const tabCounts = useMemo(() => {
    const count = (tab: Exclude<ShiftTab, "all">) =>
      rows.filter((r) => tabStatuses[tab].includes(r.shift.status)).length;
    return {
      all: rows.length,
      active: count("active"),
      upcoming: count("upcoming"),
      open: count("open"),
      completed: count("completed"),
      cancelled: count("cancelled"),
    };
  }, [rows]);

  const departments = useMemo(() => {
    const values = new Set(
      rows.map((r) => r.shift.department).filter((d): d is string => !!d),
    );
    return Array.from(values).sort();
  }, [rows]);

  const roles = useMemo(() => {
    const values = new Set(rows.map((r) => r.shift.role_title).filter(Boolean));
    return Array.from(values).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const result = rows.filter(({ shift }) => {
      if (activeTab !== "all" && !tabStatuses[activeTab].includes(shift.status)) {
        return false;
      }
      if (department !== "all" && shift.department !== department) return false;
      if (role !== "all" && shift.role_title !== role) return false;
      if (status !== "all" && shift.status !== status) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack =
          `${shift.shift_label ?? ""} ${shift.role_title} ${shift.department ?? ""} ${shift.specialty ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sortKey) {
        case "date_desc":
          return (
            new Date(b.shift.scheduled_start).getTime() -
            new Date(a.shift.scheduled_start).getTime()
          );
        case "date_asc":
          return (
            new Date(a.shift.scheduled_start).getTime() -
            new Date(b.shift.scheduled_start).getTime()
          );
        case "rate_desc":
          return shiftRateKobo(b.shift) - shiftRateKobo(a.shift);
        case "rate_asc":
          return shiftRateKobo(a.shift) - shiftRateKobo(b.shift);
      }
    });

    return result;
  }, [rows, activeTab, department, role, status, search, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, department, role, status, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.has(r.shift.id));

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        pageRows.forEach((r) => next.delete(r.shift.id));
      } else {
        pageRows.forEach((r) => next.add(r.shift.id));
      }
      return next;
    });
  };

  const exportRows = useCallback(
    (toExport: ShiftRow[], filename: string) => {
      downloadCsv(
        filename,
        ["Shift", "Role", "Department", "Date", "Time", "Applicants", "Rate (NGN)", "Status"],
        toExport.map(({ shift, applicants }) => {
          const { date, time } = dateTimeLabels(shift);
          return [
            shift.shift_label ?? shift.role_title,
            shift.role_title,
            shift.department ?? "",
            date,
            time,
            applicants,
            Math.round(shiftRateKobo(shift) / 100),
            shiftStatusDisplay[shift.status].label,
          ];
        }),
      );
    },
    [],
  );

  const handleBulkCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const cancellable = rows.filter(
        (r) =>
          cancelTarget.includes(r.shift.id) &&
          CANCELLABLE_STATUSES.includes(r.shift.status),
      );
      await Promise.all(
        cancellable.map((r) =>
          cancelShift({ shift_id: r.shift.id, reason: "Cancelled by hospital" }),
        ),
      );
      appToast.success(
        `${cancellable.length} shift${cancellable.length === 1 ? "" : "s"} cancelled`,
      );
      setSelected(new Set());
      setReloadKey((k) => k + 1);
    } catch (err) {
      appToast.fromError(err, "Unable to cancel shifts");
    } finally {
      setIsCancelling(false);
      setCancelTarget(null);
    }
  };

  const selectOptions = (
    values: string[],
    allLabel: string,
  ): { value: string; label: string }[] => [
    { value: "all", label: allLabel },
    ...values.map((v) => ({ value: v, label: v })),
  ];

  return (
    <div>
      <PageHeader
        title="Shift Management"
        breadcrumbs={[
          { label: "Dashboard", href: PATHS.hospital.dashboard },
          { label: "Shift Management" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportRows(filteredRows, "shifts.csv")}
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {!isApprovalLoading && isApproved && !isWalletLoading && !isFunded && (
        <div className="mb-6">
          <WalletFundingBanner />
        </div>
      )}

      <UnderlineTabs<ShiftTab>
        options={[
          { label: "All Shifts", value: "all", count: tabCounts.all },
          { label: "Active", value: "active", count: tabCounts.active },
          { label: "Upcoming", value: "upcoming", count: tabCounts.upcoming },
          { label: "Open", value: "open", count: tabCounts.open },
          { label: "Completed", value: "completed", count: tabCounts.completed },
          { label: "Cancelled", value: "cancelled", count: tabCounts.cancelled },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* Filter row */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search shifts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="w-full sm:w-56"
        />
        <Select
          options={selectOptions(departments, "All Departments")}
          value={department}
          onChange={setDepartment}
          containerClassName="w-44"
          className="bg-white py-2"
        />
        <Select
          options={selectOptions(roles, "All Roles")}
          value={role}
          onChange={setRole}
          containerClassName="w-40"
          className="bg-white py-2"
        />
        <Select
          options={[
            { value: "all", label: "All Statuses" },
            ...Object.entries(shiftStatusDisplay).map(([value, d]) => ({
              value,
              label: d.label,
            })),
          ]}
          value={status}
          onChange={setStatus}
          containerClassName="w-40"
          className="bg-white py-2"
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-neutral-400">Sort:</span>
          <Dropdown
            align="right"
            trigger={
              <span className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                {sortOptions.find((o) => o.value === sortKey)?.label}
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </span>
            }
            panelClassName="w-44"
          >
            {sortOptions.map((option) => (
              <DropdownItem
                key={option.value}
                active={option.value === sortKey}
                onClick={() => setSortKey(option.value)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-4 bg-neutral-900 px-5 py-3 text-sm text-white">
            <span className="font-semibold">
              {selected.size} shift{selected.size === 1 ? "" : "s"} selected
            </span>
            <span className="hidden h-5 w-px bg-white/20 sm:block" />
            <button
              onClick={() =>
                exportRows(
                  rows.filter((r) => selected.has(r.shift.id)),
                  "selected-shifts.csv",
                )
              }
              className="flex items-center gap-1.5 font-medium text-white/80 transition-colors hover:text-white"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setCancelTarget(Array.from(selected))}
              className="ml-auto rounded-lg bg-error-600 px-4 py-1.5 font-semibold transition-colors hover:bg-error-700"
            >
              Cancel Shifts
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : pageRows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<EmptyStateIcon icon={CalendarPlus} />}
              title={rows.length === 0 ? "No shifts yet" : "No shifts found"}
              description={
                rows.length === 0
                  ? "Broadcast your first shift and it will show up here with its applicants and status."
                  : "Try a different filter or search term, or create a new shift."
              }
              action={
                <button
                  onClick={() => navigate(PATHS.hospital.createShift)}
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Shift
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      className="h-4 w-4 rounded accent-primary-600"
                    />
                  </th>
                  <th className="py-3 pr-4 font-semibold">Shift</th>
                  <th className="py-3 pr-4 font-semibold">Department</th>
                  <th className="py-3 pr-4 font-semibold">Date & Time</th>
                  <th className="py-3 pr-4 font-semibold">Assigned</th>
                  <th className="py-3 pr-4 text-center font-semibold">
                    Applicants
                  </th>
                  <th className="py-3 pr-4 font-semibold">Rate</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="w-10 py-3 pr-4" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ shift, applicants }) => {
                  const statusDisplay = shiftStatusDisplay[shift.status];
                  const { date, time } = dateTimeLabels(shift);
                  const isSelected = selected.has(shift.id);
                  return (
                    <tr
                      key={shift.id}
                      className={cn(
                        "border-b border-neutral-50 transition-colors last:border-b-0 hover:bg-neutral-50/60",
                        isSelected && "bg-primary-50/40",
                      )}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(shift.id)}
                          className="h-4 w-4 rounded accent-primary-600"
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <button
                          onClick={() =>
                            navigate(PATHS.hospital.shiftDetail(shift.id))
                          }
                          className="text-left"
                        >
                          <p className="font-semibold text-neutral-900 hover:underline">
                            {shift.shift_label ?? shift.role_title}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {shift.role_title} · {priorityLabel[shift.priority]}
                          </p>
                        </button>
                      </td>
                      <td className="py-4 pr-4 text-neutral-600">
                        {shift.department ?? "—"}
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-medium text-neutral-800">{date}</p>
                        <p className="mt-0.5 text-xs text-neutral-400">{time}</p>
                      </td>
                      <td className="py-4 pr-4">
                        {shift.assigned_clinician_id ? (
                          <span className="flex items-center gap-2">
                            <AvatarInitials
                              name={shift.assigned_clinician_id}
                              className="bg-primary-600 text-white"
                            />
                            <span className="text-neutral-800">Assigned</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-center text-neutral-700">
                        {applicants}
                      </td>
                      <td className="py-4 pr-4 font-bold text-neutral-900">
                        {rateLabel(shift)}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={statusDisplay.variant}
                          className="uppercase tracking-wide"
                        >
                          {statusDisplay.label}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Dropdown
                          align="right"
                          trigger={
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
                              <MoreVertical className="h-4 w-4" />
                            </span>
                          }
                          panelClassName="w-52"
                        >
                          <DropdownItem
                            onClick={() =>
                              navigate(PATHS.hospital.shiftDetail(shift.id))
                            }
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownItem>
                          {applicants > 0 && (
                            <DropdownItem
                              onClick={() =>
                                navigate(
                                  `${PATHS.hospital.shiftDetail(shift.id)}/review`,
                                )
                              }
                            >
                              <Users className="h-4 w-4" />
                              Review Applications
                            </DropdownItem>
                          )}
                          {CANCELLABLE_STATUSES.includes(shift.status) && (
                            <DropdownItem
                              destructive
                              onClick={() => setCancelTarget([shift.id])}
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel Shift
                            </DropdownItem>
                          )}
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredRows.length > 0 && (
          <div className="border-t border-neutral-100 px-5 py-4">
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              summary={`Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(
                page * PAGE_SIZE,
                filteredRows.length,
              )} of ${filteredRows.length} shifts`}
            />
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      <Modal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel shifts"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            {cancelTarget && cancelTarget.length === 1
              ? "This shift will be cancelled and removed from the marketplace."
              : `Open, assigned, and upcoming shifts among the ${cancelTarget?.length ?? 0} selected will be cancelled and removed from the marketplace.`}{" "}
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelTarget(null)}
            >
              Keep Shifts
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleBulkCancel}
            >
              Cancel Shifts
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
