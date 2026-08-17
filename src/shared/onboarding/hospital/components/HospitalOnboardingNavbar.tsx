// import { Bell, HelpCircle } from "lucide-react";

export function HospitalOnboardingNavbar() {
  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo/nexus.png" alt="NexusCare" className="h-8 w-full" />
      </div>
    </nav>
  );
}
