import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import {
  LS_AUDIO_DEVICE,
  LS_VIDEO_DEVICE,
  readStoredDevice,
  writeStoredDevice,
} from "../mediaDevices";

export interface JoinOptions {
  videoDeviceId?: string;
  audioDeviceId?: string;
  camEnabled: boolean;
  micEnabled: boolean;
}

interface PreJoinScreenProps {
  /** Label for the local participant, shown when the camera preview is off. */
  selfName: string;
  /** True while a clinician is already connected to the room. */
  remotePresent: boolean;
  /** Display name of whoever is already in the call, if known. */
  remotePresentName: string | null;
  /** True while the parent is establishing the LiveKit connection. */
  joining: boolean;
  /** Connection error surfaced from the parent's join attempt. */
  error?: string;
  onJoin: (opts: JoinOptions) => void;
  onCancel: () => void;
}

export interface DeviceFieldProps {
  label: string;
  icon: React.ReactNode;
  devices: MediaDeviceInfo[];
  value: string | undefined;
  disabled?: boolean;
  onChange: (deviceId: string) => void;
}

export function DeviceField({
  label,
  icon,
  devices,
  value,
  disabled,
  onChange,
}: DeviceFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
        {icon}
        {label}
      </span>
      <span className="relative block">
        <select
          value={value ?? ""}
          disabled={disabled || devices.length === 0}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 pr-9 text-sm text-white outline-none transition-colors focus:border-white/30 focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
        >
          {devices.length === 0 && <option value="">Default device</option>}
          {devices.map((device) => (
            <option
              key={device.deviceId}
              value={device.deviceId}
              className="bg-neutral-900 text-white"
            >
              {device.label || `${label} (${device.deviceId.slice(0, 6)})`}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      </span>
    </label>
  );
}

/**
 * Google Meet-style "green room" the hospital sees after choosing to join a
 * virtual visit: a live self-preview with camera/mic toggles and device
 * pickers, plus a live indicator of whether the clinician is already waiting.
 * On confirm it hands the chosen devices and initial mute state back to the
 * parent, which owns the actual LiveKit connection.
 */
export function PreJoinScreen({
  selfName,
  remotePresent,
  remotePresentName,
  joining,
  error,
  onJoin,
  onCancel,
}: PreJoinScreenProps) {
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const [camEnabled, setCamEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoDeviceId, setVideoDeviceId] = useState<string | undefined>();
  const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>();
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [micLevel, setMicLevel] = useState(0);
  const [permissionError, setPermissionError] = useState("");
  const [acquiring, setAcquiring] = useState(true);

  const camEnabledRef = useRef(camEnabled);
  const micEnabledRef = useRef(micEnabled);
  camEnabledRef.current = camEnabled;
  micEnabledRef.current = micEnabled;

  const teardownStream = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startMicMeter = useCallback((stream: MediaStream) => {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(buffer);
      let sumSquares = 0;
      for (let i = 0; i < buffer.length; i += 1) {
        const sample = (buffer[i] - 128) / 128;
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / buffer.length);
      const scaled = Math.min(1, rms * 3);
      setMicLevel((prev) => prev * 0.6 + scaled * 0.4);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const acquire = useCallback(
    async (nextVideoId?: string, nextAudioId?: string) => {
      setAcquiring(true);
      setPermissionError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: nextVideoId ? { deviceId: { exact: nextVideoId } } : true,
          audio: nextAudioId ? { deviceId: { exact: nextAudioId } } : true,
        });
        teardownStream();
        streamRef.current = stream;
        if (videoElRef.current) videoElRef.current.srcObject = stream;

        stream
          .getVideoTracks()
          .forEach((track) => (track.enabled = camEnabledRef.current));
        stream
          .getAudioTracks()
          .forEach((track) => (track.enabled = micEnabledRef.current));

        const activeVideo = stream.getVideoTracks()[0]?.getSettings().deviceId;
        const activeAudio = stream.getAudioTracks()[0]?.getSettings().deviceId;
        if (activeVideo) setVideoDeviceId(activeVideo);
        if (activeAudio) setAudioDeviceId(activeAudio);

        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((d) => d.kind === "videoinput"));
        setMics(devices.filter((d) => d.kind === "audioinput"));

        startMicMeter(stream);
      } catch (err) {
        console.log(err);
        teardownStream();
        setPermissionError(
          "We couldn't reach your camera or microphone. Check the browser's site permissions, then retry.",
        );
      } finally {
        setAcquiring(false);
      }
    },
    [startMicMeter, teardownStream],
  );

  useEffect(() => {
    void acquire(
      readStoredDevice(LS_VIDEO_DEVICE),
      readStoredDevice(LS_AUDIO_DEVICE),
    );
    const refreshDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          setCameras(devices.filter((d) => d.kind === "videoinput"));
          setMics(devices.filter((d) => d.kind === "audioinput"));
        })
        .catch(() => {});
    };
    navigator.mediaDevices.addEventListener?.("devicechange", refreshDevices);
    return () => {
      navigator.mediaDevices.removeEventListener?.(
        "devicechange",
        refreshDevices,
      );
      teardownStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCam = () => {
    setCamEnabled((prev) => {
      const next = !prev;
      streamRef.current
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = next));
      return next;
    });
  };

  const toggleMic = () => {
    setMicEnabled((prev) => {
      const next = !prev;
      streamRef.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = next));
      return next;
    });
  };

  const changeCamera = (deviceId: string) => {
    if (!deviceId) return;
    writeStoredDevice(LS_VIDEO_DEVICE, deviceId);
    void acquire(deviceId, audioDeviceId);
  };

  const changeMic = (deviceId: string) => {
    if (!deviceId) return;
    writeStoredDevice(LS_AUDIO_DEVICE, deviceId);
    void acquire(videoDeviceId, deviceId);
  };

  const handleJoin = () => {
    if (videoDeviceId) writeStoredDevice(LS_VIDEO_DEVICE, videoDeviceId);
    if (audioDeviceId) writeStoredDevice(LS_AUDIO_DEVICE, audioDeviceId);
    onJoin({ videoDeviceId, audioDeviceId, camEnabled, micEnabled });
  };

  const showPlaceholder = !camEnabled || Boolean(permissionError) || acquiring;
  const meterWidth = Math.round((micEnabled ? micLevel : 0) * 100);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-6 px-4 py-8 lg:flex-row lg:py-14 lg:px-6">
      {/* Preview column */}
      <div className="flex w-full flex-col gap-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#202124] shadow-xl ring-1 ring-white/5">
          <video
            ref={videoElRef}
            autoPlay
            muted
            playsInline
            className={cn(
              "h-full w-full -scale-x-100 object-cover",
              showPlaceholder && "invisible",
            )}
          />

          {showPlaceholder && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              {acquiring ? (
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white/80">
                    {selfName.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="max-w-xs px-6 text-sm text-white/60">
                    {permissionError || "Your camera is off"}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Mic level chip */}
          {!permissionError && !acquiring && (
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-2.5 py-1.5 backdrop-blur">
              {micEnabled ? (
                <Mic className="h-3.5 w-3.5 text-white" />
              ) : (
                <MicOff className="h-3.5 w-3.5 text-white/50" />
              )}
              <span className="flex h-1.5 w-16 overflow-hidden rounded-full bg-white/20">
                <span
                  className="h-full rounded-full bg-success-400 transition-[width] duration-75 ease-out"
                  style={{ width: `${meterWidth}%` }}
                />
              </span>
            </div>
          )}

          {/* Preview toggles */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <button
              type="button"
              onClick={toggleMic}
              aria-pressed={!micEnabled}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                micEnabled
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-error-500 text-white hover:bg-error-600",
              )}
            >
              {micEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleCam}
              aria-pressed={!camEnabled}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                camEnabled
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-error-500 text-white hover:bg-error-600",
              )}
            >
              {camEnabled ? (
                <VideoIcon className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Device pickers */}
        <div className="grid gap-3 sm:grid-cols-2">
          <DeviceField
            label="Camera"
            icon={<VideoIcon className="h-3.5 w-3.5" />}
            devices={cameras}
            value={videoDeviceId}
            disabled={acquiring}
            onChange={changeCamera}
          />
          <DeviceField
            label="Microphone"
            icon={<Mic className="h-3.5 w-3.5" />}
            devices={mics}
            value={audioDeviceId}
            disabled={acquiring}
            onChange={changeMic}
          />
        </div>
        {permissionError && (
          <button
            type="button"
            onClick={() => void acquire(videoDeviceId, audioDeviceId)}
            className="self-start text-sm font-semibold text-primary-300 hover:text-primary-200"
          >
            Retry camera &amp; microphone
          </button>
        )}
      </div>

      {/* Join column */}
      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center lg:w-80 lg:flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Ready to join?</h2>

        <div className="flex flex-col items-center gap-1.5">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              remotePresent
                ? "border-success-400/40 bg-success-500/10 text-success-300"
                : "border-white/15 text-white/50",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                remotePresent ? "animate-pulse bg-success-400" : "bg-white/30",
              )}
            />
            {remotePresent ? "Clinician in the call" : "No one else here yet"}
          </span>
          {remotePresent && (
            <p className="text-sm text-white/70">
              {remotePresentName ?? "The clinician"} is waiting for you
            </p>
          )}
        </div>

        <Button
          onClick={handleJoin}
          isLoading={joining}
          disabled={joining || acquiring}
          className="w-full"
        >
          {joining ? "Joining…" : "Join now"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={joining}
          className="text-sm font-semibold text-white/60 transition-colors hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>
        {error && <p className="text-sm text-error-400">{error}</p>}
      </div>
    </div>
  );
}
