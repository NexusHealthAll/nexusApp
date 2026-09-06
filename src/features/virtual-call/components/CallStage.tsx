import { useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Video,
  VideoOff,
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
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        on
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-error-500 text-white hover:bg-error-600",
      )}
    >
      {on ? <OnIcon className="h-5 w-5" /> : <OffIcon className="h-5 w-5" />}
    </button>
  );
}

interface CallStageProps {
  call: VirtualCallRoom;
  /** Caption on the main (self) tile, e.g. "You · Kiosk device". */
  selfLabel: string;
  /** Caption on the corner (remote) tile once they join. */
  remoteLabel: string;
  /** Name used for the remote avatar fallback before they join. */
  remoteFallbackName: string | null;
  /** What the remote side is called while still absent, e.g. "clinician". */
  remoteRole: string;
  onHangup: () => void;
  hangupLabel: string;
  className?: string;
}

/**
 * Google Meet-style in-call surface shared by the hospital and health-worker
 * virtual-visit screens: self-view as the main stage, the other participant
 * as a corner tile, a floating control bar, and a device-settings popover.
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

  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-[#202124]",
        className,
      )}
    >
      {/* Self-view — main stage */}
      <div
        ref={call.setLocalVideoEl}
        className="absolute inset-0 flex items-center justify-center"
      />
      {!call.localVideoAttached && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
          <VideoOff className="h-12 w-12 text-white/20" />
          <span className="text-xs font-medium text-white/40">
            Your camera is off
          </span>
        </div>
      )}

      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
        Connected
      </span>
      <span className="absolute bottom-4 left-4 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">
        {selfLabel}
      </span>

      {/* Remote — corner tile */}
      <div className="absolute right-4 top-4 h-24 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#3c4043] shadow-lg sm:h-32 sm:w-52">
        <div ref={call.setRemoteVideoEl} className="absolute inset-0" />
        {!call.remoteJoined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <AvatarInitials
              name={remoteFallbackName ?? remoteLabel}
              className="bg-secondary-600/40 font-bold text-secondary-200"
            />
            <span className="px-2 text-center text-[10px] font-medium text-white/50">
              Waiting for {remoteRole}…
            </span>
          </div>
        )}
        {call.remoteJoined && (
          <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {remoteLabel}
          </span>
        )}
      </div>

      {/* Floating control bar */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
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
            "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
            settingsOpen
              ? "bg-white/25 text-white"
              : "bg-white/15 text-white hover:bg-white/25",
          )}
        >
          <Settings className="h-5 w-5" />
        </button>
        <span className="mx-1 h-6 w-px bg-white/15" />
        <button
          type="button"
          onClick={onHangup}
          className="flex items-center gap-1.5 rounded-full bg-error-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-error-600"
        >
          <PhoneOff className="h-4 w-4" />
          {hangupLabel}
        </button>
      </div>

      {/* Device settings popover */}
      {settingsOpen && (
        <>
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute bottom-20 left-1/2 z-50 w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-[#2a2a2e] p-4 shadow-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/50">
              Devices
            </p>
            <div className="space-y-3">
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
