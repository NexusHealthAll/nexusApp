import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarClock,
  ClipboardCheck,
  Sparkles,
  TrendingDown,
  UserCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import hero1Svg from "@/shared/assets/svgs/hero1.svg";
import hero1WhiteSvg from "@/shared/assets/svgs/hero1-white.svg";
import {
  waitlistAudienceCards,
  waitlistInsights,
  waitlistPartners,
  waitlistSteps,
} from "../constants/waitlistContent";
import { useWaitlistFlow } from "./waitlistFlowContext";
import { useWaitlistLoginNavigation } from "../hooks/useWaitlistLoginNavigation";
import {
  WaitlistSubmissionError,
  submitWaitlistEmailToFirebase,
} from "../services/waitlistFirebaseService";

const ecosystemColumns = [
  {
    title: "For Hospitals",
    items: [
      {
        title: "On-demand verified staffing",
        description:
          "Instantly access a pool of pre-vetted, elite clinical talent ready to fill critical gaps.",
        icon: UserCheck,
      },
      {
        title: "Automated compliance tracking",
        description:
          "Real-time monitoring of credentials and regulatory requirements across your entire facility.",
        icon: ClipboardCheck,
      },
      {
        title: "Real-time floor monitoring",
        description:
          "Visibility into staff distribution and clinical activity for optimized operational flow.",
        icon: Activity,
      },
      {
        title: "Reduced overhead",
        description:
          "Eliminate expensive agency fees and administrative bloat through digital automation.",
        icon: TrendingDown,
      },
    ],
  },
  {
    title: "For Health Workers",
    items: [
      {
        title: "High-priority shift access",
        description:
          "Be the first to see and claim premium shifts that match your specialized skillset.",
        icon: Zap,
      },
      {
        title: "AI-powered clinical documentation (Scribe)",
        description:
          "Automate chart notes and summaries, reclaiming up to 2 hours of clinical time daily.",
        icon: Brain,
      },
      {
        title: "Instant, secure payouts",
        description:
          "Receive compensation immediately upon shift completion through our digital ledger.",
        icon: Wallet,
      },
      {
        title: "Flexible scheduling",
        description:
          "Complete autonomy over your work-life balance. Choose where and when you practice.",
        icon: CalendarClock,
      },
    ],
  },
] as const;

