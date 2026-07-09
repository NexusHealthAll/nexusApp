import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/shared/auth/components";

// Simple admin dashboard placeholder, kept alongside the route config it
// belongs to rather than split into its own file for one component.
// eslint-disable-next-line react-refresh/only-export-components
function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="hospital_admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <img
            src="/logo/nexus.png"
            alt="Nexus Care"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Hospital Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Coming Soon - Administrative tools and analytics
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("userData");
              window.location.href = "/auth/login";
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  },
];
