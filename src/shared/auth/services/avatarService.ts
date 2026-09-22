import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/shared/auth/store/authStore";
import { getWorkerVerificationState } from "@/shared/auth/services/workerVerificationService";
import { uploadImage } from "@/shared/services/mediaUpload";

/**
 * The signed-in health worker's own profile photo — shared with hospital
 * admins conceptually (`avatar_url` lives on the base User model, see
 * `GET /api/v1/auth/me`), but there is no generic `PATCH /auth/me/avatar`
 * endpoint on the backend — that route was never implemented, so every call
 * through it 404'd despite this service looking complete.
 *
 * The real, working endpoint is clinician-scoped:
 * `PATCH /api/v1/clinicians/{clinician_id}/avatar` (`avatar_url: string`,
 * see nexus-backend `clinician_registration::set_avatar`), which updates
 * `users.avatar_url` via the clinician → user join, so `GET /auth/me`
 * reflects it immediately. The photo itself goes through the same signed
 * Cloudinary upload pipeline already used for handover/shift images.
 */
export class AvatarService {
  static async updateAvatar(file: File): Promise<string> {
    const state = await getWorkerVerificationState();
    const clinicianId = state?.clinicianId;
    if (!clinicianId) {
      throw new Error("We couldn't find your clinician account for this session.");
    }

    const avatarUrl = await uploadImage(file, "worker_avatar");

    await apiClient.patch(
      `/api/v1/clinicians/${encodeURIComponent(clinicianId)}/avatar`,
      { avatar_url: avatarUrl },
    );

    const { accessToken, refreshToken, user, setAuthSession } =
      useAuthStore.getState();
    if (user) {
      setAuthSession({
        accessToken,
        refreshToken,
        user: { ...user, avatar_url: avatarUrl },
      });
    }

    return avatarUrl;
  }
}
