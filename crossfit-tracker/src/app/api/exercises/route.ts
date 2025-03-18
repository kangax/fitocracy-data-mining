import { NextResponse } from 'next/server';
import { getExercisesData } from '@/lib/data';

export async function GET() {
  try {
    const exercisesData = getExercisesData();
    return NextResponse.json(exercisesData);
  } catch (error) {
    console.error('Error fetching exercises data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises data' },
      { status: 500 }
    );
  }
}
