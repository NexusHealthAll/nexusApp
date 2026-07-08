import { DashboardStatsRow } from "./DashboardStatsRow";
import { ShiftFillRateChart } from "./charts/ShiftFillRateChart";
import { RolesHiredChart } from "./charts/RolesHiredChart";
import { ActiveShiftsSection } from "./ActiveShiftsSection";
import { OpenShiftsSection } from "./OpenShiftsSection";
import { WorkforcePool } from "./WorkforcePool";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";

export function DashboardOverview() {
  // Primes the shared hospital-profile cache as early as possible — the
  // header, approval-status gating, etc. all read from the same cache
  // instead of independently re-fetching (see `useHospitalProfile`).
  useHospitalProfile();

  return (
    <div className="space-y-6 bg-onboarding-mainBackground">
      <DashboardStatsRow />

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <ShiftFillRateChart />
        <RolesHiredChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActiveShiftsSection />
        <OpenShiftsSection />
      </div>

      <WorkforcePool />
    </div>
  );
}
