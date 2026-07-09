import { Activity, Clock, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Metric, StatusBadge, formatKobo } from "../DashboardChrome";
import type { EarningsSummary } from "../../hooks/useHealthWorkerShifts";

const statusTone: Record<string, "green" | "amber" | "red" | "blue"> = {
  success: "green",
  pending: "amber",
  failed: "red",
};

export function EarningsScreen({
  earnings,
  isLoading,
  loadError,
}: {
  earnings: EarningsSummary | null;
  isLoading: boolean;
  loadError: string | null;
}) {
  return (
    <>
      <main className="space-y-5 py-4">
        <h1 className="text-base font-extrabold text-ink-900">Earnings</h1>
        {loadError && (
          <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">{loadError}</p>
        )}
        {isLoading && <p className="text-sm text-ink-500">Loading...</p>}

        {earnings && (
          <>
            <section className="rounded-2xl bg-brand-700 p-5 text-white">
              <p className="text-xs text-brand-100">Total Earned</p>
              <p className="text-3xl font-bold">{formatKobo(earnings.total_earned_kobo)}</p>
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
                <h2 className="font-bold text-ink-900">Recent Earnings</h2>
                <span className="text-xs text-ink-500">
                  {earnings.total_transactions} total
                </span>
              </div>
              {earnings.transactions.length === 0 ? (
                <EmptyState
                  className="bg-white"
                  icon={<WalletCards className="h-10 w-10 text-brand-300" />}
                  title="No payouts yet"
                />
              ) : (
                <div className="space-y-3">
                  {earnings.transactions.map((tx) => (
                    <Card key={tx.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-bold text-ink-900">{tx.hospital_name ?? "Hospital"}</p>
                          <p className="text-xs text-ink-500">
                            {tx.role_title ?? ""}
                            {tx.completed_at
                              ? ` • ${new Date(tx.completed_at).toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                })}`
                              : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-success-700">
                            {formatKobo(tx.amount_kobo)}
                          </p>
                          <StatusBadge tone={statusTone[tx.status] ?? "blue"}>
                            {tx.status}
                          </StatusBadge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
