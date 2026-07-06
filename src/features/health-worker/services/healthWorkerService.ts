import apiClient from "@/lib/apiClient";

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
  tasks?: string[];
  hospitalRating?: number;
  distanceKm?: number;
  bonus?: number;
  totalPayout?: number;
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
  phone?: string;
  email?: string;
  location?: string;
  memberSince?: string;
  languages?: string[];
  ratingCount?: number;
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
  ratingTrend?: number;
  ratingCount: number;
  shiftsThisMonth: number;
  shiftsThisMonthTrend?: number;
  shiftsCompleted: number;
  totalEarnings: string;
  earningsTrendPct?: number;
  earningsMonthLabel: string;
  hoursWorked: string;
  hoursTrendLabel?: string;
  hoursShiftCount: number;
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

export interface TodaysPatient {
  id: string;
  time: string;
  status: "approved" | "draft";
}

export interface EarningsSeriesPoint {
  month: string;
  amount: number;
}

export interface HoursWorkedPoint {
  week: string;
  hours: number;
}

export interface PaymentHistoryRow {
  shiftId: string;
  hospital: string;
  date: string;
  hours: string;
  rate: number;
  bonus?: number;
  total: number;
  status: "in_progress" | "pending" | "paid";
}

export interface EarningsSummary {
  thisMonth: string;
  thisMonthTrendPct: number;
  totalEarned: string;
  shiftsPaid: number;
  shiftsPending: number;
  avgPerShift: string;
  avgPerShiftTrend: string;
}

export interface PerformanceOverview {
  shiftsCompleted: number;
  onTimeRatePct: number;
  avgRating: number;
  totalEarned: string;
}

export interface HospitalRating {
  hospital: string;
  date: string;
  quote: string;
  rating: number;
}

