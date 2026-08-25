import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Video } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { MetricCard } from "@/shared/components/ui/MetricCard";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { PATHS } from "@/routes/paths";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { shiftStatusDisplay } from "@/features/hospital/shifts/shiftStatusDisplay";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { getCallWindowInfo } from "../callWindow";

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

  return (
    <div>
      <PageHeader
        title="Virtual Shifts"
        subtitle="Telehealth visits — patients check in on-site and connect via hospital device to a remote doctor."
        breadcrumbs={[
          { label: "Dashboard", href: PATHS.hospital.dashboard },
          { label: "Virtual Shifts" },
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
              Create Virtual Shift
            </button>
          </>
        }
      />

      {/* Live stats */}
      {shifts === null ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Ready to Join" value={stats.readyToJoin} valueTone="success" />
          <MetricCard label="In Progress" value={stats.inProgress} valueTone="success" />
          <MetricCard label="Completed Today" value={stats.completedToday} />
          <MetricCard label="Upcoming" value={stats.upcoming} valueTone="warning" />
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
          How Virtual Shifts Work
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
        onChange={setTab}
      />

      {/* Shift cards */}
      <div className="mt-6 space-y-4">
        {shifts === null ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<EmptyStateIcon icon={Video} />}
            title="No virtual shifts yet"
            description="Virtual shifts you create will appear here, with a call session gated to open around the scheduled time."
            action={
              <button
                onClick={() => navigate(`${PATHS.hospital.createShift}?type=virtual`)}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Virtual Shift
              </button>
            }
          />
        ) : (
          visible.map((shift) => {
            const status = shiftStatusDisplay[shift.status];
            const callWindow = getCallWindowInfo(shift);
            const scheduledLabel = new Date(shift.scheduled_start).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });
            return (
              <Link
                key={shift.id}
                to={`${PATHS.hospital.virtualShifts}/${shift.id}`}
                className="block rounded-2xl border border-neutral-100 bg-white p-5 transition-shadow hover:shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600 dark:bg-secondary-950 dark:text-secondary-400">
                    <Video className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                      {shift.role_title}
                      {shift.specialty ? ` · ${shift.specialty}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                      {shift.department ?? "Virtual Visit"} · {scheduledLabel}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {callWindow.state === "open" && (
                      <Badge variant="success" className="uppercase tracking-wide">
                        Ready to Join
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-300 dark:text-neutral-600" />
                </div>
                <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                  {callWindow.message}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
