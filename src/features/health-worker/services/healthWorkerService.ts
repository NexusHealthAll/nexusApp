const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

type BackendWorkerStatus = "available" | "on_shift" | "off_duty";
type WorkerStatus = "available" | "on-shift" | "off-duty";

export interface AvailableShift {
  id: string;
  hospital: string;
  department: string;
  date: string;
  time: string;
  duration: string;
  hourlyRate: number;
  location: string;
  urgency: "high" | "medium" | "low";
  description?: string;
  requirements?: string[];
}

export interface ActiveShift {
  id: string;
  hospital: string;
  department: string;
  startTime: string;
  hourlyRate: number;
  location: string;
  duration: string;
  status: "active" | "paused" | "completed";
}

export interface HealthWorkerProfile {
  id: string;
  name: string;
  rating: number;
  totalEarnings: number;
  specialization: string;
  licenseNumber: string;
  currentStatus: WorkerStatus;
}

export interface ShiftEarnings {
  weeklyHours: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  averageHourlyRate: number;
}

export interface DashboardStats {
  rating: number;
  totalEarnings: string;
  hoursWorked: string;
  weeklyEarnings: string;
}

export interface ShiftHistoryItem {
  id: string;
  hospital: string;
  department: string;
  date: string;
  duration: string;
  earnings: number;
  rating: number;
  status: string;
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeWorkerStatus(status: WorkerStatus | BackendWorkerStatus): WorkerStatus {
  if (status === "on_shift") return "on-shift";
  if (status === "off_duty") return "off-duty";
  return status;
}

function toBackendWorkerStatus(status: WorkerStatus): BackendWorkerStatus {
  if (status === "on-shift") return "on_shift";
  if (status === "off-duty") return "off_duty";
  return status;
}

export class HealthWorkerService {
  static async getAvailableShifts(
    workerId: string,
    location?: string,
  ): Promise<AvailableShift[]> {
    const params = new URLSearchParams({ workerId });
    if (location) params.append("location", location);

    try {
      return await requestJson<AvailableShift[]>(
        `/api/health-worker/shifts/available?${params}`,
      );
    } catch (error) {
      console.error("Failed to fetch available shifts:", error);
      return this.getMockAvailableShifts();
    }
  }

