import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { ApiError } from "@/lib/apiError";
import { VirtualCallService, type ConsultSession } from "./virtualCallService";
import {
  LS_AUDIO_DEVICE,
  LS_VIDEO_DEVICE,
  writeStoredDevice,
} from "./mediaDevices";
import type { JoinOptions } from "./components/PreJoinScreen";

export type VirtualCallState =
  | "idle"
  | "prejoin"
  | "connecting"
  | "connected"
  | "ended"
  | "error";

interface LiveKitTrack {
  kind: string;
  source?: string;
  attach: () => HTMLMediaElement;
  detach: () => HTMLMediaElement[];
}

interface LiveKitPublication {
  kind: string;
  source?: string;
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

export interface VirtualCallRoom {
  state: VirtualCallState;
  error: string;
  cameraOn: boolean;
  micOn: boolean;
  /** True once a local camera <video> is mounted in the self-view tile. */
  localVideoAttached: boolean;
  /** True once a remote participant has joined the room. */
  remoteJoined: boolean;
  consultation: ConsultSession | null;
  /** For the green room: is someone already connected, and who. */
  present: boolean;
  presentName: string | null;
  activeVideoId: string | undefined;
  activeAudioId: string | undefined;
  /** Callback refs — pass to the self-view / remote-view container divs. */
  setLocalVideoEl: (el: HTMLDivElement | null) => void;
  setRemoteVideoEl: (el: HTMLDivElement | null) => void;
  openPreJoin: () => void;
  cancelPreJoin: () => void;
  join: (opts: JoinOptions) => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleMic: () => Promise<void>;
  switchDevice: (
    kind: "videoinput" | "audioinput",
    deviceId: string,
  ) => Promise<void>;
  /** Disconnect this participant; the room stays up for everyone else. */
  leave: () => Promise<void>;
  /** End the consultation for every participant. */
  end: () => Promise<void>;
  /** Return to "idle" after an ended/errored call so the user can rejoin. */
  reset: () => void;
}

function attachRemoteVideo(track: LiveKitTrack, container: HTMLDivElement) {
  const el = track.attach();
  el.className = "h-full w-full object-cover";
  container.innerHTML = "";
  container.appendChild(el);
}

// Mirrored self-view, like looking in a mirror. Clears the container first so
// this is safe to call repeatedly (device switches, tile remounts).
function attachLocalVideo(track: LiveKitTrack, container: HTMLDivElement) {
  const el = track.attach() as HTMLVideoElement;
  el.muted = true;
  el.playsInline = true;
  el.className = "h-full w-full -scale-x-100 object-cover";
  container.innerHTML = "";
  container.appendChild(el);
}

/**
 * Owns a single LiveKit room for a virtual visit: the green-room lifecycle,
 * the connection, local mute/camera state, device switching, and attaching
 * tracks to caller-provided container elements. Shared by the hospital
 * VirtualSessionPage and the health-worker consultation flow.
 *
 * Video tracks attach to the elements passed via `setLocalVideoEl` /
 * `setRemoteVideoEl` (callback refs, so tiles can unmount and remount as the
 * user navigates). Remote audio attaches to a hidden element on <body> so the
 * caller keeps hearing the other side even when no video tile is on screen.
 */
export function useVirtualCallRoom(
  shiftId: string | undefined,
  deviceLabel: string,
): VirtualCallRoom {
  const [state, setState] = useState<VirtualCallState>("idle");
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [localVideoAttached, setLocalVideoAttached] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [consultation, setConsultation] = useState<ConsultSession | null>(null);
  const [present, setPresent] = useState(false);
  const [presentName, setPresentName] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | undefined>();
  const [activeAudioId, setActiveAudioId] = useState<string | undefined>();

  const roomRef = useRef<LiveKitRoom | null>(null);
  const localElRef = useRef<HTMLDivElement | null>(null);
  const remoteElRef = useRef<HTMLDivElement | null>(null);
  const localTrackRef = useRef<LiveKitTrack | null>(null);
  const remoteVideoTrackRef = useRef<LiveKitTrack | null>(null);
  const audioHostRef = useRef<HTMLDivElement | null>(null);
  const consultationRef = useRef<ConsultSession | null>(null);
  const endedLocallyRef = useRef(false);
  const stateRef = useRef<VirtualCallState>("idle");

  stateRef.current = state;
  useEffect(() => {
    consultationRef.current = consultation;
  }, [consultation]);

  // Hidden host on <body> for remote audio elements, so audio survives the
  // video tiles unmounting during navigation.
  useEffect(() => {
    const host = document.createElement("div");
    host.style.display = "none";
    host.dataset.virtualCallAudio = "true";
    document.body.appendChild(host);
    audioHostRef.current = host;
    return () => {
      host.remove();
      audioHostRef.current = null;
    };
  }, []);

  const teardownRoom = useCallback(() => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    localTrackRef.current = null;
    remoteVideoTrackRef.current = null;
    if (audioHostRef.current) audioHostRef.current.innerHTML = "";
    if (localElRef.current) localElRef.current.innerHTML = "";
    if (remoteElRef.current) remoteElRef.current.innerHTML = "";
    setLocalVideoAttached(false);
    setRemoteJoined(false);
  }, []);

