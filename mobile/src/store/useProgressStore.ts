// Progress Store
// Manages weight tracking, streaks, and historical data

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealStore } from './useMealStore';
import { writeWeight } from '../services/healthKitService';
import { isHealthKitEnabled, isWeightSyncEnabled } from '../utils/healthKitSettings';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getLocalDateString } from '../utils/dateUtils';

export interface WeightEntry {
  id: string;
  date: string; // ISO date string
  weight_kg: number;
  notes?: string;
}

export interface WeeklySummary {
  weekStart: string; // ISO date string
  weekEnd: string;
  totalCalories: number;
  avgDailyCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  daysLogged: number;
}

interface ProgressState {
  weightEntries: WeightEntry[];
  streak: number;
  lastLoggedDate: string | null;
  currentUserId: string | null;

  // Actions
  addWeightEntry: (weight_kg: number, notes?: string) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  getWeightEntries: (days?: number) => WeightEntry[];
  getWeeklySummaries: (weeks?: number) => WeeklySummary[];
  calculateStreak: () => number;
  getDailyCalories: (date: string) => number;
  initialize: (userId: string) => Promise<void>;
  clearData: () => Promise<void>;
}

const getStorageKeys = (userId: string) => ({
  weightEntries: `@nutrisnap_weight_entries_${userId}`,
  lastLogged: `@nutrisnap_last_logged_date_${userId}`,
});

export const useProgressStore = create<ProgressState>((set, get) => ({
  weightEntries: [],
  streak: 0,
  lastLoggedDate: null,
  currentUserId: null,

  addWeightEntry: async (weight_kg: number, notes?: string) => {
    const entry: WeightEntry = {
      id: `weight-${Date.now()}`,
      date: getLocalDateString(), // Local YYYY-MM-DD
      weight_kg,
      notes,
    };

    const updatedEntries = [...get().weightEntries, entry].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    set({ weightEntries: updatedEntries });

    // Update streak
    const streak = get().calculateStreak();
    set({ streak });

    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        await AsyncStorage.setItem(keys.weightEntries, JSON.stringify(updatedEntries));

        // Sync to Firestore
        await setDoc(doc(db, 'users', userId, 'data', 'progress'), {
          weightEntries: updatedEntries,
          streak: get().streak,
          lastLoggedDate: getLocalDateString(),
        });
      } catch (error) {
        console.error('Failed to save weight entry to Firestore:', error);
      }
    }

    // Sync to HealthKit if enabled
    try {
      const healthKitEnabled = await isHealthKitEnabled();
      const weightSyncEnabled = await isWeightSyncEnabled();

      if (healthKitEnabled && weightSyncEnabled) {
        await writeWeight(weight_kg, new Date());
        console.log('Weight synced to HealthKit');
      }
    } catch (error) {
      console.error('Failed to sync weight to HealthKit:', error);
      // Don't throw - we don't want to block the weight entry if HealthKit sync fails
    }
  },

  deleteWeightEntry: async (id: string) => {
    const updatedEntries = get().weightEntries.filter(entry => entry.id !== id);
    set({ weightEntries: updatedEntries });

    // Recalculate streak
    const streak = get().calculateStreak();
    set({ streak });

    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        await AsyncStorage.setItem(keys.weightEntries, JSON.stringify(updatedEntries));

        // Sync to Firestore
        await setDoc(doc(db, 'users', userId, 'data', 'progress'), {
          weightEntries: updatedEntries,
          streak: get().streak,
        }, { merge: true });
      } catch (error) {
        console.error('Failed to delete weight entry:', error);
      }
    }
  },

  getWeightEntries: (days: number = 30) => {
    const entries = get().weightEntries;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  },

  getWeeklySummaries: (weeks: number = 4) => {
    const summaries: WeeklySummary[] = [];
    const today = new Date();

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get meals for this week
      const meals = useMealStore.getState().meals;
      const weekMeals = meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate >= weekStart && mealDate <= weekEnd;
      });

      const totalCalories = weekMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
      const totalProtein = weekMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
      const totalCarbs = weekMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
      const totalFat = weekMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

      // Count unique days with meals
      const uniqueDays = new Set(
        weekMeals.map(meal => getLocalDateString(new Date(meal.timestamp)))
      ).size;

      summaries.push({
        weekStart: getLocalDateString(weekStart),
        weekEnd: getLocalDateString(weekEnd),
        totalCalories,
        avgDailyCalories: uniqueDays > 0 ? Math.round(totalCalories / uniqueDays) : 0,
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat),
        daysLogged: uniqueDays,
      });
    }

    return summaries; // Current week is at index 0
  },

  calculateStreak: () => {
    const meals = useMealStore.getState().meals;
    if (meals.length === 0) return 0;

    // Get unique dates with meals (YYYY-MM-DD), sorted descending
    const datesWithMeals = Array.from(
      new Set(meals.map(meal => getLocalDateString(new Date(meal.timestamp))))
    ).sort((a, b) => b.localeCompare(a));

    if (datesWithMeals.length === 0) return 0;

    const today = getLocalDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getLocalDateString(yesterdayDate);

    // If most recent log is NOT today AND NOT yesterday, streak is broken
    if (datesWithMeals[0] !== today && datesWithMeals[0] !== yesterday) {
      return 0;
    }

    // Count consecutive days starting from the most recent log
    let streak = 0;
    let checkDate = new Date(datesWithMeals[0] + 'T12:00:00');

    while (true) {
      const dateStr = getLocalDateString(checkDate);
      if (datesWithMeals.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  getDailyCalories: (date: string) => {
    const meals = useMealStore.getState().meals;
    const dayMeals = meals.filter(meal => getLocalDateString(new Date(meal.timestamp)) === date);
    return dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  },

  initialize: async (userId: string) => {
    try {
      set({ currentUserId: userId });
      const keys = getStorageKeys(userId);

      const weightEntriesStr = await AsyncStorage.getItem(keys.weightEntries);
      let localEntries = [];
      if (weightEntriesStr) {
        localEntries = JSON.parse(weightEntriesStr);
      }

      // Try to sync with Firestore
      try {
        if (!userId) return;

        const progressDoc = await getDoc(doc(db, 'users', userId, 'data', 'progress'));
        if (progressDoc.exists()) {
          const remoteEntries = progressDoc.data().weightEntries || [];
          // Merge logic: use remote if it has more or equal entries
          if (remoteEntries.length >= localEntries.length) {
            localEntries = remoteEntries;
            await AsyncStorage.setItem(keys.weightEntries, JSON.stringify(localEntries));
          }
        }
      } catch (error) {
        console.warn('Failed to load progress from Firestore:', error);
      }

      set({ weightEntries: localEntries });

      // Calculate initial streak
      const streak = get().calculateStreak();
      set({ streak });
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  },

  clearData: async () => {
    set({
      weightEntries: [],
      streak: 0,
      lastLoggedDate: null,
      currentUserId: null,
    });
  },
}));

