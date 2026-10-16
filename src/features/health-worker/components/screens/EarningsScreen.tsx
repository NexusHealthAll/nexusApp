import { Activity, Clock, FileClock, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { cn } from "@/shared/utils/cn";
import { Metric, StatusBadge, formatKobo } from "../DashboardChrome";
import { PagedFooter } from "../PagedFooter";
import type {
  EarningsSummary,
  EarningsTransaction,
} from "../../hooks/useHealthWorkerShifts";

const statusTone: Record<string, "green" | "amber" | "red" | "blue"> = {
  success: "green",
  pending: "amber",
  failed: "red",
};

const statusLabel: Record<string, string> = {
  success: "Paid",
  pending: "Pending",
  failed: "Failed",
};

const dateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-500 dark:text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-ink-900 dark:text-neutral-100">
        {value}
      </dd>
    </div>
  );
}

function TransactionCard({
  tx,
  onOpenHandover,
}: {
  tx: EarningsTransaction;
  onOpenHandover: (shiftId: string) => void;
}) {
  const showHandoverLink = !!tx.shift_id && (tx.status === "pending" || tx.status === "failed");
  // Short, human-quotable reference taken from the transaction id.
  const reference = `TX-${tx.id.slice(0, 8).toUpperCase()}`;
  const paidOrStarted =
    tx.status === "success" && tx.completed_at
      ? { label: "Paid on", value: dateOnly(tx.completed_at) }
      : { label: "Initiated", value: dateOnly(tx.created_at) };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900 dark:text-neutral-50">
              {tx.hospital_name ?? "Hospital"}
            </p>
            <p className="truncate text-xs text-ink-500 dark:text-neutral-500">
              {tx.role_title ?? "Shift"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={cn(
                "font-bold",
                tx.status === "failed"
                  ? "text-ink-500 line-through dark:text-neutral-500"
                  : "text-success-700 dark:text-success-400",
              )}
            >
              {formatKobo(tx.amount_kobo)}
            </p>
            <StatusBadge tone={statusTone[tx.status] ?? "blue"}>
              {statusLabel[tx.status] ?? tx.status}
            </StatusBadge>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
          <Detail
            label="Shift"
            value={tx.scheduled_start ? dateTime(tx.scheduled_start) : "—"}
          />
          <Detail label={paidOrStarted.label} value={paidOrStarted.value} />
          <Detail label="Reference" value={reference} />
          <Detail label="Status" value={statusLabel[tx.status] ?? tx.status} />
        </dl>

        {showHandoverLink && (
          <button
            type="button"
            onClick={() => onOpenHandover(tx.shift_id as string)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-warning-300 px-3 py-2 text-xs font-bold text-warning-800 transition-colors hover:bg-warning-50 dark:border-warning-800 dark:text-warning-300 dark:hover:bg-warning-950/40"
          >
            <FileClock className="h-3.5 w-3.5" />
            {tx.status === "failed"
              ? "Payment failed — check handover status"
              : "Payment pending — check handover status"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function EarningsSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading earnings">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function EarningsScreen({
  earnings,
  isLoading,
  isPageLoading,
  loadError,
  page,
  pageSize,
  onPageChange,
  onOpenHandover,
}: {
  earnings: EarningsSummary | null;
  /** First load (no data yet). */
  isLoading: boolean;
  /** Fetching another page while the previous one is still shown. */
  isPageLoading: boolean;
  loadError: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpenHandover: (shiftId: string) => void;
}) {
  const total = earnings?.total_transactions ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <main className="space-y-5 py-4">
      <h1 className="text-base font-extrabold text-ink-900 dark:text-neutral-100">Earnings</h1>
      {loadError && (
        <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 dark:bg-error-950/40 dark:text-error-300">{loadError}</p>
      )}
      {isLoading && !earnings && <EarningsSkeleton />}

      {earnings && (
        <>
          <section className="rounded-2xl bg-brand-700 p-5 text-white dark:bg-brand-800">
            <p className="text-xs text-brand-100">Total Earned</p>
            <p className="text-3xl font-bold">{formatKobo(earnings.total_earned_kobo)}</p>
            <p className="mt-1 text-xs text-brand-100/80">
              {total} {total === 1 ? "payment" : "payments"} across all shifts
            </p>
          </section>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Pending" value={formatKobo(earnings.pending_kobo)} icon={Clock} />
            <Metric
              label="This Month"
              value={formatKobo(earnings.this_month_kobo)}
              icon={Activity}
            />
          </div>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-ink-900 dark:text-neutral-100">Payment History</h2>
              <span className="text-xs text-ink-500 dark:text-neutral-400">{total} total</span>
            </div>
            {earnings.transactions.length === 0 ? (
              <EmptyState
                className="bg-white dark:bg-neutral-900"
                icon={<WalletCards className="h-10 w-10 text-brand-300 dark:text-brand-400" />}
                title="No payouts yet"
                description="Completed shifts will appear here once the hospital approves your handover."
              />
            ) : (
              <div
                className={cn("space-y-3 transition-opacity", isPageLoading && "opacity-50")}
                aria-busy={isPageLoading}
              >
                {earnings.transactions.map((tx) => (
                  <TransactionCard key={tx.id} tx={tx} onOpenHandover={onOpenHandover} />
                ))}
              </div>
            )}
            <PagedFooter
              page={page}
              pageCount={pageCount}
              from={from}
              to={to}
              total={total}
              noun="payments"
              onPageChange={onPageChange}
            />
          </section>
        </>
      )}
    </main>
  );
}
