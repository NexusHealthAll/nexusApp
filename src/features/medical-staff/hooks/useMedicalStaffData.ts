import { useState, useEffect } from 'react';
import { MedicalStaffService, DoctorAppointment, PatientVitals, DoctorStats } from '../services/medicalStaffService';

interface MedicalStaffData {
  appointments: DoctorAppointment[];
  currentPatientVitals: PatientVitals | null;
  stats: DoctorStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useMedicalStaffData(doctorId: string): MedicalStaffData {
  const [data, setData] = useState<MedicalStaffData>({
    appointments: [],
    currentPatientVitals: null,
    stats: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMedicalStaffData = async () => {
      if (!doctorId) return;

      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch all medical staff data in parallel
        const [appointments, stats] = await Promise.all([
          MedicalStaffService.getTodayAppointments(doctorId),
          MedicalStaffService.getDoctorStats(doctorId),
        ]);

        // Find current patient (in-progress appointment) and fetch their vitals
        const currentAppointment = appointments.find(apt => apt.status === 'in-progress');
        let currentPatientVitals = null;
        
        if (currentAppointment) {
          currentPatientVitals = await MedicalStaffService.getCurrentPatientVitals(
            currentAppointment.patient.id
          );
        }

        setData({
          appointments,
          currentPatientVitals,
          stats,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch medical staff data',
        }));
      }
    };

    fetchMedicalStaffData();
  }, [doctorId]);

  return data;
}

export function useConsultation(appointmentId: string, patientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startConsultation = async (doctorId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await MedicalStaffService.startConsultation(appointmentId, doctorId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start consultation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async (consultationId: string, notes: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await MedicalStaffService.saveConsultationNotes(consultationId, notes);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save notes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const completeConsultation = async (consultationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await MedicalStaffService.completeConsultation(consultationId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete consultation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startConsultation,
    saveNotes,
    completeConsultation,
    isLoading,
    error
  };
}

export function usePatientHistory(patientId: string) {
  const [patientHistory, setPatientHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      if (!patientId) return;

      setIsLoading(true);
      setError(null);

      try {
        const history = await MedicalStaffService.getPatientHistory(patientId);
        setPatientHistory(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch patient history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientHistory();
  }, [patientId]);

  return { patientHistory, isLoading, error };
}

// Alternative hooks for React Query integration (when implemented)
/*
import { useQuery, useMutation } from '@tanstack/react-query';

export function useTodayAppointments(doctorId: string) {
  return useQuery({
    queryKey: ['medical-staff', 'appointments', 'today', doctorId],
    queryFn: () => MedicalStaffService.getTodayAppointments(doctorId),
    enabled: !!doctorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePatientVitals(patientId: string) {
  return useQuery({
    queryKey: ['medical-staff', 'patient-vitals', patientId],
    queryFn: () => MedicalStaffService.getCurrentPatientVitals(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useStartConsultation() {
  return useMutation({
    mutationFn: ({ appointmentId, doctorId }: { appointmentId: string; doctorId: string }) =>
      MedicalStaffService.startConsultation(appointmentId, doctorId),
  });
}
*/