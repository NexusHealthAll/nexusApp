import type { RouteObject } from "react-router-dom";
import { DashboardOverview } from "@/features/hospital/components/DashboardOverview";
import { SettingsPage } from "@/shared/settings/components/SettingsPage";
import { HelpPage } from "@/shared/help/components/HelpPage";
import { ShiftSchedulePage } from "@/features/hospital/shifts/components/ShiftSchedulePage";
import { ShiftApprovalPage } from "@/features/hospital/shifts/components/ShiftApprovalPage";
import { ReviewApplicationsPage } from "@/features/hospital/shifts/components/ReviewApplicationsPage";
import { CreateShiftPage } from "@/features/hospital/shifts/components/CreateShiftPage";
import { WorkersPage } from "@/features/hospital/workers/components/WorkersPage";
import { VirtualShiftsPage } from "@/features/hospital/virtual/components/VirtualShiftsPage";
import { VirtualSessionPage } from "@/features/hospital/virtual/components/VirtualSessionPage";
import { HandoverReportsPage } from "@/features/hospital/handover/components/HandoverReportsPage";
import { HandoverReportDetailPage } from "@/features/hospital/handover/components/HandoverReportDetailPage";
import { PaymentsPage } from "@/features/hospital/payments/components/PaymentsPage";
import { MessagesPage } from "@/features/hospital/messages/components/MessagesPage";
import { NotificationsPage } from "@/features/hospital/notifications/components/NotificationsPage";
import { HospitalProfilePage } from "@/features/hospital/profile/components/HospitalProfilePage";
import { AnalyticsPage } from "@/features/hospital/analytics/components/AnalyticsPage";

export const hospitalPageRoutes: RouteObject[] = [
  { path: "dashboard", element: <DashboardOverview /> },
  { path: "shifts", element: <ShiftSchedulePage /> },
  { path: "shifts/:shiftId", element: <ShiftApprovalPage /> },
  { path: "shifts/:shiftId/review", element: <ReviewApplicationsPage /> },
  { path: "create-shift", element: <CreateShiftPage /> },
  { path: "virtual-shifts", element: <VirtualShiftsPage /> },
  { path: "virtual-shifts/:sessionId", element: <VirtualSessionPage /> },
  { path: "handover-reports", element: <HandoverReportsPage /> },
  { path: "handover-reports/:shiftId", element: <HandoverReportDetailPage /> },
  { path: "workers", element: <WorkersPage /> },
  { path: "workers/:workerId", element: <WorkersPage /> },
  { path: "payments", element: <PaymentsPage /> },
  { path: "messages", element: <MessagesPage /> },
  { path: "notifications", element: <NotificationsPage /> },
  { path: "analytics", element: <AnalyticsPage /> },
  { path: "profile", element: <HospitalProfilePage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "help", element: <HelpPage /> },
];

export const hospitalStandaloneRoutes: RouteObject[] = [];
