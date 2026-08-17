import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BarChart2,
  Radio,
  ShieldCheck,
  Users2,
  Wallet,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useRoleBasePath } from "@/shared/onboarding/hooks/useRoleBasePath";
import { OnboardingNavbar } from "./OnboardingNavbar";
import { StepTracker } from "@/shared/components/ui/StepTracker";

const features = [
  {
    icon: Radio,
    title: "Unlimited Shift Broadcasting",
    desc: "Reach our entire network of vetted clinicians instantly.",
  },
  {
    icon: Users2,
    title: "Direct Clinician Outreach",
    desc: "Invite top-rated specialists directly to your departments.",
  },
  {
    icon: Wallet,
    title: "Verified Payroll Integration",
    desc: "Automated billing and seamless clinician compensation.",
  },
  {
    icon: BarChart2,
    title: "Performance Analytics",
    desc: "Access deep insights into staffing efficiency and costs.",
  },
] as const;

export function AccreditationGrantedStep() {
  const basePath = useRoleBasePath();

  return (
    <div className="min-h-screen bg-[#F3FAFF] dark:bg-neutral-950">
      <OnboardingNavbar />

      <div className="mx-auto max-w-2xl px-4 pt-8 mt-8 mb-6">
        <StepTracker activeIndex={3} />
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-12">
        <div className="relative overflow-hidden rounded-2xl bg-white p-10 text-center shadow-md dark:bg-neutral-900">
          {/* Watermark badge */}
          <BadgeCheck
            className="absolute right-6 top-6 h-28 w-28 text-neutral-100 dark:text-neutral-800"
            aria-hidden="true"
          />

          {/* Top icon */}
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-100 dark:bg-secondary-950">
            <ShieldCheck className="h-9 w-9 text-secondary-700 dark:text-secondary-300" />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold text-onboarding-textPrimary dark:text-neutral-50">
            Accreditation Granted
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-sm leading-relaxed text-onboarding-textSecondary dark:text-neutral-400">
            Lagos University Teaching Hospital is now a verified institution on
            the NexusCare platform. Your clinical standards have been
            successfully validated.
          </p>

          {/* Feature cards 2×2 */}
          <div className="mb-8 grid grid-cols-2 gap-3 text-left">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl bg-onboarding-inputBackground p-4 dark:bg-neutral-800"
              >
                <Icon className="mb-2 h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                <p className="mb-1 text-sm font-semibold text-onboarding-textPrimary dark:text-neutral-50">
                  {title}
                </p>
                <p className="text-xs text-onboarding-textSecondary dark:text-neutral-400">{desc}</p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to={`${basePath}/dashboard`}>
              <Button className="rounded-lg bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-8 py-3 text-sm font-semibold uppercase tracking-widest">
                Go to Dashboard
              </Button>
            </Link>
            <button className="text-sm font-semibold text-secondary-700 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-secondary-100">
              View Credentials Profile
            </button>
          </div>
        </div>

        {/* Footer trust bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm sm:flex-row dark:bg-neutral-900">
          {/* Encryption */}
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-secondary-700 dark:text-secondary-400" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              256-bit Institutional Encryption Active
            </span>
          </div>

          {/* Avatar stack + trust count */}
          <div className="flex items-center gap-3">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {[
                "/avatars/doc1.jpg",
                "/avatars/doc2.jpg",
                "/avatars/doc3.jpg",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-neutral-900"
                />
              ))}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-secondary-600 text-[10px] font-bold text-white dark:border-neutral-900">
                +12k
              </div>
            </div>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Trusted by 12,000+ Nigerian Healthcare Professionals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
