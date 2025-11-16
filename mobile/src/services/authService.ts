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
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';

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
 */
export const useGoogleSignIn = () => {
  return Google.useIdTokenAuthRequest({
    clientId: '311242226872-eu8t1pqae795572hsbs6svmv0gh87sc4.apps.googleusercontent.com',
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
    } else {
      // User is signed out
      store.clearUser();
    }

    // Call optional callback
    if (callback) {
      callback(user);
    }
  });
};

