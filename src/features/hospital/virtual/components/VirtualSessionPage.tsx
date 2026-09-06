import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Room, RoomEvent, Track } from "livekit-client";
import {
  ArrowLeft,
  Check,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Star,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PATHS } from "@/routes/paths";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/lib/apiError";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";
import { shiftStatusDisplay } from "@/features/hospital/shifts/shiftStatusDisplay";
import type { ApiShift } from "@/features/hospital/shifts/types";
import { getCallWindowInfo, type CallWindowState } from "../callWindow";
import { VirtualCallService, type ConsultSession } from "../virtualCallService";
import { DeviceField, PreJoinScreen, type JoinOptions } from "./PreJoinScreen";
import {
  LS_AUDIO_DEVICE,
  LS_VIDEO_DEVICE,
  writeStoredDevice,
} from "../mediaDevices";

interface WorkerPublicDetail {
  first_name: string;
  last_name: string;
  rating: number;
  role_title: string;
}

type ConnectionState =
  | "idle"
  | "prejoin"
  | "connecting"
  | "connected"
  | "ended"
  | "error";

interface LiveKitTrack {
  kind: string;
  attach: () => HTMLElement;
}

interface LiveKitPublication {
  kind: string;
  track?: LiveKitTrack;
}

interface LiveKitParticipant {
  setCameraEnabled: (enabled: boolean) => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  getTrackPublication: (source: string) => LiveKitPublication | undefined;
}

interface LiveKitRoom {
  remoteParticipants: Map<unknown, unknown>;
  localParticipant: LiveKitParticipant;
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => void;
  switchActiveDevice: (kind: MediaDeviceKind, deviceId: string) => Promise<void>;
  on: (event: string, handler: (...args: never[]) => void) => LiveKitRoom;
}

const CALL_BUTTON_LABEL: Record<CallWindowState, string> = {
  too_early: "Call Not Open Yet",
  open: "Connect Device & Join Call",
  elapsed: "Call Window Closed",
  completed: "Consultation Completed",
  unavailable: "Call Unavailable",
};

function attachRemoteTrack(
  track: LiveKitTrack,
  container: HTMLDivElement | null,
) {
  if (!container) return;
  const el = track.attach();
  if (track.kind === Track.Kind.Video) {
    el.className = "h-full w-full object-cover";
  }
  container.appendChild(el);
}

// Attaches (or re-attaches) the local camera track into the self-view tile.
// Clears any previous element first so this is safe to call repeatedly. The
// feed is mirrored so it reads as a "looking in a mirror" self-view.
function attachLocalVideo(
  track: LiveKitTrack,
  container: HTMLDivElement | null,
) {
  if (!container) return false;
  const el = track.attach() as HTMLVideoElement;
  el.muted = true;
  el.playsInline = true;
  el.className = "h-full w-full -scale-x-100 object-cover";
  container.innerHTML = "";
  container.appendChild(el);
  return true;
}

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

