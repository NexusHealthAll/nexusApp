import { ArrowRight, CheckCircle2, CirclePlay, Sparkles } from "lucide-react";
import { NexusCareLogo } from "@/shared/components/ui/NexusCareLogo";
import { Button } from "@/shared/components/ui/Button";
import {
  waitlistAudienceCards,
  waitlistFooterSections,
  waitlistInsights,
  waitlistNavItems,
  waitlistPartners,
  waitlistSteps,
  waitlistTrustPoints,
} from "../constants/waitlistContent";
import { WaitlistEmailForm } from "./WaitlistEmailForm";

export function WaitlistPage() {
  return (
    <div className="min-h-screen bg-white text-onboarding-textPrimary">
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a aria-label="NexusCare home" className="shrink-0" href="#top">
            <NexusCareLogo size="md" />
          </a>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 md:flex"
          >
            {waitlistNavItems.map((item) => (
              <a
                key={item}
                href={
                  item === "Solutions"
                    ? "#solutions"
                    : item === "How it Works"
                      ? "#workflow"
                      : "#resources"
                }
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-onboarding-primaryBlue"
              >
                {item}
              </a>
            ))}
          </nav>

          <a href="#waitlist-form">
            <Button className="rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-5 text-sm font-semibold text-white shadow-soft">
              Join Waitlist
            </Button>
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,156,147,0.18),_transparent_30%),radial-gradient(circle_at_75%_20%,_rgba(26,88,136,0.18),_transparent_25%),linear-gradient(180deg,_#f8fdff_0%,_#eef7fb_54%,_#ffffff_100%)]" />
          <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(135deg,_rgba(52,156,147,0.16),_transparent_58%)]" />

          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-secondary-100 bg-secondary-50 px-4 py-2 text-sm font-medium text-secondary-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Redefining Clinical Efficiency
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
                Secure Your Place in the{" "}
                <span className="bg-gradient-to-r from-onboarding-primaryBlue via-secondary-700 to-onboarding-primaryGreen bg-clip-text text-transparent">
                  Future of Care.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
                Empowering healthcare facilities with AI-driven documentation
                and a high-fidelity marketplace for elite clinical talent.
                Experience the future of medical workflows.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#waitlist-form">
                  <Button
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue px-8 text-base font-semibold text-white shadow-medium"
                  >
                    Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>

                <a
                  href="#workflow"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-onboarding-primaryBlue"
                >
                  <CirclePlay className="h-5 w-5 text-secondary-700" />
                  See how it works
                </a>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
              <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200/70 bg-neutral-950 px-6 py-8 shadow-strong sm:px-8 lg:min-h-[32rem] lg:px-10 lg:py-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(94,234,212,0.22),_transparent_24%),linear-gradient(135deg,_rgba(8,47,73,0.98),_rgba(2,23,38,0.96))]" />
                <div className="absolute inset-x-10 top-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <div className="absolute left-12 right-12 top-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {waitlistTrustPoints.map((point, index) => {
                    const Icon = point.icon;

                    return (
                      <article
                        key={point.title}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                      >
                        <div className="mb-8 flex items-start justify-between">
                          <div className="rounded-2xl bg-secondary-400/15 p-3 text-secondary-200">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-medium text-white/45">
                            0{index + 1}
                          </span>
                        </div>
                        <h2 className="text-base font-semibold text-white">
                          {point.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/70">
                          {point.description}
                        </p>
                      </article>
                    );
                  })}
                </div>
                <div className="absolute bottom-6 left-6 right-6 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8 lg:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-secondary-100/70">
                        Operational Overview
                      </p>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">
                        A single surface for verified staffing, AI-assisted
                        summaries, and facility-grade oversight.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-white">
                      <div className="rounded-2xl bg-white/10 px-3 py-4">
                        <p className="text-2xl font-semibold">98%</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">
                          Coverage
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-3 py-4">
                        <p className="text-2xl font-semibold">24h</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">
                          Payout
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-3 py-4">
                        <p className="text-2xl font-semibold">AI</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">
                          Scribe
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside
                id="waitlist-form"
                className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(223,243,250,0.9))] p-6 shadow-strong backdrop-blur sm:p-8"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,156,147,0.18),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(26,88,136,0.12),_transparent_30%)]" />
                <div className="relative">
                  <h2 className="text-3xl font-semibold text-onboarding-primaryBlue">
                    Registration
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
                    Join the priority access list for the next phase. We will
                    notify you when early facility and clinician access opens.
                  </p>

                  <div className="mt-8 rounded-3xl border border-white/80 bg-white/70 p-5 shadow-soft backdrop-blur">
                    <WaitlistEmailForm layout="stacked" />
                  </div>

                  <div className="mt-8 rounded-3xl bg-neutral-950/80 px-5 py-6 text-center text-white shadow-medium backdrop-blur">
                    <div className="mx-auto flex w-fit items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                      Trusted access
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/85">
                      “NexusCare has transformed how we manage floor staffing
                      during peak surges.”
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-secondary-200/80">
                      Chief Medical Officer, Metro Doccare
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="solutions" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-neutral-200 bg-neutral-50 px-6 py-8 shadow-sm sm:px-8 lg:px-10">
            <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary-700">
                Partnered with
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:justify-end lg:gap-x-12">
                {waitlistPartners.map((partner) => (
                  <span key={partner}>{partner}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-onboarding-primaryGreen sm:text-4xl">
                Precision Workflow
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
                A seamless three-step transition from registration to your first
                clinical payout.
              </p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
              {waitlistSteps.map((step) => (
                <article
                  key={step.id}
                  className="relative rounded-[1.75rem] border border-neutral-200 bg-white px-6 pb-8 pt-12 text-center shadow-soft"
                >
                  <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-onboarding-primaryBlue to-onboarding-primaryGreen text-lg font-semibold text-white shadow-medium">
                    {step.id}
                  </div>
                  <h3 className="text-2xl font-semibold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            {waitlistAudienceCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="relative overflow-hidden rounded-[2rem] border border-neutral-200 px-6 py-8 shadow-strong sm:px-8 lg:min-h-[27rem]"
                >
                  <div
                    className={
                      index === 0
                        ? "absolute inset-0 bg-[linear-gradient(180deg,_rgba(9,37,63,0.18),_rgba(9,37,63,0.88)),radial-gradient(circle_at_top,_rgba(186,230,253,0.9),_transparent_38%),linear-gradient(135deg,_#d8f0fb,_#0d5a87)]"
                        : "absolute inset-0 bg-[linear-gradient(180deg,_rgba(7,30,39,0.1),_rgba(7,30,39,0.76)),radial-gradient(circle_at_top,_rgba(191,219,254,0.72),_transparent_32%),linear-gradient(135deg,_#d9ecfb,_#1c6ba0)]"
                    }
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#083a5f]/80 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end text-white">
                    <div className="mb-8 w-fit rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/70">
                      {card.eyebrow}
                    </p>
                    <h2 className="mt-4 text-4xl font-semibold">
                      {card.title}
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
                      {card.description}
                    </p>
                    <a
                      href="#waitlist-form"
                      className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-onboarding-primaryBlue transition-transform hover:-translate-y-0.5"
                    >
                      {card.ctaLabel}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="resources"
          className="bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-onboarding-primaryGreen sm:text-4xl">
                  Editorial Insights
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">
                  Stay updated with the latest in clinical tech, marketplace
                  operations, and compliance.
                </p>
              </div>
              <a
                href="#waitlist-form"
                className="text-sm font-semibold text-onboarding-primaryBlue transition-colors hover:text-secondary-700"
              >
                View all articles <ArrowRight className="ml-1 inline h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {waitlistInsights.map((insight, index) => {
                const Icon = insight.icon;

                return (
                  <article
                    key={insight.title}
                    className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-soft"
                  >
                    <div
                      className={
                        index === 0
                          ? "flex h-48 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.48),_transparent_28%),linear-gradient(135deg,_#05283c,_#1785af)] text-secondary-100"
                          : index === 1
                            ? "flex h-48 items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(224,242,254,0.78),_transparent_24%),linear-gradient(135deg,_#ffffff,_#1ba9db)] text-primary-700"
                            : "flex h-48 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(135deg,_#031726,_#074772)] text-secondary-100"
                      }
                    >
                      <Icon className="h-16 w-16" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                        <span>{insight.category}</span>
                        <span>{insight.readTime}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold text-neutral-900">
                        {insight.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-neutral-600">
                        {insight.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

      </main>

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
                    <a
                      href="#waitlist-form"
                      className="transition-colors hover:text-onboarding-primaryBlue"
                    >
                      {link}
                    </a>
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
