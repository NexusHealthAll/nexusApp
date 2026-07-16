import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Video } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { MetricCard } from "@/shared/components/ui/MetricCard";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { PATHS } from "@/routes/paths";
import { cn } from "@/shared/utils/cn";
import {
  STAGES,
  stageIndex,
  stageLabels,
  useVirtualSessionsStore,
  type VirtualSession,
  type VirtualSessionStage,
} from "../virtualShiftsStore";

type SessionTab = "all" | "waiting" | "in_consultation" | "completed";

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

function sessionStatus(session: VirtualSession): {
  label: string;
  variant: BadgeVariant;
} {
  switch (session.stage) {
    case "checked_in":
      return { label: "Patient Waiting", variant: "warning" };
    case "device_connected":
      return { label: "Connecting Device", variant: "info" };
    case "doctor_joined":
      return { label: "In Consultation", variant: "success" };
    case "completed":
      return { label: "Completed", variant: "neutral" };
  }
}

function tabMatches(tab: SessionTab, stage: VirtualSessionStage): boolean {
  switch (tab) {
    case "all":
      return true;
    case "waiting":
      return stage === "checked_in" || stage === "device_connected";
    case "in_consultation":
      return stage === "doctor_joined";
    case "completed":
      return stage === "completed";
  }
}

/** Virtual Shifts overview page (telehealth sessions) per the Figma redesign. */
export function VirtualShiftsPage() {
  const navigate = useNavigate();
  const sessions = useVirtualSessionsStore((s) => s.sessions);
  const [tab, setTab] = useState<SessionTab>("all");

  const stats = useMemo(
    () => ({
      waiting: sessions.filter((s) => s.stage === "checked_in").length,
      inConsultation: sessions.filter((s) => s.stage === "doctor_joined").length,
      completedToday: sessions.filter((s) => s.stage === "completed").length,
    }),
    [sessions],
  );

  const visible = sessions.filter((s) => tabMatches(tab, s.stage));

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
            <span className="flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
              Live
            </span>
            <button
              onClick={() => navigate(PATHS.hospital.createShift)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              Create Virtual Shift
            </button>
          </>
        }
      />

      {/* Live stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Patients Waiting"
          value={stats.waiting}
          valueTone="warning"
        />
        <MetricCard
          label="In Consultation"
          value={stats.inConsultation}
          valueTone="success"
        />
        <MetricCard label="Completed Today" value={stats.completedToday} />
        <MetricCard
          label="Avg. Wait Time"
          value="—"
          sub="available once sessions run"
        />
      </div>

      {/* How it works */}
      <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-6">
        <h2 className="text-base font-bold text-neutral-900">
          How Virtual Shifts Work
        </h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 text-sm font-bold text-secondary-700">
                {item.step}
              </span>
              <h3 className="mt-3 text-sm font-bold text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <UnderlineTabs<SessionTab>
        className="mt-8"
        options={[
          { label: "All Sessions", value: "all" },
          { label: "Waiting", value: "waiting" },
          { label: "In Consultation", value: "in_consultation" },
          { label: "Completed", value: "completed" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* Session cards */}
      <div className="mt-6 space-y-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={<EmptyStateIcon icon={Video} />}
            title="No virtual sessions yet"
            description="When patients check in at a telehealth kiosk, their live sessions will appear here."
            action={
              <button
                onClick={() => navigate(PATHS.hospital.createShift)}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Virtual Shift
              </button>
            }
          />
        ) : (
          visible.map((session) => {
            const status = sessionStatus(session);
            const reached = stageIndex(session.stage);
            return (
              <Link
                key={session.id}
                to={`${PATHS.hospital.virtualShifts}/${session.id}`}
                className="block rounded-2xl border border-neutral-100 bg-white p-5 transition-shadow hover:shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
                    <Video className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900">
                      {session.patientLabel} · {session.visitType}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {session.kiosk} · {session.doctor} · {session.startedAt}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-300" />
                </div>

                {/* Stage progress */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    {STAGES.map((stage, i) => (
                      <span
                        key={stage}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-semibold",
                          i <= reached ? "text-secondary-700" : "text-neutral-300",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            i <= reached ? "bg-secondary-500" : "bg-neutral-200",
                          )}
                        />
                        {stageLabels[stage]}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-secondary-500 transition-all"
                      style={{
                        width: `${(reached / (STAGES.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