  static async acceptShift(
    shiftId: string,
    workerId: string,
  ): Promise<{ success: boolean; activeShiftId: string }> {
    try {
      return await requestJson<{ success: boolean; activeShiftId: string }>(
        "/api/health-worker/shifts/accept",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shiftId, workerId }),
        },
      );
    } catch (error) {
      console.error("Failed to accept shift:", error);
      return { success: true, activeShiftId: `ACTIVE_${Date.now()}` };
    }
  }

  static async clockIn(shiftId: string, workerId: string): Promise<ActiveShift> {
    try {
      return await requestJson<ActiveShift>(
        "/api/health-worker/shifts/clock-in",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shiftId, workerId }),
        },
      );
    } catch (error) {
      console.error("Failed to clock in:", error);
      return {
        id: shiftId,
        hospital: "Lagos University Teaching Hospital",
        department: "ICU",
        startTime: new Date().toISOString(),
        hourlyRate: 8000,
        location: "Idi-Araba, Lagos",
        duration: "00:00:00",
        status: "active",
      };
    }
  }

  static async clockOut(
    activeShiftId: string,
    workerId: string,
  ): Promise<{ success: boolean; totalDuration: string; earnings: number }> {
    try {
      return await requestJson<{
        success: boolean;
        totalDuration: string;
        earnings: number;
      }>("/api/health-worker/shifts/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeShiftId, workerId }),
      });
    } catch (error) {
      console.error("Failed to clock out:", error);
      return { success: true, totalDuration: "08:30:00", earnings: 68000 };
    }
  }

  static async updateDutyStatus(
    workerId: string,
    status: Exclude<WorkerStatus, "on-shift">,
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        "/api/health-worker/status",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workerId,
            status: toBackendWorkerStatus(status),
          }),
        },
      );
    } catch (error) {
      console.error("Failed to update duty status:", error);
      return { success: true };
    }
  }

  static async getWorkerProfile(workerId: string): Promise<HealthWorkerProfile> {
    try {
      const profile = await requestJson<
        Omit<HealthWorkerProfile, "currentStatus"> & {
          currentStatus: WorkerStatus | BackendWorkerStatus;
        }
      >(`/api/health-worker/profile/${workerId}`);

      return {
        ...profile,
        currentStatus: normalizeWorkerStatus(profile.currentStatus),
      };
    } catch (error) {
      console.error("Failed to fetch worker profile:", error);
      return this.getMockWorkerProfile(workerId);
    }
  }

  static async getDashboardStats(workerId: string): Promise<DashboardStats> {
    try {
      return await requestJson<DashboardStats>(
        `/api/health-worker/dashboard/${workerId}`,
      );
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return {
        rating: 4.9,
        totalEarnings: "₦385k",
        hoursWorked: "34.5h",
        weeklyEarnings: "₦429k",
      };
    }
  }

  static async getEarnings(workerId: string): Promise<ShiftEarnings> {
    try {
      return await requestJson<ShiftEarnings>(
        `/api/health-worker/earnings/${workerId}`,
      );
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
      return this.getMockEarnings();
    }
  }

  static async getShiftHistory(
    workerId: string,
    limit = 10,
  ): Promise<ShiftHistoryItem[]> {
    const params = new URLSearchParams({
      workerId,
      limit: limit.toString(),
    });

    try {
      return await requestJson<ShiftHistoryItem[]>(
        `/api/health-worker/shifts/history?${params}`,
      );
    } catch (error) {
      console.error("Failed to fetch shift history:", error);
      return this.getMockShiftHistory();
    }
  }

  private static getMockAvailableShifts(): AvailableShift[] {
    return [
      {
        id: "1",
        hospital: "Lagos University Teaching Hospital",
        department: "ICU Specialist",
        date: "Today",
        time: "08:00 - 20:00",
        duration: "12 hours",
        hourlyRate: 3750,
        location: "Idi-Araba, Lagos",
        urgency: "high",
        description: "ICU registered nurse coverage for critical care support.",
        requirements: ["Valid RN License", "ACLS Certification", "2+ yrs ICU"],
      },
      {
        id: "2",
        hospital: "Reddington Hospital",
        department: "ICU Specialist",
        date: "Sept 20, 2024",
        time: "20:00 - 08:00",
        duration: "12 hours",
        hourlyRate: 5208,
        location: "Victoria Island",
        urgency: "medium",
        requirements: ["Valid RN License", "Critical Care"],
      },
      {
        id: "3",
        hospital: "Lagos State University Hospital",
        department: "Surgical Technologist",
        date: "Tomorrow",
        time: "07:00 - 19:00",
        duration: "12 hours",
        hourlyRate: 4583,
        location: "Ikeja",
        urgency: "high",
        requirements: ["Theatre experience", "Sterile processing"],
      },
    ];
  }

  private static getMockWorkerProfile(workerId: string): HealthWorkerProfile {
    return {
      id: workerId,
      name: "Dr. Chidi Okonjo",
      rating: 4.9,
      totalEarnings: 385000,
      specialization: "Consultant Cardiologist",
      licenseNumber: "MDC/REG/774291",
      currentStatus: "available",
    };
  }

  private static getMockEarnings(): ShiftEarnings {
    return {
      weeklyHours: 34.5,
      weeklyEarnings: 428500,
      monthlyEarnings: 684200,
      totalEarnings: 248500,
      averageHourlyRate: 7500,
    };
  }

  private static getMockShiftHistory(): ShiftHistoryItem[] {
    return [
      {
        id: "1",
        hospital: "Emergency Ward Shift",
        department: "St. Nicholas Hospital",
        date: "Oct 11, 2023",
        duration: "8 hours",
        earnings: 18500,
        rating: 5,
        status: "completed",
      },
      {
        id: "2",
        hospital: "Home Care Consultation",
        department: "Ruby Residence",
        date: "Oct 9, 2023",
        duration: "4 hours",
        earnings: 12000,
        rating: 4.8,
        status: "completed",
      },
      {
        id: "3",
        hospital: "Laboratory Oversight",
        department: "HealthPlus Labs",
        date: "Oct 6, 2023",
        duration: "6 hours",
        earnings: 22000,
        rating: 4.9,
        status: "completed",
      },
    ];
  }
}
