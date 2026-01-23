// AI Insights Service
// Generates personalized nutrition tips and reminders based on user data

import { Meal } from '../types/meal.types';
import { DailyGoals } from '../store/useMealStore';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'tip' | 'motivation';
  icon: string;
  title: string;
  message: string;
  priority: number; // 1-10, higher = more important
  actionable?: boolean;
  action?: {
    label: string;
    navigateTo: string;
    params?: Record<string, any>;
  };
}

interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  meals: Meal[];
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const getGreeting = (): string => {
  const timeOfDay = getTimeOfDay();
  switch (timeOfDay) {
    case 'morning': return 'Good morning';
    case 'afternoon': return 'Good afternoon';
    case 'evening': return 'Good evening';
    case 'night': return 'Hey there';
  }
};

// Generate insights based on current nutrition data
export const generateInsights = (
  todayMeals: Meal[],
  goals: DailyGoals | null | undefined,
  weeklyMeals?: Meal[],
  currentWeight?: number,
  targetWeight?: number
): Insight[] => {
  const insights: Insight[] = [];
  const timeOfDay = getTimeOfDay();

  // Default goals if not provided
  const safeGoals = goals || { calorieGoal: 2000, proteinGoal: 150, carbsGoal: 250, fatGoal: 65 };
  const safeMeals = todayMeals || [];

  // Calculate today's totals
  const summary: NutritionSummary = {
    calories: safeMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0),
    protein: safeMeals.reduce((sum, m) => sum + (m.totalProtein || 0), 0),
    carbs: safeMeals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0),
    fat: safeMeals.reduce((sum, m) => sum + (m.totalFat || 0), 0),
    mealCount: safeMeals.length,
    meals: safeMeals,
  };

  // Calculate percentages
  const caloriePercent = safeGoals.calorieGoal > 0 ? (summary.calories / safeGoals.calorieGoal) * 100 : 0;
  const proteinPercent = safeGoals.proteinGoal > 0 ? (summary.protein / safeGoals.proteinGoal) * 100 : 0;
  const carbsPercent = safeGoals.carbsGoal > 0 ? (summary.carbs / safeGoals.carbsGoal) * 100 : 0;
  const fatPercent = safeGoals.fatGoal > 0 ? (summary.fat / safeGoals.fatGoal) * 100 : 0;

  // Remaining
  const caloriesRemaining = Math.max(0, safeGoals.calorieGoal - summary.calories);
  const proteinRemaining = Math.max(0, safeGoals.proteinGoal - summary.protein);

  // === MORNING INSIGHTS ===
  if (timeOfDay === 'morning') {
    if (summary.mealCount === 0) {
      insights.push({
        id: 'morning-start',
        type: 'tip',
        icon: '🌅',
        title: `${getGreeting()}!`,
        message: "Start your day right! A protein-rich breakfast can boost your metabolism and keep you full longer.",
        priority: 8,
      });
    } else if (summary.protein < 20) {
      insights.push({
        id: 'morning-protein',
        type: 'tip',
        icon: '🥚',
        title: 'Boost Your Morning Protein',
        message: "Adding eggs, Greek yogurt, or a protein shake to breakfast helps control hunger throughout the day.",
        priority: 6,
      });
    }
  }

  // === PROGRESS INSIGHTS ===

  // Protein progress
  if (proteinPercent >= 45 && proteinPercent < 55) {
    insights.push({
      id: 'protein-halfway',
      type: 'success',
      icon: '💪',
      title: "Halfway to Protein Goal!",
      message: `You've hit ${Math.round(summary.protein)}g of protein. ${Math.round(proteinRemaining)}g more to reach your ${safeGoals.proteinGoal}g goal!`,
      priority: 7,
      actionable: true,
      action: {
        label: 'Find High-Protein Foods',
        navigateTo: 'FoodSearch',
        params: { query: 'high protein' },
      },
    });
  } else if (proteinPercent >= 80 && proteinPercent < 100) {
    insights.push({
      id: 'protein-almost',
      type: 'success',
      icon: '🎯',
      title: 'Almost at Protein Goal!',
      message: `Just ${Math.round(proteinRemaining)}g more protein to hit your daily goal. A small snack can get you there!`,
      priority: 8,
      actionable: true,
      action: {
        label: 'Find Protein Snacks',
        navigateTo: 'FoodSearch',
        params: { query: 'protein snack' },
      },
    });
  } else if (proteinPercent >= 100) {
    insights.push({
      id: 'protein-complete',
      type: 'success',
      icon: '🏆',
      title: 'Protein Goal Achieved!',
      message: `Amazing! You've hit ${Math.round(summary.protein)}g of protein today. Great job fueling your body!`,
      priority: 9,
    });
  } else if (timeOfDay === 'evening' && proteinPercent < 50) {
    insights.push({
      id: 'protein-low-evening',
      type: 'warning',
      icon: '⚠️',
      title: 'Protein Running Low',
      message: `You're at ${Math.round(proteinPercent)}% of your protein goal. Consider a protein-rich dinner to catch up!`,
      priority: 7,
      actionable: true,
      action: {
        label: 'Find High-Protein Meals',
        navigateTo: 'FoodSearch',
        params: { query: 'high protein dinner' },
      },
    });
  }

  // Calorie insights
  if (caloriePercent >= 45 && caloriePercent < 55) {
    insights.push({
      id: 'calories-halfway',
      type: 'tip',
      icon: '⚡',
      title: 'Halfway There!',
      message: `You've consumed ${Math.round(summary.calories)} calories. ${Math.round(caloriesRemaining)} remaining for today.`,
      priority: 5,
    });
  }

  // Over calorie budget
  if (caloriePercent > 100 && caloriePercent <= 115) {
    insights.push({
      id: 'calories-over-slight',
      type: 'tip',
      icon: '💡',
      title: 'Slightly Over Budget',
      message: "You're a bit over your calorie goal. Consider a lighter dinner or a short walk to balance it out!",
      priority: 6,
    });
  } else if (caloriePercent > 115) {
    insights.push({
      id: 'calories-over',
      type: 'warning',
      icon: '📊',
      title: 'Over Calorie Goal',
      message: `You're ${Math.round(caloriePercent - 100)}% over your calorie target. Tomorrow is a fresh start!`,
      priority: 5,
    });
  }

  // Heavy lunch suggestion
  if (timeOfDay === 'afternoon' || timeOfDay === 'evening') {
    const lunchMeals = todayMeals.filter(m => {
      const hour = new Date(m.timestamp).getHours();
      return hour >= 11 && hour <= 14;
    });
    const lunchCalories = lunchMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);

    if (lunchCalories > safeGoals.calorieGoal * 0.45) {
      insights.push({
        id: 'heavy-lunch',
        type: 'tip',
        icon: '🥗',
        title: 'Balance Your Dinner',
        message: `Your lunch was ${Math.round(lunchCalories)} calories. Consider a lighter, veggie-focused dinner to stay on track.`,
        priority: 7,
      });
    }
  }

  // === EVENING INSIGHTS ===
  if (timeOfDay === 'evening' || timeOfDay === 'night') {
    if (caloriesRemaining > 0 && caloriesRemaining < 300) {
      insights.push({
        id: 'evening-snack',
        type: 'tip',
        icon: '🍎',
        title: 'Room for a Light Snack',
        message: `You have ${Math.round(caloriesRemaining)} calories left. A healthy snack like fruit or nuts would fit perfectly!`,
        priority: 5,
      });
    }

    if (summary.mealCount >= 3 && caloriePercent >= 90 && caloriePercent <= 105) {
      insights.push({
        id: 'great-day',
        type: 'success',
        icon: '⭐',
        title: 'Great Day!',
        message: "You're right on track with your nutrition goals today. Keep up the excellent work!",
        priority: 9,
      });
    }
  }

  // === HYDRATION REMINDER ===
  const hour = new Date().getHours();
  if ((hour === 10 || hour === 14 || hour === 16) && Math.random() > 0.5) {
    insights.push({
      id: 'hydration',
      type: 'tip',
      icon: '💧',
      title: 'Stay Hydrated!',
      message: "Don't forget to drink water! Staying hydrated helps with energy and can reduce cravings.",
      priority: 4,
    });
  }

  // === MEAL TIMING ===
  if (summary.mealCount > 0) {
    const lastMeal = todayMeals.reduce((latest, meal) =>
      new Date(meal.timestamp) > new Date(latest.timestamp) ? meal : latest
    );
    const hoursSinceLastMeal = (Date.now() - new Date(lastMeal.timestamp).getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastMeal > 5 && timeOfDay !== 'night') {
      insights.push({
        id: 'meal-timing',
        type: 'tip',
        icon: '⏰',
        title: 'Time for a Meal?',
        message: `It's been ${Math.round(hoursSinceLastMeal)} hours since your last meal. Regular eating helps maintain energy levels.`,
        priority: 6,
      });
    }
  }

  // === MACRO BALANCE ===
  if (summary.mealCount >= 2) {
    const totalMacros = summary.protein + summary.carbs + summary.fat;
    if (totalMacros > 0) {
      const proteinRatio = summary.protein / totalMacros;
      const carbRatio = summary.carbs / totalMacros;
      const fatRatio = summary.fat / totalMacros;

      if (carbRatio > 0.6) {
        insights.push({
          id: 'high-carbs',
          type: 'tip',
          icon: '🍞',
          title: 'Carb-Heavy Day',
          message: "Your meals today are high in carbs. Try adding more protein and healthy fats for better satiety.",
          priority: 5,
        });
      } else if (fatRatio > 0.45) {
        insights.push({
          id: 'high-fat',
          type: 'tip',
          icon: '🥑',
          title: 'High Fat Intake',
          message: "Today's meals are fat-heavy. Balance with lean proteins and complex carbs for your next meal.",
          priority: 5,
        });
      }
    }
  }

  // === WEEKLY TRENDS & PATTERN RECOGNITION ===
  if (weeklyMeals && weeklyMeals.length > 0) {
    const weeklyCalories = weeklyMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
    const weeklyProtein = weeklyMeals.reduce((sum, m) => sum + (m.totalProtein || 0), 0);
    const avgDailyCalories = weeklyCalories / 7;
    const avgDailyProtein = weeklyProtein / 7;

    // Group meals by day of week
    const mealsByDay: { [key: number]: Meal[] } = {};
    weeklyMeals.forEach(meal => {
      const dayOfWeek = new Date(meal.timestamp).getDay(); // 0 = Sunday
      if (!mealsByDay[dayOfWeek]) {
        mealsByDay[dayOfWeek] = [];
      }
      mealsByDay[dayOfWeek].push(meal);
    });

    // Check for weekend pattern (Saturday = 6, Sunday = 0)
    const weekendMeals = [...(mealsByDay[0] || []), ...(mealsByDay[6] || [])];
    if (weekendMeals.length >= 4) {
      const weekendCalories = weekendMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
      const avgWeekendCalories = weekendCalories / 2;

      const weekdayMeals = weeklyMeals.filter(m => {
        const day = new Date(m.timestamp).getDay();
        return day >= 1 && day <= 5;
      });
      const weekdayCalories = weekdayMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
      const avgWeekdayCalories = weekdayCalories / 5;

      if (avgWeekendCalories > avgWeekdayCalories * 1.2) {
        insights.push({
          id: 'weekend-pattern',
          type: 'tip',
          icon: '📅',
          title: 'Weekend Eating Pattern',
          message: `You tend to eat ${Math.round(((avgWeekendCalories - avgWeekdayCalories) / avgWeekdayCalories) * 100)}% more on weekends. Try planning a healthy, enjoyable meal for Saturday night!`,
          priority: 7,
          actionable: true,
          action: {
            label: 'Plan Weekend Meals',
            navigateTo: 'RecipeList',
          },
        });
      }
    }

    // Consistent protein achievement
    if (avgDailyProtein >= safeGoals.proteinGoal * 0.9) {
      insights.push({
        id: 'protein-consistent',
        type: 'success',
        icon: '💎',
        title: 'Protein Consistency!',
        message: `Your protein intake has been consistently high this week (avg ${Math.round(avgDailyProtein)}g/day). Great job fueling your muscles!`,
        priority: 7,
      });
    }

    // Under-eating pattern
    if (avgDailyCalories < safeGoals.calorieGoal * 0.8) {
      insights.push({
        id: 'weekly-under',
        type: 'warning',
        icon: '📈',
        title: 'Weekly Calorie Trend',
        message: `You're averaging ${Math.round(avgDailyCalories)} cal/day this week, below your ${safeGoals.calorieGoal} goal. Make sure you're eating enough!`,
        priority: 6,
      });
    }

    // Great week pattern
    const daysOnTrack = Object.keys(mealsByDay).filter(day => {
      const dayMeals = mealsByDay[parseInt(day)];
      const dayCalories = dayMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
      return Math.abs(dayCalories - safeGoals.calorieGoal) <= safeGoals.calorieGoal * 0.15;
    }).length;

    if (daysOnTrack >= 5) {
      insights.push({
        id: 'great-week',
        type: 'success',
        icon: '🌟',
        title: 'Outstanding Week!',
        message: `You hit your calorie goal ${daysOnTrack} out of 7 days this week. You're building incredible habits!`,
        priority: 9,
      });
    }
  }

  // === WEIGHT GOAL ===
  if (currentWeight && targetWeight) {
    const diff = currentWeight - targetWeight;
    if (Math.abs(diff) < 2) {
      insights.push({
        id: 'weight-close',
        type: 'success',
        icon: '🎉',
        title: 'Almost at Goal Weight!',
        message: `You're just ${Math.abs(diff).toFixed(1)}kg from your target! Stay consistent and you'll reach it soon.`,
        priority: 8,
      });
    }
  }

  // === NO MEALS YET (afternoon/evening) ===
  if (summary.mealCount === 0 && (timeOfDay === 'afternoon' || timeOfDay === 'evening')) {
    insights.push({
      id: 'no-meals',
      type: 'warning',
      icon: '🍽️',
      title: 'No Meals Logged Yet',
      message: "Don't forget to log your meals! Tracking helps you stay aware of your nutrition.",
      priority: 8,
      actionable: true,
      action: {
        label: 'Log a Meal',
        navigateTo: 'Camera',
      },
    });
  }

  // Sort by priority (highest first) and limit to top insights
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3);
};

