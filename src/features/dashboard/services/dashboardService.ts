import { DashboardStats } from '@/types';

// Mock data service - replace with actual API calls
export class DashboardService {
  /**
   * Fetches dashboard statistics
   * Backend endpoint: GET /api/dashboard-stats
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/dashboard-stats');
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalPatients: 2847,
          totalDoctors: 24,
          todayAppointments: 156,
          pendingAppointments: 23,
          completedAppointments: 89,
          cancelledAppointments: 12,
          revenue: {
            today: 9920000,
            thisMonth: 67360000,
            lastMonth: 58480000,
          },
          patientGrowth: {
            thisMonth: 127,
            percentage: 12.3,
          },
        });
      }, 500); // Simulate network delay
    });
  }

  /**
   * Fetches recent appointments for dashboard
   * Backend endpoint: GET /api/appointments/recent?limit=5
   */
  static async getRecentAppointments() {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            patientName: 'John Doe',
            doctorName: 'whiteghost',
            time: '2:30 PM',
            type: 'Consultation',
            status: 'confirmed',
          },
          {
            id: '2',
            patientName: 'Jane Smith',
            doctorName: 'Dr. Michael Chen',
            time: '3:00 PM',
            type: 'Follow-up',
            status: 'in-progress',
          },
          {
            id: '3',
            patientName: 'Robert Wilson',
            doctorName: 'Dr. Emily Rodriguez',
            time: '3:30 PM',
            type: 'Checkup',
            status: 'scheduled',
          },
          {
            id: '4',
            patientName: 'Maria Garcia',
            doctorName: 'whiteghost',
            time: '4:00 PM',
            type: 'Consultation',
            status: 'scheduled',
          },
        ]);
      }, 300);
    });
  }

  /**
   * Fetches weekly appointment statistics
   * Backend endpoint: GET /api/analytics/weekly-appointments
   */
  static async getWeeklyAppointments() {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { day: 'Mon', appointments: 45 },
          { day: 'Tue', appointments: 52 },
          { day: 'Wed', appointments: 38 },
          { day: 'Thu', appointments: 61 },
          { day: 'Fri', appointments: 43 },
          { day: 'Sat', appointments: 29 },
          { day: 'Sun', appointments: 18 },
        ]);
      }, 400);
    });
  }

  /**
   * Fetches appointment status distribution
   * Backend endpoint: GET /api/analytics/appointment-status-today
   */
  static async getAppointmentStatusDistribution() {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { status: 'Completed', count: 89, color: 'bg-success-500' },
          { status: 'Scheduled', count: 34, color: 'bg-primary-500' },
          { status: 'Pending', count: 23, color: 'bg-warning-500' },
          { status: 'Cancelled', count: 12, color: 'bg-error-500' },
        ]);
      }, 350);
    });
  }
}

// API endpoint documentation for backend team:
/*
GET /api/dashboard-stats
Response: {
  totalPatients: number,
  totalDoctors: number,
  todayAppointments: number,
  pendingAppointments: number,
  completedAppointments: number,
  cancelledAppointments: number,
  revenue: {
    today: number,
    thisMonth: number,
    lastMonth: number
  },
  patientGrowth: {
    thisMonth: number,
    percentage: number
  }
}

GET /api/appointments/recent?limit=5
Response: Array<{
  id: string,
  patientName: string,
  doctorName: string,
  time: string,
  type: string,
  status: string
}>

GET /api/analytics/weekly-appointments
Response: Array<{
  day: string,
  appointments: number
}>

GET /api/analytics/appointment-status-today
Response: Array<{
  status: string,
  count: number
}>
*/