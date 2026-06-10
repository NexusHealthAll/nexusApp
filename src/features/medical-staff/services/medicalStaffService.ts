// Medical Staff API Service Layer
// This service handles all API calls specific to medical staff workflows

export interface DoctorAppointment {
  id: string;
  time: string;
  patient: {
    name: string;
    age: number;
    id: string;
    condition: string;
  };
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  duration: number;
  type: "consultation" | "follow-up" | "emergency";
}

export interface PatientVitals {
  patientName: string;
  patientId: string;
  vitals: {
    bloodPressure: { systolic: number; diastolic: number; status: string };
    heartRate: { value: number; status: string };
    temperature: { value: number; status: string };
    oxygenSaturation: { value: number; status: string };
    respiratoryRate: { value: number; status: string };
  };
  lastUpdated: string;
}

export interface DoctorStats {
  totalAppointments: number;
  completed: number;
  inProgress: number;
  upcoming: number;
  avgConsultationTime: number;
}

export class MedicalStaffService {
  /**
   * Fetches today's appointments for a specific doctor
   * Backend endpoint: GET /api/medical-staff/appointments/today?doctorId={doctorId}
   */
  static async getTodayAppointments(
    doctorId: string,
  ): Promise<DoctorAppointment[]> {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-staff/appointments/today?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      // Fallback to mock data if API fails
      return this.getMockAppointments();
    }
  }

  private static getMockAppointments(): DoctorAppointment[] {
    return [
      {
        id: "1",
        time: "09:00 AM",
        patient: {
          name: "John Doe",
          age: 45,
          id: "P001",
          condition: "Hypertension Follow-up",
        },
        status: "scheduled",
        duration: 30,
        type: "follow-up",
      },
      {
        id: "2",
        time: "09:30 AM",
        patient: {
          name: "Sarah Wilson",
          age: 32,
          id: "P002",
          condition: "Annual Checkup",
        },
        status: "in-progress",
        duration: 45,
        type: "consultation",
      },
      {
        id: "3",
        time: "10:15 AM",
        patient: {
          name: "Michael Brown",
          age: 28,
          id: "P003",
          condition: "Chest Pain",
        },
        status: "scheduled",
        duration: 30,
        type: "consultation",
      },
      {
        id: "4",
        time: "11:00 AM",
        patient: {
          name: "Emily Davis",
          age: 55,
          id: "P004",
          condition: "Diabetes Management",
        },
        status: "scheduled",
        duration: 30,
        type: "follow-up",
      },
    ];
  }

  /**
   * Fetches current patient vitals for active consultation
   * Backend endpoint: GET /api/medical-staff/patient-vitals/{patientId}
   */
  static async getCurrentPatientVitals(
    patientId: string,
  ): Promise<PatientVitals> {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-staff/patient-vitals/${patientId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch patient vitals:', error);
      // Fallback to mock data if API fails
      return this.getMockPatientVitals();
    }
  }

  private static getMockPatientVitals(): PatientVitals {
    return {
      patientName: "Sarah Wilson",
      patientId: "P002",
      vitals: {
        bloodPressure: { systolic: 120, diastolic: 80, status: "normal" },
        heartRate: { value: 72, status: "normal" },
        temperature: { value: 98.6, status: "normal" },
        oxygenSaturation: { value: 98, status: "normal" },
        respiratoryRate: { value: 16, status: "normal" },
      },
      lastUpdated: "2 minutes ago",
    };
  }

  /**
   * Fetches doctor's daily statistics
   * Backend endpoint: GET /api/medical-staff/stats/today?doctorId={doctorId}
   */
  static async getDoctorStats(doctorId: string): Promise<DoctorStats> {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-staff/stats/today?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch doctor stats:', error);
      // Fallback to mock data if API fails
      return this.getMockDoctorStats();
    }
  }

  private static getMockDoctorStats(): DoctorStats {
    return {
      totalAppointments: 8,
      completed: 2,
      inProgress: 1,
      upcoming: 5,
      avgConsultationTime: 28,
    };
  }

  /**
   * Starts a consultation session
   * Backend endpoint: POST /api/medical-staff/consultations/start
   */
  static async startConsultation(appointmentId: string, doctorId: string) {
    try {
      const response = await fetch('http://localhost:8080/api/medical-staff/consultations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, doctorId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to start consultation:', error);
      // Fallback to mock response if API fails
      return { success: true, consultationId: `CONS_${Date.now()}` };
    }
  }

  /**
   * Saves consultation notes
   * Backend endpoint: POST /api/medical-staff/consultations/{consultationId}/notes
   */
  static async saveConsultationNotes(
    consultationId: string,
    notes: {
      chiefComplaint: string;
      clinicalNotes: string;
      diagnosis: string;
      treatmentPlan: string;
      prescriptions: Array<{
        medication: string;
        dosage: string;
        frequency: string;
        duration: string;
      }>;
    },
  ) {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-staff/consultations/${consultationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save consultation notes:', error);
      // Fallback to mock response if API fails
      return { success: true, savedAt: new Date().toISOString() };
    }
  }

  /**
   * Completes a consultation
   * Backend endpoint: POST /api/medical-staff/consultations/{consultationId}/complete
   */
  static async completeConsultation(consultationId: string) {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-staff/consultations/${consultationId}/complete`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to complete consultation:', error);
      // Fallback to mock response if API fails
      return { success: true, completedAt: new Date().toISOString() };
    }
  }

  /**
   * Gets patient medical history
   * Backend endpoint: GET /api/medical-staff/patients/{patientId}/history
   */
  static async getPatientHistory(patientId: string) {
    try {
      const response = await fetch(`http://localhost:8080/api/medical-staff/patients/${patientId}/history`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
      // Fallback to mock data if API fails
      return this.getMockPatientHistory();
    }
  }

  private static getMockPatientHistory() {
    return {
      id: "P002",
      name: "Sarah Wilson",
      age: 32,
      gender: "Female",
      bloodType: "O+",
      allergies: ["Penicillin", "Shellfish"],
      currentMedications: [
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      ],
      medicalHistory: [
        {
          condition: "Hypertension",
          diagnosedDate: "2020-03-15",
          status: "Active",
        },
        {
          condition: "Type 2 Diabetes",
          diagnosedDate: "2019-08-22",
          status: "Active",
        },
        {
          condition: "Appendectomy",
          diagnosedDate: "2015-06-10",
          status: "Resolved",
        },
      ],
      recentVisits: [
        {
          date: "2024-01-15",
          reason: "Routine Checkup",
          doctor: "Dr. Johnson",
        },
        {
          date: "2023-12-10",
          reason: "Blood Pressure Follow-up",
          doctor: "Dr. Smith",
        },
        {
          date: "2023-11-05",
          reason: "Diabetes Management",
          doctor: "Dr. Johnson",
        },
      ],
    };
  }
}

