# Launch & Profit Strategy for Forma

## Phase 1: Monetization Readiness (Critical for Profit)
Before submitting, we must ensure you can actually fetch money.

### 1. RevenueCat (Subscriptions)
- [ ] **Offerings Configured**: Ensure you have an Offering (e.g., "Default") with Packages (e.g., "Monthly", "Annual") in the RevenueCat dashboard.
- [ ] **Entitlements**: confirm "Pro" entitlement exists and is linked to the products.
- [ ] **Store Connection**:
    - **iOS**: App Store Connect > Features > Subscriptions. Status must be "Ready to Submit" (you submit them *with* the app binary).
    - **Android**: Google Play Console > Monetize > Subscriptions.
- [ ] **Test**: Use Sandbox users (iOS) and License Testers (Android) to buy a fake subscription in a dev build.

### 2. AdMob (Ads)
- [ ] **App IDs**: Ensure `iosAppId` and `androidAppId` in `app.json` are your *real* IDs, not test IDs.
- [ ] **Unit IDs**: Ensure the code uses real Ad Unit IDs for production builds (but keep using Test IDs for development to avoid bans).
- [ ] **Payments**: Verify your payment profile is set up in AdMob console.

## Phase 2: Technical Polish & Build
Get the binary ready for the stores.

### 1. Versioning
- Current version in `app.json` is `1.0.2` (Build 3).
- Ensure `ios.buildNumber` and `android.versionCode` are incremented for every new upload.

### 2. Production Build
Run these commands to build the shipping binaries:
```bash
# iOS (IPA for App Store Connect)
eas build --platform ios --profile production

# Android (AAB for Google Play)
eas build --platform android --profile production
```

## Phase 3: Store Listing (ASO)
Maximize downloads with a great store presence.

### 1. Visuals
- **Screenshots**: You need 3-5 high-quality screenshots for each device size (6.5", 5.5" for iOS).
- **Preview Video**: Optional but recommended for fitness apps to show the scanning speed.

### 2. Text
- **Title**: "Forma - Calorie & Macro AI" (Include keywords)
- **Subtitle**: "Scan food, track macros, lose weight"
- **Keywords (iOS)**: calorie counter, food scanner, macro tracker, diet, weight loss, ai nutritionist

## Phase 4: Marketing (The "Get it Out" Part)
How to get initial users.

### 1. Organic Social (Zero Cost)
- **TikTok/Shorts**: Post a video of the "Scan -> Result" flow. It's magical and visual. Use trending audio.
- **Reddit**: Post in r/loseit, r/1200isplenty, r/fitness (check rules first) looking for "beta testers" to give feedback.

### 2. Launch
- Submit for Review.
- Once Live, change TikTok bio link to the App Store link.
