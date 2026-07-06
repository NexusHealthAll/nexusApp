import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, DollarSign, Mic, Star, CalendarDays, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Badge, BadgeVariant } from "@/shared/components/ui/Badge";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { PATHS } from "@/routes/paths";
import { authUtils } from "@/features/auth/utils/authUtils";
import {
  ActiveShift,
  AvailableShift,
  DashboardStats,
  HealthWorkerProfile,
  HealthWorkerService,
  TodaysPatient,
} from "@/features/health-worker/services/healthWorkerService";
import { MonthlyEarningsChart } from "@/features/health-worker/components/charts/MonthlyEarningsChart";
import { useRecordPatientModalStore } from "@/features/health-worker/hooks/useRecordPatientModalStore";
import { useHandoverModalStore } from "@/features/health-worker/hooks/useHandoverModalStore";

function getStoredWorkerId(): string {
  return authUtils.getCurrentUser()?.id || "HW001";
}

function urgencyBadge(shift: AvailableShift): { variant: BadgeVariant; label: string } {
  const isVirtual = /virtual/i.test(shift.department) || shift.location === "Remote";
  if (isVirtual) return { variant: "info", label: "Virtual" };
  if (shift.urgency === "high") return { variant: "error", label: "STAT" };
  if (shift.urgency === "medium") return { variant: "warning", label: "Urgent" };
  return { variant: "success", label: "Normal" };
}

