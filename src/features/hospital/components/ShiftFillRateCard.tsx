import { TrendingUp } from "lucide-react";
import CashIcon from "@/shared/assets/svgs/cashIcon.svg?react";
import GradientLoader from "@/shared/assets/svgs/gradientLoader.svg?react";

export function ShiftFillRateCard() {
  const fillRate = 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      {/* Fill Rate card — 60% */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-onboarding-primaryBlue to-onboarding-primaryGreen p-6 text-white">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-onboarding-lemonGreen">
          Shift Fill Rate
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-5xl font-bold leading-none">{fillRate}%</p>
            <p className="mt-2 max-w-[180px] text-xs leading-relaxed text-onboarding-lemonGreen">
              Institutional goal: 0%. You are 0% below the weekly target.
            </p>
          </div>
          {/* Ring */}
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(132, 217, 153, 1)"
              strokeWidth="8"
            />
            {/* <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            /> */}
          </svg>
        </div>
      </div>

      {/* Right column — 40%, inner cards equal width */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-center rounded-2xl border border-neutral-100 bg-white p-6">
          <CashIcon className="mb-3 h-6 w-6 text-onboarding-darkBrown" />
          <p className="mb-1 text-sm text-neutral-500">Total Disbursements</p>
          <p className="text-3xl font-bold text-neutral-900">₦0</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-onboarding-darkBrown">
            <TrendingUp className="h-3.5 w-3.5" />
            0% from last week
          </div>
        </div>

        {/* Average Fill Time */}
        <div className="flex flex-col justify-center rounded-2xl border border-neutral-100 bg-white p-6">
          <GradientLoader className="mb-3 h-6 w-6" />
          <p className="mb-1 text-sm text-neutral-500">Average Fill Time</p>
          <p className="text-3xl font-bold text-neutral-900">0 hrs</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium bg-gradient-to-b from-onboarding-primaryBlue to-onboarding-primaryGreen bg-clip-text text-transparent">
            0h improvement
          </div>
        </div>
      </div>
    </div>
  );
}
