import apiClient from "@/lib/apiClient";

export type VideoSessionStatus = "pending" | "active" | "ended";

export interface VirtualCallToken {
  url: string;
  token: string;
  roomName: string;
  sessionId: string;
  sessionStatus: VideoSessionStatus;
  expiresAt: string;
}

export interface ConsultParticipant {
  identity: string;
  display_name: string | null;
  participant_role: string;
  connected: boolean;
  joined_at: string | null;
  left_at: string | null;
  is_publisher: boolean;
  clocked_in_at: string | null;
  /** 1 = primary device, 2+ = a "continue on phone" companion device. One
   * person on two devices is two participant rows with the same identity
   * prefix — see identityPersonId() below to group them. */
  device_ordinal: number;
  device_label: string | null;
}

/** `identity` is `u:<uuid>` for the primary device, `u:<uuid>#d2` for a
 * companion — this strips the suffix so callers can group a person's
 * devices into one tile instead of showing each connection separately. */
export function identityPersonId(identity: string): string {
  return identity.split("#")[0] ?? identity;
}

export interface ConsultSession {
  session_id: string;
  shift_id: string | null;
  room_name: string;
  status: VideoSessionStatus;
  started_at: string | null;
  ended_at: string | null;
  ended_reason: string | null;
  live: boolean;
  clock_in_recorded: boolean;
  participants: ConsultParticipant[];
  recording: { enabled: boolean; status: string | null };
}

interface VirtualCallTokenResponse {
  session_id: string;
  url: string;
  token: string;
  room_name: string;
  session_status: VideoSessionStatus;
  expires_at: string;
}

/** Worker GPS sent with a join request so the backend can enforce the 10 km geofence. */
export interface JoinCoords {
  lat: number;
  lng: number;
}

/** "Continue on phone" (nexus-backend/docs/FRONTEND_HANDOFF.md §5): a device
 * already in the call issues a short-lived code, shown as a QR/link for a
 * second device to redeem — both devices stay in the call afterward. */
export interface CallHandoff {
  sessionId: string;
  handoffUrl: string;
  code: string;
  deviceOrdinal: number;
  /** 180s from issue, single-use — all failure modes (unknown/expired/
   * already-redeemed) collapse to the same error, by design. */
  expiresAt: string;
}

interface CreateHandoffResponse {
  session_id: string;
  handoff_url: string;
  code: string;
  device_ordinal: number;
  expires_at: string;
}

export const VirtualCallService = {
  async getCallToken(
    shiftId: string,
    deviceLabel = "hospital virtual shift page",
    coords?: JoinCoords,
  ): Promise<VirtualCallToken> {
    const res = await apiClient.post<VirtualCallTokenResponse>(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/consult/token`,
      {
        mode: "participant",
        device_label: deviceLabel,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      },
    );
    return {
      url: res.data.url,
      token: res.data.token,
      roomName: res.data.room_name,
      sessionId: res.data.session_id,
      sessionStatus: res.data.session_status,
      expiresAt: res.data.expires_at,
    };
  },

  async getSession(shiftId: string): Promise<ConsultSession> {
    const res = await apiClient.get<ConsultSession>(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/consult`,
    );
    return res.data;
  },

  async leaveSession(shiftId: string): Promise<void> {
    await apiClient.post(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/consult/leave`,
    );
  },

  async endSession(shiftId: string): Promise<void> {
    await apiClient.post(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/consult/end`,
      { reason: "Hospital ended consultation" },
    );
  },

  /** Issued from a device already authorized for this shift — does not
   * actually require being connected to the room right now, just a live
   * (not-yet-ended) session. */
  async createHandoff(shiftId: string, deviceLabel?: string): Promise<CallHandoff> {
    const res = await apiClient.post<CreateHandoffResponse>(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/consult/handoff`,
      deviceLabel ? { device_label: deviceLabel } : {},
    );
    return {
      sessionId: res.data.session_id,
      handoffUrl: res.data.handoff_url,
      code: res.data.code,
      deviceOrdinal: res.data.device_ordinal,
      expiresAt: res.data.expires_at,
    };
  },

  /** Unauthenticated by design — the code *is* the credential. Send no
   * Authorization header and never log the code (it comes from the URL
   * fragment, not a query string, for the same reason). Same response shape
   * as getCallToken, so the normal join path works unchanged. */
  async redeemHandoff(code: string): Promise<VirtualCallToken> {
    const res = await apiClient.post<VirtualCallTokenResponse>(
      `/api/v1/consult/handoff/redeem`,
      { code },
      { skipAuth: true },
    );
    return {
      url: res.data.url,
      token: res.data.token,
      roomName: res.data.room_name,
      sessionId: res.data.session_id,
      sessionStatus: res.data.session_status,
      expiresAt: res.data.expires_at,
    };
  },
};
