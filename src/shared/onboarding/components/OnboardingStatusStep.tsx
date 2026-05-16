import { useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useRoleBasePath } from "@/shared/onboarding/hooks/useRoleBasePath";
import { OnboardingNavbar } from "./OnboardingNavbar";
import { StepTracker } from "@/shared/components/ui/StepTracker";

export function OnboardingStatusStep() {
  const navigate = useNavigate();
  const basePath = useRoleBasePath();

  return (
    <div className="min-h-screen bg-[#F3FAFF]">
      <OnboardingNavbar />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Title row */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-neutral-900">
            Onboarding Status
          </h1>
        </div>

        <StepTracker activeIndex={2} />

        {/* Main content grid */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left card */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7 lg:col-span-2">
            {/* Watermark */}
            <ShieldCheck
              className="absolute right-6 top-6 h-28 w-28 text-neutral-100"
              aria-hidden="true"
            />

            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100">
              <Clock className="h-7 w-7 text-warning-600" />
            </div>

            <h2 className="mb-3 text-3xl font-bold text-neutral-900">
              Verification Pending
            </h2>
            <p className="mb-5 max-w-md text-neutral-600">
              Excellent work. Your professional documents and institutional
              credentials have been successfully uploaded and are now under
              clinical review by our administrative team.
            </p>

            <div className="mb-5 flex items-center gap-3 rounded-lg bg-secondary-50 px-4 py-3">
              <Clock className="h-4 w-4 text-secondary-600" />
              <span className="text-sm font-semibold text-secondary-800">
                24-48 Hours
              </span>
              <span className="text-sm text-neutral-500">
                Estimated time for final verification.
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest"
                onClick={() =>
                  navigate(`${basePath}/onboarding/accreditation-granted`)
                }
              >
                Explore Dashboard →
              </Button>
              <Button
                variant="outline"
                className="rounded-lg py-3 text-sm font-semibold uppercase tracking-widest"
              >
                View Submitted Docs
              </Button>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-onboarding-inputBackground p-5">
              <h3 className="mb-2 text-base font-semibold text-onboarding-textPrimary">
                Need Assistance?
              </h3>
              <p className="mb-3 text-xs text-onboarding-textSecondary">
                If you have questions about the verification process or need to
                update your submission, our concierge team is available.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-secondary-700">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>support@luthstaffing.gov</span>
                </div>
                <div className="flex items-center gap-2 text-secondary-700">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>+234 (0) 1 234 5678</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-secondary-900 to-primary-800 p-5 text-white">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-secondary-300">
                Institutional Quality
              </p>
              <p className="text-base font-semibold leading-snug">
                Ensuring the highest standards for LUTH medical staff.
              </p>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(
            [
              {
                icon: Lock,
                title: "Encrypted Data",
                desc: "Your credentials are stored using AES-256 encryption standards.",
              },
              {
                icon: RefreshCw,
                title: "Audit Trail",
                desc: "Every step of your verification is logged for institutional transparency.",
              },
              {
                icon: Bell,
                title: "Live Updates",
                desc: "You will receive an SMS and email notification once your status changes.",
              },
            ] as const
          ).map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="border-b border-neutral-200 bg-white p-4"
            >
              <Icon className="mb-2 h-5 w-5 text-secondary-600" />
              <p className="mb-1 text-sm font-semibold text-onboarding-textPrimary">
                {title}
              </p>
              <p className="text-xs text-onboarding-textSecondary">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          © 2024 Lagos University Teaching Hospital • Staffing &amp; Onboarding
          Portal
        </p>
      </div>
    </div>
  );
}
