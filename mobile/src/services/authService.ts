import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';

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

