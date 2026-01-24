# Firebase Analytics Setup Guide

This document explains how Firebase Analytics is integrated into the NutriSnap mobile app and how to use it for Google Ads conversion tracking.

## Table of Contents

- [Overview](#overview)
- [Events Tracked](#events-tracked)
- [Testing Events](#testing-events)
- [Verifying Events](#verifying-events)
- [Troubleshooting](#troubleshooting)
- [Google Ads Integration](#google-ads-integration)

## Overview

Firebase Analytics is integrated into the NutriSnap app to track user engagement and conversion events. These events are used for:

1. **Google Ads Conversion Tracking**: Measure app install campaigns and optimize for high-value users
2. **User Analytics**: Understand user behavior and improve the app experience
3. **A/B Testing**: Segment users and test different features

### Architecture

- **Analytics Module**: `src/utils/analytics.ts` - Type-safe wrapper functions
- **Initialization**: `App.tsx` - Analytics initialized on app start
- **Screen Tracking**: Automatic via React Navigation integration
- **Event Tracking**: Manual calls at key user actions

## Events Tracked

### 1. Core Conversion Events (for Google Ads)

#### `sign_up`
Tracked when a user creates a new account.

**Parameters:**
- `method`: `'google'` | `'apple'` | `'email'`

**Triggered:**
- After successful Google sign-in (new user)
- After successful Apple sign-in (new user)
- After successful email/password sign-up

**Location:** `src/services/authService.ts`

#### `tutorial_complete`
Tracked when a user completes the onboarding flow.

**Parameters:** None

**Triggered:**
- When user finishes goal setup in onboarding
- Before navigating to sign-up or home screen

**Location:** `src/screens/onboarding/GoalResultsScreen.tsx`

#### `purchase` (Future)
Will be tracked when a user completes a subscription purchase.

**Parameters:**
- `value`: Purchase amount (e.g., 4.99)
- `currency`: Currency code (e.g., 'USD')
- `items`: Array with subscription details

**Triggered:** After successful RevenueCat purchase (to be implemented)

**Location:** Subscription flow (to be added)

### 2. Engagement Events

#### `login`
Tracked when an existing user signs in.

**Parameters:**
- `method`: `'google'` | `'apple'` | `'email'`

**Triggered:**
- After successful Google sign-in (returning user)
- After successful Apple sign-in (returning user)
- After successful email/password sign-in

**Location:** `src/services/authService.ts`

#### `screen_view`
Automatically tracked for all screen navigation.

**Parameters:**
- `screen_name`: Name of the screen
- `screen_class`: Component class name

**Triggered:** On every screen transition

**Location:** `App.tsx` (React Navigation integration)

### 3. Future Events (Not Yet Implemented)

- `start_trial`: When user starts subscription trial
- `add_payment_info`: When user adds payment method
- Custom events for meal logging, goal achievements, etc.

## Testing Events

### Enable Debug Mode

#### iOS (Physical Device)
1. In Xcode, go to Product > Scheme > Edit Scheme
2. In the Arguments tab, add `-FIRDebugEnabled` to Arguments Passed On Launch
3. Build and run the app

#### iOS (Command Line)
```bash
xcrun simctl spawn booted log config --mode "level:debug" --subsystem com.google.firebase.analytics
```

#### Android (Physical Device)
```bash
adb shell setprop debug.firebase.analytics.app com.raymondzhao3000.forma
```

To disable debug mode:
```bash
adb shell setprop debug.firebase.analytics.app .none.
```

### View Events in Real-Time

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Analytics > DebugView**
4. Enable debug mode on your device (see above)
5. Use the app and watch events appear in real-time

### Test Event Flow

1. **Sign Up Event**
   - Open the app
   - Tap "Continue with Google" or "Sign in with Apple"
   - Complete authentication
   - ✅ Should see `sign_up` event with correct `method` parameter

2. **Tutorial Complete Event**
   - Complete onboarding flow:
     - Select weight goal
     - Enter physical info (optional)
     - Review calculated goals
   - Tap "Get Started" or "Create Account"
   - ✅ Should see `tutorial_complete` event

3. **Screen View Events**
   - Navigate between screens
   - ✅ Should see `screen_view` events for each navigation

4. **Login Event**
   - Sign out
   - Sign in again with same account
   - ✅ Should see `login` event (not `sign_up`)

## Verifying Events

### In Firebase Console

1. Navigate to **Analytics > Events** (may take 24-48 hours for data to appear)
2. Look for:
   - `sign_up`
   - `tutorial_complete`
   - `login`
   - `screen_view`
3. Click on an event to see parameters and user properties

### In DebugView (Real-Time)

1. Enable debug mode (see above)
2. Open Firebase Console > Analytics > DebugView
3. Use the app
4. Events should appear within seconds

### Check Implementation

Look for console logs with the 📊 emoji:
```
📊 Event tracked: sign_up (method: google)
📊 Event tracked: tutorial_complete
📊 Screen viewed: HomeScreen
```

## Troubleshooting

### Events Not Appearing in DebugView

**Problem:** No events showing up in Firebase DebugView

**Solutions:**
1. Ensure debug mode is enabled correctly (see [Enable Debug Mode](#enable-debug-mode))
2. Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is present
3. Check that Firebase plugins are in `app.config.js`
4. Restart the app after enabling debug mode
5. Check console logs for analytics errors

### Events Not Appearing in Analytics Dashboard

**Problem:** Events in DebugView but not in Analytics

**Solution:**
- Wait 24-48 hours for data to process
- Data may be in the "realtime" view first
- Check that analytics collection is enabled (should be by default)

### Build Errors

**Problem:** Build fails after adding Firebase

**Solutions:**
1. Run `npm install` to ensure packages are installed
2. Clear Expo cache: `npx expo start -c`
3. Rebuild native project:
   ```bash
   npx eas build --profile development --platform ios
   ```
4. Check that Firebase plugins are correctly added to `app.config.js`

### Google Services File Issues

**Problem:** Firebase not initializing

**Solutions:**
1. Verify `google-services.json` exists in project root
2. Verify `GoogleService-Info.plist` is configured in `app.config.js`
3. Ensure bundle IDs match in:
   - Firebase Console
   - `app.json`
   - `google-services.json` / `GoogleService-Info.plist`

### Analytics Not Tracking

**Problem:** Analytics initialized but events not tracked

**Solutions:**
1. Check for JavaScript errors in console
2. Verify analytics functions are imported correctly
3. Check that analytics is initialized before tracking events
4. Ensure user has not opted out of analytics

### Duplicate Events

**Problem:** Same event tracked multiple times

**Solutions:**
1. Check that tracking functions aren't called in render functions
2. Verify useEffect dependencies are correct
3. Use React DevTools to check for unnecessary re-renders

## Google Ads Integration

### Prerequisites

- Firebase project must have Analytics enabled
- Google Ads account (ID: 612-107-7376)
- Events must be appearing in Firebase Analytics

### Steps to Link Firebase to Google Ads

1. **Open Firebase Console**
   - Go to Project Settings > Integrations
   - Click "Link" next to Google Ads

2. **Select Google Ads Account**
   - Choose account: 612-107-7376
   - Accept terms and conditions

3. **Import Conversions**
   - Open Google Ads
   - Go to Tools > Measurement > Conversions
   - Click the "+" button > Import > Firebase
   - Select events to import:
     - `sign_up` (primary conversion)
     - `tutorial_complete` (secondary conversion)
     - `purchase` (once implemented)

4. **Create App Campaign**
   - Go to Campaigns > "+" > New Campaign
   - Select goal: "App installs" or "App engagement"
   - Choose campaign type: "App"
   - Select conversion events imported from Firebase
   - Set budget and targeting

### Conversion Actions Configuration

#### Primary Conversion: `sign_up`
- **Action**: App sign-up
- **Value**: Assign a value based on LTV estimates
- **Count**: One per user
- **Attribution window**: 30 days

#### Secondary Conversion: `tutorial_complete`
- **Action**: Onboarding completion
- **Value**: Higher than sign_up (indicates engaged user)
- **Count**: One per user
- **Attribution window**: 30 days

### Optimization Tips

1. **Target Engaged Users**
   - Use `tutorial_complete` as optimization goal
   - These users are more likely to become paying customers

2. **Segment by Sign-Up Method**
   - Create audiences based on `method` parameter
   - Compare performance: Google vs Apple vs Email

3. **Track ROAS**
   - Once `purchase` event is implemented
   - Set up revenue tracking in Google Ads
   - Optimize campaigns for revenue, not just installs

## Next Steps

### Implement Subscription Events

Add tracking to subscription flow:

```typescript
import { trackPurchase, trackStartTrial, trackAddPaymentInfo } from '../utils/analytics';

// When trial starts
await trackStartTrial(7); // 7-day trial

// When payment info is added
await trackAddPaymentInfo();

// When purchase completes
await trackPurchase(
  4.99,           // value
  'USD',          // currency
  'premium_monthly',  // itemId
  'Premium Monthly'   // itemName
);
```

### Add Custom Events

Track app-specific events:

```typescript
import { trackCustomEvent } from '../utils/analytics';

// Meal logged
await trackCustomEvent('meal_logged', {
  meal_type: 'breakfast',
  calories: 450,
  log_method: 'photo'
});

// Goal achieved
await trackCustomEvent('goal_achieved', {
  goal_type: 'calorie',
  days_to_achieve: 7
});
```

### Set User Properties

Segment users by subscription status:

```typescript
import { setUserProperty } from '../utils/analytics';

await setUserProperty('subscription_status', 'premium');
await setUserProperty('onboarding_completed', 'true');
```

## Additional Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Google Ads Help: App Campaigns](https://support.google.com/google-ads/answer/6247380)
- [React Native Firebase Docs](https://rnfirebase.io/analytics/usage)
- [Firebase Events Reference](https://support.google.com/firebase/answer/9267735)

## Support

If you encounter issues not covered in this guide:

1. Check Firebase Console for errors
2. Review implementation in `src/utils/analytics.ts`
3. Check React Native Firebase documentation
4. Open an issue in the project repository
