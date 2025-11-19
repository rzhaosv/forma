# RevenueCat Setup Guide

This guide will help you set up RevenueCat for subscription management in the Forma app.

## Overview

RevenueCat handles subscription complexity across iOS and Android, working with Stripe and the native app stores (App Store, Google Play) to manage subscriptions.

## Prerequisites

1. RevenueCat account (sign up at https://www.revenuecat.com)
2. Stripe account (for web payments, optional)
3. App Store Connect account (for iOS)
4. Google Play Console account (for Android)

## Step 1: Create RevenueCat Project

1. Sign up/login to RevenueCat dashboard
2. Create a new project: "Forma"
3. Add your iOS and Android apps

## Step 2: Configure Products

### iOS (App Store Connect)

1. Go to App Store Connect → Your App → In-App Purchases
2. Create subscription group: "Premium"
3. Create subscriptions:
   - **Monthly Premium**: $9.99/month
   - **Annual Premium**: $59.99/year (save 40%)

### Android (Google Play Console)

1. Go to Google Play Console → Your App → Monetize → Subscriptions
2. Create subscription products:
   - **Monthly Premium**: $9.99/month
   - **Annual Premium**: $59.99/year

## Step 3: Configure RevenueCat

1. In RevenueCat dashboard, go to Products
2. Add your subscription products:
   - Match product IDs from App Store/Google Play
   - Set up entitlements: "premium"
3. Create an Offering:
   - Name: "default"
   - Add both monthly and annual packages
   - Set as current offering

## Step 4: Get API Keys

1. In RevenueCat dashboard, go to API Keys
2. Copy your API keys:
   - iOS API Key: `appl_...`
   - Android API Key: `goog_...`

## Step 5: Update App Configuration

Update `mobile/src/store/useSubscriptionStore.ts`:

```typescript
const REVENUECAT_API_KEY = {
  ios: 'appl_YOUR_IOS_API_KEY_HERE',
  android: 'goog_YOUR_ANDROID_API_KEY_HERE',
};
```

## Step 6: Test Subscriptions

### iOS Testing

1. Use Sandbox test accounts in App Store Connect
2. Test purchases in iOS Simulator or device
3. RevenueCat dashboard will show test purchases

### Android Testing

1. Add test accounts in Google Play Console
2. Test purchases on device
3. Use test product IDs during development

## Step 7: Configure Webhooks (Optional)

Set up webhooks in RevenueCat to sync subscription status with your backend:

1. Go to RevenueCat → Project Settings → Webhooks
2. Add webhook URL: `https://your-backend.com/api/webhooks/revenuecat`
3. Select events: subscription.created, subscription.updated, subscription.cancelled

## Subscription Tiers

### Free Tier
- 5 photo scans per day
- 7-day history view
- Limited barcode scanning
- Basic features

### Premium Tier ($9.99/month or $59.99/year)
- Unlimited photo scans
- Unlimited barcode scanning
- Advanced analytics (30+ day history)
- Recipe builder
- Data export (CSV/PDF)
- Ad-free experience
- Priority support

## Troubleshooting

### Common Issues

1. **"No packages available"**
   - Check that offerings are configured in RevenueCat
   - Verify product IDs match App Store/Google Play
   - Ensure offering is set as "current"

2. **"Purchase failed"**
   - Check API keys are correct
   - Verify user is logged in to RevenueCat
   - Check test accounts are set up correctly

3. **"Subscription not recognized"**
   - Wait a few seconds for RevenueCat to sync
   - Call `checkSubscriptionStatus()` again
   - Check RevenueCat dashboard for subscription status

## Next Steps

- Set up analytics tracking for subscription events
- Configure promotional offers and trials
- Set up subscription management in backend
- Add subscription status to user profile

