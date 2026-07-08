import apiClient from "@/lib/apiClient";
import { formatKobo } from "@/shared/utils/currency";
import type { BadgeVariant } from "@/shared/components/ui/Badge";
import type {
  ApiShift,
  ApiShiftListResponse,
  ApiShiftPriority,
} from "@/features/hospital/shifts/types";

export interface OverviewStats {
  shiftsFilledThisMonth: number;
  shiftsFilledTotal: number;
  shiftsFilledTrendPct?: number;
  activeNow: number;
  activeNowTrendDelta?: number;
  openShifts: number;
  openShiftsTrendDelta?: number;
  payrollThisWeek: string;
  payrollThisWeekTrendPct?: number;
}

export interface FillRatePoint {
  month: string;
  filled: number;
}

export interface RoleHiredSlice {
  role: string;
  percentage: number;
  colorClass: string;
  dotClass: string;
}

export interface AnalyticsStats {
  shiftsThisMonth: number;
  shiftsRemaining: number;
  shiftsTrendPct?: number;
  fillRate: number;
  fillRateTrendPp?: number;
  fillRateLastMonth?: number;
  avgTimeToFill: string;
  avgTimeToFillTrendLabel?: string;
  statAvgTimeToFill: string;
  totalPayroll: string;
  totalPayrollTrendPct?: number;
  totalPayrollMonthLabel: string;
}

export interface WeeklyPayrollPoint {
  week: string;
  amount: number;
}

export interface FillRateTrendPoint {
  month: string;
  rate: number;
}

export interface UrgencyBreakdownRow {
  label: string;
  count: number;
  percentage: number;
  variant: BadgeVariant;
}

const FILLED_STATUSES = new Set(["assigned", "upcoming", "in_progress", "completed"]);

const roleColors: Record<string, { colorClass: string; dotClass: string }> = {
  doctor: { colorClass: "#2563eb", dotClass: "bg-blue-600" },
  nurse: { colorClass: "#16a34a", dotClass: "bg-success-600" },
  lab_technician: { colorClass: "#f59e0b", dotClass: "bg-warning-500" },
  pharmacist: { colorClass: "#9333ea", dotClass: "bg-purple-600" },
  radiographer: { colorClass: "#0891b2", dotClass: "bg-cyan-600" },
};

function roleLabel(roleCategory: string): string {
  return roleCategory
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shiftAmountKobo(s: ApiShift): number {
  if (typeof s.grand_total_kobo === "number") return s.grand_total_kobo;
  const rate = s.effective_rate_kobo_per_hour ?? s.rate_kobo_per_hour;
  if (typeof rate === "number") return Math.round(rate * s.duration_hours);
  return s.fixed_rate_kobo ?? 0;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short" });
}

/** Last N calendar months, oldest first, as { key, date, label }. */
function recentMonths(n: number): { key: string; date: Date; label: string }[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, date: d, label: monthLabel(d) };
  });
}

/**
 * Hospital operations metrics for the Dashboard and Analytics pages,
 * computed client-side from the real `GET /api/v1/shifts` endpoint (see
 * nexus-backend `src/handlers/shifts.rs`). The backend has no dedicated
 * reporting/aggregation endpoint yet, so figures like payroll and fill rate
 * are derived here from a recent page of shifts rather than fabricated.
 * Metrics with no real historical baseline (e.g. trend deltas) are simply
 * omitted rather than invented.
 */
export class HospitalMetricsService {
  private static async fetchRecentShifts(pageSize = 200): Promise<ApiShift[]> {
    const res = await apiClient.get<ApiShiftListResponse>("/api/v1/shifts", {
      params: { page: 1, page_size: pageSize },
    });
    return res.data.shifts;
  }

  private static async countByStatus(status: string): Promise<number> {
    const res = await apiClient.get<ApiShiftListResponse>("/api/v1/shifts", {
      params: { status, page: 1, page_size: 1 },
    });
    return res.data.pagination.total_items;
  }

  static async getOverviewStats(): Promise<OverviewStats> {
    const [openShifts, activeNow, shifts] = await Promise.all([
      this.countByStatus("open"),
      this.countByStatus("in_progress"),
      this.fetchRecentShifts(),
    ]);

    const now = new Date();
    const thisMonthShifts = shifts.filter((s) => {
      const d = new Date(s.scheduled_start);
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    });
    const shiftsFilledThisMonth = thisMonthShifts.filter((s) =>
      FILLED_STATUSES.has(s.status),
    ).length;

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const payrollThisWeekKobo = shifts
      .filter(
        (s) => s.billing_triggered_at && new Date(s.billing_triggered_at) >= weekAgo,
      )
      .reduce((sum, s) => sum + shiftAmountKobo(s), 0);

    return {
      shiftsFilledThisMonth,
      shiftsFilledTotal: thisMonthShifts.length,
      openShifts,
      activeNow,
      payrollThisWeek: formatKobo(payrollThisWeekKobo),
    };
  }

