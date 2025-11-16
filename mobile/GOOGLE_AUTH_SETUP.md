# Google Authentication Setup Guide

This guide will walk you through setting up Google Sign-In for Forma.

---

## 📋 Prerequisites

- Firebase project created
- Firebase Authentication enabled
- Development build capability (Google Sign-In requires native modules)

---

## 🔧 Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **forma-3803d**
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** in the providers list
5. Click **Enable**
6. Set a **Project support email** (your email)
7. Click **Save**

---

## 🔑 Step 2: Get Your Web Client ID

After enabling Google Sign-In, you'll see:

```
Web SDK configuration
Web client ID: 311242226872-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

**Copy this Web Client ID** - you'll need it in the next step.

---

## 📝 Step 3: Update the Auth Service

Open `/Users/rayzhao/workspace/bodyapp/mobile/src/services/authService.ts` and replace the placeholder:

```typescript
// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '311242226872-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace this!
});
```

With your actual Web Client ID:

```typescript
// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '311242226872-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
});
```

---

## 📱 Step 4: Configure app.json

Add the Google Sign-In plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

---

## 🔨 Step 5: Build a Development Build

Google Sign-In requires a **development build** (it won't work in Expo Go).

### For iOS:

```bash
cd mobile
eas build --profile development --platform ios
```

### For Android:

```bash
cd mobile
eas build --profile development --platform android
```

---

## 🧪 Step 6: Test Google Sign-In

1. Install the development build on your device
2. Open the app
3. Tap **"Continue with Google"**
4. Select your Google account
5. You should be signed in and redirected to the Home screen! 🎉

---

## 🔍 Troubleshooting

### Error: "Developer Error" or "Sign-in failed"

**Cause:** Web Client ID is incorrect or not configured

**Fix:** 
1. Double-check the Web Client ID from Firebase Console
2. Make sure you're using the **Web client ID**, NOT the Android or iOS client ID
3. Rebuild the app after changing the configuration

### Error: "hasPlayServices failed"

**Cause:** Google Play Services not available (Android only)

**Fix:** Test on a real device with Google Play Services installed, or use an emulator with Google APIs

### Error: "The API is not enabled"

**Cause:** Google Sign-In not enabled in Firebase

**Fix:** Go back to Step 1 and ensure Google Sign-In is enabled

---

## 📊 How It Works

1. User taps "Continue with Google"
2. Google Sign-In modal opens
3. User selects Google account
4. Google returns an `idToken`
5. App creates Firebase credential with the token
6. App signs into Firebase with the credential
7. User is authenticated! ✅

---

## 🔐 Security Notes

- The Web Client ID is **NOT** a secret - it's safe to commit
- Firebase handles all authentication securely
- User tokens are managed by Firebase Auth
- Sessions persist across app restarts

---

## 🚀 Next Steps

Once Google Sign-In works:
- [ ] Add Apple Sign-In (iOS only)
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Add profile photo from Google account
- [ ] Link multiple auth providers

---

## 📚 Resources

- [Firebase Google Sign-In Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

