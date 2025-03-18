'use client';

import React from 'react';
import { useSessions } from '@/hooks/useWorkoutData';
import type { Session, ExerciseSession, Set } from '@/lib/data';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  isLoading: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, isLoading }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      {isLoading ? (
        <div className="animate-pulse h-8 bg-gray-700 rounded mt-2"></div>
      ) : (
        <div className="mt-1">
          <p className="text-2xl font-semibold text-white">{value}</p>
          {subValue && <p className="text-sm text-gray-400">{subValue}</p>}
        </div>
      )}
    </div>
  );
};

const PerformanceMetrics: React.FC = () => {
  const { sessions, isLoading } = useSessions();
  
  // Calculate metrics
  const totalWorkouts = sessions.length;
  
  // Calculate workout frequency (average per week over the last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentSessions = sessions.filter((session: Session) => {
    const sessionDate = new Date(session.date);
    return sessionDate >= fourWeeksAgo;
  });
  
  const workoutsPerWeek = recentSessions.length / 4;
  
  // Calculate total exercise types
  const uniqueExercises = new Set();
  sessions.forEach((session: Session) => {
    session.exercises.forEach((exercise: ExerciseSession) => {
      uniqueExercises.add(exercise.exerciseId);
    });
  });
  
  // Calculate total volume (simplified)
  let totalVolume = 0;
  sessions.forEach((session: Session) => {
    session.exercises.forEach((exercise: ExerciseSession) => {
      exercise.sets.forEach((set: Set) => {
        if (set.reps && set.weight) {
          totalVolume += set.reps * set.weight.value;
        } else if (set.reps && set.primaryLoad) {
          totalVolume += set.reps * set.primaryLoad.value;
        }
      });
    });
  });
  
  // Calculate total distance
  let totalDistance = 0;
  sessions.forEach((session: Session) => {
    session.exercises.forEach((exercise: ExerciseSession) => {
      exercise.sets.forEach((set: Set) => {
        if (set.distance) {
          // Convert all distances to miles for consistency
          if (set.distance.unit === 'mile') {
            totalDistance += set.distance.value;
          } else if (set.distance.unit === 'kilometer' || set.distance.unit === 'km') {
            totalDistance += set.distance.value * 0.621371;
          } else if (set.distance.unit === 'meter' || set.distance.unit === 'm') {
            totalDistance += (set.distance.value / 1000) * 0.621371;
          }
        }
      });
    });
  });
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="TRAINING DAYS"
          value={totalWorkouts}
          isLoading={isLoading}
        />
        <MetricCard
          title="WORKOUT FREQUENCY"
          value={workoutsPerWeek.toFixed(1)}
          subValue="per week"
          isLoading={isLoading}
        />
        <MetricCard
          title="SKILL DEVELOPMENT"
          value={`${uniqueExercises.size} movements`}
          isLoading={isLoading}
        />
        <MetricCard
          title="METCON CAPACITY"
          value={`${Math.round(totalDistance)} mi`}
          isLoading={isLoading}
        />
        <MetricCard
          title="TOTAL VOLUME"
          value={`${Math.round(totalVolume / 1000)}K lbs`}
          isLoading={isLoading}
        />
        <MetricCard
          title="GYMNASTICS SKILLS"
          value="12 MU"
          subValue="Max unbroken"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default PerformanceMetrics;
