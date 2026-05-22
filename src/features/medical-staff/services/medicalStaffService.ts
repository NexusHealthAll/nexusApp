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
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
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
  static async getTodayAppointments(doctorId: string): Promise<DoctorAppointment[]> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/medical-staff/appointments/today?doctorId=${doctorId}`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            time: '09:00 AM',
            patient: {
              name: 'John Doe',
              age: 45,
              id: 'P001',
              condition: 'Hypertension Follow-up'
            },
            status: 'scheduled',
            duration: 30,
            type: 'follow-up'
          },
          {
            id: '2',
            time: '09:30 AM',
            patient: {
              name: 'Sarah Wilson',
              age: 32,
              id: 'P002',
              condition: 'Annual Checkup'
            },
            status: 'in-progress',
            duration: 45,
            type: 'consultation'
          },
          {
            id: '3',
            time: '10:15 AM',
            patient: {
              name: 'Michael Brown',
              age: 28,
              id: 'P003',
              condition: 'Chest Pain'
            },
            status: 'scheduled',
            duration: 30,
            type: 'consultation'
          },
          {
            id: '4',
            time: '11:00 AM',
            patient: {
              name: 'Emily Davis',
              age: 55,
              id: 'P004',
              condition: 'Diabetes Management'
            },
            status: 'scheduled',
            duration: 30,
            type: 'follow-up'
          }
        ]);
      }, 300);
    });
  }

  /**
   * Fetches current patient vitals for active consultation
   * Backend endpoint: GET /api/medical-staff/patient-vitals/{patientId}
   */
  static async getCurrentPatientVitals(patientId: string): Promise<PatientVitals> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/medical-staff/patient-vitals/${patientId}`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          patientName: 'Sarah Wilson',
          patientId: 'P002',
          vitals: {
            bloodPressure: { systolic: 120, diastolic: 80, status: 'normal' },
            heartRate: { value: 72, status: 'normal' },
            temperature: { value: 98.6, status: 'normal' },
            oxygenSaturation: { value: 98, status: 'normal' },
            respiratoryRate: { value: 16, status: 'normal' }
          },
          lastUpdated: '2 minutes ago'
        });
      }, 200);
    });
  }

  /**
   * Fetches doctor's daily statistics
   * Backend endpoint: GET /api/medical-staff/stats/today?doctorId={doctorId}
   */
  static async getDoctorStats(doctorId: string): Promise<DoctorStats> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/medical-staff/stats/today?doctorId=${doctorId}`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalAppointments: 8,
          completed: 2,
          inProgress: 1,
          upcoming: 5,
          avgConsultationTime: 28
        });
      }, 250);
    });
  }

  /**
   * Starts a consultation session
   * Backend endpoint: POST /api/medical-staff/consultations/start
   */
  static async startConsultation(appointmentId: string, doctorId: string) {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/medical-staff/consultations/start', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ appointmentId, doctorId })
    // });
    // return response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, consultationId: `CONS_${Date.now()}` });
      }, 500);
    });
  }

  /**
   * Saves consultation notes
   * Backend endpoint: POST /api/medical-staff/consultations/{consultationId}/notes
   */
  static async saveConsultationNotes(consultationId: string, notes: {
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
  }) {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/medical-staff/consultations/${consultationId}/notes`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(notes)
    // });
    // return response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, savedAt: new Date().toISOString() });
      }, 400);
    });
  }

  /**
   * Completes a consultation
   * Backend endpoint: POST /api/medical-staff/consultations/{consultationId}/complete
   */
  static async completeConsultation(consultationId: string) {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/medical-staff/consultations/${consultationId}/complete`, {
    //   method: 'POST'
    // });
    // return response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, completedAt: new Date().toISOString() });
      }, 300);
    });
  }

  /**
   * Gets patient medical history
   * Backend endpoint: GET /api/medical-staff/patients/{patientId}/history
   */
  static async getPatientHistory(patientId: string) {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/medical-staff/patients/${patientId}/history`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'P002',
          name: 'Sarah Wilson',
          age: 32,
          gender: 'Female',
          bloodType: 'O+',
          allergies: ['Penicillin', 'Shellfish'],
          currentMedications: [
            { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
          ],
          medicalHistory: [
            { condition: 'Hypertension', diagnosedDate: '2020-03-15', status: 'Active' },
            { condition: 'Type 2 Diabetes', diagnosedDate: '2019-08-22', status: 'Active' },
            { condition: 'Appendectomy', diagnosedDate: '2015-06-10', status: 'Resolved' }
          ],
          recentVisits: [
            { date: '2024-01-15', reason: 'Routine Checkup', doctor: 'Dr. Johnson' },
            { date: '2023-12-10', reason: 'Blood Pressure Follow-up', doctor: 'Dr. Smith' },
            { date: '2023-11-05', reason: 'Diabetes Management', doctor: 'Dr. Johnson' }
          ]
        });
      }, 350);
    });
  }
}

// API endpoint documentation for backend team:
/*
Medical Staff API Endpoints:

GET /api/medical-staff/appointments/today?doctorId={doctorId}
Response: Array<DoctorAppointment>

GET /api/medical-staff/patient-vitals/{patientId}
Response: PatientVitals

GET /api/medical-staff/stats/today?doctorId={doctorId}
Response: DoctorStats

POST /api/medical-staff/consultations/start
Body: { appointmentId: string, doctorId: string }
Response: { success: boolean, consultationId: string }

POST /api/medical-staff/consultations/{consultationId}/notes
Body: ConsultationNotes
Response: { success: boolean, savedAt: string }

POST /api/medical-staff/consultations/{consultationId}/complete
Response: { success: boolean, completedAt: string }

GET /api/medical-staff/patients/{patientId}/history
Response: PatientHistory
*/