  // Report departure and disconnect if the component unmounts mid-call.
  useEffect(() => {
    return () => {
      if (
        shiftId &&
        consultationRef.current &&
        !endedLocallyRef.current &&
        stateRef.current === "connected"
      ) {
        void VirtualCallService.leaveSession(shiftId).catch(() => {});
      }
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [shiftId]);

  // Keep the consultation record fresh while connected.
  useEffect(() => {
    if (!shiftId || state !== "connected") return;
    const refresh = () =>
      VirtualCallService.getSession(shiftId).then(setConsultation).catch(() => {});
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [state, shiftId]);

  // While the green room is open (or a join is in flight / just failed), poll
  // the session so the caller can show whether the other side is already there.
  useEffect(() => {
    if (!shiftId) return;
    const watching =
      state === "prejoin" || state === "connecting" || state === "error";
    if (!watching) return;
    let cancelled = false;
    const poll = () =>
      VirtualCallService.getSession(shiftId)
        .then((session) => {
          if (cancelled) return;
          const other = session.participants.find((p) => p.connected);
          setPresent(Boolean(other));
          setPresentName(other?.display_name ?? null);
        })
        .catch(() => {
          if (cancelled) return;
          setPresent(false);
          setPresentName(null);
        });
    poll();
    const interval = setInterval(poll, 5_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state, shiftId]);

  const setLocalVideoEl = useCallback((el: HTMLDivElement | null) => {
    localElRef.current = el;
    if (el && localTrackRef.current) {
      attachLocalVideo(localTrackRef.current, el);
      setLocalVideoAttached(true);
    } else if (el) {
      setLocalVideoAttached(false);
    }
  }, []);

  const setRemoteVideoEl = useCallback((el: HTMLDivElement | null) => {
    remoteElRef.current = el;
    if (el && remoteVideoTrackRef.current) {
      attachRemoteVideo(remoteVideoTrackRef.current, el);
    }
  }, []);

  const openPreJoin = useCallback(() => {
    setError("");
    setState("prejoin");
  }, []);

  const cancelPreJoin = useCallback(() => {
    setError("");
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    setError("");
    setState("idle");
    setConsultation(null);
    endedLocallyRef.current = false;
  }, []);

  const join = useCallback(
    async (opts: JoinOptions) => {
      if (!shiftId) return;
      setError("");
      setState("connecting");
      endedLocallyRef.current = false;
      setActiveVideoId(opts.videoDeviceId);
      setActiveAudioId(opts.audioDeviceId);
      try {
        const { url, token } = await VirtualCallService.getCallToken(
          shiftId,
          deviceLabel,
        );

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

        room.on(RoomEvent.TrackSubscribed, (track: LiveKitTrack) => {
          if (track.kind === Track.Kind.Video) {
            remoteVideoTrackRef.current = track;
            if (remoteElRef.current) {
              attachRemoteVideo(track, remoteElRef.current);
            }
          } else if (track.kind === Track.Kind.Audio && audioHostRef.current) {
            const el = track.attach();
            audioHostRef.current.appendChild(el);
          }
        });
        room.on(RoomEvent.TrackUnsubscribed, (track: LiveKitTrack) => {
          if (track.kind === Track.Kind.Video) {
            remoteVideoTrackRef.current = null;
            if (remoteElRef.current) remoteElRef.current.innerHTML = "";
          } else {
            track.detach().forEach((el) => el.remove());
          }
        });
        room.on(RoomEvent.ParticipantConnected, () => setRemoteJoined(true));
        room.on(RoomEvent.ParticipantDisconnected, () => {
          if (room.remoteParticipants.size === 0) setRemoteJoined(false);
        });
        room.on(
          RoomEvent.LocalTrackPublished,
          (publication: LiveKitPublication) => {
            const track = publication.track;
            if (track && track.kind === Track.Kind.Video) {
              localTrackRef.current = track;
              if (localElRef.current) {
                attachLocalVideo(track, localElRef.current);
                setLocalVideoAttached(true);
              }
            }
          },
        );
        room.on(
          RoomEvent.LocalTrackUnpublished,
          (publication: LiveKitPublication) => {
            if (publication.kind === Track.Kind.Video) {
              localTrackRef.current = null;
              if (localElRef.current) localElRef.current.innerHTML = "";
              setLocalVideoAttached(false);
            }
          },
        );
        room.on(RoomEvent.Disconnected, () => {
          if (stateRef.current !== "error") setState("ended");
          setRemoteJoined(false);
        });

        await room.connect(url, token);
        setRemoteJoined(room.remoteParticipants.size > 0);

        try {
          await room.localParticipant.setCameraEnabled(opts.camEnabled);
          setCameraOn(opts.camEnabled);
        } catch {
          setCameraOn(false);
        }
        try {
          await room.localParticipant.setMicrophoneEnabled(opts.micEnabled);
          setMicOn(opts.micEnabled);
        } catch {
          setMicOn(false);
        }

        VirtualCallService.getSession(shiftId)
          .then(setConsultation)
          .catch(() => {});
        setState("connected");
      } catch (err) {
        console.log(err);
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't connect to the call — check your connection and try again.",
        );
        setState("error");
        teardownRoom();
      }
    },
    [shiftId, deviceLabel, teardownRoom],
  );

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !cameraOn;
    try {
      await room.localParticipant.setCameraEnabled(next);
      setCameraOn(next);
    } catch {
      setCameraOn(false);
    }
  }, [cameraOn]);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micOn;
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch {
      setMicOn(false);
    }
  }, [micOn]);

  const switchDevice = useCallback(
    async (kind: "videoinput" | "audioinput", deviceId: string) => {
      if (!deviceId || !roomRef.current) return;
      try {
        await roomRef.current.switchActiveDevice(kind, deviceId);
        if (kind === "videoinput") {
          setActiveVideoId(deviceId);
          writeStoredDevice(LS_VIDEO_DEVICE, deviceId);
        } else {
          setActiveAudioId(deviceId);
          writeStoredDevice(LS_AUDIO_DEVICE, deviceId);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  const leave = useCallback(async () => {
    if (!shiftId) return;
    endedLocallyRef.current = true;
    try {
      await VirtualCallService.leaveSession(shiftId);
    } catch {
      /* best-effort — disconnect locally regardless */
    }
    teardownRoom();
    setState("ended");
  }, [shiftId, teardownRoom]);

  const end = useCallback(async () => {
    if (!shiftId) return;
    try {
      await VirtualCallService.endSession(shiftId);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't end the consultation.",
      );
      return;
    }
    endedLocallyRef.current = true;
    setConsultation((current) =>
      current
        ? { ...current, status: "ended", ended_at: new Date().toISOString() }
        : current,
    );
    teardownRoom();
    setState("ended");
  }, [shiftId, teardownRoom]);

  return {
    state,
    error,
    cameraOn,
    micOn,
    localVideoAttached,
    remoteJoined,
    consultation,
    present,
    presentName,
    activeVideoId,
    activeAudioId,
    setLocalVideoEl,
    setRemoteVideoEl,
    openPreJoin,
    cancelPreJoin,
    join,
    toggleCamera,
    toggleMic,
    switchDevice,
    leave,
    end,
    reset,
  };
}
