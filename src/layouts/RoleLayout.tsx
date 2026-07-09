import { Outlet } from "react-router-dom";
import { MainLayout } from "./MainLayout";
import type { AppProfile } from "@/types";

interface RoleLayoutProps {
  profile: AppProfile;
}

/**
 * Layout route wrapper used as the parent element for all role-scoped
 * authenticated pages. Renders the role-specific MainLayout shell and
 * exposes <Outlet /> so React Router can mount the matched child page.
 *
 * Health-worker pages are a self-contained mobile-app shell (their own
 * header + bottom tab bar, built to match the Figma "Nexus Care" designs)
 * rather than admin-style content nested in the shared hospital/admin
 * Sidebar + TopNavigation chrome, so medical-staff skips MainLayout here.
 */
export function RoleLayout({ profile }: RoleLayoutProps) {
  if (profile === "medical-staff") {
    return <Outlet />;
  }

  return (
    <MainLayout profile={profile}>
      <Outlet />
    </MainLayout>
  );
}
