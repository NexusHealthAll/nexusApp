import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Mic, Star, Video, VideoOff } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import {
  useVirtualSessionsStore,
  type VirtualSession,
} from "../virtualShiftsStore";

function statusPill(session: VirtualSession): {
  label: string;
  className: string;
} {
  switch (session.stage) {
    case "checked_in":
      return {
        label: "Patient Waiting",
        className: "border border-warning-400/40 text-warning-400",
      };
    case "device_connected":
      return {
        label: "Connecting Device",
        className: "border border-primary-400/40 text-primary-300",
      };
    case "doctor_joined":
      return {
        label: "In Consultation",
        className: "border border-success-400/40 bg-success-500/10 text-success-400",
      };
    case "completed":
      return {
        label: "Completed",
        className: "border border-neutral-500/40 text-neutral-400",
      };
  }
}

/**
 * Dark-theme live session console (Figma "on vitula" / "Live virtual"
 * frames). All session state is simulated locally — see
 * `virtualShiftsStore` for why (no backend telehealth endpoints yet).
 */
export function VirtualSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const session = useVirtualSessionsStore((s) =>
    s.sessions.find((x) => x.id === sessionId),
  );
  const advance = useVirtualSessionsStore((s) => s.advance);
  const end = useVirtualSessionsStore((s) => s.end);

  if (!session) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0d1424] text-white">
        <p className="text-lg font-semibold">Session not found</p>
        <button
          onClick={() => navigate(PATHS.hospital.virtualShifts)}
          className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white"
        >
          Back to Virtual Shifts
        </button>
      </div>
    );
  }

  const pill = statusPill(session);
  const isLive = session.stage === "doctor_joined";
  const deviceConnected =
    session.stage === "device_connected" || isLive;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#0d1424]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/5 bg-[#0d1424]/95 px-4 backdrop-blur lg:px-6">
        <button
          onClick={() => navigate(PATHS.hospital.virtualShifts)}
          className="flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Virtual Shifts
        </button>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              pill.className,
            )}
          >
            {isLive && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400" />
            )}
            {pill.label}
          </span>
          {isLive && (
            <button
              onClick={() => end(session.id)}
              className="rounded-lg bg-[#2563eb] px-3.5 py-1.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              End Consultation
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pb-12 lg:px-6">
        {/* Heading */}
        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary-400">
              {session.visitType} • Virtual Visit
            </p>
            <h1 className="mt-1.5 text-3xl font-bold text-white">
              {session.patientLabel}
            </h1>
          </div>
          <p className="text-sm text-white/50">{session.kiosk}</p>
        </div>

        {/* Video area */}
        <div className="relative mt-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-black">
          {isLive ? (
            <>
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
                Connected
              </span>
              <div className="absolute right-4 top-4 flex h-20 w-28 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <AvatarInitials
                  name={session.doctor}
                  className="bg-secondary-600/40 font-bold text-secondary-300"
                />
              </div>
              <Video className="h-14 w-14 text-white/15" />
              <span className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {session.kiosk} — Live feed placeholder
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center px-6 text-center">
              <VideoOff className="h-10 w-10 text-white/25" />
              <p className="mt-4 max-w-sm text-sm text-white/60">
                {session.stage === "completed"
                  ? "This consultation has ended."
                  : `${session.kiosk} is ${
                      deviceConnected ? "ready" : "idle"
                    } — ${
                      deviceConnected
                        ? "doctor has not joined the call yet."
                        : "device not yet connected to this session."
                    }`}
              </p>
              {session.stage !== "completed" && (
                <button
                  onClick={() => advance(session.id)}
                  className="mt-6 flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  <Video className="h-4 w-4" />
                  {deviceConnected
                    ? "Join Call as Doctor"
                    : "Connect Device & Join Call"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live transcription */}
        {isLive && (
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Mic className="h-4 w-4 text-white/60" />
                Live Transcription & Translation
              </h2>
              <span className="flex items-center gap-1.5 rounded-full border border-success-400/40 bg-success-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-success-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400" />
                Live
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Doctor's Language", value: "English" },
                { label: "Patient's Language", value: "Spanish" },
              ].map((lang) => (
                <div key={lang.label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    {lang.label}
                  </p>
                  <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white">
                    {lang.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-black/30 px-5 py-10 text-center">
              <Mic className="h-6 w-6 text-white/25" />
              <p className="text-sm text-white/60">
                Live transcription will appear here as the doctor and patient
                speak.
              </p>
            </div>
          </div>
        )}

        {/* Bottom grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* Timeline */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <h2 className="text-base font-bold text-white">Session Timeline</h2>
            <ul className="mt-4 space-y-5 border-l border-white/10 pl-4">
              {session.timeline.map((event, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
                  <p className="text-sm font-medium text-white/85">
                    {event.label}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">{event.time}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {/* Remote physician */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-base font-bold text-white">
                Remote Physician
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <AvatarInitials
                  name={session.doctor}
                  size="md"
                  className="bg-secondary-500 font-bold text-white"
                />
                <div>
                  <p className="text-sm font-bold text-white">
                    {session.doctor}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
                    Connected remotely •
                    <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                    {session.doctorRating}
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnostics */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-base font-bold text-white">
                Device Diagnostics
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["Camera OK", "Microphone OK"].map((check) => (
                  <span
                    key={check}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-medium text-white/80"
                  >
                    <Check className="h-4 w-4 text-success-400" />
                    {check}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="h-12 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-bold text-white/85 transition-colors hover:bg-white/[0.07]">
            Reassign Doctor
          </button>
          <button
            onClick={() => navigate(PATHS.hospital.handoverReports)}
            className="h-12 rounded-xl bg-[#2563eb] text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            View Handover Report
          </button>
        </div>
      </div>
    </div>
  );
}
