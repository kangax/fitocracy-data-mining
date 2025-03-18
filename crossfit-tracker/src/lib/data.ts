import fs from 'fs';
import path from 'path';

// Types for our data
export interface Exercise {
  id: number;
  name: string;
  primaryType: string;
  baseExercise?: string;
  modifier?: string;
  equipment?: string;
  category?: string;
}

export interface Set {
  reps?: number;
  weight?: {
    value: number;
    unit: string;
  };
  distance?: {
    value: number;
    unit: string;
  };
  seconds?: number;
  primaryLoad?: {
    value: number;
    unit: string;
  };
}

export interface ExerciseSession {
  exerciseId: number;
  sets: Set[];
}

export interface Session {
  date: string;
  time: string;
  name: string;
  duration: number;
  exercises: ExerciseSession[];
}

export interface ExercisesData {
  metadata: {
    exportDate: string;
    count: number;
  };
  exercises: Exercise[];
}

export interface SessionsData {
  metadata: {
    exportDate: string;
    year: string;
    count: number;
  };
  sessions: Session[];
}

// Function to load exercises data
export function getExercisesData(): ExercisesData {
  const filePath = path.join(process.cwd(), 'data/combined_data/exercises.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents) as ExercisesData;
}

// Function to load sessions data for a specific year
export function getSessionsDataForYear(year: string): SessionsData {
  const filePath = path.join(process.cwd(), `data/combined_data/sessions_${year}.json`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents) as SessionsData;
}

// Function to load all sessions data
export function getAllSessionsData(): Session[] {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  let allSessions: Session[] = [];
  
  for (const year of years) {
    try {
      const yearData = getSessionsDataForYear(year);
      allSessions = [...allSessions, ...yearData.sessions];
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);
    }
  }
  
  return allSessions;
}

// Function to get an exercise by ID
export function getExerciseById(id: number): Exercise | undefined {
  const exercisesData = getExercisesData();
  return exercisesData.exercises.find(exercise => exercise.id === id);
}

// Function to get all sessions for a specific exercise
export function getSessionsForExercise(exerciseId: number): { session: Session, exerciseSession: ExerciseSession }[] {
  const allSessions = getAllSessionsData();
  const result: { session: Session, exerciseSession: ExerciseSession }[] = [];
  
  for (const session of allSessions) {
    for (const exerciseSession of session.exercises) {
      if (exerciseSession.exerciseId === exerciseId) {
        result.push({ session, exerciseSession });
      }
    }
  }
  
  return result;
}

// Function to get summary data
export function getSummaryData() {
  const filePath = path.join(process.cwd(), 'data/combined_data/summary.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}
