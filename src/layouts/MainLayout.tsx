import { ReactNode, useState } from "react";
import { HospitalSidebar } from "./components/HospitalSidebar";
import { HospitalTopBar } from "./components/HospitalTopBar";
import { AppProfile } from "@/types";
import { HospitalApprovalPendingBanner } from "@/features/hospital/components/HospitalApprovalPendingBanner";

interface MainLayoutProps {
  children: ReactNode;
  profile: AppProfile;
}

/**
 * Authenticated app shell. Only the hospital profile renders this layout —
 * health-worker (medical-staff) pages are a self-contained mobile PWA shell,
 * so RoleLayout skips MainLayout for them entirely.
 */
export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <HospitalSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        <HospitalTopBar onMenuClick={() => setSidebarOpen(true)} />

        <HospitalApprovalPendingBanner />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
