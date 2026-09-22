import { useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Video,
  VideoOff,
  Volume2,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import type { VirtualCallRoom } from "../useVirtualCallRoom";
import { DeviceField } from "./PreJoinScreen";

interface ControlToggleProps {
  on: boolean;
  onClick: () => void;
  OnIcon: typeof Mic;
  OffIcon: typeof Mic;
  label: string;
}

function ControlToggle({
  on,
  onClick,
  OnIcon,
  OffIcon,
  label,
}: ControlToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!on}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11",
        on
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-error-500 text-white hover:bg-error-600",
      )}
    >
      {on ? (
        <OnIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <OffIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </button>
  );
}

/** Small "mic off" badge shown on a tile when its owner is muted. */
function MutedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-white sm:h-6 sm:w-6",
        className,
      )}
      title="Muted"
      aria-label="Muted"
    >
      <MicOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    </span>
  );
}

interface CallStageProps {
  call: VirtualCallRoom;
  /** Caption on the self tile, e.g. "You · Kiosk device". */
  selfLabel: string;
  /** Caption on the remote tile once they join. */
  remoteLabel: string;
  /** Name used for the remote avatar fallback before they join. */
  remoteFallbackName: string | null;
  /** What the remote side is called while still absent, e.g. "clinician". */
  remoteRole: string;
  onHangup: () => void;
  hangupLabel: string;
  className?: string;
}

/** Which of the two tiles currently fills the stage. */
type MainView = "self" | "remote";

/**
 * Google Meet-style in-call surface shared by the hospital and health-worker
 * virtual-visit screens: one tile fills the stage, the other sits as a corner
 * tile, a floating control bar, and a device-settings popover. Either tile
 * can be clicked to swap which one is main.
 */