  static async getFillRateSeries(): Promise<{
    avgFillRate: number;
    points: FillRatePoint[];
  }> {
    const shifts = await this.fetchRecentShifts();
    const months = recentMonths(6);

    const points = months.map(({ key, label }) => {
      const inMonth = shifts.filter((s) => monthKey(s.scheduled_start) === key);
      const filled = inMonth.filter((s) => FILLED_STATUSES.has(s.status)).length;
      return { month: label, filled };
    });

    const totalInRange = shifts.filter((s) =>
      months.some((m) => m.key === monthKey(s.scheduled_start)),
    );
    const filledInRange = totalInRange.filter((s) => FILLED_STATUSES.has(s.status));
    const avgFillRate =
      totalInRange.length > 0
        ? Math.round((filledInRange.length / totalInRange.length) * 100)
        : 0;

    return { avgFillRate, points };
  }

  static async getRolesHiredBreakdown(): Promise<RoleHiredSlice[]> {
    const shifts = await this.fetchRecentShifts();
    const hired = shifts.filter((s) => FILLED_STATUSES.has(s.status));
    if (hired.length === 0) return [];

    const counts = new Map<string, number>();
    for (const s of hired) {
      counts.set(s.role_category, (counts.get(s.role_category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => {
        const colors = roleColors[role] ?? { colorClass: "#94a3b8", dotClass: "bg-neutral-400" };
        return {
          role: roleLabel(role),
          percentage: Math.round((count / hired.length) * 100),
          ...colors,
        };
      });
  }

  static async getAnalyticsStats(): Promise<AnalyticsStats> {
    const [overview, fillRate] = await Promise.all([
      this.getOverviewStats(),
      this.getFillRateSeries(),
    ]);
    const shifts = await this.fetchRecentShifts();

    const filledShifts = shifts.filter(
      (s) => FILLED_STATUSES.has(s.status) && s.status !== "upcoming",
    );
    const timeToFillHours = filledShifts.map(
      (s) => (new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()) / 3_600_000,
    );
    const avgHours =
      timeToFillHours.length > 0
        ? timeToFillHours.reduce((a, b) => a + b, 0) / timeToFillHours.length
        : 0;

    const statFilled = filledShifts.filter((s) => s.priority === "stat");
    const statHours = statFilled.map(
      (s) => (new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()) / 3_600_000,
    );
    const avgStatHours =
      statHours.length > 0 ? statHours.reduce((a, b) => a + b, 0) / statHours.length : 0;

    const now = new Date();
    const monthShifts = shifts.filter((s) => {
      const d = new Date(s.scheduled_start);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const monthPayrollKobo = monthShifts.reduce((sum, s) => sum + shiftAmountKobo(s), 0);

    return {
      shiftsThisMonth: overview.shiftsFilledTotal,
      shiftsRemaining: overview.shiftsFilledTotal - overview.shiftsFilledThisMonth,
      fillRate: fillRate.avgFillRate,
      avgTimeToFill: timeToFillHours.length > 0 ? `${avgHours.toFixed(1)}h` : "—",
      statAvgTimeToFill: statHours.length > 0 ? `${avgStatHours.toFixed(1)}h` : "—",
      totalPayroll: formatKobo(monthPayrollKobo),
      totalPayrollMonthLabel: now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }

  static async getWeeklyPayrollSeries(): Promise<WeeklyPayrollPoint[]> {
    const shifts = await this.fetchRecentShifts();
    const now = new Date();
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const end = new Date(now.getTime() - (5 - i) * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { label: `W${i + 1}`, start, end };
    });

    return weeks.map(({ label, start, end }) => {
      const amount = shifts
        .filter((s) => {
          if (!s.billing_triggered_at) return false;
          const t = new Date(s.billing_triggered_at);
          return t >= start && t < end;
        })
        .reduce((sum, s) => sum + shiftAmountKobo(s), 0);
      return { week: label, amount: Math.round(amount / 100) };
    });
  }

  static async getFillRateTrendSeries(): Promise<FillRateTrendPoint[]> {
    const shifts = await this.fetchRecentShifts();
    const months = recentMonths(6);

    return months.map(({ key, label }) => {
      const inMonth = shifts.filter((s) => monthKey(s.scheduled_start) === key);
      const filled = inMonth.filter((s) => FILLED_STATUSES.has(s.status)).length;
      const rate = inMonth.length > 0 ? Math.round((filled / inMonth.length) * 100) : 0;
      return { month: label, rate };
    });
  }

  static async getUrgencyBreakdown(): Promise<UrgencyBreakdownRow[]> {
    const shifts = await this.fetchRecentShifts();
    if (shifts.length === 0) return [];

    const variantByPriority: Record<ApiShiftPriority, BadgeVariant> = {
      stat: "error",
      urgent: "warning",
      normal: "success",
      scheduled: "info",
    };
    const labelByPriority: Record<ApiShiftPriority, string> = {
      stat: "STAT",
      urgent: "Urgent",
      normal: "Normal",
      scheduled: "Scheduled",
    };

    const counts = new Map<ApiShiftPriority, number>();
    for (const s of shifts) {
      counts.set(s.priority, (counts.get(s.priority) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([priority, count]) => ({
        label: labelByPriority[priority],
        count,
        percentage: Math.round((count / shifts.length) * 100),
        variant: variantByPriority[priority],
      }));
  }
}
