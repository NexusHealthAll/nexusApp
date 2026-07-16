import { useEffect, useMemo, useState } from "react";
import { Download, Landmark, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { MetricCard } from "@/shared/components/ui/MetricCard";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Pagination } from "@/shared/components/ui/Pagination";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { PATHS } from "@/routes/paths";
import { formatKobo } from "@/shared/utils/currency";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import {
  PaymentsService,
  type PaymentStatus,
  type PaymentsOverview,
} from "../paymentsService";

type PaymentTab = "all" | "pending" | "completed";

const PAGE_SIZE = 6;

const statusDisplay: Record<
  PaymentStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pending", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  refunded: { label: "Refunded", variant: "neutral" },
};

const dateOptions = [
  { value: "all", label: "Any Date" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

/** Payments page per the Figma redesign, backed by the wallet endpoints. */
export function PaymentsPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<PaymentsOverview | null>(null);
  const [tab, setTab] = useState<PaymentTab>("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    PaymentsService.getOverview().then((data) => {
      if (!cancelled) setOverview(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const transactions = useMemo(
    () => overview?.transactions ?? [],
    [overview],
  );

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (tab !== "all" && t.status !== tab) return false;
      if (dateRange !== "all") {
        const cutoff = Date.now() - Number(dateRange) * 24 * 60 * 60 * 1000;
        if (new Date(t.createdAt).getTime() < cutoff) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !`${t.worker} ${t.shift} ${t.invoice}`.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, tab, dateRange, search]);

  useEffect(() => {
    setPage(1);
  }, [tab, dateRange, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () =>
    downloadCsv(
      "payments.csv",
      ["Worker", "Shift", "Invoice #", "Date", "Amount (NGN)", "Status"],
      filtered.map((t) => [
        t.worker,
        t.shift,
        t.invoice,
        t.dateLabel,
        Math.round(t.amountKobo / 100),
        statusDisplay[t.status].label,
      ]),
    );

  const billingAccount = overview?.wallet?.safehavenAccountNumber;

  return (
    <div>
      <PageHeader
        title="Payments"
        breadcrumbs={[
          { label: "Dashboard", href: PATHS.hospital.dashboard },
          { label: "Payments" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-sm font-semibold"
            title="Billing runs through your SafeHaven wallet account"
          >
            <Landmark className="h-4 w-4" />
            Manage Billing Methods
          </Button>
        }
      />

      {/* Stats */}
      {overview === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Pending Payments"
            value={formatKobo(overview.pendingKobo)}
            sub={`${transactions.filter((t) => t.status === "pending").length} invoices awaiting release`}
          />
          <MetricCard
            label="Completed This Month"
            value={formatKobo(overview.completedThisMonthKobo)}
            sub="released to workers"
          />
          <MetricCard
            label="Refunds Issued"
            value={formatKobo(overview.refundsThisMonthKobo)}
            sub={`${transactions.filter((t) => t.status === "refunded").length} this month`}
          />
          <MetricCard
            label="Default Billing Method"
            value={
              <span className="flex items-center gap-2 text-lg">
                <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  SafeHaven
                </span>
                {billingAccount
                  ? `•••• ${billingAccount.slice(-4)}`
                  : "Wallet"}
              </span>
            }
            sub="hospital wallet account"
          />
        </div>
      )}

      {/* Transactions card */}
      <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-5">
        <UnderlineTabs<PaymentTab>
          options={[
            { label: "All Transactions", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Completed", value: "completed" },
          ]}
          value={tab}
          onChange={setTab}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SearchInput
            placeholder="Search by worker or invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="w-full sm:w-64"
          />
          <Select
            options={dateOptions}
            value={dateRange}
            onChange={setDateRange}
            containerClassName="w-40"
            className="bg-white py-2"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="mt-4">
          {overview === null ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : pageRows.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={<EmptyStateIcon icon={ReceiptText} />}
                title="No transactions yet"
                description="Escrow holds, releases, and refunds from your wallet will appear here as shifts run."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate(PATHS.hospital.shifts)}
                  >
                    View Shift Management
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    <th className="py-3 pr-4 font-semibold">Worker</th>
                    <th className="py-3 pr-4 font-semibold">Shift</th>
                    <th className="py-3 pr-4 font-semibold">Invoice #</th>
                    <th className="py-3 pr-4 font-semibold">Date</th>
                    <th className="py-3 pr-4 font-semibold">Amount</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((t) => {
                    const display = statusDisplay[t.status];
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-neutral-50 last:border-b-0"
                      >
                        <td className="py-4 pr-4">
                          <span className="flex items-center gap-2.5">
                            <AvatarInitials
                              name={t.worker}
                              className="bg-primary-700 font-bold text-white"
                            />
                            <span className="font-semibold text-neutral-900">
                              {t.worker}
                            </span>
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-neutral-600">{t.shift}</td>
                        <td className="py-4 pr-4 text-neutral-500">
                          {t.invoice}
                        </td>
                        <td className="py-4 pr-4 text-neutral-600">
                          {t.dateLabel}
                        </td>
                        <td className="py-4 pr-4 font-bold text-neutral-900">
                          {formatKobo(t.amountKobo)}
                        </td>
                        <td className="py-4 pr-4">
                          <Badge
                            variant={display.variant}
                            className="uppercase tracking-wide"
                          >
                            {display.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {overview !== null && filtered.length > 0 && (
          <div className="mt-2 border-t border-neutral-100 pt-4">
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              summary={`Showing ${pageRows.length} of ${filtered.length} transactions`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