export function WaitlistLandingStep() {
  const { openJoinModal } = useWaitlistFlow();
  const handleLoginNavigation = useWaitlistLoginNavigation();
  const location = useLocation();
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaState, setCtaState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [ctaMessage, setCtaMessage] = useState("");

  // Support header nav links that arrive as "/#section" from another route.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctaEmail.trim()) return;

    setCtaState("loading");
    setCtaMessage("");

    try {
      await submitWaitlistEmailToFirebase(ctaEmail, "cta-form");
      setCtaState("success");
      setCtaMessage("You are on the waitlist! We will reach out soon.");
      setCtaEmail("");
    } catch (err) {
      if (err instanceof WaitlistSubmissionError && err.code === "duplicate") {
        setCtaState("error");
        setCtaMessage("This email is already on the waitlist.");
      } else {
        openJoinModal();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950">
      {/* 1. HERO SECTION */}
      <section className="px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20 h-[90vh]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-onboarding-primaryBlue/25 bg-onboarding-primaryBlue/5 px-4 py-2 text-sm font-medium text-onboarding-primaryBlue dark:border-[#5AA6D6]/30 dark:bg-[#5AA6D6]/10 dark:text-[#5AA6D6]">
              <Sparkles className="h-4 w-4" />
              Redefining Clinical Efficiency
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1] dark:text-neutral-50">
              The{" "}
              <span className="text-onboarding-primaryBlue dark:text-[#5AA6D6]">
                Digital Pulse
              </span>{" "}
              of Modern Healthcare.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base dark:text-neutral-400">
              Empowering healthcare facilities with AI-driven documentation and
              a high-fidelity marketplace for elite clinical talent. Experience
              the future of medical workflows.
            </p>

            {/* <div className="mt-8">
              <Button
                type="button"
                onClick={openJoinModal}
                className="rounded-xl bg-onboarding-primaryBlue px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-onboarding-primaryBlue/90"
              >
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div> */}
          </div>

          {/* Graphic */}
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <img
              src={hero1Svg}
              alt="Clinician attending to a patient"
              className="block h-auto w-full dark:hidden"
            />
            <img
              src={hero1WhiteSvg}
              alt="Clinician attending to a patient"
              className="hidden h-auto w-full dark:block"
            />
          </div>
        </div>
      </section>

      {/* 2. PARTNERS SECTION */}
      <section className="border-y border-neutral-200/80 bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 sm:text-sm dark:text-neutral-400">
          <span className="text-onboarding-primaryBlue dark:text-[#5AA6D6]">
            PARTNERED WITH
          </span>
          {waitlistPartners.map((partner) => (
            <span key={partner}>{partner}</span>
          ))}
        </div>
      </section>

      {/* 3. PRECISION WORKFLOW SECTION */}
      <section
        id="workflow"
        className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-onboarding-primaryBlue sm:text-4xl dark:text-[#5AA6D6]">
              Precision Workflow
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
              A seamless 3-step engine built from registration to shift
              reconciliation.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {waitlistSteps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center rounded-2xl border border-neutral-200/70 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-onboarding-primaryBlue text-lg font-bold text-white">
                  {step.id}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AUDIENCE CARDS (FOR HOSPITALS & HEALTH WORKERS) */}
      <section className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {waitlistAudienceCards.map((card) => {
            const isHospital = card.title.toLowerCase().includes("hospital");
            const imgSrc = isHospital
              ? "/waitlist/hospitals.jpg"
              : "/waitlist/health-workers.jpg";

            return (
              <article
                key={card.title}
                className="group overflow-hidden rounded-3xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="h-56 overflow-hidden sm:h-64">
                  <img
                    src={imgSrc}
                    alt={card.title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-7 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-onboarding-primaryBlue dark:text-[#5AA6D6]">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                    {card.description}
                  </p>
                  <Button
                    type="button"
                    onClick={() =>
                      handleLoginNavigation(
                        isHospital ? "hospital" : "health-worker",
                      )
                    }
                    className="mt-6 rounded-xl bg-onboarding-primaryBlue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-onboarding-primaryBlue/90"
                  >
                    {card.ctaLabel}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. EMPOWERING THE ECOSYSTEM */}
      <section
        id="ecosystem"
        className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-onboarding-primaryBlue sm:text-4xl dark:text-[#5AA6D6]">
              Empowering the Ecosystem
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base dark:text-neutral-400">
              A high-fidelity framework designed for precision, reliability, and
              growth in clinical practice.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {ecosystemColumns.map((column) => (
              <article
                key={column.title}
                className="rounded-3xl border border-neutral-200 bg-[#f7f8fa] p-7 sm:p-9 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-onboarding-primaryBlue text-white">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
                    {column.title}
                  </h3>
                </div>

                <div className="mt-8 space-y-6">
                  {column.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex gap-4">
                        <Icon className="mt-1 h-5 w-5 shrink-0 text-onboarding-primaryBlue dark:text-[#5AA6D6]" />
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 sm:text-base dark:text-neutral-50">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-7 text-neutral-600 sm:text-base dark:text-neutral-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL INSIGHTS */}
      <section
        id="insights"
        className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-onboarding-primaryBlue sm:text-4xl dark:text-[#5AA6D6]">
                Editorial Insights
              </h2>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
                A curated collection of research, product updates, and clinical
                operational guides.
              </p>
            </div>
            <button
              type="button"
              onClick={openJoinModal}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-onboarding-primaryBlue hover:underline shrink-0 dark:text-[#5AA6D6]"
            >
              Read all articles <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {waitlistInsights.map((insight) => (
              <article
                key={insight.title}
                className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white flex flex-col group dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="relative h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={insight.image}
                    alt={insight.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-onboarding-primaryBlue uppercase tracking-wider dark:text-[#5AA6D6]">
                    <span>{insight.category}</span>
                    <span>•</span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {insight.readTime}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-neutral-900 line-clamp-2 dark:text-neutral-50">
                    {insight.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 line-clamp-3 flex-1 dark:text-neutral-400">
                    {insight.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. READY FOR THE PULSE? */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-onboarding-primaryBlue p-8 text-center sm:p-14 text-white">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Ready for the Pulse?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
            Join the waitlist to be part of the first cohort of clinicians and
            facilities in our high-fidelity private beta.
          </p>

          <form
            onSubmit={handleCtaSubmit}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              placeholder="Enter your work email"
              required
              className="h-12 w-full sm:flex-1 rounded-xl bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-white/60"
            />
            <Button
              type="submit"
              isLoading={ctaState === "loading"}
              className="h-12 w-full sm:w-auto rounded-xl bg-white px-6 text-sm font-semibold text-onboarding-primaryBlue hover:bg-neutral-50 transition-colors shrink-0"
            >
              Secure My Spot
            </Button>
          </form>

          {ctaMessage && (
            <p
              className={`mt-4 text-xs font-medium ${
                ctaState === "error" ? "text-red-200" : "text-emerald-100"
              }`}
            >
              {ctaMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
