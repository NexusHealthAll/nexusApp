import { WaitlistFlowProvider } from "@/shared/waitlist/components/waitlistFlowContext";
import { WaitlistFlowShell } from "@/shared/waitlist/components/WaitlistFlowShell";

export function LandingPage() {
  return (
    <WaitlistFlowProvider>
      <WaitlistFlowShell />
    </WaitlistFlowProvider>
  );
}