export interface PatientNote {
  id: string;
  summary: string;
  date: string;
  time: string;
  language?: string;
  status: "approved" | "draft";
  transcript?: { speaker: string; original: string; translated: string }[];
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
      const res = await apiClient.get<AvailableShift[]>(
        `/api/health-worker/shifts/available?${params}`,
      );
      return res.data;
    } catch (error) {
      return this.getMockAvailableShifts();
    }
  }

  static async acceptShift(
    shiftId: string,
    workerId: string,
  ): Promise<{ success: boolean; activeShiftId: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; activeShiftId: string }>(
        "/api/health-worker/shifts/accept",
        { shiftId, workerId },
      );
      return res.data;
    } catch (error) {
      return { success: true, activeShiftId: `ACTIVE_${Date.now()}` };
    }
  }

  static async clockIn(shiftId: string, workerId: string): Promise<ActiveShift> {
    try {
      const res = await apiClient.post<ActiveShift>(
        "/api/health-worker/shifts/clock-in",
        { shiftId, workerId },
      );
      return res.data;
    } catch (error) {
      return {
        id: shiftId,
        hospital: "Lagos University Teaching Hospital",
        department: "Main Emergency Dept.",
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
      const res = await apiClient.post<{
        success: boolean;
        totalDuration: string;
        earnings: number;
      }>("/api/health-worker/shifts/clock-out", { activeShiftId, workerId });
      return res.data;
    } catch (error) {
      return { success: true, totalDuration: "08:05:00", earnings: 69000 };
    }
  }

  static async updateDutyStatus(
    workerId: string,
    status: Exclude<WorkerStatus, "on-shift">,
  ): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.put<{ success: boolean }>(
        "/api/health-worker/status",
        { workerId, status: toBackendWorkerStatus(status) },
      );
      return res.data;
    } catch (error) {
      return { success: true };
    }
  }

  static async getWorkerProfile(workerId: string): Promise<HealthWorkerProfile> {
    try {
      const res = await apiClient.get<
        Omit<HealthWorkerProfile, "currentStatus"> & {
          currentStatus: WorkerStatus | BackendWorkerStatus;
        }
      >(`/api/health-worker/profile/${workerId}`);

      return {
        ...res.data,
        currentStatus: normalizeWorkerStatus(res.data.currentStatus),
      };
    } catch (error) {
      return this.getMockWorkerProfile(workerId);
    }
  }

  static async getDashboardStats(workerId: string): Promise<DashboardStats> {
    try {
      const res = await apiClient.get<DashboardStats>(
        `/api/health-worker/dashboard/${workerId}`,
      );
      return res.data;
    } catch (error) {
      return {
        rating: 4.9,
        ratingTrend: 0.1,
        ratingCount: 45,
        shiftsThisMonth: 8,
        shiftsThisMonthTrend: 3,
        shiftsCompleted: 4,
        totalEarnings: "₦385k",
        earningsTrendPct: 18,
        earningsMonthLabel: "Apr 2026",
        hoursWorked: "72h",
        hoursTrendLabel: "+8h",
        hoursShiftCount: 8,
        weeklyEarnings: "₦429k",
      };
    }
  }

  static async getEarnings(workerId: string): Promise<ShiftEarnings> {
    try {
      const res = await apiClient.get<ShiftEarnings>(
        `/api/health-worker/earnings/${workerId}`,
      );
      return res.data;
    } catch (error) {
      return this.getMockEarnings();
    }
  }

  static async getShiftHistory(
    workerId: string,
    limit = 10,
  ): Promise<ShiftHistoryItem[]> {
    const params = new URLSearchParams({ workerId, limit: limit.toString() });

    try {
      const res = await apiClient.get<ShiftHistoryItem[]>(
        `/api/health-worker/shifts/history?${params}`,
      );
      return res.data;
    } catch (error) {
      return this.getMockShiftHistory();
    }
  }

  static async getTodaysPatients(_workerId: string): Promise<TodaysPatient[]> {
    return [
      { id: "#2341", time: "2:15 PM", status: "approved" },
      { id: "#2342", time: "2:45 PM", status: "approved" },
      { id: "#2343", time: "3:20 PM", status: "draft" },
    ];
  }

  static async getMonthlyEarningsSeries(_workerId: string): Promise<EarningsSeriesPoint[]> {
    return [
      { month: "Nov", amount: 290000 },
      { month: "Dec", amount: 330000 },
      { month: "Jan", amount: 295000 },
      { month: "Feb", amount: 405000 },
      { month: "Mar", amount: 340000 },
      { month: "Apr", amount: 355000 },
    ];
  }

  static async getHoursWorkedSeries(_workerId: string): Promise<HoursWorkedPoint[]> {
    return [
      { week: "W1", hours: 24 },
      { week: "W2", hours: 32 },
      { week: "W3", hours: 16 },
      { week: "W4", hours: 40 },
    ];
  }

  static async getEarningsSummary(_workerId: string): Promise<EarningsSummary> {
    return {
      thisMonth: "₦385,000",
      thisMonthTrendPct: 18,
      totalEarned: "₦1.84M",
      shiftsPaid: 41,
      shiftsPending: 2,
      avgPerShift: "₦44,900",
      avgPerShiftTrend: "+₦3k",
    };
  }

  static async getPaymentHistory(_workerId: string): Promise<PaymentHistoryRow[]> {
    return [
      { shiftId: "SH-001", hospital: "LUTH", date: "Today, Apr 14", hours: "8h", rate: 8000, bonus: 5000, total: 69000, status: "in_progress" },
      { shiftId: "SH-002", hospital: "IGH", date: "Apr 16, 2026", hours: "12h", rate: 7500, total: 90000, status: "pending" },
      { shiftId: "SH-H1", hospital: "GHL", date: "Apr 12, 2026", hours: "12h", rate: 7000, total: 84000, status: "paid" },
      { shiftId: "SH-H2", hospital: "LUTH", date: "Apr 10, 2026", hours: "8h", rate: 8000, bonus: 5000, total: 69000, status: "paid" },
    ];
  }

  static async getPerformanceOverview(_workerId: string): Promise<PerformanceOverview> {
    return {
      shiftsCompleted: 45,
      onTimeRatePct: 98,
      avgRating: 4.9,
      totalEarned: "₦1.84M",
    };
  }

  static async getRecentHospitalRatings(_workerId: string): Promise<HospitalRating[]> {
    return [
      { hospital: "LUTH", date: "Apr 12, 2026", quote: "Excellent doctor, very professional and thorough with patients.", rating: 5 },
      { hospital: "GHL", date: "Apr 10, 2026", quote: "Arrived early, great with patients, would hire again.", rating: 5 },
      { hospital: "IGH", date: "Mar 28, 2026", quote: "Good work overall, punctual and knowledgeable.", rating: 4 },
    ];
  }

  static async getPatientNotes(_workerId: string): Promise<PatientNote[]> {
    return [
      {
        id: "#2341",
        summary: "Fever and cough for three days",
        date: "Apr 14, 2026",
        time: "2:15 PM",
        language: "Hausa → English",
        status: "approved",
        transcript: [
          { speaker: "Patient", original: "Ina jin zazzabi na kwana uku", translated: "I have had fever for three days" },
          { speaker: "Doctor", original: "Zan duba zafin jikin ku", translated: "I will check your temperature now" },
        ],
      },
      { id: "#2342", summary: "Hypertension follow-up, BP 160/100", date: "Apr 14, 2026", time: "2:45 PM", language: "English", status: "approved" },
      { id: "#2343", summary: "Malaria symptoms, high fever", date: "Apr 14, 2026", time: "3:20 PM", language: "Yoruba → English", status: "draft" },
      { id: "#2344", summary: "Road traffic accident, leg fracture", date: "Apr 12, 2026", time: "10:05 AM", language: "English", status: "approved" },
      { id: "#2345", summary: "Chest pain, shortness of breath", date: "Apr 12, 2026", time: "11:30 AM", language: "Igbo → English", status: "approved" },
    ];
  }

  private static getMockAvailableShifts(): AvailableShift[] {
    return [
      {
        id: "SH-003",
        hospital: "Lagos University Teaching Hospital",
        department: "Emergency Doctor",
        date: "Today, Apr 14",
        time: "2:00 PM–10:00 PM",
        duration: "8 hours",
        hourlyRate: 8000,
        location: "Idi-Araba, Surulere, Lagos",
        urgency: "high",
        description: "Emergency department coverage with continuous monitoring and treatment support.",
        requirements: ["2+ years emergency experience", "ACLS certified", "Valid medical license"],
      },
      {
        id: "SH-004",
        hospital: "General Hospital Lagos",
        department: "GP Consultation",
        date: "Tomorrow, Apr 15",
        time: "8:00 AM–4:00 PM",
        duration: "8 hours",
        hourlyRate: 5500,
        location: "Lagos Island",
        urgency: "medium",
        requirements: ["Valid medical license", "General practice experience"],
      },
      {
        id: "SH-005",
        hospital: "Teleclinic NG",
        department: "Virtual GP",
        date: "Today, Apr 14",
        time: "6:00 PM–9:00 PM",
        duration: "3 hours",
        hourlyRate: 6000,
        location: "Remote",
        urgency: "low",
        requirements: ["Stable internet connection", "Valid medical license"],
      },
      {
        id: "SH-006",
        hospital: "Island General Hospital",
        department: "Emergency Doctor",
        date: "Apr 16",
        time: "7:00 AM–7:00 PM",
        duration: "12 hours",
        hourlyRate: 7500,
        location: "Victoria Island",
        urgency: "low",
        requirements: ["Valid medical license"],
      },
    ];
  }

  private static getMockWorkerProfile(workerId: string): HealthWorkerProfile {
    return {
      id: workerId,
      name: "Dr. Abiola Oluwaseun",
      rating: 4.9,
      ratingCount: 45,
      totalEarnings: 1840000,
      specialization: "Emergency Medicine",
      licenseNumber: "MDC/NGR/2024/12345",
      currentStatus: "available",
      phone: "+234 801 234 5678",
      email: "abiola@nexuscare.ng",
      location: "Surulere, Lagos",
      memberSince: "January 2025",
      languages: ["English", "Hausa", "Yoruba"],
    };
  }

  private static getMockEarnings(): ShiftEarnings {
    return {
      weeklyHours: 32,
      weeklyEarnings: 355000,
      monthlyEarnings: 385000,
      totalEarnings: 1840000,
      averageHourlyRate: 7500,
    };
  }

  private static getMockShiftHistory(): ShiftHistoryItem[] {
    return [
      {
        id: "SH-001",
        hospital: "Lagos University Teaching Hospital",
        department: "Emergency Doctor",
        date: "Today, Apr 14",
        duration: "8h",
        earnings: 69000,
        rating: 0,
        status: "in_progress",
      },
      {
        id: "SH-002",
        hospital: "Island General Hospital",
        department: "Emergency Doctor",
        date: "Apr 16, 2026",
        duration: "12h",
        earnings: 90000,
        rating: 0,
        status: "upcoming",
      },
      {
        id: "SH-H1",
        hospital: "General Hospital Lagos",
        department: "Emergency Doctor",
        date: "Apr 12, 2026",
        duration: "12h",
        earnings: 84000,
        rating: 4.9,
        status: "completed",
      },
      {
        id: "SH-H2",
        hospital: "Lagos University Teaching Hospital",
        department: "Emergency Doctor",
        date: "Apr 10, 2026",
        duration: "8h",
        earnings: 69000,
        rating: 5,
        status: "completed",
      },
    ];
  }
}
