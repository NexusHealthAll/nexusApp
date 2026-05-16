import type { RouteObject } from "react-router-dom";
import { PatientList } from "@/features/patient/components/PatientList";
import { DoctorList } from "@/features/hospital/components/DoctorList";
import { AppointmentList } from "@/features/hospital/components/AppointmentList";

function MedicalStaffDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-lg font-semibold text-neutral-700">
        Medical Staff Dashboard
      </p>
      <p className="text-sm text-neutral-400">Coming soon</p>
    </div>
  );
}

export const medicalStaffPageRoutes: RouteObject[] = [
  { path: "dashboard", element: <MedicalStaffDashboard /> },
  { path: "appointments", element: <AppointmentList /> },
  { path: "patients", element: <PatientList /> },
  { path: "doctors", element: <DoctorList /> },
  { path: "analytics", element: <div>Analytics — Coming Soon</div> },
  { path: "settings", element: <div>Settings — Coming Soon</div> },
  { path: "help", element: <div>Help — Coming Soon</div> },
];
