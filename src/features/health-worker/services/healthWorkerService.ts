// Health Worker API Service Layer - Shift-based system

export interface AvailableShift {
  id: string;
  hospital: string;
  department: string;
  date: string;
  time: string;
  duration: string;
  hourlyRate: number;
  location: string;
  urgency: 'high' | 'medium' | 'low';
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
  status: 'active' | 'paused' | 'completed';
}

export interface HealthWorkerProfile {
  id: string;
  name: string;
  rating: number;
  totalEarnings: number;
  specialization: string;
  licenseNumber: string;
  currentStatus: 'available' | 'on-shift' | 'off-duty';
}

export interface ShiftEarnings {
  weeklyHours: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  averageHourlyRate: number;
}

export class HealthWorkerService {
  /**
   * Fetches available shifts for health worker
   * Backend endpoint: GET /api/health-worker/shifts/available?workerId={workerId}&location={location}
   */
  static async getAvailableShifts(workerId: string, location?: string): Promise<AvailableShift[]> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/health-worker/shifts/available?workerId=${workerId}&location=${location || ''}`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            hospital: 'LUTH - Emergency Dept',
            department: 'Emergency Medicine',
            date: 'Today',
            time: '2:00 PM - 10:00 PM',
            duration: '8 hours',
            hourlyRate: 8000,
            location: 'Lagos Island',
            urgency: 'high',
            description: 'Emergency department coverage needed'
          },
          {
            id: '2',
            hospital: 'General Hospital',
            department: 'General Medicine',
            date: 'Tomorrow',
            time: '6:00 AM - 2:00 PM',
            duration: '8 hours',
            hourlyRate: 6000,
            location: 'Victoria Island',
            urgency: 'medium'
          },
          {
            id: '3',
            hospital: 'Private Clinic',
            department: 'General Practice',
            date: 'Oct 28',
            time: '9:00 AM - 5:00 PM',
            duration: '8 hours',
            hourlyRate: 6000,
            location: 'Ikeja',
            urgency: 'low'
          }
        ]);
      }, 300);
    });
  }

  /**
   * Accepts a shift
   * Backend endpoint: POST /api/health-worker/shifts/accept
   */
  static async acceptShift(shiftId: string, workerId: string): Promise<{ success: boolean; activeShiftId: string }> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/health-worker/shifts/accept', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ shiftId, workerId })
    // });
    // return response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          activeShiftId: `ACTIVE_${Date.now()}` 
        });
      }, 500);
    });
  }

  /**
   * Starts/clocks into a shift
   * Backend endpoint: POST /api/health-worker/shifts/clock-in
   */
  static async clockIn(shiftId: string, workerId: string): Promise<ActiveShift> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/health-worker/shifts/clock-in', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ shiftId, workerId })
    // });
    // return response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: shiftId,
          hospital: 'LUTH - Emergency Dept',
          department: 'Emergency Medicine',
          startTime: new Date().toISOString(),
          hourlyRate: 8000,
          location: 'Lagos Island',
          duration: '00:00:00',
          status: 'active'
        });
      }, 400);
    });
  }

  /**
   * Clocks out of current shift
   * Backend endpoint: POST /api/health-worker/shifts/clock-out
   */
  static async clockOut(activeShiftId: string, workerId: string): Promise<{ 
    success: boolean; 
    totalDuration: string; 
    earnings: number 
  }> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/health-worker/shifts/clock-out', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ activeShiftId, workerId })
    // });
    // return response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          totalDuration: '08:30:00',
          earnings: 68000
        });
      }, 300);
    });
  }

  /**
   * Updates health worker duty status
   * Backend endpoint: PUT /api/health-worker/status
   */
  static async updateDutyStatus(workerId: string, status: 'available' | 'off-duty'): Promise<{ success: boolean }> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/health-worker/status', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ workerId, status })
    // });
    // return response.json();
    
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 200);
    });
  }

  /**
   * Gets health worker profile and stats
   * Backend endpoint: GET /api/health-worker/profile/{workerId}
   */
  static async getWorkerProfile(workerId: string): Promise<HealthWorkerProfile> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/health-worker/profile/${workerId}`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: workerId,
          name: 'Dr. Abode',
          rating: 4.9,
          totalEarnings: 385000,
          specialization: 'Emergency Doctor',
          licenseNumber: 'MDC/NGR/0050',
          currentStatus: 'available'
        });
      }, 250);
    });
  }

  /**
   * Gets earnings and statistics
   * Backend endpoint: GET /api/health-worker/earnings/{workerId}
   */
  static async getEarnings(workerId: string): Promise<ShiftEarnings> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/health-worker/earnings/${workerId}`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          weeklyHours: 34.5,
          weeklyEarnings: 428500,
          monthlyEarnings: 1850000,
          totalEarnings: 385000,
          averageHourlyRate: 7500
        });
      }, 300);
    });
  }

  /**
   * Gets recent shift history
   * Backend endpoint: GET /api/health-worker/shifts/history?workerId={workerId}&limit={limit}
   */
  static async getShiftHistory(workerId: string, limit: number = 10): Promise<any[]> {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/health-worker/shifts/history?workerId=${workerId}&limit=${limit}`);
    // return response.json();
    
    // Mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            hospital: 'Lagos University Teaching Hospital',
            department: 'Emergency Medicine',
            date: '2024-10-25',
            duration: '8 hours',
            earnings: 64000,
            rating: 5.0,
            status: 'completed'
          },
          {
            id: '2',
            hospital: 'Emergency Hospital',
            department: 'Emergency Medicine',
            date: '2024-10-23',
            duration: '6 hours',
            earnings: 48000,
            rating: 4.8,
            status: 'completed'
          },
          {
            id: '3',
            hospital: 'General Hospital Victoria Island',
            department: 'General Medicine',
            date: '2024-10-20',
            duration: '8 hours',
            earnings: 48000,
            rating: 4.9,
            status: 'completed'
          }
        ]);
      }, 350);
    });
  }
}

// API endpoint documentation for backend team:
/*
Health Worker API Endpoints:

GET /api/health-worker/shifts/available?workerId={workerId}&location={location}
Response: Array<AvailableShift>

POST /api/health-worker/shifts/accept
Body: { shiftId: string, workerId: string }
Response: { success: boolean, activeShiftId: string }

POST /api/health-worker/shifts/clock-in
Body: { shiftId: string, workerId: string }
Response: ActiveShift

POST /api/health-worker/shifts/clock-out
Body: { activeShiftId: string, workerId: string }
Response: { success: boolean, totalDuration: string, earnings: number }

PUT /api/health-worker/status
Body: { workerId: string, status: 'available' | 'off-duty' }
Response: { success: boolean }

GET /api/health-worker/profile/{workerId}
Response: HealthWorkerProfile

GET /api/health-worker/earnings/{workerId}
Response: ShiftEarnings

GET /api/health-worker/shifts/history?workerId={workerId}&limit={limit}
Response: Array<ShiftHistory>
*/