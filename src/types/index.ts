// Core entity types for Nexus Care

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  department: string;
  experience: number; // years
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  availability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  }[];
  rating: number; // 1-5
  bio: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration: number; // minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  prescription?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Extended types with relationships
export interface PatientWithAppointments extends Patient {
  appointments: Appointment[];
  upcomingAppointment?: Appointment;
  lastVisit?: string;
}

export interface DoctorWithAppointments extends Doctor {
  appointments: Appointment[];
  todayAppointments: Appointment[];
  patientCount: number;
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: Doctor;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

// Filter and search types
export interface PatientFilters {
  search?: string;
  gender?: Patient['gender'];
  ageRange?: {
    min: number;
    max: number;
  };
  hasUpcomingAppointment?: boolean;
}

export interface DoctorFilters {
  search?: string;
  specialization?: string;
  department?: string;
  isActive?: boolean;
  minRating?: number;
}

export interface AppointmentFilters {
  search?: string;
  status?: Appointment['status'];
  type?: Appointment['type'];
  dateRange?: {
    start: string;
    end: string;
  };
  doctorId?: string;
  patientId?: string;
}

// Dashboard analytics types
export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: {
    today: number;
    thisMonth: number;
    lastMonth: number;
  };
  patientGrowth: {
    thisMonth: number;
    percentage: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}