import apiClient from "@/lib/apiClient";
import { formatKobo } from "@/shared/utils/currency";
import { WalletService } from "./walletService";
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

export interface DashboardHeroStats {
  weeklyRevenue: string;
  fillRatePct: number;
  openShifts: number;
  urgentOpenShifts: number;
  needsAttentionToday: number;
}

export interface SpendVsFillRatePoint {
  week: string;
  /** Naira spent in the week (kobo / 100). */
  spending: number;
  /** Fill rate for shifts scheduled in the week, in percent. */
  fillRate: number;
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

const FILLED_STATUSES = new Set([
  "assigned",
  "upcoming",
  "in_progress",
  "completed",
]);

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
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      date: d,
      label: monthLabel(d),
    };
  });
}

export type AnalyticsPeriod = "weekly" | "monthly" | "yearly";

/** Chart buckets for a period: 8 rolling weeks, 6 calendar months, or 12 calendar months. */
function analyticsBuckets(
  period: AnalyticsPeriod,
): { label: string; start: Date; end: Date }[] {
  const now = new Date();
  if (period === "weekly") {
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return Array.from({ length: 8 }, (_, i) => {
      const end = new Date(now.getTime() - (7 - i) * weekMs);
      return {
        label: `Wk ${i + 1}`,
        start: new Date(end.getTime() - weekMs),
        end,
      };
    });
  }
  const count = period === "monthly" ? 6 : 12;
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - (count - 1 - i),
      1,
    );
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return {
      label: start.toLocaleDateString("en-US", { month: "short" }),
      start,
      end,
    };
  });
}

export class HospitalMetricsService {
  private static shiftsCache: {
    at: number;
    promise: Promise<ApiShift[]>;
  } | null = null;

  private static async fetchRecentShifts(maxShifts = 500): Promise<ApiShift[]> {
    const cached = this.shiftsCache;
    if (cached && Date.now() - cached.at < 10_000) {
      return (await cached.promise).slice(0, maxShifts);
    }
    const promise = (async () => {
      const pageSize = 100;
      const shifts: ApiShift[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await apiClient.get<ApiShiftListResponse>(
          "/api/v1/shifts",
          {
            params: { page, page_size: pageSize },
          },
        );
        shifts.push(...res.data.shifts);
        totalPages = res.data.pagination.total_pages;
        page += 1;
      } while (page <= totalPages && shifts.length < 500);
      return shifts;
    })();
    this.shiftsCache = { at: Date.now(), promise };
    promise.catch(() => {
      if (this.shiftsCache?.promise === promise) this.shiftsCache = null;
    });
    return (await promise).slice(0, maxShifts);
  }

  static async countByStatus(status: string): Promise<number> {
    const res = await apiClient.get<ApiShiftListResponse>("/api/v1/shifts", {
      params: { status, page: 1, page_size: 1 },
    });
    return res.data.pagination.total_items;
  }

