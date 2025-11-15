# Development Build Setup

**Goal:** Create a custom Expo app with barcode scanner support  
**Time:** 5-10 minutes setup + 10-15 minutes build time

---

## 🚀 Quick Setup (Choose Your Platform)

### For iOS (Mac Only)

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo (create free account if needed)
eas login

# 3. Configure project
eas build:configure

# 4. Create development build for iOS
eas build --profile development --platform ios

# Build will take 10-15 minutes
# You'll get a link to download the app
```

### For Android

```bash
# 1. Install EAS CLI globally  
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure project
eas build:configure

# 4. Create development build for Android
eas build --profile development --platform android

# Build will take 10-15 minutes
# You'll get an APK to install
```

---

## 📱 Install the Dev Build

### iOS:
1. Open the build link on your iPhone
2. Install via TestFlight or direct install
3. Trust the developer certificate (Settings → General → Device Management)

### Android:
1. Download the APK from the build link
2. Enable "Install from Unknown Sources"
3. Install the APK

---

## 🎯 Run Your App

After installing the dev build:

```bash
# Start the dev server
npx expo start --dev-client

# Scan the QR code with your dev build app
```

**Now the barcode scanner will work!** 🎉

---

## ✅ What You'll Have

- ✅ Camera mode (take food photos)
- ✅ Barcode mode (scan products)
- ✅ Toggle between modes
- ✅ **Real barcode scanning** with product lookup
- ✅ **Real nutrition data** from Open Food Facts

---

## ⚡ Faster Alternative: Local Build

If you have Xcode (Mac) or Android Studio:

### iOS (Requires Mac + Xcode):
```bash
npx expo prebuild
npx expo run:ios
```

### Android (Requires Android Studio):
```bash
npx expo prebuild  
npx expo run:android
```

This builds locally (faster but requires more setup).

---

## 💡 What's Different?

**Expo Go:**
- Pre-built app
- Limited native modules
- ❌ No barcode scanner

**Development Build:**
- Custom app with your native modules
- ✅ Barcode scanner included
- ✅ Any native module you need
- Still has live reload!

---

## 🎊 After Build Completes

You'll have a custom app that works just like Expo Go but with barcode scanning!

Test:
1. Launch your dev build app
2. Tap "🏷️ Barcode" button
3. Scan any product barcode
4. **See real product info!** 🎉

