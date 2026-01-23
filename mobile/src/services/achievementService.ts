// Achievement Service
// Checks and awards badges based on user progress

import { Meal, DailySummary } from '../types/meal.types';
import { badges } from '../config/badgeData';
import { useAchievementStore } from '../store/useAchievementStore';
import { useProgressStore } from '../store/useProgressStore';
import { useMealStore } from '../store/useMealStore';

interface BadgeCheckResult {
  badgeId: string;
  earned: boolean;
  message: string;
}

/**
 * Check if user has earned any new badges and award them
 * This should be called after key actions: meal logging, goal achievement, etc.
 */
export const checkAndAwardBadges = async (): Promise<BadgeCheckResult[]> => {
  const achievementStore = useAchievementStore.getState();
  const progressStore = useProgressStore.getState();
  const mealStore = useMealStore.getState();

  const newBadges: BadgeCheckResult[] = [];

  // Get current user stats
  const streak = progressStore.streak;
  const meals = mealStore.meals;
  const totalMeals = meals.length;

  // Count photo and voice logs
  const photoLogs = meals.filter(m => m.logType === 'photo').length;
  const voiceLogs = meals.filter(m => m.logType === 'voice').length;

  // Count goal hits
  const calorieGoal = mealStore.calorieGoal;
  let goalHits = 0;
  let consecutiveGoalHits = 0;
  let currentConsecutive = 0;

  // Group meals by date and check goal achievement
  const mealsByDate: { [date: string]: Meal[] } = {};
  meals.forEach(meal => {
    const date = meal.timestamp.split('T')[0];
    if (!mealsByDate[date]) {
      mealsByDate[date] = [];
    }
    mealsByDate[date].push(meal);
  });

  const sortedDates = Object.keys(mealsByDate).sort();
  let lastDate = '';

  sortedDates.forEach(date => {
    const dayMeals = mealsByDate[date];
    const dayCalories = dayMeals.reduce((sum, m) => sum + m.totalCalories, 0);

    if (Math.abs(dayCalories - calorieGoal) <= calorieGoal * 0.1) {
      // Within 10% of goal
      goalHits++;

      // Check if consecutive
      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const currentDateObj = new Date(date);
        const dayDiff = Math.floor(
          (currentDateObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff === 1) {
          currentConsecutive++;
        } else {
          consecutiveGoalHits = Math.max(consecutiveGoalHits, currentConsecutive);
          currentConsecutive = 1;
        }
      } else {
        currentConsecutive = 1;
      }
    } else {
      consecutiveGoalHits = Math.max(consecutiveGoalHits, currentConsecutive);
      currentConsecutive = 0;
    }

    lastDate = date;
  });
  consecutiveGoalHits = Math.max(consecutiveGoalHits, currentConsecutive);

  // Check each badge
  for (const badge of Object.values(badges)) {
    // Skip if already earned
    if (achievementStore.hasBadge(badge.id)) {
      continue;
    }

    let earned = false;

    switch (badge.requirement.type) {
      case 'streak':
        earned = streak >= badge.requirement.value;
        break;
      case 'total_logs':
        earned = totalMeals >= badge.requirement.value;
        break;
      case 'photo_logs':
        earned = photoLogs >= badge.requirement.value;
        break;
      case 'voice_logs':
        earned = voiceLogs >= badge.requirement.value;
        break;
      case 'goal_hits':
        earned = goalHits >= badge.requirement.value;
        break;
      case 'consecutive_goal_hits':
        earned = consecutiveGoalHits >= badge.requirement.value;
        break;
    }

    if (earned) {
      await achievementStore.addEarnedBadge(badge.id);
      newBadges.push({
        badgeId: badge.id,
        earned: true,
        message: `${badge.icon} ${badge.name} - ${badge.description}`,
      });
    }
  }

  return newBadges;
};

/**
 * Get progress towards a specific badge
 */
export const getBadgeProgress = (badgeId: string): { current: number; required: number; percentage: number } => {
  const badge = badges[badgeId];
  if (!badge) {
    return { current: 0, required: 0, percentage: 0 };
  }

  const progressStore = useProgressStore.getState();
  const mealStore = useMealStore.getState();
  const meals = mealStore.meals;

  let current = 0;
  const required = badge.requirement.value;

  switch (badge.requirement.type) {
    case 'streak':
      current = progressStore.streak;
      break;
    case 'total_logs':
      current = meals.length;
      break;
    case 'photo_logs':
      current = meals.filter(m => m.logType === 'photo').length;
      break;
    case 'voice_logs':
      current = meals.filter(m => m.logType === 'voice').length;
      break;
    case 'goal_hits':
    case 'consecutive_goal_hits':
      // Would need to calculate, skip for now
      current = 0;
      break;
  }

  const percentage = Math.min(100, Math.round((current / required) * 100));

  return { current, required, percentage };
};
