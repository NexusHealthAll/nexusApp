export type AppProfile = "hospital" | "medical-staff" | "patient";

export type OnboardingStep =
  | "hospital-registration"
  | "legal-verification"
  | "onboarding-status"
  | "verification-pending"
  | "accreditation-granted";
