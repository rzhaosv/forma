# Version Management Guide

This guide explains how to manage and track app versions in Forma.

## Version Display

The app version is displayed in two places:
1. **Settings Screen**: Shows version number and build number at the bottom
2. **Console Logs**: Version is logged on app startup and during builds

## How to Update the Version

### 1. Update app.json

Edit `/mobile/app.json` and update these fields:

```json
{
  "expo": {
    "version": "1.0.1",           // Increment for new releases
    "ios": {
      "buildNumber": "1"           // Increment for each iOS build
    },
    "android": {
      "versionCode": 1             // Increment for each Android build
    }
  }
}
```

### 2. Version Numbering Convention

**Semantic Versioning (MAJOR.MINOR.PATCH):**
- **MAJOR**: Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR**: New features (e.g., 1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (e.g., 1.0.0 → 1.0.1)

**Build Numbers:**
- iOS `buildNumber`: String, increment for each build (e.g., "1", "2", "3")
- Android `versionCode`: Integer, increment for each build (e.g., 1, 2, 3)

### 3. Example Update Flow

**Bug Fix Release:**
```json
// Before: 1.0.0 (build 1)
"version": "1.0.1",
"ios": { "buildNumber": "2" },
"android": { "versionCode": 2 }
```

**Feature Release:**
```json
// Before: 1.0.1 (build 2)
"version": "1.1.0",
"ios": { "buildNumber": "3" },
"android": { "versionCode": 3 }
```

**Major Release:**
```json
// Before: 1.5.0 (build 10)
"version": "2.0.0",
"ios": { "buildNumber": "11" },
"android": { "versionCode": 11 }
```

## Version Logging

### During Development

When you run the app, version info is logged to the console:

```
🚀 Forma App Started - Version: 1.0.1 (Build: 1)
📱 Platform: iOS
🔧 Environment: Development
```

### During Builds

When you build the app (`npm run ios` or `npm run android`), version info is displayed:

```
┌────────────────────────────────────────┐
│         🚀 FORMA BUILD INFO           │
└────────────────────────────────────────┘
📦 Version:           1.0.1
🍎 iOS Build:         1
🤖 Android Build:     1
📅 Build Time:        2025-11-24T01:07:47.247Z
🔧 Environment:       development
─────────────────────────────────────────
```

A `build-info.json` file is also created in the project root with this information.

## Build Commands

The version is automatically logged when you run:

```bash
# Development builds
npm run ios          # Logs version, then builds for iOS
npm run android      # Logs version, then builds for Android

# Manual version check
npm run log-version  # Just logs the version without building

# Production builds (if using EAS)
npm run build:ios
npm run build:android
```

## Checking Version on Device

### In-App:
1. Open the app
2. Go to **Settings** (from Profile or Dashboard)
3. Scroll to the bottom
4. Look for the "About" section with "App Version" and "Build Number"

### Via Console:
1. Open the app with Metro bundler running
2. Check the console output for the startup log
3. Look for: `🚀 Forma App Started - Version: X.X.X (Build: X)`

## Verification Checklist

Before releasing a new version:

- [ ] Updated `version` in `app.json`
- [ ] Incremented `buildNumber` (iOS) in `app.json`
- [ ] Incremented `versionCode` (Android) in `app.json`
- [ ] Ran `npm run log-version` to verify
- [ ] Built and tested the app
- [ ] Verified version shows correctly in Settings screen
- [ ] Checked console logs show correct version on startup
- [ ] Tagged the commit in git (e.g., `git tag v1.0.1`)

## Git Tagging (Recommended)

After updating the version, tag the commit:

```bash
# Update version in app.json
git add mobile/app.json
git commit -m "Bump version to 1.0.1"

# Create a git tag
git tag v1.0.1
git push origin v1.0.1
```

This makes it easy to track which code corresponds to which release.

## Troubleshooting

**Version not showing in Settings:**
- Make sure you completely restarted the app (not just refreshed)
- Check that `expo-constants` is installed: `npm list expo-constants`

**Build number shows "dev":**
- This is normal in development mode
- The real build number will show in production builds

**Console logs not showing version:**
- Check that `App.tsx` imports `expo-constants`
- Make sure the app fully restarted

## Files Involved

- `mobile/app.json` - Source of truth for version numbers
- `mobile/App.tsx` - Logs version on app startup
- `mobile/src/screens/SettingsScreen.tsx` - Displays version in UI
- `mobile/scripts/log-version.js` - Build-time logging script
- `mobile/build-info.json` - Generated during builds (gitignored)

