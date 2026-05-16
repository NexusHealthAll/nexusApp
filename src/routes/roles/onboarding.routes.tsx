import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import type { RouteObject } from "react-router-dom";
import { HospitalRegistrationStep } from "@/shared/onboarding/components/HospitalRegistrationStep";
import { LegalVerificationStep } from "@/shared/onboarding/components/LegalVerificationStep";
import { OnboardingStatusStep } from "@/shared/onboarding/components/OnboardingStatusStep";
import { VerificationPendingStep } from "@/shared/onboarding/components/VerificationPendingStep";
import { AccreditationGrantedStep } from "@/shared/onboarding/components/AccreditationGrantedStep";
import type { AppProfile } from "@/types";

type OnboardingSlug =
  | "registration"
  | "legal-verification"
  | "onboarding-status"
  | "verification-pending"
  | "accreditation-granted";

interface OnboardingStepConfig {
  slug: OnboardingSlug;
  element: ReactElement;
}

const profileOnboardingSteps: Record<AppProfile, OnboardingStepConfig[]> = {
  hospital: [
    { slug: "registration", element: <HospitalRegistrationStep /> },
    { slug: "legal-verification", element: <LegalVerificationStep /> },
    { slug: "onboarding-status", element: <OnboardingStatusStep /> },
    { slug: "accreditation-granted", element: <AccreditationGrantedStep /> },
  ],
  "medical-staff": [
    { slug: "registration", element: <HospitalRegistrationStep /> },
    { slug: "verification-pending", element: <VerificationPendingStep /> },
    { slug: "accreditation-granted", element: <AccreditationGrantedStep /> },
  ],
  patient: [
    { slug: "registration", element: <HospitalRegistrationStep /> },
    { slug: "accreditation-granted", element: <AccreditationGrantedStep /> },
  ],
};

export function buildOnboardingRoutes(profile: AppProfile): RouteObject[] {
  const steps = profileOnboardingSteps[profile];
  const firstSlug = steps[0].slug;

  return [
    { path: "onboarding", element: <Navigate to={firstSlug} replace /> },

    ...steps.map(({ slug, element }) => ({
      path: `onboarding/${slug}`,
      element,
    })),
  ];
}
