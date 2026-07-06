import { DashboardStatsRow } from "./DashboardStatsRow";
import { ShiftFillRateChart } from "./charts/ShiftFillRateChart";
import { RolesHiredChart } from "./charts/RolesHiredChart";
import { ActiveShiftsSection } from "./ActiveShiftsSection";
import { OpenShiftsSection } from "./OpenShiftsSection";
import { WorkforcePool } from "./WorkforcePool";

export function DashboardOverview() {
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
