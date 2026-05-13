import { Button } from "@/shared/components/ui/Button";

export function OnboardingNavbar() {
  return (
    <nav className="bg-[#F3FAFFCC] px-6 py-3 shadow-md shadow-[#071E270F]">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexusCare" className="h-8 w-8" />
          <p className="text-lg font-bold tracking-wide text-[#1A5888]">
            NEXUS
            <span className="text-secondary-800">CARE</span>
          </p>
        </div>
        <div className="hidden items-center gap-6 text-sm text-neutral-600 sm:flex">
          <a href="#" className="hover:text-neutral-900">
            Support
          </a>
          <a href="#" className="hover:text-neutral-900">
            Guidelines
          </a>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="bg-onboarding-primaryGreen text-white hover:bg-onboarding-primaryGreenHover"
        >
          Sign In
        </Button>
      </div>
    </nav>
  );
}
