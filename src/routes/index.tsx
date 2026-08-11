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
import { authRoutes } from "./auth.routes";
import { adminRoutes } from "./admin.routes";
import {
  ProtectedRoute,
  PublicOnlyAuthRoute,
} from "@/shared/auth/components";
import {
  HospitalDetailsStep,
  LocationGeofencingStep,
  IdentityVerificationStep,
  VerificationStatusStep,
} from "@/shared/onboarding/hospital/components";
import { OnboardingProvider } from "@/shared/onboarding/hospital/context/OnboardingContext";
import {
  ProfessionalProfile,
  IdentityVerification,
  PayoutSetup,
  VerificationPending,
} from "@/shared/onboarding/health-worker/components";
import { InstallGate } from "@/features/health-worker/components/InstallGate";
import { useAuthStore } from "@/shared/auth/store/authStore";

function buildRoleTree(
  basePath: string,
  profile: AppProfile,
  pageRoutes: RouteObject[],
  standaloneRoutes: RouteObject[] = [],
): RouteObject[] {
  // ProtectedRoute's requiredRole matches the backend's UserRole enum
  // ("health_worker"), not the frontend-only "medical-staff" AppProfile label.
  const requiredRole =
    profile === "medical-staff" ? "health_worker" : "hospital_admin";

  // Onboarding routes are public — no auth check required
  const onboardingRoutes = buildOnboardingRoutes(profile).map((route) => ({
    ...route,
    path: `${basePath}/${route.path}`,
  }));

  // Health workers must use the installed PWA — InstallGate hard-blocks
  // browser-tab access to every post-login medical-staff route (prod only).
  const roleLayout =
    profile === "medical-staff" ? (
      <InstallGate>
        <RoleLayout profile={profile} />
      </InstallGate>
    ) : (
      <RoleLayout profile={profile} />
    );

  // All other role routes remain protected
  const protectedTree: RouteObject = {
    path: `${basePath}/*`,
    element: (
      <ProtectedRoute requiredRole={requiredRole}>{roleLayout}</ProtectedRoute>
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
        path: "/hospital/onboarding/identity-verification",
        element: <IdentityVerificationStep />,
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

function OnboardingAuthGuard({ children }: { children: React.ReactNode }) {
  const clinicianId = useAuthStore((s) => s.clinicianId);
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!clinicianId && !accessToken) {
    return <Navigate to="/auth/login" replace />;
  }
  return <>{children}</>;
}

/**
 * Health-worker onboarding (identity, professional profile, payout) runs right
 * after registration and before login, using the pending clinician context.
 */
const medicalStaffOnboardingRoutes: RouteObject[] = [
  {
    element: (
      <InstallGate>
        <OnboardingAuthGuard>
          <Outlet />
        </OnboardingAuthGuard>
      </InstallGate>
    ),
    children: [
      {
        path: "/medical-staff/onboarding/identity",
        element: <IdentityVerification />,
      },
      {
        path: "/medical-staff/onboarding/profile",
        element: <ProfessionalProfile />,
      },
      {
        path: "/medical-staff/onboarding/payout",
        element: <PayoutSetup />,
      },
      {
        path: "/medical-staff/onboarding/pending",
        element: <VerificationPending />,
      },
    ],
  },
];

export const appRoutes: RouteObject[] = [
  ...authRoutes,
  ...adminRoutes,

  // Hospital-specific onboarding (new sidebar layout) — must come before buildRoleTree
  ...hospitalOnboardingRoutes,
  ...medicalStaffOnboardingRoutes,

  ...buildRoleTree(
    "/hospital",
    "hospital",
    hospitalPageRoutes,
    hospitalStandaloneRoutes,
  ),
  ...buildRoleTree("/medical-staff", "medical-staff", medicalStaffPageRoutes),

  { path: "*", element: <Navigate to="/auth/login" replace /> },
];