export function CallStage({
  call,
  selfLabel,
  remoteLabel,
  remoteFallbackName,
  remoteRole,
  onHangup,
  hangupLabel,
  className,
}: CallStageProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [mainView, setMainView] = useState<MainView>("self");

  useEffect(() => {
    if (!settingsOpen) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setCameras(devices.filter((d) => d.kind === "videoinput"));
        setMics(devices.filter((d) => d.kind === "audioinput"));
      })
      .catch(() => {});
  }, [settingsOpen]);

  const selfIsMain = mainView === "self";

  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-[#202124]",
        className,
      )}
    >
      {/* Self tile — main stage or corner tile, clicking swaps which is which */}
      <button
        type="button"
        onClick={() => setMainView("self")}
        aria-label={selfIsMain ? selfLabel : `Make ${selfLabel} the main view`}
        className={cn(
          "overflow-hidden text-left",
          selfIsMain
            ? "absolute inset-0 z-0 cursor-default"
            // z-10: the corner tile must paint above the main tile regardless
            // of DOM order (self renders before remote either way).
            : "absolute right-4 top-4 z-10 h-20 w-32 rounded-xl border border-white/10 bg-[#3c4043] shadow-lg sm:h-32 sm:w-52",
        )}
      >
        <div
          ref={call.setLocalVideoEl}
          className="absolute inset-0 flex items-center justify-center"
        />
        {!call.localVideoAttached && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
            <VideoOff
              className={cn(
                "text-white/20",
                selfIsMain ? "h-12 w-12" : "h-6 w-6",
              )}
            />
            {selfIsMain && (
              <span className="text-xs font-medium text-white/40">
                Your camera is off
              </span>
            )}
          </div>
        )}
        <span
          className={cn(
            "absolute bottom-1 left-1 rounded bg-black/50 font-semibold uppercase tracking-widest text-white/70",
            selfIsMain
              ? "px-2 py-1 text-[10px]"
              : "px-1.5 py-0.5 text-[9px]",
          )}
        >
          {selfLabel}
        </span>
        {!call.micOn && (
          <MutedBadge className="absolute bottom-1 right-1" />
        )}
      </button>

      {/* Remote tile — main stage or corner tile */}
      <button
        type="button"
        onClick={() => setMainView("remote")}
        aria-label={
          selfIsMain ? `Make ${remoteLabel} the main view` : remoteLabel
        }
        className={cn(
          "overflow-hidden text-left",
          !selfIsMain
            ? "absolute inset-0 z-0 cursor-default"
            // z-10: the corner tile must paint above the main tile regardless
            // of DOM order (self renders before remote either way).
            : "absolute right-4 top-4 z-10 h-20 w-32 rounded-xl border border-white/10 bg-[#3c4043] shadow-lg sm:h-32 sm:w-52",
        )}
      >
        <div ref={call.setRemoteVideoEl} className="absolute inset-0" />
        {!call.remoteJoined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#3c4043]">
            <AvatarInitials
              name={remoteFallbackName ?? remoteLabel}
              className="bg-secondary-600/40 font-bold text-secondary-200"
            />
            <span
              className={cn(
                "px-2 text-center font-medium text-white/50",
                !selfIsMain ? "text-sm" : "text-[10px]",
              )}
            >
              Waiting for {remoteRole}…
            </span>
          </div>
        )}
        {call.remoteJoined && (
          <span
            className={cn(
              "absolute bottom-1 left-1 rounded bg-black/50 font-medium text-white",
              !selfIsMain ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]",
            )}
          >
            {remoteLabel}
          </span>
        )}
        {call.remoteJoined && !call.remoteMicOn && (
          <MutedBadge className="absolute bottom-1 right-1" />
        )}
      </button>

      {/* Overall call status — independent of which tile is main */}
      <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
        Connected
      </span>

      {/* Audio blocked by the browser — tap to resume */}
      {call.audioBlocked && (
        <button
          type="button"
          onClick={call.resumeAudio}
          className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-warning-500 px-4 py-2 text-sm font-bold text-white shadow-lg"
        >
          <Volume2 className="h-4 w-4" />
          Tap to enable call audio
        </button>
      )}

      {/* Floating control bar */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1.5 backdrop-blur sm:bottom-4 sm:gap-2 sm:px-3 sm:py-2">
        <ControlToggle
          on={call.micOn}
          onClick={call.toggleMic}
          OnIcon={Mic}
          OffIcon={MicOff}
          label={call.micOn ? "Mute microphone" : "Unmute microphone"}
        />
        <ControlToggle
          on={call.cameraOn}
          onClick={call.toggleCamera}
          OnIcon={Video}
          OffIcon={VideoOff}
          label={call.cameraOn ? "Turn off camera" : "Turn on camera"}
        />
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          aria-label="Device settings"
          title="Device settings"
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11",
            settingsOpen
              ? "bg-white/25 text-white"
              : "bg-white/15 text-white hover:bg-white/25",
          )}
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <span className="mx-0.5 h-5 w-px bg-white/15 sm:mx-1 sm:h-6" />
        <button
          type="button"
          onClick={onHangup}
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-error-500 px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-error-600 sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <PhoneOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {hangupLabel}
        </button>
      </div>

      {/* Device settings popover — width is clamped to the viewport so it
          never overflows on a narrow phone, and sits above the control bar
          rather than centered over the whole stage on small screens. */}
      {settingsOpen && (
        <>
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute bottom-14 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-[#2a2a2e] p-3 shadow-2xl sm:bottom-20 sm:p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/50 sm:mb-3">
              Devices
            </p>
            <div className="space-y-2.5 sm:space-y-3">
              <DeviceField
                label="Camera"
                icon={<Video className="h-3.5 w-3.5" />}
                devices={cameras}
                value={call.activeVideoId}
                onChange={(id) => call.switchDevice("videoinput", id)}
              />
              <DeviceField
                label="Microphone"
                icon={<Mic className="h-3.5 w-3.5" />}
                devices={mics}
                value={call.activeAudioId}
                onChange={(id) => call.switchDevice("audioinput", id)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
