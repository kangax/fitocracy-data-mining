'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useExerciseDetails } from '@/hooks/useWorkoutData';
import { format } from 'date-fns';

export default function MovementDetail() {
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const { exercise, sessions, personalRecords, isLoading, isError } = useExerciseDetails(id);
  
  // Helper function to format sets as a string with dot separators
  const formatSets = (sets: any[]) => {
    return sets.map(set => {
      let setStr = '';
      if (set.reps) setStr += `${set.reps} reps`;
      if (set.weight) setStr += ` @ ${set.weight.value} ${set.weight.unit}`;
      if (set.distance) setStr += ` ${set.distance.value} ${set.distance.unit}`;
      if (set.seconds) setStr += ` for ${set.seconds} seconds`;
      return setStr;
    }).join(' • ');
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }
  
  if (isError || !exercise) {
    return (
      <Layout>
        <div className="text-red-500">
          Error loading exercise data. Please try again.
        </div>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </Layout>
    );
  }
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.session.date).getTime() - new Date(a.session.date).getTime();
  });
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
          <div className="text-gray-600">
            {exercise.category && <span className="mr-2">{exercise.category}</span>}
            {exercise.equipment && <span>Equipment: {exercise.equipment}</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Records */}
          <div className="bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Personal Records</h2>
            <div className="space-y-4">
              {personalRecords.maxWeight.value > 0 && (
                <div>
                  <div className="text-sm text-gray-300">Max Weight</div>
                  <div className="text-2xl font-semibold text-white">
                    {personalRecords.maxWeight.value} {personalRecords.maxWeight.session?.exercises.find((e: { exerciseId: number }) => e.exerciseId === id)?.sets[0]?.weight?.unit || 'lbs'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {personalRecords.maxWeight.session && format(new Date(personalRecords.maxWeight.session.date), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
              
              {personalRecords.maxReps.value > 0 && (
                <div>
                  <div className="text-sm text-gray-300">Max Reps</div>
                  <div className="text-2xl font-semibold text-white">
                    {personalRecords.maxReps.value}
                  </div>
                  <div className="text-xs text-gray-400">
                    {personalRecords.maxReps.session && format(new Date(personalRecords.maxReps.session.date), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
              
              {personalRecords.maxVolume.value > 0 && (
                <div>
                  <div className="text-sm text-gray-300">Max Volume</div>
                  <div className="text-2xl font-semibold text-white">
                    {personalRecords.maxVolume.value} {personalRecords.maxVolume.session?.exercises.find((e: { exerciseId: number }) => e.exerciseId === id)?.sets[0]?.weight?.unit || 'lbs'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {personalRecords.maxVolume.session && format(new Date(personalRecords.maxVolume.session.date), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Training Frequency */}
          <div className="bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Training Frequency</h2>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-300">Total Sessions</div>
                <div className="text-2xl font-semibold">{sessions.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Total Sets</div>
                <div className="text-2xl font-semibold text-white">
                  {sessions.reduce((total: number, { exerciseSession }: { exerciseSession: any }) => total + exerciseSession.sets.length, 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Total Reps</div>
                <div className="text-2xl font-semibold text-white">
                  {sessions.reduce((total: number, { exerciseSession }: { exerciseSession: any }) => {
                    return total + exerciseSession.sets.reduce((setTotal: number, set: any) => {
                      return setTotal + (set.reps || 0);
                    }, 0);
                  }, 0)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Performed */}
          <div className="bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Last Performed</h2>
            {sortedSessions.length > 0 ? (
              <div>
                <div className="text-2xl font-semibold text-white">
                  {format(new Date(sortedSessions[0].session.date), 'MMM d, yyyy')}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {sortedSessions[0].session.name}
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-300">Sets:</div>
                  <div className="mt-2 text-sm text-gray-300 whitespace-normal">
                    {formatSets(sortedSessions[0].exerciseSession.sets)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No sessions recorded</div>
            )}
          </div>
        </div>
        
        {/* Session History */}
        <div className="bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Session History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Workout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sets
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedSessions.map(({ session, exerciseSession }, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {format(new Date(session.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {session.name}
                    </td>
                    <td className="px-6 py-4 text-white">
                      <div className="text-sm text-gray-300 whitespace-normal">
                        {formatSets(exerciseSession.sets)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
