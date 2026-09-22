import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { ApiError } from "@/lib/apiError";
import {
  VirtualCallService,
  type ConsultSession,
  type JoinCoords,
} from "./virtualCallService";
import {
  LS_AUDIO_DEVICE,
  LS_VIDEO_DEVICE,
  writeStoredDevice,
} from "./mediaDevices";
import type { JoinOptions } from "./components/PreJoinScreen";

/** A clinician must be within this many km of the hospital to join (F6). */
export const CONSULT_GEOFENCE_KM = 10;

export interface HospitalCoords {
  latitude: number | null;
  longitude: number | null;
}

/** Great-circle distance between two lat/lng points, in km. */
function distanceKm(a: JoinCoords, b: JoinCoords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** A user-facing message for a real `GeolocationPositionError` code. Only
 * `PERMISSION_DENIED` is actually a permission problem — `POSITION_UNAVAILABLE`
 * and `TIMEOUT` are common on devices with no GPS chip (most desktops) and
 * were previously all reported as "enable location", which sent people to the
 * wrong browser setting. */
function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location access is required to join this consultation. Enable location for this site in your browser, then try again.";
    case err.TIMEOUT:
      return "Couldn't get your location in time. Check your device's location settings and try again.";
    case err.POSITION_UNAVAILABLE:
    default:
      return "Couldn't determine your location. Check your device's location settings and try again.";
  }
}

function getPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options),
  );
}

/** Promisified `getCurrentPosition`, rejecting with a user-facing message.
 *
 * High-accuracy (GPS) positioning can time out or report
 * `POSITION_UNAVAILABLE` on hardware with no GPS chip — most laptops/desktops
 * — well before a permission problem is the cause. Mirrors the fallback
 * `useHealthWorkerShifts.getNearbyShifts` already uses: try high accuracy
 * with a short timeout, then retry once with network/IP-based positioning
 * before giving up.
 */
async function getCurrentPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    throw new Error(
      "This device can't share its location, which is required to join.",
    );
  }
  try {
    return await getPosition({
      enableHighAccuracy: true,
      timeout: 8_000,
      maximumAge: 60_000,
    });
  } catch {
    try {
      return await getPosition({
        enableHighAccuracy: false,
        timeout: 8_000,
        maximumAge: 300_000,
      });
    } catch (err) {
      throw new Error(
        err instanceof GeolocationPositionError
          ? geolocationErrorMessage(err)
          : "Couldn't determine your location. Check your device's location settings and try again.",
      );
    }
  }
}

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
  isMuted?: boolean;
}

/** The subset of `Participant` needed to tell a `TrackMuted`/`TrackUnmuted`
 * event's local participant apart from the remote one. */
interface LiveKitEventParticipant {
  isLocal?: boolean;
}

interface LiveKitParticipant {
  setCameraEnabled: (enabled: boolean) => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  getTrackPublication: (source: string) => LiveKitPublication | undefined;
}

interface LiveKitRemoteParticipant {
  trackPublications: Map<unknown, LiveKitPublication>;
}

