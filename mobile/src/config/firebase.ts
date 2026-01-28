import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import React Native Firebase (initialized natively in AppDelegate.swift/MainActivity.java)
// No JavaScript initialization needed - FirebaseApp.configure() handles this natively

// Firebase configuration for Web SDK (used for Auth and Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyCL6su_cFHvijSIuQYomXVzNvfMcsmcJTk",
  authDomain: "forma-3803d.firebaseapp.com",
  projectId: "forma-3803d",
  storageBucket: "forma-3803d.firebasestorage.app",
  messagingSenderId: "311242226872",
  appId: "1:311242226872:web:e3e40064d1471d8725884d",
};

// Initialize Web Firebase SDK for Auth and Firestore
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence for React Native
// This ensures users stay logged in across app restarts
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If auth is already initialized, just get it
  auth = getAuth(app);
}

// Initialize Firestore with long polling for better tunnel/proxy compatibility
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export { auth, db };
export default app;

