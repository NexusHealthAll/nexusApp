import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Video } from "lucide-react";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { MetricCard } from "@/shared/components/ui/MetricCard";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Pagination } from "@/shared/components/ui/Pagination";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { PATHS } from "@/routes/paths";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { getCallWindowInfo } from "../callWindow";
import { VirtualSessionCard } from "./VirtualSessionCard";
import {
  VirtualSessionsSkeleton,
} from "./VirtualShiftsSkeleton";

const PAGE_SIZE = 5;

type SessionTab = "all" | "upcoming" | "in_progress" | "completed";

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Patient Checks In",
    body: "Patient arrives on-site and checks in at the telehealth kiosk or care station.",
  },
  {
    step: 2,
    title: "Device Connects",
    body: "Hospital telehealth device links to the assigned doctor's session automatically.",
  },
  {
    step: 3,
    title: "Doctor Joins Remotely",
    body: "Remote physician joins the live video consultation with the on-site patient.",
  },
  {
    step: 4,
    title: "Visit Completes",
    body: "Consultation ends, handover report submitted, and payment released on approval.",
  },
];

function tabMatches(tab: SessionTab, status: ApiShift["status"]): boolean {
  switch (tab) {
    case "all":
      return true;
    case "upcoming":
      return status === "assigned" || status === "upcoming";
    case "in_progress":
      return status === "in_progress";
    case "completed":
      return status === "completed";
  }
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Virtual Shifts overview page — real shifts (shift_type=virtual) from the backend. */
export function VirtualShiftsPage() {
  const navigate = useNavigate();
  const { getShifts } = useHospitalShift();
  const [shifts, setShifts] = useState<ApiShift[] | null>(null);
  const [tab, setTab] = useState<SessionTab>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getShifts({ page_size: 100 })
      .then((res) => {
        if (!cancelled) {
          setShifts(res.shifts.filter((s) => s.shift_type === "virtual"));
        }
      })
      .catch(() => {
        if (!cancelled) setShifts([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const list = shifts ?? [];
    return {
      readyToJoin: list.filter((s) => getCallWindowInfo(s).state === "open").length,
      inProgress: list.filter((s) => s.status === "in_progress").length,
      completedToday: list.filter((s) => s.status === "completed" && isToday(s.scheduled_start))
        .length,
      upcoming: list.filter((s) => s.status === "assigned" || s.status === "upcoming").length,
    };
  }, [shifts]);

  const visible = (shifts ?? []).filter((s) => tabMatches(tab, s.status));
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Telehealth Visits"
        subtitle="Telehealth visits — patients check in on-site and connect via hospital device to a remote doctor."
        breadcrumbs={[
          { label: "Dashboard", href: PATHS.hospital.dashboard },
          { label: "Telehealth Visits" },
        ]}
        actions={
          <>
            <span className="flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 dark:bg-success-950 dark:text-success-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
              Live
            </span>
            <button
              onClick={() => navigate(`${PATHS.hospital.createShift}?type=virtual`)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Plus className="h-4 w-4" />
              Create Telehealth Visit
            </button>
          </>
        }
      />

      {/* Live stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ready to Join" loading={shifts === null} value={stats.readyToJoin} valueTone="success" />
        <MetricCard label="In Progress" loading={shifts === null} value={stats.inProgress} valueTone="success" />
        <MetricCard label="Completed Today" loading={shifts === null} value={stats.completedToday} />
        <MetricCard label="Upcoming" loading={shifts === null} value={stats.upcoming} valueTone="warning" />
      </div>

      {/* How it works */}
      <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
          How Telehealth Visits Work
        </h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 text-sm font-bold text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300">
                {item.step}
              </span>
              <h3 className="mt-3 text-sm font-bold text-neutral-900 dark:text-neutral-50">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <UnderlineTabs<SessionTab>
        className="mt-8"
        options={[
          { label: "All Shifts", value: "all" },
          { label: "Upcoming", value: "upcoming" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          setPage(1);
        }}
      />

      {/* Shift cards */}
      <div className="mt-6 space-y-4">
        {shifts === null ? (
          <VirtualSessionsSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<EmptyStateIcon icon={Video} />}
            title="No telehealth visits yet"
            description="Telehealth visits you create will appear here, with a call session gated to open around the scheduled time."
            action={
              <button
                onClick={() => navigate(`${PATHS.hospital.createShift}?type=virtual`)}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Telehealth Visit
              </button>
            }
          />
        ) : (
          <>
            {pageItems.map((shift) => (
              <VirtualSessionCard
                key={shift.id}
                shift={shift}
                href={`${PATHS.hospital.virtualShifts}/${shift.id}`}
              />
            ))}
            {visible.length > PAGE_SIZE && (
              <Pagination
                className="pt-2"
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
                summary={`Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(
                  page * PAGE_SIZE,
                  visible.length,
                )} of ${visible.length} visits`}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
