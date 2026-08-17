import { Button } from "@/shared/components/ui/Button";

export function OnboardingNavbar() {
  return (
    <nav className="bg-[#F3FAFFCC] px-6 py-3 shadow-md shadow-[#071E270F] dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexusCare" className="h-8 w-8" />
          <p className="text-lg font-bold tracking-wide text-[#1A5888] dark:text-[#5AA6D6]">
            NEXUS
            <span className="text-secondary-800 dark:text-secondary-300">CARE</span>
          </p>
        </div>
        <div className="hidden items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400 sm:flex">
          <a href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100">
            Support
          </a>
          <a href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100">
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
