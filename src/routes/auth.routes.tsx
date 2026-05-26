import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import {
  EmailLogin,
  OtpVerify,
  RoleSelection,
} from "@/features/auth/components";
import {
  ProfessionalProfile,
  PayoutSetup,
} from "@/features/onboarding/components";
import { WaitlistLandingStep } from "@/features/waitlist/components/WaitlistLandingStep";
import { WaitlistSuccessStep } from "@/features/waitlist/components/WaitlistSuccessStep";
import { LandingPage } from "@/pages/landing";

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
          {
            index: true,
            element: <Navigate to="professional-profile" replace />,
          },
          { path: "professional-profile", element: <ProfessionalProfile /> },
          { path: "payout-setup", element: <PayoutSetup /> },
          {
            path: "*",
            element: <Navigate to="professional-profile" replace />,
          },
        ],
      },
      { path: "*", element: <Navigate to="login" replace /> },
    ],
  },
  {
    path: "/",
    element: <LandingPage />,
    children: [
      { index: true, element: <WaitlistLandingStep /> },
      { path: "success", element: <WaitlistSuccessStep /> },
    ],
  },
  {
    path: "/waitlist",
    children: [
      { index: true, element: <Navigate to="/" replace /> },
      { path: "landing", element: <Navigate to="/" replace /> },
      { path: "join", element: <Navigate to="/" replace /> },
      { path: "form/hospital", element: <Navigate to="/" replace /> },
      { path: "form/health-worker", element: <Navigate to="/" replace /> },
      { path: "success", element: <Navigate to="/success" replace /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
