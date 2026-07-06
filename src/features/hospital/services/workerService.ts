export type WorkerStatus = "available" | "on_shift" | "off_duty";

export interface WorkerRecord {
  id: string;
  name: string;
  roleTitle: string;
  specialty: string;
  distanceKm: number;
  languages: string[];
  rating: number;
  shiftsDone: number;
  joined: string;
  totalEarned: string;
  status: WorkerStatus;
}

export interface WorkerPoolStats {
  totalInPool: number;
  availableNow: number;
  availableNowTrendDelta?: number;
  onShift: number;
  avgRating: number;
  avgRatingTrendDelta?: number;
}

/**
 * Workforce pool data for the Dashboard preview and the full Workers page.
 *
 * There is currently no backend endpoint that returns a hospital-scoped
 * workforce pool (nearby clinicians + their status/rating/distance for a
 * specific hospital). The only clinician-listing route in nexus-backend is
 * `GET /api/v1/admin/clinicians` — a platform-wide admin roster with no
 * hospital scoping or distance/status fields, so it isn't a fit here.
 *
 * Rather than fabricate rows, this returns real empty results until a
 * matching endpoint exists — see the documentation block below for the
 * shape this service should call once it's built.
 */
export class WorkerService {
  static async getWorkers(): Promise<WorkerRecord[]> {
    return [];
  }

  static async getWorkerPoolStats(): Promise<WorkerPoolStats> {
    return {
      totalInPool: 0,
      availableNow: 0,
      onShift: 0,
      avgRating: 0,
    };
  }
}

// API endpoint documentation for backend team:
/*
GET /api/v1/hospitals/:id/workforce?radius_km=5
Response: Array<{
  id: string,
  name: string,
  role_title: string,
  specialty: string,
  distance_km: number,
  languages: string[],
  rating: number,
  shifts_done: number,
  joined_at: string,
  total_earned_kobo: number,
  status: "available" | "on_shift" | "off_duty"
}>

GET /api/v1/hospitals/:id/workforce/stats
Response: {
  total_in_pool: number,
  available_now: number,
  available_now_trend_delta: number,
  on_shift: number,
  avg_rating: number,
  avg_rating_trend_delta: number
}
*/
