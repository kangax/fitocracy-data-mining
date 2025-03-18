import { NextRequest, NextResponse } from 'next/server';
import { getExerciseById, getSessionsForExercise } from '@/lib/data';
import { 
  calculatePersonalRecords, 
  calculateMovementFrequency,
  calculateMovementVolume
} from '@/lib/calculations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Convert the ID to a number
    const exerciseId = parseInt(params.id);
    
    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }
    
    const exercise = getExerciseById(exerciseId);
    
    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    const exerciseSessions = getSessionsForExercise(exerciseId);
    const personalRecords = calculatePersonalRecords(exerciseId, exerciseSessions);
    const frequencyData = calculateMovementFrequency(exerciseId, exerciseSessions);
    const volumeData = calculateMovementVolume(exerciseId, exerciseSessions);
    
    return NextResponse.json({
      exercise,
      sessions: exerciseSessions,
      personalRecords,
      frequencyData,
      volumeData
    });
  } catch (error) {
    console.error(`Error fetching exercise data:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise data' },
      { status: 500 }
    );
  }
}
