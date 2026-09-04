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

export const VirtualCallService = {
  async getCallToken(shiftId: string): Promise<VirtualCallToken> {
    const res = await apiClient.post<VirtualCallTokenResponse>(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/consult/token`,
      { mode: "participant", device_label: "hospital virtual shift page" },
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
};
