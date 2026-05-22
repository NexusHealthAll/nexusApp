import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { RoleLayout } from "@/layouts/RoleLayout";
import type { AppProfile } from "@/types";
import { DEFAULT_REDIRECT } from "./paths";
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

function buildRoleTree(
  basePath: string,
  profile: AppProfile,
  pageRoutes: RouteObject[],
  standaloneRoutes: RouteObject[] = [],
): RouteObject {
  const requiredRole = profile === 'medical-staff' ? 'medical-staff' : 'hospital-admin';
  
  return {
    path: `${basePath}/*`,
    element: (
      <ProtectedRoute requiredRole={requiredRole}>
        <RoleLayout profile={profile} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      ...buildOnboardingRoutes(profile),
      ...standaloneRoutes,

      ...pageRoutes,

      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  };
}

export const appRoutes: RouteObject[] = [
  ...authRoutes,
  ...adminRoutes,

  buildRoleTree(
    "/hospital",
    "hospital",
    hospitalPageRoutes,
    hospitalStandaloneRoutes,
  ),
  buildRoleTree("/medical-staff", "medical-staff", medicalStaffPageRoutes),
  buildRoleTree("/patient", "patient", patientPageRoutes),

  { path: "*", element: <Navigate to="/auth/login" replace /> },
];
