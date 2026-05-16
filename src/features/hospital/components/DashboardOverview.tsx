import { useHospitalSetup } from "../hooks/useHospitalSetup";
import { SetHospitalLocation } from "./SetHospitalLocation";
import { AddPaymentMethod } from "./AddPaymentMethod";
import { ShiftFillRateCard } from "./ShiftFillRateCard";
import { ActiveShiftsSection } from "./ActiveShiftsSection";
import { OpenShiftsSection } from "./OpenShiftsSection";
import { WorkforcePool } from "./WorkforcePool";

export function DashboardOverview() {
  const { locationSet, paymentSet } = useHospitalSetup();

  if (!locationSet) {
    return <SetHospitalLocation />;
  }

  if (!paymentSet) {
    return <AddPaymentMethod />;
  }

  return (
    <div className="space-y-6 bg-onboarding-mainBackground">
      <ShiftFillRateCard />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <ActiveShiftsSection />
          <OpenShiftsSection />
        </div>

        <WorkforcePool />
      </div>
    </div>
  );
}
