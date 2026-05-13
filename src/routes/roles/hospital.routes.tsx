import type { RouteObject } from "react-router-dom";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { PatientList } from "@/features/patients/components/PatientList";
import { DoctorList } from "@/features/doctors/components/DoctorList";
import { AppointmentList } from "@/features/appointments/components/AppointmentList";
import { AnalyticsPage } from "@/features/analytics/components/AnalyticsPage";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { HelpPage } from "@/features/help/components/HelpPage";

export const hospitalPageRoutes: RouteObject[] = [
  { path: "dashboard", element: <DashboardOverview /> },
  { path: "patients", element: <PatientList /> },
  { path: "doctors", element: <DoctorList /> },
  { path: "appointments", element: <AppointmentList /> },
  { path: "analytics", element: <AnalyticsPage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "help", element: <HelpPage /> },
];
