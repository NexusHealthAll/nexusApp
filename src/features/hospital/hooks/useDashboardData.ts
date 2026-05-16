import { useState, useEffect } from "react";
import {
  AppointmentStatusPoint,
  DashboardService,
  RecentAppointment,
  WeeklyAppointmentPoint,
} from "../services/dashboardService";
import { DashboardStats } from "@/types";

interface DashboardData {
  stats: DashboardStats | null;
  recentAppointments: RecentAppointment[];
  weeklyAppointments: WeeklyAppointmentPoint[];
  appointmentStatusDistribution: AppointmentStatusPoint[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    recentAppointments: [],
    weeklyAppointments: [],
    appointmentStatusDistribution: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setData((prev) => ({ ...prev, isLoading: true, error: null }));

        // Fetch all dashboard data in parallel
        const [
          stats,
          recentAppointments,
          weeklyAppointments,
          statusDistribution,
        ] = await Promise.all([
          DashboardService.getDashboardStats(),
          DashboardService.getRecentAppointments(),
          DashboardService.getWeeklyAppointments(),
          DashboardService.getAppointmentStatusDistribution(),
        ]);

        setData({
          stats,
          recentAppointments,
          weeklyAppointments,
          appointmentStatusDistribution: statusDistribution,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard data",
        }));
      }
    };

    fetchDashboardData();
  }, []);

  return data;
}

// Alternative hook for React Query integration (when implemented)
/*
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: DashboardService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRecentAppointments() {
  return useQuery({
    queryKey: ['recent-appointments'],
    queryFn: DashboardService.getRecentAppointments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
*/
