import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { appToast } from "@/shared/components/feedback/toast";
import { Header, StatusBadge } from "../DashboardChrome";
import type { MyApplicationEntry } from "../../hooks/useHealthWorkerShifts";
import { useHealthWorkerShifts } from "../../hooks/useHealthWorkerShifts";

const statusTone: Record<string, "blue" | "green" | "red" | "amber"> = {
  open: "amber",
  offered: "green",
  assigned: "blue",
  upcoming: "blue",
  in_progress: "green",
  completed: "green",
  cancelled: "red",
  no_show: "red",
  submitted: "amber",
  withdrawn: "red",
  accepted: "green",
  rejected: "red",
};

function statusLabel(entry: MyApplicationEntry): string {
  if (entry.kind === "application" && entry.application_status) {
    return entry.application_status;
  }
  return entry.shift_status.replace("_", " ");
}

export function MyApplicationsScreen({
  entries,
  isLoading,
  loadError,
  onBack,
  onRefresh,
  onRespondToOffer,
}: {
  entries: MyApplicationEntry[];
  isLoading: boolean;
  loadError: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onRespondToOffer: (shiftId: string) => void;
}) {
  const { withdrawInterest } = useHealthWorkerShifts();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (entry: MyApplicationEntry) => {
    setWithdrawingId(entry.shift_id);
    try {
      await withdrawInterest(entry.shift_id);
      appToast.success("Interest withdrawn", "You've withdrawn from this shift.");
      onRefresh();
    } catch (err) {
      appToast.fromError(err, "Failed to withdraw. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <>
      <Header title="My Applications" subtitle="Pending placements" onBack={onBack} />
      <main className="space-y-4 px-5 py-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          Review your submitted interest and applications. Hospitals usually respond within 24
          hours. When a hospital selects you for a shift, click "Respond to Offer" to review and confirm.
        </p>

        {loadError && (
          <p className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 dark:bg-error-950 dark:text-error-300">{loadError}</p>
        )}

        {isLoading && <p className="text-sm text-neutral-500 dark:text-neutral-500">Loading...</p>}

        {!isLoading && !loadError && entries.length === 0 && (
          <EmptyState
            className="bg-white dark:bg-neutral-900"
            icon={<ClipboardList className="h-10 w-10 text-brand-300" />}
            title="No applications yet"
            description="Browse the marketplace to express interest in a shift."
          />
        )}

        <div className="space-y-3">
          {entries.map((entry) => {
            const hasOffer = entry.application_status === "offered";

            return (
              <Card key={`${entry.kind}-${entry.shift_id}-${entry.created_at}`}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">
                        {entry.kind === "interest" ? "Interest" : "Application"}
                      </p>
                      <h3 className="font-bold">{entry.role_title}</h3>
                    </div>
                    <StatusBadge tone={statusTone[statusLabel(entry)] ?? "blue"}>
                      {statusLabel(entry)}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    {new Date(entry.scheduled_start).toLocaleString("en-NG", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {hasOffer ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-error-200 text-error-600 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-950"
                        isLoading={withdrawingId === entry.shift_id}
                        disabled={
                          withdrawingId === entry.shift_id ||
                          !["open"].includes(entry.shift_status)
                        }
                        onClick={() => handleWithdraw(entry)}
                      >
                        Withdraw
                      </Button>
                      <Button
                        type="button"
                        className="bg-brand-700 font-medium"
                        onClick={() => onRespondToOffer(entry.shift_id)}
                      >
                        Respond to Offer
                      </Button>
                    </div>
                  ) : entry.kind === "interest" ? (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Pending Hospital Selection
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-error-200 text-error-600 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-950"
                          isLoading={withdrawingId === entry.shift_id}
                          disabled={
                            withdrawingId === entry.shift_id ||
                            !["open"].includes(entry.shift_status)
                          }
                          onClick={() => handleWithdraw(entry)}
                        >
                          Withdraw
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950"
                          onClick={() => onRespondToOffer(entry.shift_id)}
                        >
                          Respond to Offer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Formal application {entry.application_status ?? "submitted"} — hospital will respond once reviewed.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
