// Badge & Achievement Definitions

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'logging' | 'goal' | 'milestone';
  requirement: {
    type: 'streak' | 'total_logs' | 'photo_logs' | 'voice_logs' | 'goal_hits' | 'consecutive_goal_hits';
    value: number;
  };
}

export const badges: Record<string, Badge> = {
  // First Steps
  FIRST_LOG: {
    id: 'FIRST_LOG',
    name: 'First Step',
    description: 'You logged your first meal!',
    icon: '🚀',
    category: 'logging',
    requirement: { type: 'total_logs', value: 1 },
  },

  // Streak Badges
  STREAK_3: {
    id: 'STREAK_3',
    name: '3-Day Streak',
    description: 'Building momentum! 3 days in a row.',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
  },
  STREAK_7: {
    id: 'STREAK_7',
    name: '7-Day Streak',
    description: 'One full week of consistent tracking!',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
  },
  STREAK_14: {
    id: 'STREAK_14',
    name: '2-Week Streak',
    description: 'Two weeks strong! You\'re forming a habit.',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 14 },
  },
  STREAK_30: {
    id: 'STREAK_30',
    name: '30-Day Streak',
    description: 'A full month of dedication! Incredible!',
    icon: '🌟',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
  },
  STREAK_60: {
    id: 'STREAK_60',
    name: '60-Day Streak',
    description: 'Two months of consistency! You\'re unstoppable!',
    icon: '💎',
    category: 'streak',
    requirement: { type: 'streak', value: 60 },
  },
  STREAK_100: {
    id: 'STREAK_100',
    name: '100-Day Streak',
    description: 'Triple digits! You\'re a legend!',
    icon: '👑',
    category: 'streak',
    requirement: { type: 'streak', value: 100 },
  },

  // Logging Method Badges
  PHOTO_LOG: {
    id: 'PHOTO_LOG',
    name: 'Photographer',
    description: 'Logged your first meal with a photo.',
    icon: '📸',
    category: 'logging',
    requirement: { type: 'photo_logs', value: 1 },
  },
  VOICE_LOG: {
    id: 'VOICE_LOG',
    name: 'Orator',
    description: 'Logged your first meal with your voice.',
    icon: '🎤',
    category: 'logging',
    requirement: { type: 'voice_logs', value: 1 },
  },
  PHOTO_PRO: {
    id: 'PHOTO_PRO',
    name: 'Photo Pro',
    description: 'Logged 50 meals with photos!',
    icon: '📷',
    category: 'logging',
    requirement: { type: 'photo_logs', value: 50 },
  },
  VOICE_MASTER: {
    id: 'VOICE_MASTER',
    name: 'Voice Master',
    description: 'Logged 50 meals with voice!',
    icon: '🎙️',
    category: 'logging',
    requirement: { type: 'voice_logs', value: 50 },
  },

  // Goal Achievement Badges
  GOAL_CRUSHER: {
    id: 'GOAL_CRUSHER',
    name: 'Goal Crusher',
    description: 'Hit your calorie goal for the first time!',
    icon: '🎯',
    category: 'goal',
    requirement: { type: 'goal_hits', value: 1 },
  },
  GOAL_CONSISTENT: {
    id: 'GOAL_CONSISTENT',
    name: 'Goal Getter',
    description: 'Hit your calorie goal 7 times!',
    icon: '✨',
    category: 'goal',
    requirement: { type: 'goal_hits', value: 7 },
  },
  GOAL_WEEK: {
    id: 'GOAL_WEEK',
    name: 'Perfect Week',
    description: 'Hit your goal 7 days in a row!',
    icon: '🏆',
    category: 'goal',
    requirement: { type: 'consecutive_goal_hits', value: 7 },
  },

  // Milestone Badges
  MEALS_10: {
    id: 'MEALS_10',
    name: 'Getting Started',
    description: 'Logged 10 meals total!',
    icon: '🎈',
    category: 'milestone',
    requirement: { type: 'total_logs', value: 10 },
  },
  MEALS_50: {
    id: 'MEALS_50',
    name: 'Tracking Habit',
    description: 'Logged 50 meals! This is becoming a habit.',
    icon: '🌱',
    category: 'milestone',
    requirement: { type: 'total_logs', value: 50 },
  },
  MEALS_100: {
    id: 'MEALS_100',
    name: 'Century',
    description: '100 meals logged! You\'re committed!',
    icon: '💯',
    category: 'milestone',
    requirement: { type: 'total_logs', value: 100 },
  },
  MEALS_500: {
    id: 'MEALS_500',
    name: 'Master Tracker',
    description: '500 meals! You\'re a tracking master!',
    icon: '🏅',
    category: 'milestone',
    requirement: { type: 'total_logs', value: 500 },
  },
};

// Helper to get all badges as an array
export const getAllBadges = (): Badge[] => Object.values(badges);

// Helper to get badges by category
export const getBadgesByCategory = (category: Badge['category']): Badge[] => {
  return getAllBadges().filter(badge => badge.category === category);
};