  /** Telehealth visits that are scheduled but not yet started (assigned/upcoming). */
  static async countUpcomingVirtual(): Promise<number> {
    const shifts = await this.fetchRecentShifts();
    return shifts.filter(
      (s) =>
        s.shift_type === "virtual" &&
        (s.status === "assigned" || s.status === "upcoming"),
    ).length;
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
        (s) =>
          s.billing_triggered_at && new Date(s.billing_triggered_at) >= weekAgo,
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

  /** Headline stats for the redesigned dashboard's four metric cards. */
  static async getDashboardHeroStats(): Promise<DashboardHeroStats> {
    const [openShifts, shifts, fillRate] = await Promise.all([
      this.countByStatus("open"),
      this.fetchRecentShifts(),
      this.getFillRateSeries(),
    ]);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyRevenueKobo = shifts
      .filter(
        (s) =>
          s.billing_triggered_at && new Date(s.billing_triggered_at) >= weekAgo,
      )
      .reduce((sum, s) => sum + shiftAmountKobo(s), 0);

    const urgentOpenShifts = shifts.filter(
      (s) =>
        s.status === "open" &&
        (s.priority === "stat" || s.priority === "urgent"),
    ).length;

    const todayKey = now.toDateString();
    const needsAttentionToday = shifts.filter(
      (s) =>
        s.status === "open" &&
        new Date(s.scheduled_start).toDateString() === todayKey,
    ).length;

    return {
      weeklyRevenue: formatKobo(weeklyRevenueKobo),
      fillRatePct: fillRate.avgFillRate,
      openShifts,
      urgentOpenShifts,
      needsAttentionToday,
    };
  }

  /** Dual-series line chart data: weekly spending vs weekly fill rate. */
  static async getSpendVsFillRateSeries(): Promise<SpendVsFillRatePoint[]> {
    const now = new Date();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeks = 7;
    const windowStart = new Date(now.getTime() - weeks * weekMs);

    // Spending = money that actually left the wallet for shifts: `payout_debit`
    // ledger rows (escrow released to a worker), net of `payout_reversal`
    // re-credits. Holds, deposits and bank withdrawals are not shift spend.
    const [shifts, ledger] = await Promise.all([
      this.fetchRecentShifts(),
      WalletService.getLedgerSince(windowStart).catch(() => []),
    ]);

    return Array.from({ length: weeks }, (_, i) => {
      const end = new Date(now.getTime() - (weeks - 1 - i) * weekMs);
      const start = new Date(end.getTime() - weekMs);
      const inRange = (iso: string) => {
        const t = new Date(iso);
        return t >= start && t < end;
      };

      const spendingKobo = ledger.reduce((sum, e) => {
        if (!inRange(e.created_at)) return sum;
        if (e.kind === "payout_debit") return sum + Math.abs(e.delta_held_kobo);
        if (e.kind === "payout_reversal")
          return sum - Math.abs(e.delta_balance_kobo);
        return sum;
      }, 0);

      const inWeek = shifts.filter((s) => inRange(s.scheduled_start));
      const filled = inWeek.filter((s) => FILLED_STATUSES.has(s.status)).length;

      return {
        week: `Wk ${i + 1}`,
        spending: Math.max(0, Math.round(spendingKobo / 100)),
        fillRate:
          inWeek.length > 0 ? Math.round((filled / inWeek.length) * 100) : 0,
      };
    });
  }

  /** Shifts scheduled to run today, newest first, for the dashboard list. */
  static async getTodaysShifts(limit = 4): Promise<ApiShift[]> {
    const shifts = await this.fetchRecentShifts();
    const todayKey = new Date().toDateString();
    return shifts
      .filter((s) => new Date(s.scheduled_start).toDateString() === todayKey)
      .sort(
        (a, b) =>
          new Date(a.scheduled_start).getTime() -
          new Date(b.scheduled_start).getTime(),
      )
      .slice(0, limit);
  }

  /** Aggregates for the redesigned Analytics page, from the real shifts list. */
  static async getAnalyticsOverview(
    period: AnalyticsPeriod = "weekly",
  ): Promise<{
    totalRevenue: string;
    fillRatePct: number;
    completionRatePct: number;
    cancelledShifts: number;
    trend: { week: string; committed: number; spending: number }[];
    rolesRequested: { role: string; count: number }[];
    departments: { name: string; shifts: number; fillRatePct: number }[];
  }> {
    const allShifts = await this.fetchRecentShifts();
    const buckets = analyticsBuckets(period);
    const windowStart = buckets[0].start;
    const windowEnd = buckets[buckets.length - 1].end;
    const inWindow = (iso: string | null | undefined) => {
      if (!iso) return false;
      const t = new Date(iso);
      return t >= windowStart && t < windowEnd;
    };
    // Every card, chart and list on the page covers the selected period only.
    const shifts = allShifts.filter((s) => inWindow(s.scheduled_start));

    const totalRevenueKobo = shifts
      .filter((s) => s.billing_triggered_at)
      .reduce((sum, s) => sum + shiftAmountKobo(s), 0);

    const filled = shifts.filter((s) => FILLED_STATUSES.has(s.status));
    const fillRatePct =
      shifts.length > 0 ? Math.round((filled.length / shifts.length) * 100) : 0;

    const started = shifts.filter((s) =>
      ["in_progress", "completed", "no_show", "cancelled"].includes(s.status),
    );
    const completed = shifts.filter((s) => s.status === "completed");
    const completionRatePct =
      started.length > 0
        ? Math.round((completed.length / started.length) * 1000) / 10
        : 0;

    const cancelledShifts = shifts.filter(
      (s) => s.status === "cancelled" || s.status === "no_show",
    ).length;

    const trend = buckets.map(({ label, start, end }) => {
      const inBucket = (iso: string | null | undefined) => {
        if (!iso) return false;
        const t = new Date(iso);
        return t >= start && t < end;
      };
      return {
        week: label,
        committed: Math.round(
          allShifts
            .filter((s) => inBucket(s.scheduled_start))
            .reduce((sum, s) => sum + shiftAmountKobo(s), 0) / 100,
        ),
        spending: Math.round(
          allShifts
            .filter((s) => inBucket(s.billing_triggered_at))
            .reduce((sum, s) => sum + shiftAmountKobo(s), 0) / 100,
        ),
      };
    });

    const roleCounts = new Map<string, number>();
    for (const s of shifts) {
      roleCounts.set(s.role_title, (roleCounts.get(s.role_title) ?? 0) + 1);
    }
    const rolesRequested = Array.from(roleCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([role, count]) => ({ role, count }));

    const deptGroups = new Map<string, { total: number; filled: number }>();
    for (const s of shifts) {
      const name = s.department ?? "General";
      const group = deptGroups.get(name) ?? { total: 0, filled: 0 };
      group.total += 1;
      if (FILLED_STATUSES.has(s.status)) group.filled += 1;
      deptGroups.set(name, group);
    }
    const departments = Array.from(deptGroups.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([name, g]) => ({
        name,
        shifts: g.total,
        fillRatePct: g.total > 0 ? Math.round((g.filled / g.total) * 100) : 0,
      }));

    return {
      totalRevenue: formatKobo(totalRevenueKobo),
      fillRatePct,
      completionRatePct,
      cancelledShifts,
      trend,
      rolesRequested,
      departments,
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
      const filled = inMonth.filter((s) =>
        FILLED_STATUSES.has(s.status),
      ).length;
      return { month: label, filled };
    });

    const totalInRange = shifts.filter((s) =>
      months.some((m) => m.key === monthKey(s.scheduled_start)),
    );
    const filledInRange = totalInRange.filter((s) =>
      FILLED_STATUSES.has(s.status),
    );
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
        const colors = roleColors[role] ?? {
          colorClass: "#94a3b8",
          dotClass: "bg-neutral-400",
        };
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
      (s) =>
        (new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()) /
        3_600_000,
    );
    const avgHours =
      timeToFillHours.length > 0
        ? timeToFillHours.reduce((a, b) => a + b, 0) / timeToFillHours.length
        : 0;

    const statFilled = filledShifts.filter((s) => s.priority === "stat");
    const statHours = statFilled.map(
      (s) =>
        (new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()) /
        3_600_000,
    );
    const avgStatHours =
      statHours.length > 0
        ? statHours.reduce((a, b) => a + b, 0) / statHours.length
        : 0;

    const now = new Date();
    const monthShifts = shifts.filter((s) => {
      const d = new Date(s.scheduled_start);
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    });
    const monthPayrollKobo = monthShifts.reduce(
      (sum, s) => sum + shiftAmountKobo(s),
      0,
    );

    return {
      shiftsThisMonth: overview.shiftsFilledTotal,
      shiftsRemaining:
        overview.shiftsFilledTotal - overview.shiftsFilledThisMonth,
      fillRate: fillRate.avgFillRate,
      avgTimeToFill:
        timeToFillHours.length > 0 ? `${avgHours.toFixed(1)}h` : "—",
      statAvgTimeToFill:
        statHours.length > 0 ? `${avgStatHours.toFixed(1)}h` : "—",
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
      const filled = inMonth.filter((s) =>
        FILLED_STATUSES.has(s.status),
      ).length;
      const rate =
        inMonth.length > 0 ? Math.round((filled / inMonth.length) * 100) : 0;
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
