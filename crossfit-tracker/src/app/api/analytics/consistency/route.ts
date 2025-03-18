import { NextResponse } from 'next/server';
import { getAllSessionsData } from '@/lib/data';
import { calculateTrainingConsistency } from '@/lib/calculations';

export async function GET() {
  try {
    const allSessions = getAllSessionsData();
    const consistencyData = calculateTrainingConsistency(allSessions);
    
    return NextResponse.json(consistencyData);
  } catch (error) {
    console.error('Error calculating training consistency:', error);
    return NextResponse.json(
      { error: 'Failed to calculate training consistency' },
      { status: 500 }
    );
  }
}
