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
  action?: string;
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
  const safeGoals = goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const safeMeals = todayMeals || [];
  
  // Calculate today's totals
  const summary: NutritionSummary = {
    calories: safeMeals.reduce((sum, m) => sum + (m.calories || 0) * (m.quantity || 1), 0),
    protein: safeMeals.reduce((sum, m) => sum + (m.protein_g || 0) * (m.quantity || 1), 0),
    carbs: safeMeals.reduce((sum, m) => sum + (m.carbs_g || 0) * (m.quantity || 1), 0),
    fat: safeMeals.reduce((sum, m) => sum + (m.fat_g || 0) * (m.quantity || 1), 0),
    mealCount: safeMeals.length,
    meals: safeMeals,
  };
  
  // Calculate percentages
  const caloriePercent = safeGoals.calories > 0 ? (summary.calories / safeGoals.calories) * 100 : 0;
  const proteinPercent = safeGoals.protein > 0 ? (summary.protein / safeGoals.protein) * 100 : 0;
  const carbsPercent = safeGoals.carbs > 0 ? (summary.carbs / safeGoals.carbs) * 100 : 0;
  const fatPercent = safeGoals.fat > 0 ? (summary.fat / safeGoals.fat) * 100 : 0;
  
  // Remaining
  const caloriesRemaining = Math.max(0, safeGoals.calories - summary.calories);
  const proteinRemaining = Math.max(0, safeGoals.protein - summary.protein);
  
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
      message: `You've hit ${Math.round(summary.protein)}g of protein. ${Math.round(proteinRemaining)}g more to reach your ${safeGoals.protein}g goal!`,
      priority: 7,
    });
  } else if (proteinPercent >= 80 && proteinPercent < 100) {
    insights.push({
      id: 'protein-almost',
      type: 'success',
      icon: '🎯',
      title: 'Almost at Protein Goal!',
      message: `Just ${Math.round(proteinRemaining)}g more protein to hit your daily goal. A small snack can get you there!`,
      priority: 8,
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
    const lunchCalories = lunchMeals.reduce((sum, m) => sum + (m.calories || 0) * (m.quantity || 1), 0);
    
    if (lunchCalories > safeGoals.calories * 0.45) {
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
  
  // === WEEKLY TRENDS ===
  if (weeklyMeals && weeklyMeals.length > 0) {
    const weeklyCalories = weeklyMeals.reduce((sum, m) => sum + (m.calories || 0) * (m.quantity || 1), 0);
    const avgDailyCalories = weeklyCalories / 7;
    
    if (avgDailyCalories < safeGoals.calories * 0.8) {
      insights.push({
        id: 'weekly-under',
        type: 'tip',
        icon: '📈',
        title: 'Weekly Calorie Trend',
        message: `You're averaging ${Math.round(avgDailyCalories)} cal/day this week, below your ${safeGoals.calories} goal. Make sure you're eating enough!`,
        priority: 6,
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
      action: 'Log a meal',
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
  const safeGoals = goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const safeMeals = todayMeals || [];
  
  const summary = {
    calories: safeMeals.reduce((sum, m) => sum + (m.calories || 0) * (m.quantity || 1), 0),
    protein: safeMeals.reduce((sum, m) => sum + (m.protein_g || 0) * (m.quantity || 1), 0),
    mealCount: safeMeals.length,
  };
  
  const caloriePercent = safeGoals.calories > 0 ? (summary.calories / safeGoals.calories) * 100 : 0;
  const proteinPercent = safeGoals.protein > 0 ? (summary.protein / safeGoals.protein) * 100 : 0;
  
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
        body: `You have ${Math.round(safeGoals.calories - summary.calories)} calories remaining. Enjoy a balanced dinner!`,
      };
    }
  }
  
  return null;
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

