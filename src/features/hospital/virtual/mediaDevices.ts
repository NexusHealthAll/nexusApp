/**
 * Small helpers for remembering the hospital's preferred camera / microphone
 * across virtual-visit sessions. Storage access is wrapped because it throws
 * in private-mode / storage-disabled browsers.
 */

export const LS_VIDEO_DEVICE = "nexus.virtualCall.videoDeviceId";
export const LS_AUDIO_DEVICE = "nexus.virtualCall.audioDeviceId";

export function readStoredDevice(key: string): string | undefined {
  try {
    return localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeStoredDevice(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — non-fatal */
  }
}
