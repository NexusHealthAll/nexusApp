import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { RoleLayout } from "@/layouts/RoleLayout";
import type { AppProfile } from "@/types";
import { buildOnboardingRoutes } from "./roles/onboarding.routes";
import {
  hospitalPageRoutes,
  hospitalStandaloneRoutes,
} from "./roles/hospital.routes";
import { medicalStaffPageRoutes } from "./roles/medical-staff.routes";
import { patientPageRoutes } from "./roles/patient.routes";
import { authRoutes } from "./auth.routes";
import { adminRoutes } from "./admin.routes";
import { ProtectedRoute } from "@/features/auth/components";
import {
  HospitalDetailsStep,
  LocationGeofencingStep,
  FinancialSetupStep,
  VerificationStatusStep,
} from "@/features/hospital/onboarding/components";

function buildRoleTree(
  basePath: string,
  profile: AppProfile,
  pageRoutes: RouteObject[],
  standaloneRoutes: RouteObject[] = [],
): RouteObject[] {
  const requiredRole =
    profile === "medical-staff" ? "medical-staff" : "hospital-admin";

  // Onboarding routes are public — no auth check required
  const onboardingRoutes = buildOnboardingRoutes(profile).map((route) => ({
    ...route,
    path: `${basePath}/${route.path}`,
  }));

  // All other role routes remain protected
  const protectedTree: RouteObject = {
    path: `${basePath}/*`,
    element: (
      <ProtectedRoute requiredRole={requiredRole}>
        <RoleLayout profile={profile} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      ...standaloneRoutes,
      ...pageRoutes,

      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  };

  return [...onboardingRoutes, protectedTree];
}

/** Hospital-specific onboarding routes with the new sidebar layout */
const hospitalOnboardingRoutes: RouteObject[] = [
  // Canonical new routes
  { path: "/hospital/onboarding/registration",        element: <HospitalDetailsStep /> },
  { path: "/hospital/onboarding/location",            element: <LocationGeofencingStep /> },
  { path: "/hospital/onboarding/financial-setup",     element: <FinancialSetupStep /> },
  { path: "/hospital/onboarding/verification-status", element: <VerificationStatusStep /> },
  // Redirect old slugs → new canonical slugs
  { path: "/hospital/onboarding/legal-verification",     element: <Navigate to="/hospital/onboarding/location" replace /> },
  { path: "/hospital/onboarding/onboarding-status",      element: <Navigate to="/hospital/onboarding/verification-status" replace /> },
  { path: "/hospital/onboarding/accreditation-granted",  element: <Navigate to="/hospital/onboarding/verification-status" replace /> },
  { path: "/hospital/onboarding",                        element: <Navigate to="/hospital/onboarding/registration" replace /> },
];

export const appRoutes: RouteObject[] = [
  ...authRoutes,
  ...adminRoutes,

  // Hospital-specific onboarding (new sidebar layout) — must come before buildRoleTree
  ...hospitalOnboardingRoutes,

  ...buildRoleTree(
    "/hospital",
    "hospital",
    hospitalPageRoutes,
    hospitalStandaloneRoutes,
  ),
  ...buildRoleTree("/medical-staff", "medical-staff", medicalStaffPageRoutes),
  ...buildRoleTree("/patient", "patient", patientPageRoutes),

  { path: "*", element: <Navigate to="/auth/login" replace /> },
];
