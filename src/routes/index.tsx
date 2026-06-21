import { Navigate, Outlet } from "react-router-dom";
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
import {
  ProtectedRoute,
  PublicOnlyAuthRoute,
} from "@/features/auth/components";
import {
  HospitalDetailsStep,
  LocationGeofencingStep,
  VerificationStatusStep,
} from "@/features/hospital/onboarding/components";
import { OnboardingProvider } from "@/features/hospital/onboarding/context/OnboardingContext";

function buildRoleTree(
  basePath: string,
  profile: AppProfile,
  pageRoutes: RouteObject[],
  standaloneRoutes: RouteObject[] = [],
): RouteObject[] {
  const requiredRole =
    profile === "medical-staff" ? "medical-staff" : "hospital_admin";

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

/** Hospital-specific onboarding routes — wrapped in OnboardingProvider for shared form context */
const hospitalOnboardingRoutes: RouteObject[] = [
  {
    // Layout route: provides OnboardingProvider to all child steps
    element: (
      <PublicOnlyAuthRoute>
        <OnboardingProvider>
          <Outlet />
        </OnboardingProvider>
      </PublicOnlyAuthRoute>
    ),
    children: [
      {
        path: "/hospital/onboarding/registration",
        element: <HospitalDetailsStep />,
      },
      {
        path: "/hospital/onboarding/location",
        element: <LocationGeofencingStep />,
      },
      {
        path: "/hospital/onboarding/verification-status",
        element: <VerificationStatusStep />,
      },
    ],
  },
  // Redirect old slugs → new canonical slugs (outside provider — no form data needed)
  {
    path: "/hospital/onboarding/legal-verification",
    element: (
      <PublicOnlyAuthRoute>
        <Navigate to="/hospital/onboarding/location" replace />
      </PublicOnlyAuthRoute>
    ),
  },
  {
    path: "/hospital/onboarding/onboarding-status",
    element: (
      <PublicOnlyAuthRoute>
        <Navigate to="/hospital/onboarding/verification-status" replace />
      </PublicOnlyAuthRoute>
    ),
  },
  {
    path: "/hospital/onboarding/accreditation-granted",
    element: (
      <PublicOnlyAuthRoute>
        <Navigate to="/hospital/onboarding/verification-status" replace />
      </PublicOnlyAuthRoute>
    ),
  },
  {
    path: "/hospital/onboarding",
    element: (
      <PublicOnlyAuthRoute>
        <Navigate to="/hospital/onboarding/registration" replace />
      </PublicOnlyAuthRoute>
    ),
  },
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
