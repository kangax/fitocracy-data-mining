import { differenceInDays } from 'date-fns';
import type { Exercise, Session, ExerciseSession, Set } from './data';

// Interface for movement proficiency metrics
export interface MovementProficiency {
  exerciseId: number;
  name: string;
  frequency: number; // Total number of sets
  sessionCount: number; // Total number of sessions
  lastPerformed: string; // Date last performed
  daysAgo: number; // Days since last performed
  totalReps: number; // Total reps performed
  totalVolume: number; // Total volume (reps × weight where applicable)
  category?: string;
  equipment?: string;
  proficiencyScore: number; // Combined score of frequency and recency
}

// Calculate movement proficiency for all exercises
export function calculateMovementProficiency(
  exercises: Exercise[],
  sessions: Session[]
): MovementProficiency[] {
  const proficiencyData: MovementProficiency[] = [];
  const today = new Date();

  // Create a map of exercise IDs to their sessions
  const exerciseSessionsMap: Record<number, { session: Session; exerciseSession: ExerciseSession }[]> = {};
  
  // Initialize the map with empty arrays for each exercise
  exercises.forEach(exercise => {
    exerciseSessionsMap[exercise.id] = [];
  });
  
  // Populate the map with sessions for each exercise
  sessions.forEach(session => {
    session.exercises.forEach(exerciseSession => {
      if (exerciseSessionsMap[exerciseSession.exerciseId]) {
        exerciseSessionsMap[exerciseSession.exerciseId].push({ session, exerciseSession });
      }
    });
  });
  
  // Calculate proficiency metrics for each exercise
  exercises.forEach(exercise => {
    const exerciseSessions = exerciseSessionsMap[exercise.id];
    
    if (exerciseSessions.length === 0) {
      // Skip exercises with no sessions
      return;
    }
    
    // Sort sessions by date (newest first)
    exerciseSessions.sort((a, b) => {
      return new Date(b.session.date).getTime() - new Date(a.session.date).getTime();
    });
    
    const lastSession = exerciseSessions[0];
    const lastPerformed = lastSession.session.date;
    const daysAgo = differenceInDays(today, new Date(lastPerformed));
    
    // Calculate total sets, reps, and volume
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    
    exerciseSessions.forEach(({ exerciseSession }) => {
      totalSets += exerciseSession.sets.length;
      
      exerciseSession.sets.forEach(set => {
        // Add reps to total
        if (set.reps) {
          totalReps += set.reps;
          
          // Calculate volume if weight is available
          if (set.weight) {
            totalVolume += set.reps * set.weight.value;
          } else if (set.primaryLoad) {
            totalVolume += set.reps * set.primaryLoad.value;
          }
        }
      });
    });
    
    // Count unique sessions
    const uniqueSessions = new Set(exerciseSessions.map(({ session }) => session.date));
    const sessionCount = uniqueSessions.size;
    
    // Calculate proficiency score (higher is better)
    // Formula: (frequency factor) × (recency factor)
    const frequencyFactor = Math.log10(totalSets + 1) * 10; // Log scale to prevent extremes
    const recencyFactor = Math.max(0, 100 - daysAgo) / 100; // 0 to 1 scale, 1 being most recent
    const proficiencyScore = frequencyFactor * (recencyFactor * 0.7 + 0.3); // Weighted to favor frequency
    
    proficiencyData.push({
      exerciseId: exercise.id,
      name: exercise.name,
      frequency: totalSets,
      sessionCount,
      lastPerformed,
      daysAgo,
      totalReps,
      totalVolume,
      category: exercise.category,
      equipment: exercise.equipment,
      proficiencyScore
    });
  });
  
  // Sort by proficiency score (highest first)
  return proficiencyData.sort((a, b) => b.proficiencyScore - a.proficiencyScore);
}

// Calculate personal records for an exercise
export function calculatePersonalRecords(
  exerciseId: number,
  sessions: { session: Session; exerciseSession: ExerciseSession }[]
) {
  // Sort sessions by date (oldest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(a.session.date).getTime() - new Date(b.session.date).getTime();
  });
  
  let maxWeight = 0;
  let maxReps = 0;
  let maxVolume = 0;
  let maxWeightSession = null;
  let maxRepsSession = null;
  let maxVolumeSession = null;
  
  sortedSessions.forEach(({ session, exerciseSession }) => {
    exerciseSession.sets.forEach(set => {
      // Check for max weight
      if (set.weight && set.weight.value > maxWeight) {
        maxWeight = set.weight.value;
        maxWeightSession = session;
      } else if (set.primaryLoad && set.primaryLoad.value > maxWeight) {
        maxWeight = set.primaryLoad.value;
        maxWeightSession = session;
      }
      
      // Check for max reps
      if (set.reps && set.reps > maxReps) {
        maxReps = set.reps;
        maxRepsSession = session;
      }
      
      // Calculate volume for this set
      let setVolume = 0;
      if (set.reps) {
        if (set.weight) {
          setVolume = set.reps * set.weight.value;
        } else if (set.primaryLoad) {
          setVolume = set.reps * set.primaryLoad.value;
        }
      }
      
      // Check for max volume
      if (setVolume > maxVolume) {
        maxVolume = setVolume;
        maxVolumeSession = session;
      }
    });
  });
  
  return {
    maxWeight: {
      value: maxWeight,
      session: maxWeightSession
    },
    maxReps: {
      value: maxReps,
      session: maxRepsSession
    },
    maxVolume: {
      value: maxVolume,
      session: maxVolumeSession
    }
  };
}

// Calculate training consistency metrics
export function calculateTrainingConsistency(sessions: Session[]) {
  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Group sessions by month
  const sessionsByMonth: Record<string, Session[]> = {};
  
  sortedSessions.forEach(session => {
    const date = new Date(session.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!sessionsByMonth[monthKey]) {
      sessionsByMonth[monthKey] = [];
    }
    
    sessionsByMonth[monthKey].push(session);
  });
  
  // Calculate metrics for each month
  const monthlyMetrics = Object.entries(sessionsByMonth).map(([month, monthlySessions]) => {
    return {
      month,
      sessionCount: monthlySessions.length,
      totalDuration: monthlySessions.reduce((sum, session) => sum + session.duration, 0),
      exerciseTypes: new Set(
        monthlySessions.flatMap(session => 
          session.exercises.map(ex => ex.exerciseId)
        )
      ).size
    };
  });
  
  return monthlyMetrics;
}
