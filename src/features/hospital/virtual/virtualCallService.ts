import apiClient from "@/lib/apiClient";

export interface VirtualCallToken {
  url: string;
  token: string;
  roomName: string;
}

interface VirtualCallTokenResponse {
  url: string;
  token: string;
  room_name: string;
}

export const VirtualCallService = {
  /**
   * Mints a LiveKit access token for this shift's call room. Backed by the
   * real `POST /api/v1/shifts/{id}/virtual/call-token` (see nexus-backend
   * `ShiftService::generate_virtual_call_token`). The backend re-checks the
   * ±60 min call window server-side — this call can still 409 even if the
   * button was enabled, e.g. if the window closed while the page was open.
   */
  async getCallToken(shiftId: string): Promise<VirtualCallToken> {
    const res = await apiClient.post<VirtualCallTokenResponse>(
      `/api/v1/shifts/${encodeURIComponent(shiftId)}/virtual/call-token`,
    );
    return {
      url: res.data.url,
      token: res.data.token,
      roomName: res.data.room_name,
    };
  },
};
