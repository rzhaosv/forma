// Exercise and workout data types

export type ExerciseCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'sports'
  | 'other';

export type IntensityLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  caloriesPerMinute: number; // Base calories burned per minute (varies by weight)
  metValue: number; // Metabolic Equivalent of Task
  icon: string;
}

export interface WorkoutSet {
  id: string;
  reps?: number;
  weight?: number; // in kg
  duration?: number; // in seconds
  distance?: number; // in meters
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  duration: number; // Total duration in minutes
  caloriesBurned: number;
  intensity: IntensityLevel;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  startTime: string;
  endTime?: string;
  totalDuration: number; // in minutes
  totalCaloriesBurned: number;
  notes?: string;
  timestamp: string;
}

export interface DailyExerciseSummary {
  date: string;
  workouts: Workout[];
  totalCaloriesBurned: number;
  totalDuration: number;
  exerciseCount: number;
}

// Common exercises database
export const COMMON_EXERCISES: Exercise[] = [
  // Cardio
  { id: 'running', name: 'Running', category: 'cardio', caloriesPerMinute: 11.4, metValue: 9.8, icon: '🏃' },
  { id: 'walking', name: 'Walking', category: 'cardio', caloriesPerMinute: 4.5, metValue: 3.8, icon: '🚶' },
  { id: 'cycling', name: 'Cycling', category: 'cardio', caloriesPerMinute: 8.5, metValue: 7.5, icon: '🚴' },
  { id: 'swimming', name: 'Swimming', category: 'cardio', caloriesPerMinute: 9.0, metValue: 8.0, icon: '🏊' },
  { id: 'jumping_rope', name: 'Jumping Rope', category: 'cardio', caloriesPerMinute: 12.0, metValue: 11.0, icon: '🪢' },
  { id: 'rowing', name: 'Rowing', category: 'cardio', caloriesPerMinute: 8.5, metValue: 7.0, icon: '🚣' },
  { id: 'elliptical', name: 'Elliptical', category: 'cardio', caloriesPerMinute: 7.5, metValue: 6.5, icon: '🏋️' },
  { id: 'stair_climbing', name: 'Stair Climbing', category: 'cardio', caloriesPerMinute: 9.0, metValue: 8.0, icon: '🪜' },
  { id: 'hiking', name: 'Hiking', category: 'cardio', caloriesPerMinute: 7.0, metValue: 6.0, icon: '🥾' },
  { id: 'dancing', name: 'Dancing', category: 'cardio', caloriesPerMinute: 6.5, metValue: 5.5, icon: '💃' },
  
  // Strength
  { id: 'weight_lifting', name: 'Weight Lifting', category: 'strength', caloriesPerMinute: 5.0, metValue: 5.0, icon: '🏋️' },
  { id: 'push_ups', name: 'Push-ups', category: 'strength', caloriesPerMinute: 7.0, metValue: 6.0, icon: '💪' },
  { id: 'pull_ups', name: 'Pull-ups', category: 'strength', caloriesPerMinute: 8.0, metValue: 7.0, icon: '🧗' },
  { id: 'squats', name: 'Squats', category: 'strength', caloriesPerMinute: 6.0, metValue: 5.5, icon: '🦵' },
  { id: 'deadlifts', name: 'Deadlifts', category: 'strength', caloriesPerMinute: 6.5, metValue: 6.0, icon: '🏋️' },
  { id: 'bench_press', name: 'Bench Press', category: 'strength', caloriesPerMinute: 5.5, metValue: 5.0, icon: '🛋️' },
  { id: 'lunges', name: 'Lunges', category: 'strength', caloriesPerMinute: 6.0, metValue: 5.5, icon: '🦿' },
  { id: 'planks', name: 'Planks', category: 'strength', caloriesPerMinute: 4.0, metValue: 3.5, icon: '🧘' },
  
  // Flexibility
  { id: 'yoga', name: 'Yoga', category: 'flexibility', caloriesPerMinute: 3.5, metValue: 3.0, icon: '🧘' },
  { id: 'pilates', name: 'Pilates', category: 'flexibility', caloriesPerMinute: 4.0, metValue: 3.5, icon: '🤸' },
  { id: 'stretching', name: 'Stretching', category: 'flexibility', caloriesPerMinute: 2.5, metValue: 2.3, icon: '🙆' },
  
  // Sports
  { id: 'basketball', name: 'Basketball', category: 'sports', caloriesPerMinute: 8.0, metValue: 7.0, icon: '🏀' },
  { id: 'soccer', name: 'Soccer', category: 'sports', caloriesPerMinute: 9.0, metValue: 8.0, icon: '⚽' },
  { id: 'tennis', name: 'Tennis', category: 'sports', caloriesPerMinute: 8.0, metValue: 7.0, icon: '🎾' },
  { id: 'volleyball', name: 'Volleyball', category: 'sports', caloriesPerMinute: 5.0, metValue: 4.5, icon: '🏐' },
  { id: 'golf', name: 'Golf', category: 'sports', caloriesPerMinute: 4.5, metValue: 4.0, icon: '⛳' },
  { id: 'boxing', name: 'Boxing', category: 'sports', caloriesPerMinute: 10.0, metValue: 9.0, icon: '🥊' },
  { id: 'martial_arts', name: 'Martial Arts', category: 'sports', caloriesPerMinute: 10.0, metValue: 9.0, icon: '🥋' },
  
  // Other
  { id: 'hiit', name: 'HIIT', category: 'other', caloriesPerMinute: 12.0, metValue: 10.0, icon: '🔥' },
  { id: 'crossfit', name: 'CrossFit', category: 'other', caloriesPerMinute: 11.0, metValue: 9.5, icon: '💥' },
  { id: 'circuit_training', name: 'Circuit Training', category: 'other', caloriesPerMinute: 9.0, metValue: 8.0, icon: '🔄' },
];

// Get exercise by ID
export const getExerciseById = (id: string): Exercise | undefined => {
  return COMMON_EXERCISES.find(e => e.id === id);
};

// Get exercises by category
export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return COMMON_EXERCISES.filter(e => e.category === category);
};

// Calculate calories burned based on exercise, duration, and weight
export const calculateCaloriesBurned = (
  exercise: Exercise,
  durationMinutes: number,
  weightKg: number = 70,
  intensity: IntensityLevel = 'moderate'
): number => {
  // MET formula: Calories = MET × weight (kg) × duration (hours)
  const intensityMultiplier = {
    low: 0.8,
    moderate: 1.0,
    high: 1.2,
    very_high: 1.4,
  };
  
  const hours = durationMinutes / 60;
  const calories = exercise.metValue * weightKg * hours * intensityMultiplier[intensity];
  
  return Math.round(calories);
};

