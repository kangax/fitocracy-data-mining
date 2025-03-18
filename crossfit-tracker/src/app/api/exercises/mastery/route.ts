import { NextResponse } from 'next/server';
import { getExercisesData, getAllSessionsData } from '@/lib/data';

export async function GET() {
  try {
    const exercisesData = getExercisesData();
    const allSessions = getAllSessionsData();

    // Calculate exercise frequency
    const exerciseFrequencies = exercisesData.exercises.map(exercise => {
      const sessionCount = allSessions.filter(session =>
        session.exercises.some(ex => ex.exerciseId === exercise.id)
      ).length;

      return {
        exerciseId: exercise.id,
        name: exercise.name,
        sessionCount,
        remaining: Math.max(0, 100 - sessionCount),
        mastered: sessionCount >= 100,
      };
    });

    return NextResponse.json(exerciseFrequencies);
  } catch (error) {
    console.error('Error calculating exercise mastery:', error);
    return NextResponse.json(
      { error: 'Failed to calculate exercise mastery' },
      { status: 500 }
    );
  }
}
