const ONBOARDING_STEPS = [
  "SETUP",
  "LEGAL",
  "VERIFICATION",
  "ACCESS GRANTED",
] as const;

interface StepTrackerProps {
  activeIndex: number;
}

export function StepTracker({ activeIndex }: StepTrackerProps) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex">
        {ONBOARDING_STEPS.map((_, idx) => (
          <div key={idx} className="flex-1">
            <div
              className={`h-1 w-full rounded-full ${
                idx <= activeIndex ? "bg-secondary-600" : "bg-neutral-200"
              }`}
            />
          </div>
        ))}
      </div>
      <div className="flex">
        {ONBOARDING_STEPS.map((step, idx) => (
          <div key={step} className="flex-1 text-center">
            <span
              className={`text-[10px] font-semibold tracking-wider ${
                idx === activeIndex
                  ? "text-secondary-700"
                  : idx < activeIndex
                    ? "text-neutral-500"
                    : "text-neutral-300"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
