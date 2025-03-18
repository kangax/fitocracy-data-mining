'use client';

import useSWR from 'swr';

// Define fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook to fetch exercises data
export function useExercises() {
  const { data, error, isLoading } = useSWR('/api/exercises', fetcher);
  
  return {
    exercises: data?.exercises || [],
    isLoading,
    isError: error
  };
}

// Hook to fetch sessions data
export function useSessions(year?: string) {
  const url = year ? `/api/sessions?year=${year}` : '/api/sessions';
  const { data, error, isLoading } = useSWR(url, fetcher);
  
  return {
    sessions: data?.sessions || [],
    isLoading,
    isError: error
  };
}

// Hook to fetch movement proficiency data
export function useMovementProficiency() {
  const { data, error, isLoading } = useSWR('/api/movements/proficiency', fetcher);
  
  return {
    proficiencyData: data || [],
    isLoading,
    isError: error
  };
}

// Hook to fetch exercise details
export function useExerciseDetails(id: number) {
  const { data, error, isLoading } = useSWR(id ? `/api/exercises/${id}` : null, fetcher);
  
  return {
    exercise: data?.exercise,
    sessions: data?.sessions || [],
    personalRecords: data?.personalRecords,
    frequencyData: data?.frequencyData || [],
    volumeData: data?.volumeData || [],
    isLoading,
    isError: error
  };
}

// Hook to fetch training consistency data
export function useTrainingConsistency() {
  const { data, error, isLoading } = useSWR('/api/analytics/consistency', fetcher);
  
  return {
    monthlyMetrics: data || [],
    isLoading,
    isError: error
  };
}

// Hook to fetch benchmark data
export function useBenchmarks() {
  const { data, error, isLoading } = useSWR('/api/benchmarks', fetcher);
  
  return {
    benchmarks: data || [],
    isLoading,
    isError: error
  };
}
