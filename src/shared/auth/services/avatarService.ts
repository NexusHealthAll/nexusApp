import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/shared/auth/store/authStore";

/**
 * The signed-in user's own profile photo — shared by hospital admins and
 * health workers alike, since `avatar_url` lives on the base User model
 * (see `GET /api/v1/auth/me`), not on a role-specific record.
 */
export class AvatarService {
  static async updateAvatar(
    photoBase64: string,
    mimeType: string,
  ): Promise<string> {
    const res = await apiClient.patch<{ avatar_url: string }>(
      "/api/v1/auth/me/avatar",
      { photo_base64: photoBase64, photo_mime_type: mimeType },
    );
    const { avatar_url } = res.data;

    const { accessToken, refreshToken, user, setAuthSession } =
      useAuthStore.getState();
    if (user) {
      setAuthSession({
        accessToken,
        refreshToken,
        user: { ...user, avatar_url },
      });
    }

    return avatar_url;
  }
}
