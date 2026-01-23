// Achievement Store
// Manages earned badges and achievement state

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string; // ISO timestamp
}

interface AchievementState {
  earnedBadges: EarnedBadge[];
  currentUserId: string | null;
  lastShownBadge: string | null; // To avoid showing same badge multiple times

  // Actions
  addEarnedBadge: (badgeId: string) => Promise<void>;
  hasBadge: (badgeId: string) => boolean;
  getRecentBadges: (limit?: number) => EarnedBadge[];
  setLastShownBadge: (badgeId: string) => void;
  initialize: (userId: string) => Promise<void>;
  clearData: () => Promise<void>;
}

const getStorageKeys = (userId: string) => ({
  earnedBadges: `@nutrisnap_earned_badges_${userId}`,
});

export const useAchievementStore = create<AchievementState>((set, get) => ({
  earnedBadges: [],
  currentUserId: null,
  lastShownBadge: null,

  addEarnedBadge: async (badgeId: string) => {
    // Check if already earned
    if (get().hasBadge(badgeId)) {
      return;
    }

    const newBadge: EarnedBadge = {
      badgeId,
      earnedAt: new Date().toISOString(),
    };

    const updatedBadges = [...get().earnedBadges, newBadge];
    set({ earnedBadges: updatedBadges });

    const userId = get().currentUserId;
    if (userId) {
      try {
        const keys = getStorageKeys(userId);
        await AsyncStorage.setItem(keys.earnedBadges, JSON.stringify(updatedBadges));

        // Sync to Firestore
        await setDoc(
          doc(db, 'users', userId, 'data', 'achievements'),
          {
            earnedBadges: updatedBadges,
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Failed to save earned badge:', error);
      }
    }
  },

  hasBadge: (badgeId: string) => {
    return get().earnedBadges.some(badge => badge.badgeId === badgeId);
  },

  getRecentBadges: (limit: number = 5) => {
    return get()
      .earnedBadges.slice()
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, limit);
  },

  setLastShownBadge: (badgeId: string) => {
    set({ lastShownBadge: badgeId });
  },

  initialize: async (userId: string) => {
    try {
      set({ currentUserId: userId });
      const keys = getStorageKeys(userId);

      const badgesStr = await AsyncStorage.getItem(keys.earnedBadges);
      let localBadges: EarnedBadge[] = [];
      if (badgesStr) {
        localBadges = JSON.parse(badgesStr);
      }

      // Try to sync with Firestore
      try {
        if (!userId) return;

        const achievementsDoc = await getDoc(doc(db, 'users', userId, 'data', 'achievements'));
        if (achievementsDoc.exists()) {
          const remoteBadges = achievementsDoc.data().earnedBadges || [];
          // Merge logic: use remote if it has more or equal badges
          if (remoteBadges.length >= localBadges.length) {
            localBadges = remoteBadges;
            await AsyncStorage.setItem(keys.earnedBadges, JSON.stringify(localBadges));
          }
        }
      } catch (error) {
        console.warn('Failed to load achievements from Firestore:', error);
      }

      set({ earnedBadges: localBadges });
    } catch (error) {
      console.error('Failed to load achievement data:', error);
    }
  },

  clearData: async () => {
    set({
      earnedBadges: [],
      currentUserId: null,
      lastShownBadge: null,
    });
  },
}));
