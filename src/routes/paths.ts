/**
 * Centralised route path registry.
 *
 * All absolute paths used throughout the app are defined here.
 * Import `PATHS` in components and route configs instead of
 * hard-coding strings, so a path change only needs one edit.
 */

interface OnboardingPaths {
  readonly root: string;
  readonly registration: string;
  readonly legalVerification: string;
  readonly onboardingStatus: string;
  readonly verificationPending: string;
  readonly accreditationGranted: string;
}

interface RolePathGroup {
  readonly root: string;
  readonly dashboard: string;
  readonly patients: string;
  readonly doctors: string;
  readonly appointments: string;
  readonly analytics: string;
  readonly settings: string;
  readonly help: string;
  readonly shifts: string;
  readonly shiftCreate: string;
  readonly onboarding: OnboardingPaths;
}

function buildRolePaths(base: string): RolePathGroup {
  const ob = `${base}/onboarding`;
  return {
    root: base,
    dashboard: `${base}/dashboard`,
    patients: `${base}/patients`,
    doctors: `${base}/doctors`,
    appointments: `${base}/appointments`,
    analytics: `${base}/analytics`,
    settings: `${base}/settings`,
    help: `${base}/help`,
    shifts: `${base}/shifts`,
    shiftCreate: `${base}/shifts/create`,
    onboarding: {
      root: ob,
      registration: `${ob}/registration`,
      legalVerification: `${ob}/legal-verification`,
      onboardingStatus: `${ob}/onboarding-status`,
      verificationPending: `${ob}/verification-pending`,
      accreditationGranted: `${ob}/accreditation-granted`,
    },
  };
}

export const PATHS = {
  hospital: buildRolePaths("/hospital"),
  medicalStaff: buildRolePaths("/medical-staff"),
  patient: buildRolePaths("/patient"),
} as const;

/** App-level default landing route. */
export const DEFAULT_REDIRECT = PATHS.medicalStaff.dashboard;
