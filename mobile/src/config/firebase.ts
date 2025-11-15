import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

// Initialize Auth (persistence is automatic in React Native)
const auth = getAuth(app);

export { auth };
export default app;

