# Firebase Setup Guide

**Purpose:** Authentication service for Forma  
**Features:** Email/password, Google OAuth, Apple OAuth

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
Visit: https://console.firebase.google.com/

### 1.2 Create New Project
```
1. Click "Add project"
2. Project name: "Forma" or "Forma Production"
3. Enable Google Analytics: ✅ (recommended)
4. Choose or create Analytics account
5. Click "Create project"
6. Wait ~30 seconds for setup
```

---

## Step 2: Enable Authentication

### 2.1 Navigate to Authentication
```
Left sidebar → Authentication → Get started
```

### 2.2 Enable Sign-in Methods

#### Email/Password
```
Sign-in method tab → Email/Password
☑️ Enable
☐ Email link (passwordless sign-in) - Skip for now
Save
```

#### Google OAuth
```
Sign-in method tab → Google
☑️ Enable
Project support email: your-email@example.com
Save
```

#### Apple OAuth (For iOS)
```
Sign-in method tab → Apple
☑️ Enable

Note: Requires Apple Developer account
- Service ID: com.forma.signin
- Key ID: Get from Apple Developer Console
- Team ID: Get from Apple Developer Console
- Private Key: Download from Apple Developer Console

Save
```

---

## Step 3: Register Web App

### 3.1 Add App
```
Project Overview → Add app → Web (</> icon)
App nickname: "Forma Web/Mobile"
☐ Firebase Hosting (not needed)
Register app
```

### 3.2 Get Configuration
Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "forma-prod.firebaseapp.com",
  projectId: "forma-prod",
  storageBucket: "forma-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Save this!** You'll need it for mobile app configuration.

---

## Step 4: Generate Service Account Key (Backend)

### 4.1 Go to Project Settings
```
⚙️ (top left) → Project settings
```

### 4.2 Navigate to Service Accounts
```
Service accounts tab
```

### 4.3 Generate New Private Key
```
Click "Generate new private key"
Confirm → Download JSON file
```

### 4.4 Extract Values
Open the downloaded JSON file and extract:

```json
{
  "project_id": "forma-prod",
  "private_key": "-----BEGIN PRIVATE KEY-----\nXXXX...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@forma-prod.iam.gserviceaccount.com"
}
```

---

## Step 5: Configure Backend

### 5.1 Update .env File

```bash
# backend/.env

# Firebase Authentication
FIREBASE_PROJECT_ID=forma-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@forma-prod.iam.gserviceaccount.com
```

**Important:** Keep the quotes around FIREBASE_PRIVATE_KEY and preserve `\n` line breaks.

### 5.2 Install Firebase Admin SDK

```bash
cd backend
npm install firebase-admin
```

### 5.3 Create Firebase Admin Service

Create `backend/src/config/firebase.ts`:

```typescript
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export const auth = admin.auth();

// Verify Firebase ID token
export async function verifyToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default admin;
```

### 5.4 Update Auth Middleware

Update `backend/src/middleware/auth.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/firebase.js';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    const decodedToken = await verifyToken(idToken);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email!,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};
```

---

## Step 6: Configure Mobile App

### 6.1 Install Firebase SDK

```bash
cd mobile
npm install firebase
```

### 6.2 Create Firebase Configuration

Create `mobile/src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "forma-prod.firebaseapp.com",
  projectId: "forma-prod",
  storageBucket: "forma-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export default app;
```

### 6.3 Create Auth Service

Create `mobile/src/services/auth.service.ts`:

```typescript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
  // Sign up with email/password
  signUp: async (email: string, password: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Sign in with email/password
  signIn: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    await signOut(auth);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Get ID token
  getIdToken: async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },
};
```

---

## Step 7: Testing

### 7.1 Test Backend Token Verification

Create `backend/test-firebase.ts`:

```typescript
import { verifyToken } from './src/config/firebase.js';

// Get a token from mobile app or Firebase Console
const testToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6...';

verifyToken(testToken)
  .then(result => {
    console.log('✅ Token verified:', result);
  })
  .catch(error => {
    console.error('❌ Token verification failed:', error);
  });
```

Run:
```bash
npx tsx backend/test-firebase.ts
```

### 7.2 Test Mobile Authentication

In your mobile app:

```typescript
import { authService } from './src/services/auth.service';

// Test sign up
const testAuth = async () => {
  try {
    // Sign up
    const user = await authService.signUp('test@example.com', 'password123');
    console.log('✅ Sign up successful:', user.uid);
    
    // Get token
    const token = await authService.getIdToken();
    console.log('✅ Got token:', token?.substring(0, 20) + '...');
    
    // Sign out
    await authService.signOut();
    console.log('✅ Sign out successful');
  } catch (error) {
    console.error('❌ Auth error:', error);
  }
};

testAuth();
```

---

## Step 8: Security Rules (Optional but Recommended)

### 8.1 Firestore Rules (if using Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 8.2 Storage Rules (if using Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Step 9: Production Configuration

### 9.1 Environment Variables Checklist

**Backend:**
```bash
✅ FIREBASE_PROJECT_ID
✅ FIREBASE_PRIVATE_KEY (with \n preserved)
✅ FIREBASE_CLIENT_EMAIL
```

**Mobile:**
```bash
✅ Firebase config in firebase.ts
✅ API key not exposed in version control
```

### 9.2 Security Best Practices

1. **Never commit service account JSON** to git
2. **Add to .gitignore:**
   ```
   firebase-adminsdk-*.json
   .env
   ```
3. **Use environment variables** in production
4. **Rotate keys** if exposed
5. **Enable App Check** for production

---

## Troubleshooting

### "Invalid token" Error
```
❌ Error: Firebase ID token has invalid signature
```
**Solution:** 
- Check that FIREBASE_PRIVATE_KEY has `\n` line breaks
- Ensure quotes around the private key in .env
- Verify project ID matches

### "Module not found" Error
```
❌ Cannot find module 'firebase-admin'
```
**Solution:**
```bash
cd backend
npm install firebase-admin
```

### "App already initialized" Error
```
❌ Firebase app named '[DEFAULT]' already exists
```
**Solution:** Check for `if (!admin.apps.length)` in initialization

### CORS Error (Mobile)
```
❌ Access to fetch blocked by CORS policy
```
**Solution:** This is normal for React Native - Firebase SDK handles it

---

## Cost Information

### Free Tier (Spark Plan)
- Authentication: Unlimited users ✅
- Email/Password: Free ✅
- OAuth (Google/Apple): Free ✅
- Phone Auth: Free for development

### Paid Tier (Blaze Plan)
Only needed if you use:
- Phone authentication in production
- Firestore database
- Cloud Functions
- Firebase Hosting

**For Forma:** Stay on free tier (we use Supabase for database)

---

## Next Steps

1. ✅ Firebase project created
2. ✅ Authentication enabled
3. ✅ Backend SDK configured
4. ✅ Mobile SDK configured
5. ✅ Ready to build auth screens

**Continue to:** Supabase setup for database and storage

---

**Setup Time:** ~20 minutes  
**Difficulty:** Easy  
**Status:** Production-ready ✅

