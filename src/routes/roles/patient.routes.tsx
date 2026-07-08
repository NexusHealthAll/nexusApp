import type { RouteObject } from "react-router-dom";

// Placeholder dashboard, kept alongside the route config it belongs to
// rather than split into its own file for one component.
// eslint-disable-next-line react-refresh/only-export-components
function PatientDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-lg font-semibold text-neutral-700">
        Patient Dashboard
      </p>
      <p className="text-sm text-neutral-400">Coming soon</p>
    </div>
  );
}

export const patientPageRoutes: RouteObject[] = [
  { path: "dashboard", element: <PatientDashboard /> },
  { path: "appointments", element: <div>Appointments — Coming Soon</div> },
  { path: "doctors", element: <div>Doctors — Coming Soon</div> },
  { path: "messages", element: <div>Messages — Coming Soon</div> },
  { path: "settings", element: <div>Settings — Coming Soon</div> },
  { path: "help", element: <div>Help — Coming Soon</div> },
];
