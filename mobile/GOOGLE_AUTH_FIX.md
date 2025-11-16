# 🔧 Fix Google Sign-In "Access Blocked" Error

Follow these steps to fix the authorization error:

---

## Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/apis/credentials?project=forma-3803d
2. You should see your OAuth 2.0 Client IDs listed

---

## Step 2: Edit the Web Client

1. Click on the **Web client** (the one that starts with `311242226872-eu8t1pqae795572hsbs6svmv0gh87sc4`)
2. Scroll down to **"Authorized redirect URIs"**

---

## Step 3: Add Expo Redirect URIs

Click **"+ ADD URI"** and add these **THREE** URIs:

```
https://auth.expo.io/@raymondzhao3000/forma
```

```
http://localhost:19006
```

```
http://localhost
```

---

## Step 4: Save

1. Click **"SAVE"** at the bottom
2. Wait 5-10 seconds for changes to propagate

---

## Step 5: Test Again

1. **Force quit Expo Go** on your phone
2. **Reopen Expo Go** and scan the QR code
3. Tap **"Continue with Google"**
4. Should work now! ✅

---

## 🎯 Why This Was Needed

Google OAuth requires you to pre-register all valid redirect URIs for security. Expo uses:
- `https://auth.expo.io/@YOUR_USERNAME/YOUR_SLUG` for the OAuth redirect
- `localhost` for web development

Without these registered, Google blocks the sign-in attempt.

---

## ⚠️ Important Notes

- Your Expo username is: `raymondzhao3000`
- Your app slug is: `forma`
- The redirect URI format is: `https://auth.expo.io/@USERNAME/SLUG`

---

## 🚀 After This Works

Once Google Sign-In is working, you can optionally:
- Add a test user in Google Cloud Console (if app is in testing mode)
- Publish the OAuth consent screen (to allow any Google user to sign in)