interface LiveKitRoom {
  remoteParticipants: Map<unknown, LiveKitRemoteParticipant>;
  localParticipant: LiveKitParticipant;
  /** False when the browser is blocking autoplay of remote audio. */
  canPlaybackAudio: boolean;
  /** Must be called from a user gesture to resume blocked audio playback. */
  startAudio: () => Promise<void>;
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
  /** True when the browser is blocking remote audio; show a tap-to-enable control. */
  audioBlocked: boolean;
  /** True once a local camera <video> is mounted in the self-view tile. */
  localVideoAttached: boolean;
  /** True once a remote participant has joined the room. */
  remoteJoined: boolean;
  /** The remote participant's microphone state. Unknown reads as `true`
   * (unmuted) so no badge flashes before the first signal arrives. */
  remoteMicOn: boolean;
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
  /** Resume remote audio playback after the browser blocked it (call from a click). */
  resumeAudio: () => Promise<void>;
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

// Remote audio: attach to the hidden host and force playback. `track.attach()`
// gives an <audio autoplay> element, but if the track is subscribed seconds
// after the join click (outside the user-gesture window) the browser can
// silently refuse to start it — so call play() explicitly and let the room's
// AudioPlaybackStatusChanged handler surface a retry if it's still blocked.
function attachRemoteAudio(track: LiveKitTrack, host: HTMLDivElement) {
  const el = track.attach() as HTMLAudioElement;
  el.autoplay = true;
  el.setAttribute("playsinline", "");
  el.dataset.virtualCallAudioEl = "true";
  host.appendChild(el);
  const played = el.play?.();
  if (played && typeof played.catch === "function") played.catch(() => {});
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
/**
 * Which side of the consult this hook is running for. Drives green-room
 * presence: each side only counts the *other* party as "present", so the
 * hospital never sees "the clinician is on the call" just because its own
 * (or a stale) participant row is in the session.
 */
export type VirtualCallViewer = "hospital" | "worker";

/** `video_session_participants.participant_role` for the opposite side. */
const COUNTERPART_ROLE: Record<VirtualCallViewer, string> = {
  hospital: "clinician",
  worker: "hospital_observer",
};

export function useVirtualCallRoom(
  shiftId: string | undefined,
  deviceLabel: string,
  viewerRole: VirtualCallViewer = "hospital",
  /**
   * The shift's hospital coordinates, used for the client-side geofence
   * pre-check on the worker side (F6). The backend stays the source of truth.
   */
  hospitalLocation?: HospitalCoords | null,
): VirtualCallRoom {
  const [state, setState] = useState<VirtualCallState>("idle");
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  /** True when the browser is blocking remote audio and needs a tap to resume. */
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [localVideoAttached, setLocalVideoAttached] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  /** Unknown/not-yet-signaled reads as unmuted, so no badge flashes before
   * the first mute-state signal arrives. */
  const [remoteMicOn, setRemoteMicOn] = useState(true);
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
    // Visually hidden but still *rendered* — some browsers won't start media
    // playback for elements inside a `display:none` subtree.
    host.style.cssText =
      "position:fixed;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;";
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
          // Only the *other* side counts as "present" — never our own row or a
          // stale participant left over from an earlier connection.
          const counterpart = session.participants.find(
            (p) =>
              p.connected &&
              p.participant_role === COUNTERPART_ROLE[viewerRole],
          );
          setPresent(Boolean(counterpart));
          setPresentName(counterpart?.display_name ?? null);
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
  }, [state, shiftId, viewerRole]);

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

  const hospitalLat = hospitalLocation?.latitude ?? null;
  const hospitalLng = hospitalLocation?.longitude ?? null;

