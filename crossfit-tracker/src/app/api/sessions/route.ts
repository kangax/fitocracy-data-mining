import { NextResponse } from 'next/server';
import { getAllSessionsData, getSessionsDataForYear } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    if (year) {
      // If a specific year is requested, return sessions for that year
      try {
        const sessionsData = getSessionsDataForYear(year);
        return NextResponse.json(sessionsData);
      } catch (error) {
        console.error(`Error fetching sessions for year ${year}:`, error);
        return NextResponse.json(
          { error: `No data available for year ${year}` },
          { status: 404 }
        );
      }
    } else {
      // Otherwise, return all sessions
      const allSessions = getAllSessionsData();
      return NextResponse.json({ sessions: allSessions });
    }
  } catch (error) {
    console.error('Error fetching sessions data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions data' },
      { status: 500 }
    );
  }
}
