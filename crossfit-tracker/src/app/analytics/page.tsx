'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import ConsistencyChart from '@/components/charts/ConsistencyChart';
import { useTrainingConsistency, useSessions } from '@/hooks/useWorkoutData';
import { format } from 'date-fns';

export default function AnalyticsPage() {
  const { monthlyMetrics, isLoading: isLoadingConsistency } = useTrainingConsistency();
  const { sessions, isLoading: isLoadingSessions } = useSessions();
  
  // Calculate total workout time
  const totalWorkoutTime = sessions.reduce((total: number, session: any) => {
    return total + (session.duration || 0);
  }, 0);
  
  // Format as hours and minutes
  const totalHours = Math.floor(totalWorkoutTime / 60);
  const totalMinutes = totalWorkoutTime % 60;
  
  // Calculate average workout duration
  const averageWorkoutDuration = sessions.length > 0 
    ? Math.round(totalWorkoutTime / sessions.length) 
    : 0;
  
  // Get most recent workout
  const sortedSessions = [...sessions].sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const mostRecentWorkout = sortedSessions.length > 0 ? sortedSessions[0] : null;
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-400">
            Track your training consistency and performance metrics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Total Training</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-300">Workouts Completed</div>
                <div className="text-2xl font-semibold text-white">{sessions.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Total Training Time</div>
                <div className="text-2xl font-semibold text-white">
                  {totalHours}h {totalMinutes}m
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Average Workout Duration</div>
                <div className="text-2xl font-semibold text-white">{averageWorkoutDuration} minutes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            {mostRecentWorkout ? (
              <div>
                <div className="text-sm text-gray-300">Last Workout</div>
                <div className="text-xl font-semibold text-white">{mostRecentWorkout.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {format(new Date(mostRecentWorkout.date), 'MMMM d, yyyy')}
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-300">Duration</div>
                  <div className="text-lg font-semibold text-white">
                    {mostRecentWorkout.duration} minutes
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-300">Exercises</div>
                  <div className="text-lg font-semibold text-white">
                    {mostRecentWorkout.exercises.length} movements
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No workouts recorded</div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Training Frequency</h2>
            {!isLoadingConsistency && monthlyMetrics.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-300">This Month</div>
                  <div className="text-2xl font-semibold text-white">
                    {monthlyMetrics[monthlyMetrics.length - 1]?.sessionCount || 0} workouts
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Last Month</div>
                  <div className="text-2xl font-semibold text-white">
                    {monthlyMetrics[monthlyMetrics.length - 2]?.sessionCount || 0} workouts
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Average Per Month</div>
                  <div className="text-2xl font-semibold text-white">
                    {monthlyMetrics.length > 0
                      ? (monthlyMetrics.reduce((sum: number, month: any) => sum + month.sessionCount, 0) / monthlyMetrics.length).toFixed(1)
                      : 0} workouts
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-600 rounded"></div>
                <div className="h-6 bg-gray-600 rounded"></div>
                <div className="h-6 bg-gray-600 rounded"></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Training Consistency</h2>
          <div className="h-96">
            <ConsistencyChart />
          </div>
        </div>
      </div>
    </Layout>
  );
}
