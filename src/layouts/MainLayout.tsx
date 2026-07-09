import { ReactNode, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNavigation } from "./components/TopNavigation";
import { AppProfile } from "@/types";
import { CreateShiftModal } from "@/features/hospital/shifts/components/CreateShiftModal";
import { HospitalApprovalPendingBanner } from "@/features/hospital/components/HospitalApprovalPendingBanner";

interface MainLayoutProps {
  children: ReactNode;
  profile: AppProfile;
}

const profileLayoutStyles: Record<
  AppProfile,
  { shell: string; content: string }
> = {
  hospital: {
    shell: "bg-secondary-50/40",
    content: "mx-auto bg-onboarding-mainBackground p-4 lg:p-6",
  },
  "medical-staff": {
    shell: "bg-primary-50/40",
    content: "mx-auto bg-neutral-50 p-4 lg:p-6",
  },
};

export function MainLayout({ children, profile }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const layoutStyles = profileLayoutStyles[profile];

  return (
    <div className={`flex h-screen ${layoutStyles.shell}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        {/* Top Navigation */}
        <TopNavigation
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {profile === "hospital" && <HospitalApprovalPendingBanner />}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={layoutStyles.content}>{children}</div>
        </main>

      </div>

      {profile === "hospital" && <CreateShiftModal />}
    </div>
  );
}
