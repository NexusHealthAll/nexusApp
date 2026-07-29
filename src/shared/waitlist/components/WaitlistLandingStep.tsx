import { useState } from "react";
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
import {
  waitlistAudienceCards,
  waitlistInsights,
  waitlistPartners,
  waitlistSteps,
} from "../constants/waitlistContent";
import { useWaitlistFlow } from "./waitlistFlowContext";
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
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaState, setCtaState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ctaMessage, setCtaMessage] = useState("");

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
    <div className="bg-[#f4f6fa]">
      {/* 1. HERO SECTION */}
      <section className="px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/80 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-teal-600" />
            Redefining Clinical Efficiency
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
            The{" "}
            <span className="text-onboarding-primaryBlue">Digital Pulse</span>{" "}
            of Modern Healthcare.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">
            Empowering healthcare facilities with AI-driven documentation and a
            high-fidelity marketplace for elite clinical talent. Experience the
            future of medical workflows.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              type="button"
              onClick={openJoinModal}
              className="rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-6 py-3 text-base font-semibold text-white shadow-soft hover:opacity-90 transition-opacity"
            >
              Join Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 bg-[#0a2f4a] shadow-strong">
            <img
              src="/waitlist/landing.jpg"
              alt="Clinical workflow dashboard"
              className="h-[32rem] w-full object-cover center opacity-80 sm:h-[36rem]"
            />
          </div>
        </div>
      </section>

      {/* 2. PARTNERS SECTION */}
      <section className="border-y border-neutral-200/80 bg-[#eef0f5] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 sm:text-sm">
          <span className="text-onboarding-primaryBlue">PARTNERED WITH</span>
          {waitlistPartners.map((partner) => (
            <span key={partner}>{partner}</span>
          ))}
        </div>
      </section>

      {/* 3. PRECISION WORKFLOW SECTION */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-onboarding-primaryBlue sm:text-4xl">
              Precision Workflow
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
              A seamless 3-step engine built from registration to shift reconciliation.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {waitlistSteps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-neutral-200/70 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white font-bold text-lg shadow-sm">
                  {step.id}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
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
                className="relative overflow-hidden rounded-3xl shadow-strong group"
              >
                <img
                  src={imgSrc}
                  alt={card.title}
                  className="h-[26rem] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06345c]/95 via-[#06345c]/55 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/80 max-w-md">
                    {card.description}
                  </p>
                  <Button
                    type="button"
                    onClick={openJoinModal}
                    className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow hover:bg-neutral-100 transition-colors"
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
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold bg-gradient-to-br from-onboarding-primaryBlue to-onboarding-primaryGreen bg-clip-text text-transparent sm:text-4xl">
              Empowering the Ecosystem
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">
              A high-fidelity framework designed for precision, reliability, and
              growth in clinical practice.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {ecosystemColumns.map((column) => (
              <article
                key={column.title}
                className="rounded-3xl border border-[#e7e9ee] bg-[#f3f4f8] p-7 sm:p-9"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue text-white">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-semibold text-neutral-900">
                    {column.title}
                  </h3>
                </div>

                <div className="mt-8 space-y-6">
                  {column.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex gap-4">
                        <Icon className="mt-1 h-5 w-5 shrink-0 text-onboarding-primaryBlue" />
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 sm:text-base">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-7 text-neutral-600 sm:text-base">
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
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-onboarding-primaryBlue sm:text-4xl">
                Editorial Insights
              </h2>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                A curated collection of research, product updates, and clinical operational guides.
              </p>
            </div>
            <button
              type="button"
              onClick={openJoinModal}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-onboarding-primaryBlue hover:underline shrink-0"
            >
              Read all articles <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {waitlistInsights.map((insight) => (
              <article
                key={insight.title}
                className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-soft flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  <img
                    src={insight.image}
                    alt={insight.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-onboarding-primaryBlue uppercase tracking-wider">
                    <span>{insight.category}</span>
                    <span>•</span>
                    <span className="text-neutral-500">{insight.readTime}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-neutral-900 line-clamp-2">
                    {insight.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 line-clamp-3 flex-1">
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
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d5675] via-[#107085] to-[#189a96] p-8 text-center sm:p-14 shadow-strong text-white">
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
              className="h-12 w-full sm:flex-1 rounded-xl bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none shadow-sm focus:ring-2 focus:ring-teal-300"
            />
            <Button
              type="submit"
              isLoading={ctaState === "loading"}
              className="h-12 w-full sm:w-auto rounded-xl bg-white px-6 text-sm font-semibold text-[#13888d] hover:bg-neutral-50 shadow-md transition-colors shrink-0"
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
