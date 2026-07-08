import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
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
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<
    "hospital" | "health-worker" | null
  >(null);

  useEffect(() => {
    if (!isDropdownOpen) {
      setOpenAccordion(null);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Close when clicking anywhere outside the dropdown+button wrapper
      if (!target.closest("[data-waitlist-get-started]")) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isDropdownOpen]);

  const handleLoginNavigation = useCallback((role: "hospital" | "health-worker") => {
    const hasToken = !!localStorage.getItem("accessToken");
    if (!hasToken) {
      // Track which auth flow started from (so OTP + redirects can use correct API behavior)
      if (role === "hospital") {
        useAuthStore.getState().setAuthFlowOrigin("hospital-onboarding");
      } else {
        // store currently supports only "hospital-onboarding" | "normal" | null
        useAuthStore.getState().setAuthFlowOrigin("normal");
      }

      localStorage.setItem("selectedRole", role);

      // Start the same role/action auth selection flow as the landing screen.
      // This ensures OTP verification + redirects have consistent context.
      useAuthStore.getState().setActiveAuthFlow({
        role,
        action: "login",
        origin: "landing",
      });

      navigate("/auth/login");
      return;
    }

    // If already logged in, route to dashboards
    try {
      const raw = localStorage.getItem("userData");
      const parsed = raw ? JSON.parse(raw) : null;
      const currentRole = parsed?.role as string | undefined;

      if (currentRole === "hospital_admin") {
        navigate("/hospital/dashboard");
        return;
      }

      if (currentRole === "medical-staff") {
        navigate("/medical-staff/dashboard");
        return;
      }
    } catch {
      // ignore
    }

    navigate("/auth/login");
  }, [navigate]);

  const handleRegisterNavigation = useCallback((role: "hospital" | "health-worker") => {
    if (role === "hospital") {
      // Hospital register currently creates a temp hospital admin user
      // and routes into hospital onboarding.
      const tempAuthToken = `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tempUserData = {
        id: `user_${Date.now()}`,
        fullName: "Hospital Administrator",
        email: "",
        role: "hospital_admin",
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("authToken", tempAuthToken);
      localStorage.setItem("userData", JSON.stringify(tempUserData));
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("emailVerified");

      navigate("/hospital/onboarding/registration");
      return;
    }

    // Health worker register: use the same login→OTP→verify→onboarding flow.
    // Let the clinicians OTP endpoints be triggered after email entry.
    useAuthStore.getState().setAuthFlowOrigin("normal");

    localStorage.setItem("selectedRole", role);

    useAuthStore.getState().setActiveAuthFlow({
      role: "health-worker",
      action: "register",
      origin: "landing",
    });

    // Navigate to email capture. EmailLogin will send clinicians OTP.
    navigate("/auth/login");
  }, [navigate]);

  const dropdownContent = useMemo(() => {
    const hospitalOpen = openAccordion === "hospital";
    const workerOpen = openAccordion === "health-worker";

    return (
      <div className="mt-3 w-[22rem] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
        <div className="p-3">
          {/* Hospital accordion */}
          <div className="rounded-xl border border-neutral-200/80 bg-white/80">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              aria-expanded={hospitalOpen}
              onClick={() =>
                setOpenAccordion((prev) =>
                  prev === "hospital" ? null : "hospital",
                )
              }
            >
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Hospital
                </p>
                <p className="text-xs text-neutral-600">
                  Join as a facility admin
                </p>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${
                  hospitalOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                hospitalOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    data-waitlist-get-started
                    type="button"
                    onClick={() => handleLoginNavigation("hospital")}
                    className="h-9 rounded-lg bg-transparent hover:bg-onboarding-primaryBlue/10 text-onboarding-primaryBlue border border-onboarding-primaryBlue/40 px-3 text-sm font-semibold"
                  >
                    Login
                  </Button>
                  <Button
                    data-waitlist-get-started
                    type="button"
                    onClick={() => handleRegisterNavigation("hospital")}
                    className="h-9 rounded-lg bg-transparent hover:bg-onboarding-primaryBlue/10 text-onboarding-primaryBlue border border-onboarding-primaryBlue/40 px-3 text-sm font-semibold"
                  >
                    Register
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Health worker accordion */}
          <div className="mt-3 rounded-xl border border-neutral-200/80 bg-white/80">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              aria-expanded={workerOpen}
              onClick={() =>
                setOpenAccordion((prev) =>
                  prev === "health-worker" ? null : "health-worker",
                )
              }
            >
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Health worker
                </p>
                <p className="text-xs text-neutral-600">Join as a clinician</p>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${
                  workerOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                workerOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    data-waitlist-get-started
                    type="button"
                    onClick={() => handleLoginNavigation("health-worker")}
                    className="h-9 rounded-lg bg-transparent hover:bg-onboarding-primaryBlue/10 text-onboarding-primaryBlue border border-onboarding-primaryBlue/40 px-3 text-sm font-semibold"
                  >
                    Login
                  </Button>
                  <Button
                    data-waitlist-get-started
                    type="button"
                    onClick={() => handleRegisterNavigation("health-worker")}
                    className="h-9 rounded-lg bg-transparent hover:bg-onboarding-primaryBlue/10 text-onboarding-primaryBlue border border-onboarding-primaryBlue/40 px-3 text-sm font-semibold"
                  >
                    Register
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [openAccordion, handleLoginNavigation, handleRegisterNavigation]);

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

          <div className="flex flex-row gap-4">
            <Button
              type="button"
              onClick={openJoinModal}
              className="rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-5 text-sm font-semibold text-white shadow-soft"
            >
              Join Waitlist
            </Button>

            <div className="relative" data-waitlist-get-started>
              <Button
                type="button"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="rounded-xl px-5 text-sm font-semibold text-onboarding-textPrimary bg-white hover:bg-white/80 border border-onboarding-textPrimary/50"
              >
                <span className="flex items-center gap-2">
                  Get started
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </span>
              </Button>

              <div
                className={`absolute top-full right-0 z-30 ${
                  isDropdownOpen ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
                <div
                  className={`origin-top-left transform transition-all duration-300 ease-out ${
                    isDropdownOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-[0.98]"
                  }`}
                >
                  <div className="relative" role="menu">
                    {dropdownContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
