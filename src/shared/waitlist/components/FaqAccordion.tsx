import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  headline: string;
  items: FaqItem[];
}

export function FaqAccordion({ headline, items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-4xl font-semibold bg-gradient-to-r from-onboarding-primaryBlue to-onboarding-primaryGreen bg-clip-text text-transparent sm:text-5xl">
            {headline}
          </h2>
        </div>

        <div className="mt-10 max-w-full space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white shadow-soft transition-all",
                  isOpen
                    ? "border-onboarding-primaryBlue/45 ring-2 ring-onboarding-primaryGreen/20"
                    : "border-neutral-200",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span className="text-sm font-semibold text-neutral-900 sm:text-base">
                    {item.question}
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-onboarding-primaryBlue to-onboarding-primaryGreen text-white transition-transform",
                      isOpen ? "rotate-180" : "rotate-0",
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-neutral-100 px-5 py-4 sm:px-6">
                    <p className="text-sm leading-7 text-neutral-600 sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
