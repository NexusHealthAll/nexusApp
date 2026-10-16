import { Skeleton } from "@/shared/components/ui/Skeleton";

/** Mirrors a handover report card: avatar, name/shift, meta line, status badge, instructions. */
export function HandoverReportsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </>
  );
}

const SECTIONS = [
  { title: "1. Instructions for Incoming Staff", lines: ["w-full", "w-11/12", "w-2/3"] },
  { title: "2. Patients Requiring Follow-up", rows: 2 },
  { title: "3. Pending Tasks", rows: 2 },
  { title: "4. Shift Photos", photos: 3 },
  { title: "5. Equipment Status", lines: ["w-3/4"] },
] as const;

/** Mirrors the report sheet: brand row, worker header, 4-up stats strip, then the 5 numbered sections. */
export function HandoverReportDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading handover report"
      className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="ml-auto h-2.5 w-32" />
            <Skeleton className="ml-auto h-3 w-36" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Skeleton className="h-14 w-14 flex-shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-56 max-w-full" />
            <Skeleton className="h-4 w-44 max-w-full" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 sm:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-800">
          {["Department", "Submitted", "Patients Seen", "Follow-ups"].map((label) => (
            <div key={label} className="bg-white px-4 py-3.5 dark:bg-neutral-900">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {label}
              </p>
              <Skeleton className="mt-2 h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-100 p-6 sm:p-8 dark:border-neutral-800">
        {SECTIONS.map((section, i) => (
          <section key={section.title} className={i === 0 ? "" : "mt-7"}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600/60 dark:text-brand-400/60">
              {section.title}
            </h2>
            <div className="mt-3 space-y-2">
              {"lines" in section &&
                section.lines.map((w, j) => <Skeleton key={j} className={`h-4 ${w}`} />)}
              {"rows" in section &&
                Array.from({ length: section.rows }).map((_, j) => (
                  <Skeleton key={j} className="h-11 w-full rounded-xl" />
                ))}
              {"photos" in section && (
                <div className="flex gap-3">
                  {Array.from({ length: section.photos }).map((_, j) => (
                    <Skeleton key={j} className="h-24 w-24 rounded-xl" />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
