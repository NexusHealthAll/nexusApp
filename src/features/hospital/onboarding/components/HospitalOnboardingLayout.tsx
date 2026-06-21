import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Settings,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { HospitalOnboardingNavbar } from "./HospitalOnboardingNavbar";

interface Step {
  index: number;
  label: string;
  icon: React.ElementType;
  path: string;
}

const STEPS: Step[] = [
  { index: 0, label: "Hospital Details",      icon: Building2,  path: "/hospital/onboarding/registration" },
  { index: 1, label: "Location & Geofencing", icon: MapPin,      path: "/hospital/onboarding/location" },
  { index: 2, label: "Verification Status",   icon: ShieldCheck, path: "/hospital/onboarding/verification-status" },
];

interface HospitalOnboardingLayoutProps {
  activeStep: number;
  children: React.ReactNode;
}

export function HospitalOnboardingLayout({ activeStep, children }: HospitalOnboardingLayoutProps) {
  const navigate = useNavigate();
  const progressPercent = (activeStep / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#F4FAFF] flex flex-col font-sans">
      <HospitalOnboardingNavbar />

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-[230px] bg-white border-r border-gray-200 shrink-0">
          <div className="px-5 pt-6 pb-4 flex-1">
            {/* Label */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">
              Registration
            </p>
            <p className="text-sm font-bold text-[#1A5888] mb-4">
              Hospital Onboarding
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1 mb-1 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#349C93] transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 mb-6">
              Step {activeStep + 1} of {STEPS.length}
            </p>

            {/* Step list */}
            <nav className="space-y-1">
              {STEPS.map((step) => {
                const completed = step.index < activeStep;
                const active    = step.index === activeStep;
                const Icon      = step.icon;

                return (
                  <button
                    key={step.index}
                    onClick={() => (completed || active) && navigate(step.path)}
                    className={[
                      "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-150",
                      active
                        ? "bg-[#349C93] text-white"
                        : completed
                        ? "text-neutral-600 hover:bg-gray-50 cursor-pointer"
                        : "text-neutral-400 cursor-default",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Icon
                        className={`h-[14px] w-[14px] shrink-0 ${
                          active ? "text-white" : completed ? "text-neutral-500" : "text-neutral-300"
                        }`}
                      />
                      {step.label}
                    </span>
                    {completed && !active && (
                      <CheckCircle2 className="h-[14px] w-[14px] shrink-0 text-[#349C93]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom support links */}
          <div className="px-5 py-4 border-t border-gray-100 space-y-0.5">
            <button className="flex items-center gap-2.5 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors w-full px-3 py-2 rounded-lg hover:bg-gray-50">
              <HelpCircle className="h-[15px] w-[15px]" />
              Support
            </button>
            <button className="flex items-center gap-2.5 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors w-full px-3 py-2 rounded-lg hover:bg-gray-50">
              <Settings className="h-[15px] w-[15px]" />
              Settings
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
