import {
  Activity,
  Brain,
  CalendarClock,
  ClipboardCheck,
  Sparkles,
  TrendingDown,
  UserCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  waitlistPartners,
} from "../constants/waitlistContent";
import { DirectionalStepper } from "./DirectionalStepper";
import { FaqAccordion } from "./FaqAccordion";
import { ProblemCard } from "./ProblemCard";

const staffingProblems = [
  {
    title: "Last-minute shift cancellations",
    description:
      "Unexpected call-outs leave critical units under-covered, forcing hospitals to scramble for replacements during peak demand.",
    imageSrc: "/waitlist/hospital-form.jpg",
    imageAlt: "Hospital unit managing a sudden staffing gap",
  },
  {
    title: "Staff shortages and burnout",
    description:
      "Persistent vacancies and overtime pressure increase clinician fatigue, impacting team morale, retention, and continuity of care.",
    imageSrc: "/waitlist/health-workers.jpg",
    imageAlt: "Healthcare staff experiencing workload strain",
  },
  {
    title: "Slow manual staffing process",
    description:
      "Phone calls, spreadsheets, and back-and-forth approvals delay shift fulfillment and make urgent staffing decisions harder.",
    imageSrc: "/waitlist/landing.jpg",
    imageAlt: "Manual staffing coordination and scheduling workflow",
  },
] as const;

const hospitalFlowSteps = [
  "Post an open shift",
  "Verified healthcare workers apply or accept",
  "Fill staffing gaps quickly",
  "Approve completed shifts and payment",
] as const;

const healthWorkerFlowSteps = [
  "Create and verify your profile",
  "Browse available hospital shifts",
  "Accept shifts that fit your schedule",
  "Complete shifts and get paid",
] as const;

const faqItems = [
  {
    question: "Is Nexus only for hospitals?",
    answer: "No. Clinics and healthcare centers can also use Nexus.",
  },
  {
    question: "Who can apply for shifts?",
    answer:
      "Verified healthcare professionals such as nurses, doctors, and healthcare assistants.",
  },
  {
    question: "How are workers verified?",
    answer: "We verify identity and professional credentials before approval.",
  },
  {
    question: "When do workers get paid?",
    answer: "Payments are processed after shift completion and approval.",
  },
  {
    question: "Can workers choose their schedules?",
    answer: "Yes. Workers select shifts based on their availability.",
  },
] as const;

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
  const navigate = useNavigate();
  const goToRoleLogin = (role: "hospital" | "health-worker") => {
    localStorage.setItem("selectedRole", role);
    navigate(`/auth/login?role=${role}`);
  };

  return (
    <div className="bg-[#f4f6fa]">
      <section className="px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-primaryGreen/90 px-4 py-2 text-sm font-medium bg-gradient-to-b from-onboarding-primaryBlue to-onboarding-primaryGreen bg-clip-text text-transparent shadow-sm">
            <Sparkles className="h-4 w-4" />
            Redefining Clinical Efficiency
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
            <span className="text-onboarding-primaryBlue">
              Healthcare staffing,
            </span>{" "}
            <span className="text-onboarding-primaryGreen">on demand.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
            Hospitals post open shifts. Verified healthcare professionals accept
            shifts and get paid after completion.
          </p>

          <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 bg-[#0a2f4a] shadow-strong">
            <img
              src="/waitlist/landing.jpg"
              alt="Clinical workflow dashboard"
              className="h-[32rem] w-full object-cover center opacity-75 sm:h-[32rem]"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20 mx-auto">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-2xl shadow-strong">
            <img
              src="/waitlist/hospitals.jpg"
              alt="Hospital operations"
              className="h-[24rem] w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06345c]/90 via-[#06345c]/45 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Institutional Excellence
              </p>
              <h2 className="mt-2 text-4xl font-semibold">For Hospitals</h2>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Eliminate staffing gaps with automated compliance and verified
                talent pipelines.
              </p>
              <button
                type="button"
                onClick={() => goToRoleLogin("hospital")}
                className="text-sm bg-white text-onboarding-primaryBlue py-4 px-6 rounded-lg mt-2"
              >
                Join as a Hospital
              </button>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl shadow-strong">
            <img
              src="/waitlist/health-workers.jpg"
              alt="Healthcare worker profile"
              className="h-[24rem] w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b3a63]/90 via-[#0b3a63]/45 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Clinician Empowerment
              </p>
              <h2 className="mt-2 text-4xl font-semibold">
                For Health Workers
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/80">
                The freedom to work anywhere, powered by AI documentation that
                saves hours daily.
              </p>
              <button
                type="button"
                onClick={() => goToRoleLogin("health-worker")}
                className="text-sm bg-white text-onboarding-primaryBlue py-4 px-6 rounded-lg mt-2"
              >
                Join as a Health Worker
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-[#eef0f5] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 sm:text-sm">
          <span className="text-onboarding-primaryBlue">Partnered with</span>
          {waitlistPartners.map((partner) => (
            <span key={partner}>{partner}</span>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-4xl font-semibold text-onboarding-primaryGreen">
              Hospital struggles to fill shifts quickly
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-600 sm:text-base">
              Staff shortages, emergency absences, and scheduling gaps affect
              healthcare delivery every day. Nexus helps hospitals find
              qualified healthcare workers fast.
            </p>
          </div>

          <div className="mt-12 grid gap-6 border-t border-neutral-200 pt-8 md:grid-cols-3">
            {staffingProblems.map((problem) => (
              <ProblemCard
                key={problem.title}
                title={problem.title}
                description={problem.description}
                imageSrc={problem.imageSrc}
                imageAlt={problem.imageAlt}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-4xl font-semibold text-onboarding-primaryGreen">
              How Nexus solves these staffing challenges
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-600 sm:text-base">
              This step-by-step flow helps hospitals respond faster to
              cancellations, reduce burnout from understaffing, and replace
              slow manual coordination with a reliable digital workflow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 border-t border-neutral-200 pt-8 lg:grid-cols-2">
            <DirectionalStepper
              title="For Hospitals"
              steps={[...hospitalFlowSteps]}
            />
            <DirectionalStepper
              title="For Health Workers"
              steps={[...healthWorkerFlowSteps]}
            />
          </div>
        </div>
      </section>

      <section>
        <FaqAccordion
          headline="Frequently asked questions"
          items={[...faqItems]}
        />
      </section>

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
                  <h3 className="text-4xl font-semibold text-neutral-900">
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
    </div>
  );
}
