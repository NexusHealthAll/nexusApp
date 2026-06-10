import { ReactNode, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopNavigation } from "./components/TopNavigation";
import { AppProfile } from "@/types";

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
  patient: {
    shell: "bg-success-50/40",
    content:
      "mx-auto max-w-6xl rounded-2xl border border-success-100 bg-white p-4 lg:p-6",
  },
  "medical-staff": {
    shell: "bg-warning-50/50",
    content:
      "mx-auto max-w-7xl rounded-2xl border border-warning-100 bg-white p-4 lg:p-6",
  },
};

export function MainLayout({ children, profile }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const layoutStyles = profileLayoutStyles[profile];

  if (profile === "medical-staff") {
    return <main className="min-h-screen bg-[#eef7fb]">{children}</main>;
  }

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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={layoutStyles.content}>{children}</div>
        </main>

        {/* Setup Progress Footer — hospital profile only */}
        {profile === "hospital" && (
          <div className="flex h-10 flex-shrink-0 items-center justify-between border-t border-neutral-200 bg-white px-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Setup Progress
              </span>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-secondary-600 to-secondary-400" />
              </div>
              <span className="text-xs font-semibold text-secondary-700">
                75%
              </span>
            </div>
            <button className="text-xs font-semibold text-secondary-600 hover:text-secondary-900">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
