// Exercise tracking state management
import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Workout,
  WorkoutExercise,
  DailyExerciseSummary,
  calculateCaloriesBurned,
} from '../types/exercise.types';
import { syncWorkoutToHealthKit, readStepCount } from '../services/healthKitService';
import { syncWorkoutToGoogleFit } from '../services/googleFitService';
import {
  isHealthKitEnabled,
  isExerciseSyncEnabled,
  isGoogleFitEnabled,
  isGoogleFitExerciseSyncEnabled,
} from '../utils/healthKitSettings';
import { getLocalDateString } from '../utils/dateUtils';

interface ExerciseStore {
  workouts: Workout[];
  dailySummary: DailyExerciseSummary | null;
  currentUserId: string | null;
  activeWorkout: Workout | null;
  weeklyGoal: number; // minutes per week
  steps: number;
  stepGoal: number;

  // Actions
  initialize: (userId: string) => Promise<void>;
  clearData: () => Promise<void>;

  // Workout management
  startWorkout: (name?: string) => void;
  addExerciseToWorkout: (exercise: WorkoutExercise) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  endWorkout: () => Promise<void>;
  cancelWorkout: () => void;

  // Manual logging
  logWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;

  // Summary
  updateDailySummary: () => void;
  getWeeklySummary: () => { totalMinutes: number; totalCalories: number; workoutCount: number };

  // Goals
  setWeeklyGoal: (minutes: number) => Promise<void>;

  // Steps
  syncSteps: () => Promise<void>;
  setStepGoal: (goal: number) => Promise<void>;
}

const getStorageKeys = (userId: string) => ({
  workouts: `@forma_workouts_${userId}`,
  weeklyGoal: `@forma_weekly_exercise_goal_${userId}`,
});

