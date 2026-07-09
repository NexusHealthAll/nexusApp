import { useNavigate } from "react-router-dom";
import {
  BriefcaseMedical,
  Calendar,
  ChevronRight,
  Clock,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import type { AuthUser } from "@/shared/auth/store/authStore";
import type { MyApplicationEntry, EarningsSummary } from "../../hooks/useHealthWorkerShifts";
import { Metric, StatusBadge, formatKobo } from "../DashboardChrome";

const upcomingStatuses = new Set(["assigned", "upcoming"]);
const pendingStatuses = new Set(["open"]);

export function HomeScreen({
  user,
  applications,
  earnings,
  isLoading,
  isBookingActive,
  onMarketplace,
  onOpenShift,
}: {
  user: AuthUser | null;
  applications: MyApplicationEntry[];
  earnings: EarningsSummary | null;
  isLoading: boolean;
  isBookingActive: boolean;
  onMarketplace: () => void;
  onOpenShift: (shiftId: string) => void;
}) {
  const navigate = useNavigate();

  const upcoming = applications
    .filter((e) => upcomingStatuses.has(e.shift_status))
    .sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start))[0];
  const pendingCount = applications.filter((e) => pendingStatuses.has(e.shift_status)).length;

  const firstName = user?.first_name || user?.email?.split("@")[0] || "there";

  return (
    <>
      <main className="space-y-5 py-4">
        <button
          type="button"
          onClick={() => navigate("/medical-staff/onboarding/profile")}
          className="flex w-full items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-3 text-left transition-colors hover:bg-warning-100"
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600" />
          <span>
            <span className="block text-sm font-semibold text-warning-800">
              Complete your professional profile
            </span>
            <span className="block text-sm text-warning-900">
              Verify your license, identity, and payout details to start receiving shifts.
            </span>
          </span>
        </button>

        <section className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
              Welcome back
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-brand-800">
              Hi, {firstName}
            </h1>
          </div>
          <StatusBadge tone={isBookingActive ? "green" : "amber"}>
            {isBookingActive ? "On duty" : "Off duty"}
          </StatusBadge>
        </section>

        {upcoming && (
          <section className="rounded-2xl bg-brand-700 p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <StatusBadge>Upcoming Shift</StatusBadge>
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-xl font-bold">{upcoming.role_title}</h2>
            <div className="mt-3 flex items-center gap-4 text-xs text-brand-50">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(upcoming.scheduled_start).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(upcoming.scheduled_start).toLocaleTimeString("en-NG", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <Button
              type="button"
              onClick={() => onOpenShift(upcoming.shift_id)}
              className="mt-4 w-full bg-white text-brand-800 hover:bg-brand-50"
            >
              View Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </section>
        )}

        <section className="grid grid-cols-2 gap-3">
          <Metric
            label="This Month"
            value={earnings ? formatKobo(earnings.this_month_kobo) : "—"}
            icon={Wallet}
          />
          <Metric label="Pending Applications" value={String(pendingCount)} icon={Clock} />
        </section>

        <button
          type="button"
          onClick={onMarketplace}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-brand-50 p-2 text-brand-700">
              <BriefcaseMedical className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-ink-900">Marketplace</p>
              <p className="text-xs text-ink-500">Find new shifts near you</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-ink-500" />
        </button>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {isLoading && <p className="text-sm text-ink-500">Loading...</p>}
            {!isLoading && (earnings?.transactions.length ?? 0) === 0 && (
              <EmptyState
                className="bg-white"
                icon={<Receipt className="h-10 w-10 text-brand-300" />}
                title="No completed shifts yet"
              />
            )}
            {(earnings?.transactions ?? []).slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
              >
                <div className="border-l-4 border-success-500 pl-3">
                  <p className="text-sm font-bold text-ink-900">{item.hospital_name ?? "Hospital"}</p>
                  <p className="text-[10px] uppercase text-ink-500">{item.role_title ?? ""}</p>
                </div>
                <p className="text-sm font-bold text-ink-900">{formatKobo(item.amount_kobo)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
