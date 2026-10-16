import { Navigate, type RouteObject } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { HealthWorkerLayout } from "@/features/health-worker/components/HealthWorkerLayout";
import {
  ActiveShiftPage,
  AlreadyAppliedPage,
  ApplicationsPage,
  ClinicalReviewPage,
  ClockInPage,
  ConfirmShiftPage,
  ConsultationPage,
  EarningsPage,
  HandoverPage,
  HandoverReviewPage,
  HealthWorkerNotFoundPage,
  HomePage,
  MarketplacePage,
  NotificationsPage,
  PatientDetailPage,
  PatientIntakePage,
  ProfilePage,
  SchedulePage,
  ShiftDetailPage,
  ShiftInterestSentPage,
  VirtualCallPage,
  WaitingRoomPage,
} from "@/features/health-worker/components/HealthWorkerPages";

/**
 * Health-worker routes (relative to /medical-staff). Every screen has its own
 * URL; all of them render inside <HealthWorkerLayout /> (shared shell + shift
 * session). Paths are mirrored in `PATHS.medicalStaff`.
 */
export const medicalStaffPageRoutes: RouteObject[] = [
  {
    element: <HealthWorkerLayout />,
    children: [
      // Legacy entry point — auth flows still redirect here.
      { path: "dashboard", element: <Navigate to={PATHS.medicalStaff.home} replace /> },

      // Main tabs
      { path: "home", element: <HomePage /> },
      { path: "marketplace", element: <MarketplacePage /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "earnings", element: <EarningsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/edit", element: <ProfilePage editing /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "applications", element: <ApplicationsPage /> },

      // Shift detail + application flow
      { path: "shifts/:shiftId", element: <ShiftDetailPage /> },
      { path: "shifts/:shiftId/interest-sent", element: <ShiftInterestSentPage /> },
      { path: "shifts/:shiftId/already-applied", element: <AlreadyAppliedPage /> },
      { path: "shifts/:shiftId/confirm", element: <ConfirmShiftPage /> },

      // Working a shift
      { path: "shifts/:shiftId/clock-in", element: <ClockInPage /> },
      { path: "shifts/:shiftId/active", element: <ActiveShiftPage /> },
      { path: "shifts/:shiftId/call", element: <VirtualCallPage /> },
      { path: "shifts/:shiftId/waiting-room", element: <WaitingRoomPage /> },
      { path: "shifts/:shiftId/patients/new", element: <PatientIntakePage /> },
      { path: "shifts/:shiftId/patients/:patientId", element: <PatientDetailPage /> },
      {
        path: "shifts/:shiftId/patients/:patientId/consultation",
        element: <ConsultationPage />,
      },
      {
        path: "shifts/:shiftId/patients/:patientId/review",
        element: <ClinicalReviewPage />,
      },
      { path: "shifts/:shiftId/handover", element: <HandoverPage /> },
      { path: "shifts/:shiftId/handover/review", element: <HandoverReviewPage /> },

      { path: "*", element: <HealthWorkerNotFoundPage /> },
    ],
  },
];
