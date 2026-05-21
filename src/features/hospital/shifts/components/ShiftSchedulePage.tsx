import { ActiveShiftsSection } from "@/features/hospital/components/ActiveShiftsSection";
import { OpenShiftsSection } from "@/features/hospital/components/OpenShiftsSection";

export function ShiftSchedulePage() {
  return (
    <div className="space-y-6">
      <ActiveShiftsSection />
      <OpenShiftsSection />
    </div>
  );
}
