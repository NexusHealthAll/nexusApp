import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { EmailLogin, OtpVerify, RoleSelection, SplashScreen } from "@/features/auth/components";
import { ProfessionalProfile, PayoutSetup } from "@/features/onboarding/components";

export const authRoutes: RouteObject[] = [
  {
    path: "auth",
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <EmailLogin /> },
      { path: "verify-otp", element: <OtpVerify /> },
      { path: "role-selection", element: <RoleSelection /> },
      {
        path: "onboarding",
        children: [
          { index: true, element: <Navigate to="professional-profile" replace /> },
          { path: "professional-profile", element: <ProfessionalProfile /> },
          { path: "payout-setup", element: <PayoutSetup /> },
          { path: "*", element: <Navigate to="professional-profile" replace /> },
        ],
      },
      { path: "*", element: <Navigate to="login" replace /> },
    ],
  },
  // Splash screen as root
  { path: "/", element: <SplashScreen /> },
];