// Helper to sync workout to fitness apps
const syncWorkoutToFitnessApps = async (workout: Workout): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      const healthKitEnabled = await isHealthKitEnabled();
      const exerciseSyncEnabled = await isExerciseSyncEnabled();

      if (healthKitEnabled && exerciseSyncEnabled) {
        const startTime = new Date(workout.startTime);
        const endTime = workout.endTime ? new Date(workout.endTime) : undefined;

        await syncWorkoutToHealthKit(
          workout.totalCaloriesBurned,
          workout.totalDuration,
          workout.name,
          startTime,
          endTime
        );
        console.log('✅ Workout synced to Apple Health');
      }
    } else if (Platform.OS === 'android') {
      const googleFitEnabled = await isGoogleFitEnabled();
      const exerciseSyncEnabled = await isGoogleFitExerciseSyncEnabled();

      if (googleFitEnabled && exerciseSyncEnabled) {
        const startTime = new Date(workout.startTime);
        const endTime = workout.endTime ? new Date(workout.endTime) : undefined;

        await syncWorkoutToGoogleFit(
          workout.totalCaloriesBurned,
          workout.totalDuration,
          workout.name,
          startTime,
          endTime
        );
        console.log('✅ Workout synced to Google Fit');
      }
    }
  } catch (error) {
    console.error('Error syncing workout to fitness apps:', error);
    // Don't throw - syncing is optional
  }
};

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  workouts: [],
  dailySummary: null,
  currentUserId: null,
  activeWorkout: null,
  weeklyGoal: 150, // Default: 150 minutes per week (WHO recommendation)
  steps: 0,
  stepGoal: 10000,

  initialize: async (userId: string) => {
    try {
      const keys = getStorageKeys(userId);

      // Load workouts
      const storedWorkouts = await AsyncStorage.getItem(keys.workouts);
      const workouts = storedWorkouts ? JSON.parse(storedWorkouts) : [];

      // Load weekly goal
      const storedGoal = await AsyncStorage.getItem(keys.weeklyGoal);
      const weeklyGoal = storedGoal ? parseInt(storedGoal) : 150;

      set({
        workouts,
        weeklyGoal,
        currentUserId: userId,
        activeWorkout: null,
      });

      get().updateDailySummary();
      get().syncSteps();
      console.log('✅ Exercise store initialized with', workouts.length, 'workouts');
    } catch (error) {
      console.error('Error initializing exercise store:', error);
    }
  },

  clearData: async () => {
    set({
      workouts: [],
      dailySummary: null,
      activeWorkout: null,
    });
  },

  startWorkout: (name?: string) => {
    const now = new Date();
    const workout: Workout = {
      id: `workout-${Date.now()}`,
      name: name || `Workout ${now.toLocaleDateString()}`,
      exercises: [],
      startTime: now.toISOString(),
      totalDuration: 0,
      totalCaloriesBurned: 0,
      timestamp: now.toISOString(),
    };

    set({ activeWorkout: workout });
    console.log('🏋️ Workout started:', workout.name);
  },

  addExerciseToWorkout: (exercise: WorkoutExercise) => {
    const { activeWorkout } = get();
    if (!activeWorkout) {
      console.warn('No active workout to add exercise to');
      return;
    }

    const updatedWorkout = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, exercise],
      totalDuration: activeWorkout.totalDuration + exercise.duration,
      totalCaloriesBurned: activeWorkout.totalCaloriesBurned + exercise.caloriesBurned,
    };

    set({ activeWorkout: updatedWorkout });
    console.log('➕ Exercise added:', exercise.exercise.name);
  },

  removeExerciseFromWorkout: (exerciseId: string) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exerciseToRemove = activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!exerciseToRemove) return;

    const updatedWorkout = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter(e => e.id !== exerciseId),
      totalDuration: activeWorkout.totalDuration - exerciseToRemove.duration,
      totalCaloriesBurned: activeWorkout.totalCaloriesBurned - exerciseToRemove.caloriesBurned,
    };

    set({ activeWorkout: updatedWorkout });
  },

  endWorkout: async () => {
    const { activeWorkout, workouts, currentUserId } = get();
    if (!activeWorkout || !currentUserId) {
      console.warn('No active workout to end');
      return;
    }

    const now = new Date();
    const completedWorkout: Workout = {
      ...activeWorkout,
      endTime: now.toISOString(),
    };

    const updatedWorkouts = [...workouts, completedWorkout];

    // Persist
    const keys = getStorageKeys(currentUserId);
    await AsyncStorage.setItem(keys.workouts, JSON.stringify(updatedWorkouts));

    set({
      workouts: updatedWorkouts,
      activeWorkout: null,
    });

    get().updateDailySummary();
    console.log('✅ Workout completed:', completedWorkout.name);

    // Sync to fitness apps (Apple Health / Google Fit)
    await syncWorkoutToFitnessApps(completedWorkout);
  },

  cancelWorkout: () => {
    set({ activeWorkout: null });
    console.log('❌ Workout cancelled');
  },

  logWorkout: async (workout: Workout) => {
    const { workouts, currentUserId } = get();
    if (!currentUserId) return;

    const updatedWorkouts = [...workouts, workout];

    // Persist
    const keys = getStorageKeys(currentUserId);
    await AsyncStorage.setItem(keys.workouts, JSON.stringify(updatedWorkouts));

    set({ workouts: updatedWorkouts });
    get().updateDailySummary();
    console.log('📝 Workout logged:', workout.name);

    // Sync to fitness apps (Apple Health / Google Fit)
    await syncWorkoutToFitnessApps(workout);
  },

  deleteWorkout: async (workoutId: string) => {
    const { workouts, currentUserId } = get();
    if (!currentUserId) return;

    const updatedWorkouts = workouts.filter(w => w.id !== workoutId);

    // Persist
    const keys = getStorageKeys(currentUserId);
    await AsyncStorage.setItem(keys.workouts, JSON.stringify(updatedWorkouts));

    set({ workouts: updatedWorkouts });
    get().updateDailySummary();
    console.log('🗑️ Workout deleted:', workoutId);
  },

  updateDailySummary: () => {
    const { workouts } = get();
    const today = getLocalDateString();

    const todayWorkouts = workouts.filter(w =>
      getLocalDateString(new Date(w.timestamp)) === today
    );

    const summary: DailyExerciseSummary = {
      date: today,
      workouts: todayWorkouts,
      totalCaloriesBurned: todayWorkouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0),
      totalDuration: todayWorkouts.reduce((sum, w) => sum + w.totalDuration, 0),
      exerciseCount: todayWorkouts.reduce((sum, w) => sum + w.exercises.length, 0),
    };

    set({ dailySummary: summary });
  },

  getWeeklySummary: () => {
    const { workouts } = get();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekWorkouts = workouts.filter(w =>
      new Date(w.timestamp) >= weekAgo
    );

    return {
      totalMinutes: weekWorkouts.reduce((sum, w) => sum + w.totalDuration, 0),
      totalCalories: weekWorkouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0),
      workoutCount: weekWorkouts.length,
    };
  },

  setWeeklyGoal: async (minutes: number) => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    const keys = getStorageKeys(currentUserId);
    await AsyncStorage.setItem(keys.weeklyGoal, minutes.toString());

    set({ weeklyGoal: minutes });
    console.log('🎯 Weekly goal set:', minutes, 'minutes');
  },

  syncSteps: async () => {
    if (Platform.OS !== 'ios') return;

    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const steps = await readStepCount(startOfToday, now);
      set({ steps });
      console.log('👟 Steps synced:', steps);
    } catch (error) {
      console.error('Error syncing steps:', error);
    }
  },

  setStepGoal: async (goal: number) => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    // In a real app we'd also persist this
    set({ stepGoal: goal });
    console.log('🎯 Step goal set:', goal);
  },
}));

