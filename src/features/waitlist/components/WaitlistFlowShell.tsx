import { Link, Outlet } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Button } from "@/shared/components/ui/Button";
import {
  waitlistFooterSections,
  waitlistNavItems,
} from "../constants/waitlistContent";
import { useWaitlistFlow } from "./waitlistFlowContext";
import { WaitlistJoinModalFlow } from "./WaitlistJoinModalFlow";

export function WaitlistFlowShell() {
  const { openJoinModal } = useWaitlistFlow();

  return (
    <div className="min-h-screen bg-white text-onboarding-textPrimary">
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link aria-label="NexusCare home" className="shrink-0" to="/">
            <NexusCareLogo size="md" />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 md:flex"
          >
            {waitlistNavItems.map((item) => (
              <Link
                key={item}
                to="/"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-onboarding-primaryBlue"
              >
                {item}
              </Link>
            ))}
          </nav>

          <Button
            type="button"
            onClick={openJoinModal}
            className="rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-5 text-sm font-semibold text-white shadow-soft"
          >
            Join Waitlist
          </Button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <WaitlistJoinModalFlow />

      <footer className="border-t border-neutral-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_repeat(3,_1fr)]">
          <div>
            <NexusCareLogo size="md" />
            <p className="mt-5 max-w-xs text-sm leading-7 text-neutral-600">
              Editorial grace in every interaction. Clinical precision in every
              byte.
            </p>
          </div>

          {waitlistFooterSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900">
                {section.title}
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-neutral-600">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="transition-colors hover:text-onboarding-primaryBlue"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-7xl items-center justify-center border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
          <CheckCircle2 className="mr-2 h-4 w-4 text-secondary-700" />
          <p>
            © 2024 NexusCare AI. Crafted with clinical precision and editorial
            grace.
          </p>
        </div>
      </footer>
    </div>
  );
}
