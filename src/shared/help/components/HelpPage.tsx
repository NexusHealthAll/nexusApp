import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Mail,
  MessageCircle,
  Search,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

const SUPPORT_CHANNELS = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    caption: "Avg. reply in 2 minutes",
  },
  {
    icon: Mail,
    title: "Contact Support",
    caption: "support@nexuscare.io",
  },
  {
    icon: FileText,
    title: "Documentation",
    caption: "Guides & API reference",
  },
];

const FAQS = [
  {
    question: "How do I broadcast a shift to healthcare professionals?",
    answer:
      "Go to Create Shift, fill out the role, department, schedule, and compensation details across the four-step wizard, then click Broadcast Shift. It will be sent instantly to verified professionals matching your requirements within your configured radius.",
  },
  {
    question: "How does worker verification work?",
    answer:
      "Every worker on NexusCare submits their professional license and identity documents during onboarding. Licenses are validated against the issuing registry, and workers show a Verified badge once checks pass.",
  },
  {
    question: "When are payments released to workers?",
    answer:
      "Funds are held in escrow from your hospital wallet when a shift is assigned. Payment is released automatically when you approve the worker's handover report — or after the auto-approval window if no action is taken.",
  },
  {
    question: "Can I cancel or edit a shift after it has been broadcast?",
    answer:
      "Open, assigned, and upcoming shifts can be cancelled from Shift Management (single or in bulk), and rescheduled from the shift detail page. Shifts already in progress can't be cancelled from the dashboard.",
  },
  {
    question: "How do AI-generated shift notes work?",
    answer:
      "When a worker submits their handover, NexusCare AI structures their clinical notes and shift activity log into an executive summary, findings, and a full narrative for your review. You can always request a revision.",
  },
  {
    question: "How do I add or remove hospital departments?",
    answer:
      "Go to Hospital Profile → Departments and use the Add Department chip. Departments are used when creating shifts and in analytics breakdowns.",
  },
];

/** Help Center page per Figma 29:16082. */
export function HelpPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const visibleFaqs = useMemo(() => {
    if (!search.trim()) return FAQS;
    const q = search.trim().toLowerCase();
    return FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero */}
      <div className="pt-4 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">
          How can we help?
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Search articles, or reach our support team directly.
        </p>
        <div className="relative mx-auto mt-6 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 shadow-soft placeholder:text-neutral-400 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
          />
        </div>
      </div>

      {/* Support channels */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {SUPPORT_CHANNELS.map((channel) => (
          <button
            key={channel.title}
            className="rounded-2xl border border-neutral-100 bg-white px-6 py-8 text-center transition-shadow hover:shadow-soft"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
              <channel.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-bold text-neutral-900">
              {channel.title}
            </p>
            <p className="mt-1 text-xs text-neutral-400">{channel.caption}</p>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">
          Frequently Asked Questions
        </h2>
        <button className="flex items-center gap-1.5 rounded-lg border border-error-200 bg-white px-3.5 py-2 text-sm font-semibold text-error-600 transition-colors hover:bg-error-50">
          <AlertTriangle className="h-4 w-4" />
          Report an Issue
        </button>
      </div>

      <div className="mt-4 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
        {visibleFaqs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-neutral-400">
            No articles match "{search.trim()}".
          </p>
        ) : (
          visibleFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-bold text-neutral-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-500">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
