import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useMealStore } from '../store/useMealStore';
import { useProgressStore } from '../store/useProgressStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { useExerciseStore } from '../store/useExerciseStore';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Google Sign-In Hook
 * Use this in your component to initialize Google auth
 * 
 * For Expo Go: Uses Expo's auth proxy (requires web client ID)
 * For standalone builds: Uses native client IDs
 */
export const useGoogleSignIn = () => {
  return Google.useAuthRequest({
    // Web client ID (required for Expo Go proxy)
    webClientId: '311242226872-eu8t1pqae795572hsbs6svmv0gh87sc4.apps.googleusercontent.com',
    // iOS client ID (for standalone builds)
    iosClientId: '311242226872-4jrv4kndh6j0s974u1h0uqbj4bvmp3af.apps.googleusercontent.com',

    // Android client ID (for standalone builds) 
    androidClientId: '311242226872-71e54jta65m6l3dtg286kboeg06omdnn.apps.googleusercontent.com',
  });
};

/**
 * Complete Google Sign-In with the ID token
 */
export const completeGoogleSignIn = async (idToken: string): Promise<User> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
  useAuthStore.getState().clearUser();
};

/**
 * Listen to authentication state changes
 * Call this once when the app starts
 */
export const listenToAuthChanges = (callback?: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    const store = useAuthStore.getState();

    if (user) {
      // User is signed in
      const token = await user.getIdToken();
      store.setUser(user, token);

      const userId = user.uid;

      // Initialize all stores with user-specific data
      try {
        // Initialize meal store (meals, goals)
        await useMealStore.getState().initialize(userId);

        // Initialize progress store (weight entries, streaks)
        await useProgressStore.getState().initialize(userId);

        // Initialize recipe store
        await useRecipeStore.getState().initialize(userId);

        // Initialize onboarding store
        await useOnboardingStore.getState().initialize(userId);

        // Initialize subscription store (subscription, trial)
        await useSubscriptionStore.getState().initialize(userId);

        // Initialize exercise store (workouts, goals)
        await useExerciseStore.getState().initialize(userId);
      } catch (error) {
        console.error('Failed to initialize user stores:', error);
      }
    } else {
      // User is signed out - clear all user-specific data
      store.clearUser();

      // Clear all stores
      try {
        await useMealStore.getState().clearData();
        await useProgressStore.getState().clearData();
        await useRecipeStore.getState().clearData();
        await useOnboardingStore.getState().clearData();
        await useExerciseStore.getState().clearData();

        // Reset subscription state but DON'T clear trial data
        // Trial data is user-specific and will be validated on next login
        // The initialize function will clear it if it belongs to a different user
        useSubscriptionStore.getState().resetSubscriptionState();
      } catch (error) {
        console.error('Failed to clear user data on logout:', error);
      }
    }

    // Call optional callback
    if (callback) {
      callback(user);
    }
  });
};

