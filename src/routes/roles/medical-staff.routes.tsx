import type { RouteObject } from "react-router-dom";
import { HealthWorkerDashboard } from "@/features/health-worker/components/HealthWorkerDashboard";
import { ConsultationWrapper } from "@/features/appointments/components/ConsultationWrapper";
import { PatientList } from "@/features/patient/components/PatientList";
import { AppointmentList } from "@/features/hospital/components/AppointmentList";

export const medicalStaffPageRoutes: RouteObject[] = [
  { path: "dashboard", element: <HealthWorkerDashboard /> },
  { path: "consultation/:appointmentId/:patientId", element: <ConsultationWrapper /> },
  { path: "appointments", element: <AppointmentList /> },
  { path: "patients", element: <PatientList /> },
  { path: "analytics", element: <div>Health Worker Analytics — Coming Soon</div> },
  { path: "settings", element: <div>Settings — Coming Soon</div> },
  { path: "help", element: <div>Help — Coming Soon</div> },
];