// Generate a quick tip for notifications
export const getNotificationTip = (
  todayMeals: Meal[],
  goals: DailyGoals | null | undefined
): { title: string; body: string } | null => {
  const hour = new Date().getHours();

  // Default goals if not provided
  const safeGoals = goals || { calorieGoal: 2000, proteinGoal: 150, carbsGoal: 250, fatGoal: 65 };
  const safeMeals = todayMeals || [];

  const summary = {
    calories: safeMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0),
    protein: safeMeals.reduce((sum, m) => sum + (m.totalProtein || 0), 0),
    mealCount: safeMeals.length,
  };

  const caloriePercent = safeGoals.calorieGoal > 0 ? (summary.calories / safeGoals.calorieGoal) * 100 : 0;
  const proteinPercent = safeGoals.proteinGoal > 0 ? (summary.protein / safeGoals.proteinGoal) * 100 : 0;

  // Morning reminder (8-9 AM)
  if (hour >= 8 && hour <= 9 && summary.mealCount === 0) {
    return {
      title: "Good morning! 🌅",
      body: "Start your day with a healthy breakfast. Log your first meal to stay on track!",
    };
  }

  // Lunch reminder (12-1 PM)
  if (hour >= 12 && hour <= 13 && caloriePercent < 30) {
    return {
      title: "Lunchtime! 🍽️",
      body: "You've logged less than 30% of your daily calories. Time for a nutritious lunch!",
    };
  }

  // Afternoon protein check (3-4 PM)
  if (hour >= 15 && hour <= 16 && proteinPercent < 50) {
    return {
      title: "Protein Check 💪",
      body: `You're at ${Math.round(proteinPercent)}% of your protein goal. Consider a protein-rich snack!`,
    };
  }

  // Evening summary (7-8 PM)
  if (hour >= 19 && hour <= 20) {
    if (caloriePercent >= 90 && caloriePercent <= 110) {
      return {
        title: "Great job today! ⭐",
        body: "You're right on track with your calorie goal. Keep up the excellent work!",
      };
    } else if (caloriePercent < 70) {
      return {
        title: "Room for dinner! 🥗",
        body: `You have ${Math.round(safeGoals.calorieGoal - summary.calories)} calories remaining. Enjoy a balanced dinner!`,
      };
    }
  }

  return null;
};