export function VirtualSessionPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { getShiftDetails } = useHospitalShift();

  const [shift, setShift] = useState<ApiShift | null>(null);
  const [loadError, setLoadError] = useState("");
  const [physician, setPhysician] = useState<WorkerPublicDetail | null>(null);
  const [now, setNow] = useState(() => new Date());

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [connectError, setConnectError] = useState("");
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [localVideoAttached, setLocalVideoAttached] = useState(false);
  const [cameraOk, setCameraOk] = useState<boolean | null>(null);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [consultation, setConsultation] = useState<ConsultSession | null>(null);

  // Whether a clinician is already connected, polled while in the green room.
  const [prejoinPresent, setPrejoinPresent] = useState(false);
  const [prejoinPresentName, setPrejoinPresentName] = useState<string | null>(
    null,
  );

  // In-call device settings popover.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inCallCameras, setInCallCameras] = useState<MediaDeviceInfo[]>([]);
  const [inCallMics, setInCallMics] = useState<MediaDeviceInfo[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | undefined>();
  const [activeAudioId, setActiveAudioId] = useState<string | undefined>();

  const roomRef = useRef<LiveKitRoom | null>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const consultationRef = useRef<ConsultSession | null>(null);
  const endedByHospitalRef = useRef(false);
  const deviceIdsRef = useRef<{ video?: string; audio?: string }>({});

  useEffect(() => {
    consultationRef.current = consultation;
  }, [consultation]);

  // Load the real shift; recheck the call window every 30s so the button
  // flips from disabled -> enabled without a manual refresh.
  useEffect(() => {
    if (!shiftId) return;
    let cancelled = false;
    getShiftDetails(shiftId)
      .then((data) => {
        if (cancelled) return;
        setShift(data);
        if (data.assigned_clinician_id) {
          apiClient
            .get<WorkerPublicDetail>(
              `/api/v1/workers/${data.assigned_clinician_id}`,
            )
            .then((res) => {
              if (!cancelled) setPhysician(res.data);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : "Couldn't load this shift.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Report departure and disconnect on unmount so the backend has a final
  // participant state even when the browser closes the page.
  useEffect(() => {
    return () => {
      if (shiftId && consultationRef.current && !endedByHospitalRef.current) {
        void VirtualCallService.leaveSession(shiftId).catch(() => {});
      }
      roomRef.current?.disconnect();
    };
  }, [shiftId]);

  useEffect(() => {
    if (!shiftId || !consultationRef.current || connectionState !== "connected")
      return;
    const refresh = () =>
      VirtualCallService.getSession(shiftId)
        .then(setConsultation)
        .catch(() => {});
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [connectionState, shiftId]);

  // The local camera track is published inside handleJoin() while the state is
  // still "connecting", so the self-view tile (and localVideoRef) hasn't
  // mounted yet and the LocalTrackPublished event fires into a null ref. Once
  // the connected view is on screen, attach the already-published camera track
  // so the hospital sees its own feed instead of the placeholder icon.
  useEffect(() => {
    if (connectionState !== "connected") return;
    const room = roomRef.current;
    if (!room || !localVideoRef.current) return;
    if (localVideoAttached && localVideoRef.current.childElementCount > 0) return;
    const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
    if (pub?.track && pub.track.kind === Track.Kind.Video) {
      const ok = attachLocalVideo(pub.track, localVideoRef.current);
      if (ok) setLocalVideoAttached(true);
    }
  }, [connectionState, cameraOk, localVideoAttached]);

  // While the green room is open (or a join is in flight / just failed), poll
  // the session so the hospital can see whether the clinician is already there.
  useEffect(() => {
    if (!shiftId) return;
    const watching =
      connectionState === "prejoin" ||
      connectionState === "connecting" ||
      connectionState === "error";
    if (!watching) return;
    let cancelled = false;
    const poll = () =>
      VirtualCallService.getSession(shiftId)
        .then((session) => {
          if (cancelled) return;
          const other = session.participants.find((p) => p.connected);
          setPrejoinPresent(Boolean(other));
          setPrejoinPresentName(other?.display_name ?? null);
        })
        .catch(() => {
          if (!cancelled) {
            setPrejoinPresent(false);
            setPrejoinPresentName(null);
          }
        });
    poll();
    const interval = setInterval(poll, 5_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [connectionState, shiftId]);

  // Populate the in-call device pickers when the settings popover opens.
  useEffect(() => {
    if (!settingsOpen) return;
    setActiveVideoId(deviceIdsRef.current.video);
    setActiveAudioId(deviceIdsRef.current.audio);
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setInCallCameras(devices.filter((d) => d.kind === "videoinput"));
        setInCallMics(devices.filter((d) => d.kind === "audioinput"));
      })
      .catch(() => {});
  }, [settingsOpen]);

  const openPreJoin = useCallback(() => {
    setConnectError("");
    setConnectionState("prejoin");
  }, []);

  const cancelPreJoin = useCallback(() => {
    setConnectError("");
    setConnectionState("idle");
  }, []);

  const handleJoin = useCallback(
    async (opts: JoinOptions) => {
      if (!shiftId) return;
      setConnectError("");
      setConnectionState("connecting");
      deviceIdsRef.current = {
        video: opts.videoDeviceId,
        audio: opts.audioDeviceId,
      };
      try {
        const { url, token } = await VirtualCallService.getCallToken(shiftId);

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          ...(opts.videoDeviceId
            ? { videoCaptureDefaults: { deviceId: opts.videoDeviceId } }
            : {}),
          ...(opts.audioDeviceId
            ? { audioCaptureDefaults: { deviceId: opts.audioDeviceId } }
            : {}),
        }) as LiveKitRoom;
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track: LiveKitTrack) =>
          attachRemoteTrack(track, remoteVideoRef.current),
        );
        room.on(RoomEvent.ParticipantConnected, () => setRemoteJoined(true));
        room.on(RoomEvent.ParticipantDisconnected, () => {
          if (room.remoteParticipants.size === 0) setRemoteJoined(false);
        });
        room.on(
          RoomEvent.LocalTrackPublished,
          (publication: LiveKitPublication) => {
            if (
              publication.track &&
              publication.track.kind === Track.Kind.Video
            ) {
              const ok = attachLocalVideo(
                publication.track,
                localVideoRef.current,
              );
              if (ok) setLocalVideoAttached(true);
            }
          },
        );
        room.on(
          RoomEvent.LocalTrackUnpublished,
          (publication: LiveKitPublication) => {
            if (publication.kind === Track.Kind.Video && localVideoRef.current) {
              localVideoRef.current.innerHTML = "";
              setLocalVideoAttached(false);
            }
          },
        );
        room.on(RoomEvent.Disconnected, () => {
          setConnectionState((prev) => (prev === "error" ? prev : "ended"));
          setRemoteJoined(false);
        });

        await room.connect(url, token);
        const session = await VirtualCallService.getSession(shiftId);
        setConsultation(session);
        setRemoteJoined(room.remoteParticipants.size > 0);

        try {
          await room.localParticipant.setCameraEnabled(opts.camEnabled);
          setCameraOk(opts.camEnabled);
        } catch {
          setCameraOk(false);
        }
        try {
          await room.localParticipant.setMicrophoneEnabled(opts.micEnabled);
          setMicOk(opts.micEnabled);
        } catch {
          setMicOk(false);
        }

        setConnectionState("connected");
      } catch (err) {
        console.log(err);
        setConnectError(
          err instanceof ApiError
            ? err.message
            : "Couldn't connect to the call — check your connection and try again.",
        );
        setConnectionState("error");
        roomRef.current?.disconnect();
        roomRef.current = null;
      }
    },
    [shiftId],
  );

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micOk;
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOk(next);
    } catch {
      setMicOk(false);
    }
  }, [micOk]);

  const toggleCam = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !cameraOk;
    try {
      await room.localParticipant.setCameraEnabled(next);
      setCameraOk(next);
    } catch {
      setCameraOk(false);
    }
  }, [cameraOk]);

  const switchDevice = useCallback(
    async (kind: "videoinput" | "audioinput", deviceId: string) => {
      if (!deviceId || !roomRef.current) return;
      try {
        await roomRef.current.switchActiveDevice(kind, deviceId);
        if (kind === "videoinput") {
          deviceIdsRef.current.video = deviceId;
          setActiveVideoId(deviceId);
          writeStoredDevice(LS_VIDEO_DEVICE, deviceId);
        } else {
          deviceIdsRef.current.audio = deviceId;
          setActiveAudioId(deviceId);
          writeStoredDevice(LS_AUDIO_DEVICE, deviceId);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  const handleEnd = useCallback(async () => {
    if (!shiftId) return;
    try {
      await VirtualCallService.endSession(shiftId);
    } catch (err) {
      setConnectError(
        err instanceof ApiError
          ? err.message
          : "Couldn't end the consultation.",
      );
      return;
    }
    endedByHospitalRef.current = true;
    roomRef.current?.disconnect();
    roomRef.current = null;
    setConsultation((current) =>
      current
        ? { ...current, status: "ended", ended_at: new Date().toISOString() }
        : current,
    );
    setConnectionState("ended");
    setSettingsOpen(false);
    setLocalVideoAttached(false);
    if (localVideoRef.current) localVideoRef.current.innerHTML = "";
    if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
  }, [shiftId]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {loadError}
        </p>
        <button
          onClick={() => navigate(PATHS.hospital.virtualShifts)}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Back to Virtual Shifts
        </button>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Loading session...
        </p>
      </div>
    );
  }

  const callWindow = getCallWindowInfo(shift, now);
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";
  const isPreJoin =
    connectionState === "prejoin" ||
    connectionState === "connecting" ||
    connectionState === "error";
  const canConnect = callWindow.state === "open" && connectionState === "idle";
  const physicianName = physician
    ? `Dr. ${physician.first_name} ${physician.last_name}`
    : null;

  const statusPill = isConnected
    ? {
        label: "In Consultation",
        className:
          "border border-success-400/40 bg-success-500/10 text-success-700 dark:text-success-400",
      }
    : shift.status === "completed" || connectionState === "ended"
      ? {
          label: "Completed",
          className:
            "border border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400",
        }
      : isPreJoin
        ? {
            label: isConnecting ? "Connecting Device" : "Device Check",
            className:
              "border border-primary-400/40 text-primary-600 dark:text-primary-300",
          }
        : {
            label: shiftStatusDisplay[shift.status].label,
            className:
              "border border-neutral-300 text-neutral-500 dark:border-neutral-600 dark:text-neutral-400",
          };

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-neutral-50 dark:bg-[#0d1424]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-neutral-100 bg-neutral-50/95 px-4 backdrop-blur dark:border-white/5 dark:bg-[#0d1424]/95 lg:px-6">
        <button
          onClick={() => navigate(PATHS.hospital.virtualShifts)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-white/80 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Virtual Shifts
        </button>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            statusPill.className,
          )}
        >
          {isConnected && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500" />
          )}
          {statusPill.label}
        </span>
      </div>

      {isPreJoin ? (
        <div className="flex-1 bg-[#0d1424]">
          <PreJoinScreen
            selfName="You"
            remotePresent={prejoinPresent}
            remotePresentName={prejoinPresentName ?? physicianName}
            joining={isConnecting}
            error={connectError || undefined}
            onJoin={handleJoin}
            onCancel={cancelPreJoin}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 lg:px-6">
          {/* Heading */}
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-600 dark:text-secondary-400">
                {shift.specialty ?? shift.role_title} • Virtual Visit
              </p>
              <h1 className="mt-1.5 text-3xl font-bold text-neutral-900 dark:text-white">
                {shift.role_title}
              </h1>
            </div>
            <p className="text-sm text-neutral-500 dark:text-white/50">
              {new Date(shift.scheduled_start).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Video area */}
          <div className="relative mt-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-[#202124]">
            {isConnected ? (
              <>
                {/* Self-view — main stage */}
                <div
                  ref={localVideoRef}
                  className="absolute inset-0 flex items-center justify-center"
                />
                {!localVideoAttached && (
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
                  You · Kiosk device
                </span>

                {/* Remote physician — corner tile */}
                <div className="absolute right-4 top-4 h-24 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#3c4043] shadow-lg sm:h-32 sm:w-52">
                  <div ref={remoteVideoRef} className="absolute inset-0" />
                  {!remoteJoined && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <AvatarInitials
                        name={physicianName ?? "Dr"}
                        className="bg-secondary-600/40 font-bold text-secondary-200"
                      />
                      <span className="px-2 text-center text-[10px] font-medium text-white/50">
                        Waiting for clinician…
                      </span>
                    </div>
                  )}
                  {remoteJoined && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {physicianName ?? "Clinician"}
                    </span>
                  )}
                </div>

                {/* Floating control bar */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
                  <ControlToggle
                    on={Boolean(micOk)}
                    onClick={toggleMic}
                    OnIcon={Mic}
                    OffIcon={MicOff}
                    label={micOk ? "Mute microphone" : "Unmute microphone"}
                  />
                  <ControlToggle
                    on={Boolean(cameraOk)}
                    onClick={toggleCam}
                    OnIcon={Video}
                    OffIcon={VideoOff}
                    label={cameraOk ? "Turn off camera" : "Turn on camera"}
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
                    onClick={handleEnd}
                    className="flex items-center gap-1.5 rounded-full bg-error-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-error-600"
                  >
                    <PhoneOff className="h-4 w-4" />
                    End
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
                          devices={inCallCameras}
                          value={activeVideoId}
                          onChange={(id) => switchDevice("videoinput", id)}
                        />
                        <DeviceField
                          label="Microphone"
                          icon={<Mic className="h-3.5 w-3.5" />}
                          devices={inCallMics}
                          value={activeAudioId}
                          onChange={(id) => switchDevice("audioinput", id)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center px-6 text-center">
                <VideoOff className="h-10 w-10 text-white/25" />
                <p className="mt-4 max-w-sm text-sm text-white/60">
                  {connectionState === "ended"
                    ? "This consultation has ended."
                    : callWindow.message}
                </p>
                {connectError && (
                  <p className="mt-2 max-w-sm text-sm text-error-400">
                    {connectError}
                  </p>
                )}
                {connectionState !== "ended" && (
                  <Tooltip
                    content={!canConnect ? callWindow.message : undefined}
                  >
                    <Button
                      onClick={openPreJoin}
                      disabled={!canConnect}
                      className="mt-6 flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      {CALL_BUTTON_LABEL[callWindow.state]}
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          {/* Bottom grid */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Session summary */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Session
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-white/50">Status</dt>
                  <dd className="font-semibold text-neutral-900 dark:text-white">
                    {shiftStatusDisplay[shift.status].label}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-white/50">
                    Department
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-white">
                    {shift.department ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-white/50">
                    Call window
                  </dt>
                  <dd className="max-w-[220px] text-right font-semibold text-neutral-900 dark:text-white">
                    {callWindow.message}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              {/* Remote physician */}
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Remote Physician
                </h2>
                {physicianName ? (
                  <div className="mt-4 flex items-center gap-3">
                    <AvatarInitials
                      name={physicianName}
                      size="md"
                      className="bg-secondary-500 font-bold text-white"
                    />
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {physicianName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-white/50">
                        {physician?.role_title ?? "Clinician"} •
                        <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                        {physician?.rating?.toFixed(1) ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400 dark:text-white/40">
                    No clinician assigned yet.
                  </p>
                )}
              </div>

              {/* Diagnostics */}
              {isConnected && (
                <div className="rounded-2xl border border-neutral-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    Device Diagnostics
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <span className="flex items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
                      {cameraOk ? (
                        <Check className="h-4 w-4 text-success-500" />
                      ) : (
                        <X className="h-4 w-4 text-error-500" />
                      )}
                      {cameraOk ? "Camera OK" : "Camera Off"}
                    </span>
                    <span className="flex items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
                      {micOk ? (
                        <Check className="h-4 w-4 text-success-500" />
                      ) : (
                        <X className="h-4 w-4 text-error-500" />
                      )}
                      {micOk ? "Microphone OK" : "Microphone Muted"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate(`${PATHS.hospital.shifts}/${shift.id}`)}
              className="h-12 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/85 dark:hover:bg-white/[0.07]"
            >
              View Shift Details
            </button>
            <button
              onClick={() => navigate(PATHS.hospital.handoverReports)}
              className="h-12 rounded-xl bg-[#2563eb] text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              View Handover Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
