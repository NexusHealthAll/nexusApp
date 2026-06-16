import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  CreditCard,
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
  { index: 0, label: "Hospital Details",     icon: Building2,  path: "/hospital/onboarding/registration" },
  { index: 1, label: "Location & Geofencing",icon: MapPin,      path: "/hospital/onboarding/location" },
  { index: 2, label: "Financial Setup",      icon: CreditCard,  path: "/hospital/onboarding/financial-setup" },
  { index: 3, label: "Verification Status",  icon: ShieldCheck, path: "/hospital/onboarding/verification-status" },
];

interface HospitalOnboardingLayoutProps {
  activeStep: number;
  children: React.ReactNode;
}

export function HospitalOnboardingLayout({ activeStep, children }: HospitalOnboardingLayoutProps) {
  const navigate = useNavigate();
  const progressPercent = (activeStep / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#F3FAFF] flex flex-col">
      <HospitalOnboardingNavbar />

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm shrink-0">
          <div className="px-6 py-7 flex-1">
            {/* Label */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">
              Registration
            </p>
            <p className="text-sm font-bold text-[#1B6DA1] mb-4">
              Hospital Onboarding
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400 mb-7">
              Step {activeStep + 1} of {STEPS.length}
            </p>

            {/* Step list */}
            <nav className="space-y-1.5">
              {STEPS.map((step) => {
                const completed = step.index < activeStep;
                const active    = step.index === activeStep;
                const Icon      = step.icon;

                return (
                  <button
                    key={step.index}
                    onClick={() => completed && navigate(step.path)}
                    className={[
                      "w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-sm font-medium",
                      "transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-teal-500/15 to-blue-500/10 text-[#1B6DA1] border border-teal-200/70 shadow-sm"
                        : completed
                        ? "text-neutral-600 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                        : "text-neutral-400 cursor-default",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                          active    ? "text-teal-600"
                          : completed ? "text-neutral-500"
                          : "text-neutral-300"
                        }`}
                      />
                      {step.label}
                    </span>
                    {completed && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom support links */}
          <div className="px-6 py-5 border-t border-gray-100 space-y-1">
            <button className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-neutral-700 transition-all duration-200 w-full px-3.5 py-2 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-300/50">
              <HelpCircle className="h-4 w-4" />
              Support
            </button>
            <button className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-neutral-700 transition-all duration-200 w-full px-3.5 py-2 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-300/50">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-12 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
