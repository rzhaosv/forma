# ✅ Google Sign-In Setup Checklist

Quick steps to enable Google authentication in Forma.

---

## 🎯 What You Need To Do

### 1. Enable Google Sign-In in Firebase (2 minutes)

1. Go to: https://console.firebase.google.com/project/forma-3803d/authentication/providers
2. Click **Google** in the provider list
3. Toggle **Enable**
4. Enter your support email
5. Click **Save**
6. **Copy the Web Client ID** (looks like: `311242226872-xxxxx.apps.googleusercontent.com`)

---

### 2. Update the Code (30 seconds)

Open: `mobile/src/services/authService.ts`

Find line 16:
```typescript
webClientId: '311242226872-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
```

Replace with your actual Web Client ID from Firebase:
```typescript
webClientId: '311242226872-xxxxx.apps.googleusercontent.com',
```

---

### 3. Build a Development Build (5-10 minutes)

Google Sign-In requires native modules, so you need a development build.

**For iOS:**
```bash
cd mobile
eas build --profile development --platform ios
```

**For Android:**
```bash
cd mobile
eas build --profile development --platform android
```

---

### 4. Install and Test (2 minutes)

1. Install the development build on your device
2. Open the app
3. Tap **"Continue with Google"**
4. Select your Google account
5. You're signed in! 🎉

---

## ⚠️ Important Notes

- ❌ Google Sign-In **WILL NOT WORK** in Expo Go
- ✅ Google Sign-In **WILL WORK** in development/production builds
- 📱 You must rebuild the app after changing `app.json`
- 🔑 The Web Client ID is safe to commit (it's not a secret)

---

## 🐛 If It Doesn't Work

See the full troubleshooting guide: `GOOGLE_AUTH_SETUP.md`

Common issues:
- Wrong client ID → Double-check you copied the **Web Client ID**
- "Developer Error" → Rebuild the app after configuration changes
- "hasPlayServices failed" → Use a real device or emulator with Google Play

---

## 📊 Current Status

- ✅ Dependencies installed
- ✅ Code implemented
- ✅ `app.json` configured
- ⏳ **Waiting for you:** Enable in Firebase + add Web Client ID
- ⏳ **Waiting for you:** Build development build

