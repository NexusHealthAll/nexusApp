import { useNavigate } from "react-router-dom";
import { Ban, Eye, HelpCircle, Timer } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useRoleBasePath } from "@/features/onboarding/hooks/useRoleBasePath";
import { OnboardingNavbar } from "./OnboardingNavbar";

export function VerificationPendingStep() {
  const navigate = useNavigate();
  const basePath = useRoleBasePath();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e6f2f8]">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-secondary-600 via-primary-500 to-secondary-400" />

      <OnboardingNavbar />

      <div className="mx-auto max-w-lg px-4 pb-20 pt-6">
        {/* Main card */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          {/* Hourglass icon with status badge */}
          <div className="relative mx-auto mb-6 inline-flex">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary-100 bg-secondary-50">
              <Timer className="h-9 w-9 text-secondary-700" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning-400 text-[10px] font-bold text-white">
              ···
            </span>
          </div>

          <h1 className="mb-2 text-4xl font-bold text-neutral-900">
            Verification Pending
          </h1>
          <p className="mb-4 text-base font-semibold text-secondary-700">
            Your hospital is under review
          </p>
          <p className="mb-7 text-sm leading-relaxed text-neutral-500">
            We'll verify your credentials within 24-48 hours. We'll notify you
            via email and push notification once your institutional profile is
            activated.
          </p>

          <Button
            className="w-full bg-secondary-700 py-3 text-sm font-bold uppercase tracking-widest hover:bg-secondary-800"
            onClick={() =>
              navigate(`${basePath}/onboarding/accreditation-granted`)
            }
          >
            Go to Dashboard
          </Button>
          <button
            onClick={() => navigate(`${basePath}/onboarding/onboarding-status`)}
            className="mt-4 w-full text-center text-sm font-semibold text-secondary-700 underline underline-offset-2 hover:text-secondary-900"
          >
            View Verification Status Details
          </button>
        </div>

        {/* Info cards */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-secondary-100 bg-secondary-50/80 p-4">
            <Eye className="mb-2 h-5 w-5 text-secondary-700" />
            <p className="mb-1 text-sm font-semibold text-neutral-800">
              Read-Only Mode
            </p>
            <p className="text-xs text-neutral-500">
              You can browse the app, view available doctor profiles, and
              explore system tools.
            </p>
          </div>
          <div className="rounded-xl border border-secondary-100 bg-secondary-50/80 p-4">
            <Ban className="mb-2 h-5 w-5 text-secondary-700" />
            <p className="mb-1 text-sm font-semibold text-neutral-800">
              Action Restricted
            </p>
            <p className="text-xs text-neutral-500">
              Creation of new shifts and contract approvals are disabled until
              verified.
            </p>
          </div>
        </div>
      </div>

      {/* Watermark building outline */}
      <div
        className="pointer-events-none absolute bottom-8 right-0 h-48 w-64 overflow-hidden opacity-[0.06]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 200 150"
          fill="currentColor"
          className="text-neutral-800"
        >
          <rect x="40" y="80" width="120" height="70" />
          <rect x="80" y="40" width="40" height="40" />
          <rect x="55" y="95" width="20" height="55" />
          <rect x="85" y="95" width="30" height="55" />
          <rect x="125" y="95" width="20" height="55" />
          <rect x="85" y="55" width="30" height="25" />
        </svg>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-neutral-400">
          Lagos University Teaching Hospital Institutional Security © 2024
        </p>
      </footer>
    </div>
  );
}
