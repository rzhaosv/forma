import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration for React Native
const firebaseConfig = {
  apiKey: "AIzaSyBXhrvGVlmBFP43T_fS_V4CmiNEmIw6Z14",
  authDomain: "forma-3803d.firebaseapp.com",
  projectId: "forma-3803d",
  storageBucket: "forma-3803d.firebasestorage.app",
  messagingSenderId: "311242226872",
  appId: "1:311242226872:web:e3e40064d1471d8725884d",
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export default app;

