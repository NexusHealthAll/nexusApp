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
  readonly workers: string;
  readonly workerDetail: (workerId: string) => string;
  readonly appointments: string;
  readonly analytics: string;
  readonly settings: string;
  readonly help: string;
  readonly shifts: string;
  readonly shiftDetail: (shiftId: string) => string;
  readonly createShift: string;
  readonly virtualShifts: string;
  readonly handoverReports: string;
  readonly handoverReportDetail: (shiftId: string) => string;
  readonly payments: string;
  readonly notifications: string;
  readonly messages: string;
  readonly findShifts: string;
  readonly myShifts: string;
  readonly patientNotes: string;
  readonly earnings: string;
  readonly profile: string;
  readonly onboarding: OnboardingPaths;
}

function buildRolePaths(base: string): RolePathGroup {
  const ob = `${base}/onboarding`;
  return {
    root: base,
    dashboard: `${base}/dashboard`,
    patients: `${base}/patients`,
    workers: `${base}/workers`,
    workerDetail: (workerId: string) => `${base}/workers/${workerId}`,
    appointments: `${base}/appointments`,
    analytics: `${base}/analytics`,
    settings: `${base}/settings`,
    help: `${base}/help`,
    shifts: `${base}/shifts`,
    shiftDetail: (shiftId: string) => `${base}/shifts/${shiftId}`,
    createShift: `${base}/create-shift`,
    virtualShifts: `${base}/virtual-shifts`,
    handoverReports: `${base}/handover-reports`,
    handoverReportDetail: (shiftId: string) =>
      `${base}/handover-reports/${shiftId}`,
    payments: `${base}/payments`,
    notifications: `${base}/notifications`,
    messages: `${base}/messages`,
    findShifts: `${base}/find-shifts`,
    myShifts: `${base}/my-shifts`,
    patientNotes: `${base}/patient-notes`,
    earnings: `${base}/earnings`,
    profile: `${base}/profile`,
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
} as const;

/** App-level default landing route. */
export const DEFAULT_REDIRECT = PATHS.medicalStaff.onboarding.registration;
