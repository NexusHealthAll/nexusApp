import type { RouteObject } from "react-router-dom";
import { DashboardOverview } from "@/features/hospital/components/DashboardOverview";
import { PatientList } from "@/features/patient/components/PatientList";
import { DoctorList } from "@/features/hospital/components/DoctorList";
import { AppointmentList } from "@/features/hospital/components/AppointmentList";
import { HospitalAnalyticsPage } from "@/features/hospital/analytics/components/HospitalAnalyticsPage";
import { SettingsPage } from "@/shared/settings/components/SettingsPage";
import { HelpPage } from "@/shared/help/components/HelpPage";
import { ShiftSchedulePage } from "@/features/hospital/shifts/components/ShiftSchedulePage";
import { ShiftApprovalPage } from "@/features/hospital/shifts/components/ShiftApprovalPage";
import { WorkersPage } from "@/features/hospital/workers/components/WorkersPage";

export const hospitalPageRoutes: RouteObject[] = [
  { path: "dashboard", element: <DashboardOverview /> },
  { path: "patients", element: <PatientList /> },
  { path: "doctors", element: <DoctorList /> },
  { path: "workers", element: <WorkersPage /> },
  { path: "shifts", element: <ShiftSchedulePage /> },
  { path: "shifts/:shiftId", element: <ShiftApprovalPage /> },
  { path: "appointments", element: <AppointmentList /> },
  { path: "analytics", element: <HospitalAnalyticsPage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "help", element: <HelpPage /> },
];

export const hospitalStandaloneRoutes: RouteObject[] = [];
