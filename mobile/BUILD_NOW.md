# 🚀 Create Development Build - Step by Step

**Follow these steps to get barcode scanner working!**

---

## Step 1: Login to Expo (2 minutes)

```bash
cd /Users/rayzhao/workspace/bodyapp/mobile
eas login
```

**What happens:**
- Opens browser or prompts for email/password
- Create free account if you don't have one
- Login with your credentials

---

## Step 2: Configure EAS (1 minute)

```bash
eas build:configure
```

**What happens:**
- Creates `eas.json` configuration file
- Sets up build profiles
- Just press Enter to accept defaults

---

## Step 3: Choose Your Platform

### For iOS (Mac + iPhone):
```bash
eas build --profile development --platform ios
```

**Build will:**
- Take 10-15 minutes
- Build in the cloud (no Xcode needed!)
- Give you a download link
- You can install directly on your iPhone

### For Android (Any computer):
```bash
eas build --profile development --platform android
```

**Build will:**
- Take 10-15 minutes
- Build in the cloud
- Give you an APK file
- Install on any Android phone

---

## Step 4: Install on Your Device

### iOS:
1. Open the build link on your iPhone (sent via email or shown in terminal)
2. Tap "Install" or "Download"
3. Go to Settings → General → VPN & Device Management
4. Trust the developer certificate
5. Open the Forma app

### Android:
1. Download the APK from the build link
2. Open the APK file
3. Allow "Install from Unknown Sources" if prompted
4. Install the app
5. Open the Forma app

---

## Step 5: Run Your App

```bash
# Start dev server (same as before)
npx expo start --dev-client

# Or just:
npx expo start
```

**Then:**
- Open your development build app (not Expo Go!)
- It will connect automatically
- Or scan the QR code

---

## 🎉 That's It!

Your app now has:
- ✅ Camera mode (take food photos)
- ✅ **Barcode mode (scan real products!)** 🏷️
- ✅ Mode toggle button
- ✅ Real product lookup with Open Food Facts
- ✅ Live serving size adjuster
- ✅ Real nutrition data

**Test the barcode scanner:**
1. Tap "🏷️ Barcode" button
2. Point at any packaged food
3. Watch it auto-detect and look up the product!
4. Adjust serving size
5. See nutrition update in real-time

---

## 💡 Tips

### While Build Is Running (10-15 min):
- Go get coffee ☕
- Check email
- Read documentation
- Plan next features

### After Build:
- Download link expires in 30 days
- Can rebuild anytime with same command
- Free tier: Unlimited dev builds!
- Keep the dev build app on your phone

### Development Workflow:
- Make code changes
- Hot reload works (like Expo Go!)
- Only rebuild if you add new native modules
- Otherwise, just `npx expo start`

---

## ⚡ Quick Start

Copy-paste these commands:

```bash
cd /Users/rayzhao/workspace/bodyapp/mobile
eas login
eas build:configure
eas build --profile development --platform ios     # Mac users
# or
eas build --profile development --platform android  # Everyone
```

Then wait 10-15 minutes and install the app!

---

## ✅ Result

You'll have a fully functional app with:
- Camera scanning
- **Barcode scanning** 🎉
- AI analysis (mock)
- Beautiful UI
- Both modes working

**It's worth the 10-15 minute wait!** 🚀

