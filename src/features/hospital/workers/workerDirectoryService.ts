export type WorkerLicenseStatus = "verified" | "pending";

export type WorkerAvailability =
  | { kind: "available_now" }
  | { kind: "on_shift" }
  | { kind: "available_today" }
  | { kind: "available_at"; label: string };

export interface DirectoryWorker {
  id: string;
  name: string;
  /** Professional credential shown after the name, e.g. "RN", "MD", "LT". */
  credential: string;
  role: string;
  yearsExperience: number;
  distanceMi: number;
  rating: number;
  shiftsDone: number;
  license: WorkerLicenseStatus;
  availability: WorkerAvailability;
  nearby: boolean;
  recommended: boolean;
  bio: string;
  acceptanceRatePct: number;
  cancellationRatePct: number;
  certificates: string[];
  languages: string[];
  /** Past shifts with this hospital, newest first. */
  history: { shift: string; date: string }[];
}

export function availabilityDisplay(availability: WorkerAvailability): {
  label: string;
  className: string;
} {
  switch (availability.kind) {
    case "available_now":
      return { label: "Available now", className: "text-success-600" };
    case "on_shift":
      return { label: "On shift", className: "text-primary-600" };
    case "available_today":
      return { label: "Available Today", className: "text-success-600" };
    case "available_at":
      return { label: availability.label, className: "text-success-600" };
  }
}

/**
 * Worker directory data for the Workers page and the dashboard's "Nearby
 * Available Workers" card.
 *
 * There is no backend endpoint yet that returns a hospital-scoped workforce
 * pool — the only clinician listing in nexus-backend is the platform-wide
 * `GET /api/v1/admin/clinicians`, which has no distance/availability/rating
 * fields. Rather than fabricate rows, these return real empty results (the
 * UI shows empty states) until a matching endpoint exists; see the shape
 * documentation below for what it should return.
 */
export const WorkerDirectoryService = {
  async getWorkers(): Promise<DirectoryWorker[]> {
    return [];
  },

  async getNearbyAvailable(_limit = 3): Promise<DirectoryWorker[]> {
    return [];
  },

  /** Headline count for the dashboard "Worker Availability" stat. */
  async getAvailableCount(): Promise<number | null> {
    return null;
  },
};

// API endpoint documentation for the backend team:
/*
GET /api/v1/hospitals/:id/workforce?radius_km=25
Response: Array<{
  id, name, credential, role, years_experience, distance_km,
  rating, shifts_done, license_status: "verified" | "pending",
  availability: { kind, label? }, bio, acceptance_rate_pct,
  cancellation_rate_pct, certificates: string[], languages: string[],
  history: Array<{ shift: string, date: string }>
}>
*/
