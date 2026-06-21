import { Bell, HelpCircle } from "lucide-react";

export function HospitalOnboardingNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo/nexus.png" alt="NexusCare" className="h-8 w-8" />
        <span className="text-base font-extrabold tracking-wide text-[#1A5888]">
          NEXUS<span className="text-teal-600">CARE</span>
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-neutral-500">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-neutral-500">
          <HelpCircle className="h-5 w-5" />
        </button>
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
          A
        </div>
      </div>
    </nav>
  );
}