// Generate immediate feedback after logging a meal
export const getPostMealFeedback = (meal: Meal, dailyGoals: DailyGoals): Insight | null => {
  const insights: Insight[] = [];

  const mealCalories = meal.totalCalories;
  const mealProtein = meal.totalProtein;
  const mealCarbs = meal.totalCarbs;
  const mealFat = meal.totalFat;

  // Calculate macro ratios
  const totalMacros = mealProtein + mealCarbs + mealFat;
  if (totalMacros === 0) return null;

  const proteinRatio = mealProtein / totalMacros;
  const carbRatio = mealCarbs / totalMacros;
  const fatRatio = mealFat / totalMacros;

  // High protein meal
  if (proteinRatio > 0.35 || mealProtein > 30) {
    insights.push({
      id: 'post-meal-protein',
      type: 'success',
      icon: '💪',
      title: 'Great Choice!',
      message: `That meal is packed with ${Math.round(mealProtein)}g of protein to keep you full and support your muscles!`,
      priority: 8,
    });
  }

  // Balanced meal
  if (proteinRatio >= 0.25 && proteinRatio <= 0.35 && carbRatio >= 0.3 && carbRatio <= 0.5 && fatRatio >= 0.2 && fatRatio <= 0.35) {
    insights.push({
      id: 'post-meal-balanced',
      type: 'success',
      icon: '⚖️',
      title: 'Perfectly Balanced!',
      message: 'This meal has a great balance of protein, carbs, and healthy fats. Excellent choice!',
      priority: 7,
    });
  }

  // High carb meal (could be pre-workout or dessert)
  if (carbRatio > 0.6) {
    if (mealCarbs > 50) {
      insights.push({
        id: 'post-meal-carbs',
        type: 'tip',
        icon: '🍞',
        title: 'Carb-Heavy Meal',
        message: `This meal is high in carbs (${Math.round(mealCarbs)}g). Great for energy! Balance your next meal with more protein and veggies.`,
        priority: 6,
      });
    }
  }

  // High fat meal
  if (fatRatio > 0.45) {
    insights.push({
      id: 'post-meal-fat',
      type: 'tip',
      icon: '🥑',
      title: 'Fat-Rich Meal',
      message: 'This meal is high in fats. Healthy fats are great, but try adding lean protein to your next meal!',
      priority: 5,
    });
  }

  // High calorie meal
  if (mealCalories > dailyGoals.calorieGoal * 0.4) {
    insights.push({
      id: 'post-meal-calories',
      type: 'tip',
      icon: '🔥',
      title: 'Big Meal!',
      message: `That was a ${Math.round(mealCalories)} calorie meal! Consider lighter options for your remaining meals today.`,
      priority: 6,
    });
  }

  // Low calorie but nutritious
  if (mealCalories < 300 && mealProtein > 15) {
    insights.push({
      id: 'post-meal-light',
      type: 'success',
      icon: '🌱',
      title: 'Light & Nutritious!',
      message: 'A perfectly portioned, protein-rich meal. Great for staying on track!',
      priority: 7,
    });
  }

  // Sweet treat detection (high carb, low protein)
  if (carbRatio > 0.7 && proteinRatio < 0.1 && mealCarbs > 30) {
    insights.push({
      id: 'post-meal-sweet',
      type: 'tip',
      icon: '🍰',
      title: 'Sweet Treat!',
      message: 'Enjoyed a sweet treat! Remember to balance it out with protein and veggies in your next meal.',
      priority: 6,
    });
  }

  // Return highest priority insight, or null
  if (insights.length === 0) return null;
  return insights.sort((a, b) => b.priority - a.priority)[0];
};

// Motivational quotes for variety
export const getMotivationalQuote = (): Insight => {
  const quotes = [
    { icon: '🌟', message: "Small steps lead to big changes. Keep going!" },
    { icon: '💪', message: "Every healthy choice is a victory. Celebrate your progress!" },
    { icon: '🎯', message: "Consistency beats perfection. You're doing great!" },
    { icon: '🌱', message: "Nourish your body, it's the only place you have to live." },
    { icon: '⚡', message: "Energy comes from good food choices. Fuel yourself well!" },
    { icon: '🏃', message: "Progress, not perfection. Every day is a new opportunity!" },
    { icon: '❤️', message: "Taking care of yourself is the best investment you can make." },
    { icon: '🌈', message: "Balance is key. Enjoy the journey to better health!" },
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    id: 'motivation',
    type: 'motivation',
    icon: quote.icon,
    title: 'Daily Motivation',
    message: quote.message,
    priority: 3,
  };
};