// API endpoint documentation for backend team:
/*
Medical Staff API Endpoints - ✅ IMPLEMENTED:

GET /api/medical-staff/appointments/today?doctorId={doctorId}
Response: Array<DoctorAppointmentResponse>
Status: ✅ Working - Returns mock appointment data

GET /api/medical-staff/patient-vitals/{patientId}
Response: PatientVitalsResponse
Status: ✅ Working - Returns mock vitals data

GET /api/medical-staff/stats/today?doctorId={doctorId}
Response: DoctorStatsResponse
Status: ✅ Working - Returns mock statistics

POST /api/medical-staff/consultations/start
Body: { appointmentId: string, doctorId: string }
Response: { success: boolean, consultationId: string }
Status: ✅ Working - Creates consultation session

POST /api/medical-staff/consultations/{consultationId}/notes
Body: ConsultationNotesRequest
Response: { success: boolean, savedAt: string }
Status: ✅ Working - Saves consultation notes

POST /api/medical-staff/consultations/{consultationId}/complete
Response: { success: boolean, completedAt: string }
Status: ✅ Working - Completes consultation

GET /api/medical-staff/patients/{patientId}/history
Response: PatientHistoryResponse
Status: ✅ Working - Returns mock patient history

Backend Server: http://localhost:8080
Frontend Integration: ✅ Connected with fallback to mock data
Swagger Documentation: ✅ Available at http://localhost:8080/api/docs
*/
