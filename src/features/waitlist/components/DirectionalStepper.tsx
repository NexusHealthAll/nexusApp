interface DirectionalStepperProps {
  title: string;
  steps: string[];
}

export function DirectionalStepper({ title, steps }: DirectionalStepperProps) {
  return (
    <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
      <h3 className="text-2xl font-semibold text-onboarding-primaryBlue sm:text-3xl">
        {title}
      </h3>

      <div className="mt-7">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;

          return (
            <div key={`${title}-${index}`}>
              <div className="flex gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-onboarding-primaryBlue to-onboarding-primaryGreen text-sm font-semibold text-white">
                  {index + 1}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-7 text-neutral-800 sm:text-base">
                    {step}
                  </p>
                </div>
              </div>

              {!isLastStep ? (
                <div className="relative ml-[1.05rem] h-10 w-4">
                  <span className="absolute -left-0.5 top-0 h-full w-px bg-gradient-to-b from-onboarding-primaryBlue/70 to-onboarding-primaryGreen/70 py-1.5" />
                  {/* <ArrowDown
                    className="absolute -left-1 top-3 h-4 w-4 text-onboarding-primaryBlue animate-bounce"
                    style={{ animationDelay: `${index * 140}ms` }}
                  /> */}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}
