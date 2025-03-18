import { NextResponse } from 'next/server';
import { getExercisesData, getAllSessionsData } from '@/lib/data';
import { calculateMovementProficiency } from '@/lib/calculations';

export async function GET() {
  try {
    const exercisesData = getExercisesData();
    const allSessions = getAllSessionsData();
    
    const proficiencyData = calculateMovementProficiency(
      exercisesData.exercises,
      allSessions
    );
    
    return NextResponse.json(proficiencyData);
  } catch (error) {
    console.error('Error calculating movement proficiency:', error);
    return NextResponse.json(
      { error: 'Failed to calculate movement proficiency' },
      { status: 500 }
    );
  }
}
