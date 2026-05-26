import { WaitlistFlowProvider } from "@/features/waitlist/components/waitlistFlowContext";
import { WaitlistFlowShell } from "@/features/waitlist/components/WaitlistFlowShell";

export function LandingPage() {
  return (
    <WaitlistFlowProvider>
      <WaitlistFlowShell />
    </WaitlistFlowProvider>
  );
}