  const join = useCallback(
    async (opts: JoinOptions) => {
      if (!shiftId) return;
      setError("");
      setState("connecting");
      endedLocallyRef.current = false;
      setActiveVideoId(opts.videoDeviceId);
      setActiveAudioId(opts.audioDeviceId);
      try {
        // F6 — a clinician must send GPS and be within 10 km of the hospital.
        // Hospital observers are exempt (and hospitals with no coords on file).
        let coords: JoinCoords | undefined;
        if (viewerRole === "worker") {
          let position: GeolocationPosition;
          try {
            position = await getCurrentPosition();
          } catch (geoErr) {
            setError(
              geoErr instanceof Error
                ? geoErr.message
                : "Location access is required to join this consultation.",
            );
            setState("error");
            return;
          }
          coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (hospitalLat != null && hospitalLng != null) {
            const km = distanceKm(coords, {
              lat: hospitalLat,
              lng: hospitalLng,
            });
            if (km > CONSULT_GEOFENCE_KM) {
              setError(
                `You are ${km.toFixed(1)} km from the hospital — you must be within ${CONSULT_GEOFENCE_KM} km to join.`,
              );
              setState("error");
              return;
            }
          }
        }

        const { url, token } = await VirtualCallService.getCallToken(
          shiftId,
          deviceLabel,
          coords,
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
            attachRemoteAudio(track, audioHostRef.current);
          }
        });
        room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
          setAudioBlocked(!room.canPlaybackAudio);
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
          if (room.remoteParticipants.size === 0) {
            setRemoteJoined(false);
            // Stale mute state must not survive them leaving and rejoining.
            setRemoteMicOn(true);
          }
        });
        room.on(
          RoomEvent.TrackMuted,
          (pub: LiveKitPublication, participant?: LiveKitEventParticipant) => {
            if (pub.kind === Track.Kind.Audio && !participant?.isLocal) {
              setRemoteMicOn(false);
            }
          },
        );
        room.on(
          RoomEvent.TrackUnmuted,
          (pub: LiveKitPublication, participant?: LiveKitEventParticipant) => {
            if (pub.kind === Track.Kind.Audio && !participant?.isLocal) {
              setRemoteMicOn(true);
            }
          },
        );
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
          setRemoteMicOn(true);
        });

        await room.connect(url, token);
        setRemoteJoined(room.remoteParticipants.size > 0);

        // Attach audio for anyone who was already publishing before we joined —
        // `TrackSubscribed` is not guaranteed to re-fire for pre-existing
        // tracks in every livekit-client version. Their current mute state
        // needs the same catch-up: `TrackMuted`/`TrackUnmuted` only fire on a
        // change from here on, not for state that predates our join.
        for (const participant of room.remoteParticipants.values()) {
          for (const pub of participant.trackPublications.values()) {
            if (pub.kind !== Track.Kind.Audio) continue;
            setRemoteMicOn(!pub.isMuted);
            if (pub.track && audioHostRef.current) {
              attachRemoteAudio(pub.track, audioHostRef.current);
            }
          }
        }
        // Resume playback while we're still inside the join click's gesture.
        try {
          await room.startAudio();
        } catch {
          /* startAudio only works from a gesture; retried via resumeAudio() */
        }
        setAudioBlocked(!room.canPlaybackAudio);

        try {
          await room.localParticipant.setCameraEnabled(opts.camEnabled);
          setCameraOn(opts.camEnabled);
        } catch {
          setCameraOn(false);
        }
        try {
          await room.localParticipant.setMicrophoneEnabled(opts.micEnabled);
          setMicOn(opts.micEnabled);
        } catch (micErr) {
          // A stale remembered audio device id makes the constrained capture
          // throw — retry once with no device constraint before giving up.
          console.warn("mic enable failed, retrying without device", micErr);
          try {
            await room.localParticipant.setMicrophoneEnabled(true);
            setMicOn(true);
          } catch {
            setMicOn(false);
          }
        }

        VirtualCallService.getSession(shiftId)
          .then(setConsultation)
          .catch(() => {});
        setState("connected");
      } catch (err) {
        console.error("[virtual-call] join failed", err);
        const detail = err instanceof Error && err.message ? err.message : "";
        setError(
          err instanceof ApiError
            ? err.message
            : `Couldn't connect to the call${detail ? ` (${detail})` : ""} — check your connection and try again.`,
        );
        setState("error");
        teardownRoom();
      }
    },
    [shiftId, deviceLabel, teardownRoom, viewerRole, hospitalLat, hospitalLng],
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
    // This runs from a click — a good moment to also clear any blocked audio.
    room.startAudio().then(
      () => setAudioBlocked(!room.canPlaybackAudio),
      () => {},
    );
    const next = !micOn;
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch {
      setMicOn(false);
    }
  }, [micOn]);

  /** Re-trigger blocked remote-audio playback; call from a click. */
  const resumeAudio = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.startAudio();
      setAudioBlocked(!room.canPlaybackAudio);
    } catch {
      /* still blocked — button stays visible */
    }
  }, []);

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
    audioBlocked,
    localVideoAttached,
    remoteJoined,
    remoteMicOn,
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
    resumeAudio,
    switchDevice,
    leave,
    end,
    reset,
  };
}
