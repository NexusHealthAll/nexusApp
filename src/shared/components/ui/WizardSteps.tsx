import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface WizardStepsProps {
  steps: string[];
  /** 0-based index of the current step. */
  current: number;
  className?: string;
}

/**
 * Horizontal numbered step tracker from the redesign wizard: filled navy
 * circles for the current/completed steps, connector lines between them,
 * step labels underneath.
 */
export function WizardSteps({ steps, current, className }: WizardStepsProps) {
  return (
    <div className={cn("flex items-start justify-center", className)}>
      {steps.map((step, index) => {
        const isDone = index < current;
        const isActive = index === current;
        return (
          <div key={step} className="flex items-start">
            {index > 0 && (
              <div
                className={cn(
                  "mx-3 mt-5 h-0.5 w-10 rounded-full sm:w-16",
                  isDone || isActive ? "bg-brand-800" : "bg-neutral-200",
                )}
              />
            )}
            <div className="flex w-20 flex-col items-center sm:w-24">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  isDone || isActive
                    ? "bg-brand-800 text-white"
                    : "bg-neutral-100 text-neutral-400",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "mt-2 text-center text-xs font-medium",
                  isActive
                    ? "font-semibold text-brand-800"
                    : isDone
                      ? "text-neutral-500"
                      : "text-neutral-400",
                )}
              >
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