function useElapsedTime(startTime?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  if (!startTime) return "0:00";
  const diffMs = Math.max(0, now - new Date(startTime).getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function HealthWorkerDashboardPage() {
  const navigate = useNavigate();
  const workerId = useMemo(() => getStoredWorkerId(), []);
  const openRecordPatient = useRecordPatientModalStore((s) => s.open);
  const openHandover = useHandoverModalStore((s) => s.open);

  const [profile, setProfile] = useState<HealthWorkerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [todaysPatients, setTodaysPatients] = useState<TodaysPatient[]>([]);
  const [nearbyShifts, setNearbyShifts] = useState<AvailableShift[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const elapsed = useElapsedTime(activeShift?.startTime);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const [p, s, patients, shifts] = await Promise.all([
        HealthWorkerService.getWorkerProfile(workerId),
        HealthWorkerService.getDashboardStats(workerId),
        HealthWorkerService.getTodaysPatients(workerId),
        HealthWorkerService.getAvailableShifts(workerId),
      ]);
      if (cancelled) return;
      setProfile(p);
      setStats(s);
      setTodaysPatients(patients);
      setNearbyShifts(shifts.slice(0, 3));
      setIsAvailable(p.currentStatus !== "off-duty");

      // Demo active shift so the dashboard shows the in-progress state.
      const history = await HealthWorkerService.getShiftHistory(workerId);
      if (cancelled) return;
      const inProgress = history.find((h) => h.status === "in_progress");
      if (inProgress) {
        setActiveShift({
          id: inProgress.id,
          hospital: "Lagos University Teaching Hospital",
          department: "Main Emergency Dept.",
          startTime: new Date(Date.now() - (4 * 60 + 23) * 60000).toISOString(),
          hourlyRate: 8000,
          location: "Idi-Araba, Lagos",
          duration: "8h",
          status: "active",
        });
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [workerId]);

  const toggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    await HealthWorkerService.updateDutyStatus(
      workerId,
      next ? "available" : "off-duty",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Good afternoon,
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-neutral-900">
            {profile?.name ?? "—"} 👋
          </h1>
          <p className="text-sm text-neutral-500">
            {profile?.specialization} • {profile?.licenseNumber}
          </p>
        </div>

        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            isAvailable
              ? "border-success-200 bg-success-50 text-success-700"
              : "border-neutral-200 bg-neutral-50 text-neutral-500"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isAvailable ? "bg-success-500" : "bg-neutral-400"}`}
          />
          Available for Shifts
          <span
            className={`ml-1 flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
              isAvailable ? "justify-end bg-success-500" : "justify-start bg-neutral-300"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-white" />
          </span>
        </button>
      </div>

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-500 p-5 text-white">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Star className="h-4.5 w-4.5" />
              </div>
              {stats.ratingTrend !== undefined && (
                <span className="text-xs font-semibold text-primary-100">
                  +{stats.ratingTrend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
            <p className="mt-1 text-sm font-medium text-primary-50">Rating</p>
            <p className="mt-0.5 text-xs text-primary-200">
              From {stats.ratingCount} shifts
            </p>
          </div>

          <StatCard
            icon={CalendarDays}
            tone="primary"
            value={stats.shiftsThisMonth}
            label="Shifts this month"
            sublabel={`${stats.shiftsCompleted} completed`}
            trend={
              stats.shiftsThisMonthTrend !== undefined
                ? { direction: "up", label: `+${stats.shiftsThisMonthTrend}` }
                : undefined
            }
          />
          <StatCard
            icon={DollarSign}
            tone="primary"
            value={stats.totalEarnings}
            label="Earnings this month"
            sublabel={stats.earningsMonthLabel}
            trend={
              stats.earningsTrendPct !== undefined
                ? { direction: "up", label: `+${stats.earningsTrendPct}%` }
                : undefined
            }
          />
          <StatCard
            icon={Clock}
            tone="primary"
            value={stats.hoursWorked}
            label="Hours this month"
            sublabel={`Across ${stats.hoursShiftCount} shifts`}
            trend={
              stats.hoursTrendLabel
                ? { direction: "up", label: stats.hoursTrendLabel }
                : undefined
            }
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-[320px] rounded-2xl" />
          ) : activeShift ? (
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
              <div className="flex items-center gap-2 bg-primary-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
                Active Shift
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-neutral-900">Emergency Doctor</h3>
                <p className="text-sm text-neutral-500">
                  🏥 {activeShift.hospital.includes("Lagos") ? "LUTH" : activeShift.hospital} •{" "}
                  {activeShift.department}
                </p>

                <div className="mt-4 rounded-xl bg-primary-50 py-4 text-center">
                  <p className="text-3xl font-bold text-primary-700">{elapsed}</p>
                  <p className="text-xs text-neutral-500">hours worked</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-neutral-400">Start</p>
                    <p className="font-semibold text-neutral-800">2:00 PM</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">End</p>
                    <p className="font-semibold text-neutral-800">10:00 PM</p>
                  </div>
                </div>

                <button
                  onClick={openRecordPatient}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-error-200 bg-error-50 py-2.5 text-sm font-semibold text-error-600 hover:bg-error-100"
                >
                  <Mic className="h-4 w-4" />
                  Record Patient
                </button>
                <button
                  onClick={openHandover}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  End Shift &amp; Handover
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center">
              <p className="text-sm font-semibold text-neutral-800">No active shift</p>
              <p className="max-w-[220px] text-xs text-neutral-400">
                Clock in from My Shifts once you arrive on-site.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-neutral-100 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">
              Today's Patients
            </h3>
            {todaysPatients.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">
                No patients recorded yet today.
              </p>
            ) : (
              <div className="divide-y divide-neutral-50">
                {todaysPatients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{p.id}</p>
                      <p className="text-xs text-neutral-400">{p.time}</p>
                    </div>
                    <Badge variant={p.status === "approved" ? "success" : "warning"}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
                <button
                  onClick={() => navigate(PATHS.medicalStaff.patientNotes)}
                  className="pt-3 text-sm font-semibold text-primary-700 hover:text-primary-900"
                >
                  View all notes →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <MonthlyEarningsChart workerId={workerId} />

          <div className="rounded-2xl border border-neutral-100 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Shifts Near You</h3>
              <button
                onClick={() => navigate(PATHS.medicalStaff.findShifts)}
                className="text-sm font-semibold text-primary-700 hover:text-primary-900"
              >
                See all →
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-neutral-50">
                {nearbyShifts.map((shift) => {
                  const badge = urgencyBadge(shift);
                  return (
                    <div key={shift.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          <span className="text-xs text-neutral-400">
                            {shift.hospital.split(" ").slice(0, 1).join("")}
                          </span>
                        </div>
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {shift.department}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {shift.date} • {shift.time}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-neutral-900">
                          ₦{shift.hourlyRate.toLocaleString()}/hr
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
