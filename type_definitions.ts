/**
 * Workout data TypeScript interface definitions
 */

/**
 * Main data structure containing all workout information
 */
interface WorkoutData {
  metadata: Metadata;
  exercises: Exercise[];
  sessions: WorkoutSession[];
}

/**
 * General information about the workout data
 */
interface Metadata {
  exportDate: string;      // ISO date string when this JSON was created
  dateRange?: {            // Optional - can be calculated from sessions
    start: string;         // YYYY-MM-DD
    end: string;           // YYYY-MM-DD
  };
}

/**
 * Exercise definition
 */
interface Exercise {
  id: number;
  name: string;
  primaryType: 'resistance' | 'distance' | 'duration' | 'complex';
  baseExercise?: string;   // For exercises with modifiers (e.g., "Bench Press" for "Bench Press (Paused)")
  modifier?: string;       // Specific variant or modification (e.g., "Paused", "Wide Grip")
  equipment?: string;      // Equipment used (e.g., "Barbell", "Dumbbell", "Machine")
  category?: string;       // Category for grouping (e.g., "Olympic Lifting", "Gymnastics", "Monostructural")
  measurement?: string;    // Primary measurement value ("weight", "reps", "distance", "time")
  isUnilateral?: boolean;  // Whether the exercise is performed one side at a time (e.g., Single-arm rows)
  targetMuscleGroups?: string[]; // Primary muscles targeted
}

/**
 * A single workout session
 */
interface WorkoutSession {
  date: string;            // YYYY-MM-DD
  time: string;            // HH:MM:SS
  name: string;            // e.g., "Morning Workout", "Leg Day"
  duration?: number;       // duration in minutes
  notes?: string;          // any notes about the workout
  workoutType?: string;    // e.g., "Strength", "HIIT", "CrossFit WOD", "Cardio"
  style?: string;          // e.g., "AMRAP", "EMOM", "For Time", "Tabata"
  totalCalories?: number;  // calories burned if tracked
  location?: string;       // where the workout was performed
  exercises: SessionExercise[];
}

/**
 * An exercise performed during a workout session
 */
interface SessionExercise {
  exerciseId: number;      // references Exercise.id
  type: 'resistance' | 'distance' | 'duration' | 'complex'; // Type of exercise (from Exercise.primaryType)
  sets: SetData[];         // Array of sets, with type-specific data
}

/**
 * Base interface for all exercise set types
 */
interface BaseExerciseSet {
  type: string;            // Discriminator field
  notes?: string;          // Notes about the set
  rpe?: number;            // Rate of perceived exertion (1-10)
  timeCapSeconds?: number; // Optional time cap for AMRAP-style exercises
  additionalLoad?: {
    weight: WeightMeasurement;
    type: string;          // E.g., 'vest', 'backpack', 'chains', 'bands'
  };                       // For any exercise with added resistance (vest, chains, etc.)
}

/**
 * Weight measurement with unit
 */
interface WeightMeasurement {
  value: number;          // Numeric weight value
  unit: 'lb' | 'kg';      // Weight unit
}

/**
 * Dynamic resistance exercises measured primarily by weight and repetitions
 * Examples: Bench Press, Squat, Deadlift, Olympic lifts, Push-ups, Pull-ups
 */
interface ResistanceExerciseSet extends BaseExerciseSet {
  type: 'resistance';
  reps: number;            // Number of repetitions
  weight?: WeightMeasurement; // Primary weight (barbell, dumbbell, etc.) - absent for pure bodyweight
  assistanceType?: string; // Optional assistance method (bands, machine)
  assistanceValue?: number; // Amount of assistance
}

/**
 * Bodyweight exercises (primarily reps)
 * Examples: Push-ups, Pull-ups, Air squats
 */
interface BodyweightSet extends BaseExerciseSet {
  type: 'bodyweight';
  reps: number;            // Number of repetitions
  weight?: WeightMeasurement; // Optional added weight (e.g., weighted pull-ups)
  assistanceType?: string; // Optional assistance method (bands, machine)
  assistanceValue?: number; // Amount of assistance
}

/**
 * Distance measurement with unit
 */
interface DistanceMeasurement {
  value: number;           // Numeric distance value
  unit: 'm' | 'km' | 'mi' | 'yd' | 'ft'; // Distance unit
}

/**
 * Dynamic cardio exercises measured primarily by distance
 * Examples: Running, Rowing, Cycling, Carries
 */
interface DistanceExerciseSet extends BaseExerciseSet {
  type: 'distance';
  distance: DistanceMeasurement;
  seconds?: number;        // Optional time taken
  pace?: number;           // Optional pace value
  calories?: number;       // Optional calorie count (common for machines)
  loadType?: string;       // Load type when carrying weight is part of the exercise (e.g., sandbag, dumbbells)
  primaryLoad?: WeightMeasurement; // Weight carried as part of the exercise itself
}

/**
 * Static or isometric exercises measured primarily by time held
 * Examples: Plank, Wall sit, Hanging, Static holds
 */
interface DurationExerciseSet extends BaseExerciseSet {
  type: 'duration';
  seconds: number;         // Duration in seconds
  reps?: number;           // Optional repetitions within the duration
}

/**
 * Height measurement with unit
 */
interface HeightMeasurement {
  value: number;           // Numeric height value
  unit: 'in' | 'cm';       // Height unit
}

/**
 * Specialized exercises with height component
 * Examples: Box Jumps, Depth Jumps
 */
interface HeightBasedSet extends BaseExerciseSet {
  type: 'height';
  height: HeightMeasurement;
  reps?: number;           // Optional repetitions
}

/**
 * Weighted carries (combines weight + distance)
 * Examples: Farmer's Carry, Sandbag Carry
 */
interface WeightedCarrySet extends BaseExerciseSet {
  type: 'weighted-carry';
  weight: number;          // Weight carried
  distance: number;        // Distance covered
  seconds?: number;        // Time taken
  distanceUnit?: string;   // Unit for distance
}

/**
 * Multi-modal exercises with varied measurement needs
 * Examples: Burpees, Turkish Get-ups, Wallballs, Box Jumps
 */
interface ComplexExerciseSet extends BaseExerciseSet {
  type: 'complex';
  reps?: number;           // Optional repetitions
  seconds?: number;        // Optional duration
  primaryLoad?: WeightMeasurement; // Primary implement weight (e.g., medicine ball for wall balls)
  distance?: DistanceMeasurement; // Optional distance component
  height?: HeightMeasurement; // Optional height component (for box jumps, etc.)
  targetDescription?: string; // Description of movement target (e.g., "9ft target" for wall balls)
}

/**
 * Union type representing all possible exercise set types
 */
type ExerciseSet = 
  | ResistanceExerciseSet 
  | DistanceExerciseSet 
  | DurationExerciseSet 
  | ComplexExerciseSet;

/**
 * Example usage:
 * 
 * const workoutData: WorkoutData = {
 *   metadata: { ... },
 *   exercises: [ ... ],
 *   sessions: [ ... ]
 * };
 */