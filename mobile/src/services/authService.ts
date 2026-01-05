import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  User,
  deleteUser,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';

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
 * Initialize Google Sign-In
 */
GoogleSignin.configure({
  webClientId: '311242226872-eu8t1pqae795572hsbs6svmv0gh87sc4.apps.googleusercontent.com',
  iosClientId: '311242226872-4jrv4kndh6j0s974u1h0uqbj4bvmp3af.apps.googleusercontent.com',
});

/**
 * Sign In with Google (Native)
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Check if idToken is present
    const idToken = userInfo.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token present!');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

import * as Crypto from 'expo-crypto';

/**
 * Apple Sign-In
 */
export const signInWithApple = async (): Promise<User> => {
  try {
    const rawNonce = Crypto.randomUUID();
    const state = Crypto.randomUUID();

    const result = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      state,
      nonce: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      ),
    });

    const { identityToken, fullName } = result;

    if (!identityToken) {
      throw new Error('No identity token provided.');
    }

    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: identityToken,
      rawNonce,
    });

    const signInResult = await signInWithCredential(auth, firebaseCredential);
    const user = signInResult.user;

    // TODO: Update user profile with full name if available (only available on first sign in)
    // if (fullName && (fullName.givenName || fullName.familyName)) {
    //   // Update user profile logic here
    // }

    return user;
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Sign in canceled');
    }
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
};



/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
  useAuthStore.getState().clearUser();
};

/**
 * Delete the current user account
 * This requires recent authentication. If failed, user might need to re-login.
 */
export const deleteAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user currently signed in');
  }

  try {
    // Delete from Firebase Auth
    await deleteUser(user);

    // Clear local state
    useAuthStore.getState().clearUser();
  } catch (error: any) {
    console.error('Error deleting account:', error);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please sign out and sign in again to delete your account.');
    }
    throw error;
  }
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

