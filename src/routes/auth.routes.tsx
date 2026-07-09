import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import {
  EmailLogin,
  EmailSignup,
  OtpVerify,
  RoleSelection,
  EmailVerificationSuccess,
  PublicOnlyAuthRoute,
} from "@/shared/auth/components";
import { WaitlistLandingStep } from "@/shared/waitlist/components/WaitlistLandingStep";
import { WaitlistSuccessStep } from "@/shared/waitlist/components/WaitlistSuccessStep";
import { LandingPage } from "@/pages/landing";

export const authRoutes: RouteObject[] = [
  {
    path: "auth",
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      {
        path: "signup",
        element: (
          <PublicOnlyAuthRoute>
            <EmailSignup />
          </PublicOnlyAuthRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicOnlyAuthRoute>
            <EmailLogin />
          </PublicOnlyAuthRoute>
        ),
      },
      {
        path: "verify-otp",
        element: (
          <PublicOnlyAuthRoute>
            <OtpVerify />
          </PublicOnlyAuthRoute>
        ),
      },
      {
        path: "verification-success",
        element: (
          <PublicOnlyAuthRoute>
            <EmailVerificationSuccess />
          </PublicOnlyAuthRoute>
        ),
      },
      {
        path: "role-selection",
        element: (
          <PublicOnlyAuthRoute>
            <RoleSelection />
          </PublicOnlyAuthRoute>
        ),
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
