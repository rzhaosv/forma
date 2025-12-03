# Complete iOS Payment Flow Guide

## 🎯 Overview

This guide covers the complete payment/subscription flow for the Forma iOS app, including setup, testing, and troubleshooting.

---

## 📋 Current Setup

### Products Configured

**Monthly Subscription**:
- Product ID: `com.forma.premium.monthly`
- Price: $9.99/month
- Free Trial: 3 days
- Description: Premium access with unlimited features

**Annual Subscription**:
- Product ID: `com.forma.premium.annual`
- Price: $59.99/year  
- Free Trial: 3 days
- Description: Premium access - Best Value! (Save 50%)

### Features Included
- ✅ Unlimited photo scanning
- ✅ Unlimited barcode scanning
- ✅ Custom recipe builder
- ✅ Advanced analytics
- ✅ Apple Health integration
- ✅ Export data
- ✅ Priority support

---

## 🚀 Quick Start for Testing

### 1. Verify StoreKit Configuration

The file `mobile/ios/Products.storekit` contains:
- ✅ Two subscriptions (monthly & annual)
- ✅ 3-day free trials on both
- ✅ Subscription group: "Premium"
- ✅ Proper localization

**To verify in Xcode:**
1. Open `mobile/ios/Forma.xcworkspace`
2. Find `Products.storekit` in file navigator
3. Should see both subscriptions listed

### 2. Enable StoreKit Configuration

**In Xcode:**
1. Product → Scheme → Edit Scheme...
2. Select **"Run"** from left sidebar
3. Click **"Options"** tab
4. Under **"StoreKit Configuration"**, select `Products.storekit`
5. Click **Close**

### 3. Build and Run

```bash
cd mobile
npx expo run:ios
```

---

## 💳 Testing Payment Flow

### Test Scenario 1: Subscribe to Monthly Plan

1. **Launch app** on device/simulator
2. **Go to Settings** → **Subscription**
3. **Tap "Manage Subscription"** button
4. **See pricing cards** for Monthly and Annual plans
5. **Tap "Start Free Trial"** on Monthly plan
6. **StoreKit modal appears** with subscription details
7. **Confirm purchase** (using StoreKit test mode)
8. **Success!** Should see:
   - "3-day trial activated"
   - Trial countdown timer
   - Premium features unlocked

### Test Scenario 2: Subscribe to Annual Plan

1. Same as above but select Annual plan
2. Should show $59.99/year with 3-day trial
3. Confirm and verify trial activation

### Test Scenario 3: Restore Purchases

1. **Settings** → **Subscription**
2. Scroll to bottom
3. **Tap "Restore Purchases"** button
4. Should restore any active subscriptions
5. Success message appears

### Test Scenario 4: Test Paywalls

**Photo Scanning Limit:**
1. Use app without subscribing
2. Take 3 photos (free tier limit)
3. Try to take 4th photo
4. **Paywall appears** with upgrade prompt
5. Can subscribe from paywall

**Barcode Scanning Limit:**
1. Scan 2 barcodes (free tier limit)
2. Try to scan 3rd barcode
3. **Paywall appears**

**Recipe Builder (Premium Only):**
1. Go to Recipes tab
2. Try to create recipe
3. **Paywall appears** (feature requires premium)

---

## 🧪 StoreKit Testing Features

### Test Different Scenarios

**In Xcode StoreKit Configuration:**

1. **Fast-forward time**:
   - Edit Scheme → Run → Options
   - Set "Time Rate" to faster speed
   - Trial will expire quickly for testing

2. **Test subscription renewal**:
   - Subscriptions auto-renew in test mode
   - Monthly renews every few minutes (accelerated)

3. **Test billing issues**:
   - StoreKit Settings → Enable "Billing Issues"
   - Simulates payment failures

4. **Test cancellations**:
   - In StoreKit transaction manager
   - Right-click subscription → Cancel
   - Test app behavior with cancelled sub

### View Test Transactions

**In Xcode:**
1. Debug → StoreKit → Manage Transactions
2. See all test purchases
3. Can refund, cancel, or modify subscriptions

---

## 📱 Testing on Physical Device

### Option 1: StoreKit Configuration (Recommended for Dev)

**Works on device without App Store Connect setup:**
1. Connect iPhone via USB
2. Run: `npx expo run:ios --device`
3. Select your device
4. StoreKit Configuration will work
5. No real money involved
6. Test all scenarios safely

### Option 2: Sandbox Testing (Production-Like)

**Requires App Store Connect setup:**

#### Step 1: Create Sandbox Tester

1. Go to https://appstoreconnect.apple.com
2. Users and Access → Sandbox Testers
3. Click **"+"** to add tester
4. Fill in fake email (e.g., `test@example.com`)
5. Choose country and password
6. Save

#### Step 2: Create Products in App Store Connect

1. My Apps → Your App → In-App Purchases
2. Create subscription group: "Premium"
3. Add subscriptions:
   - ID: `com.forma.premium.monthly`
   - Price: $9.99
   - Free trial: 3 days
4. Repeat for annual (`com.forma.premium.annual`)
5. Submit for review (for production) or use immediately (sandbox)

#### Step 3: Test with Sandbox Account

1. **On iPhone**: Settings → App Store → Sign Out
2. **Don't sign back in!** (sandbox tester will sign in automatically)
3. Run app from Xcode
4. Attempt purchase
5. **Sign in with sandbox tester** when prompted
6. Complete purchase
7. **No real money charged!**

---

## 🔄 Purchase Flow (Under the Hood)

### What Happens When User Subscribes

1. **User taps "Start Free Trial"**
   ```typescript
   PaywallScreen.tsx → onPurchase(packageToPurchase)
   ```

2. **Store initiates purchase**
   ```typescript
   useSubscriptionStore.purchasePackage(packageToPurchase)
   ```

3. **RevenueCat processes purchase**
   ```typescript
   Purchases.purchasePackage(packageToPurchase)
   ```

4. **Store checks for entitlements**
   - If RevenueCat entitlement exists → Grant premium
   - If no entitlement but first time → Start local 3-day trial
   - If trial already used → Keep free tier

5. **Update UI**
   - `subscriptionStatus`: 'free' | 'trial' | 'premium'
   - `isPremium`: boolean
   - `trialInfo`: trial details

6. **Persist to AsyncStorage**
   - Status saved for offline access
   - Trial dates stored user-specifically

### Error Handling

**User cancels:**
```typescript
if (error.userCancelled) {
  return false; // Silent failure, no error shown
}
```

**Network error:**
```typescript
Alert.alert('Connection Error', 'Please try again later')
```

**Already subscribed:**
```typescript
Alert.alert('Already Subscribed', 'You already have an active subscription')
```

**StoreKit error:**
```typescript
Alert.alert('Purchase Failed', error.message)
```

---

## 🐛 Troubleshooting

### Issue: "No packages available"

**Symptoms:**
- Paywall shows "Please configure RevenueCat offerings"
- No pricing cards visible

**Solutions:**

1. **Check RevenueCat Dashboard:**
   - Offerings → "default" offering
   - Must be marked as **"Current"**
   - Must have products with IDs matching StoreKit

2. **Check Product IDs Match:**
   - RevenueCat: `com.forma.premium.monthly`
   - StoreKit: `com.forma.premium.monthly`
   - Must be **EXACTLY** the same

3. **Check API Keys:**
   - Development build needs iOS API key (`appl_...`)
   - Not Test Store key (`rcb_...`)
   - Set in `.env` or `useSubscriptionStore.ts`

4. **Check Console Logs:**
   ```
   📦 Offerings response: { current: 'default', ... }
   ✅ Found 2 packages in current offering
   ```

### Issue: Purchase completes but no premium access

**Check these:**

1. **Trial not starting?**
   - Check console for "🎁 Starting trial"
   - Verify `AsyncStorage` has trial dates
   - Check `TRIAL_DURATION_DAYS` constant

2. **Entitlement not recognized?**
   - Check RevenueCat dashboard → Customers
   - Verify entitlement "premium" is active
   - Check `customerInfo.entitlements.active['premium']`

3. **User ID mismatch?**
   - Trial is user-specific
   - Check `currentUserId` matches across sessions
   - Sign out and back in to verify persistence

### Issue: StoreKit Configuration not working

**Verify:**

1. **File exists:** `mobile/ios/Products.storekit`
2. **Scheme configured:** Edit Scheme → Run → Options → StoreKit Configuration
3. **Rebuilt after changes:** Clean build folder (Cmd+Shift+K) and rebuild
4. **Using development build:** Not Expo Go (StoreKit won't work in Expo Go)

### Issue: Sandbox testing not working

**Common problems:**

1. **Signed in with real Apple ID:**
   - Must sign OUT of App Store completely
   - Don't sign in manually
   - Let sandbox tester sign in during purchase

2. **Products not approved:**
   - Sandbox works even without approval
   - But metadata must be complete
   - Check all required fields filled in App Store Connect

3. **Wrong environment:**
   - Production builds use production
   - Debug builds use sandbox
   - Make sure build is debug/development

---

## 📊 Monitoring & Analytics

### Events Tracked

**Subscription Events:**
- `Subscription Started` - User begins trial/subscription
- `Trial Activated` - 3-day trial starts
- `Subscription Cancelled` - User cancels
- `Subscription Renewed` - Auto-renewal occurs
- `Restore Purchases` - User restores subscription

**Paywall Events:**
- `Paywall Viewed` - User sees upgrade prompt
- `Paywall Dismissed` - User closes without subscribing
- `Purchase Initiated` - User taps subscribe button
- `Purchase Completed` - Transaction successful
- `Purchase Failed` - Transaction error

**Limit Events:**
- `Photo Scan Limit Reached` - Free tier limit hit
- `Barcode Scan Limit Reached` - Free tier limit hit
- `Recipe Builder Blocked` - Premium-only feature accessed

### Check in RevenueCat Dashboard

1. **Overview** - Revenue, active subscriptions
2. **Customers** - Individual user subscriptions
3. **Charts** - Subscriber growth, churn
4. **Events** - Purchase events log

---

## ✅ Pre-Launch Checklist

### RevenueCat Configuration

- [ ] ✅ Entitlement "premium" created
- [ ] ✅ Products added (monthly & annual)
- [ ] ✅ Offering "default" created
- [ ] ✅ Packages added to offering
- [ ] ✅ Offering set as "Current"
- [ ] ✅ iOS API key configured in app

### StoreKit Configuration

- [ ] ✅ `Products.storekit` file exists
- [ ] ✅ Products match RevenueCat IDs exactly
- [ ] ✅ Subscription group created
- [ ] ✅ Prices set correctly
- [ ] ✅ Free trials configured (optional)
- [ ] ✅ Scheme configuration enabled

### App Store Connect (Production)

- [ ] ⏳ Products created in App Store Connect
- [ ] ⏳ Subscription group created
- [ ] ⏳ Product IDs match everywhere
- [ ] ⏳ Pricing & localization set
- [ ] ⏳ Submitted for review
- [ ] ⏳ Approved by Apple

### Testing Completed

- [ ] ✅ Monthly subscription purchase
- [ ] ✅ Annual subscription purchase
- [ ] ✅ Free trial activation
- [ ] ✅ Trial expiration behavior
- [ ] ✅ Restore purchases
- [ ] ✅ Paywall displays
- [ ] ✅ Premium features unlock
- [ ] ✅ Feature limits enforced
- [ ] ✅ Error handling
- [ ] ✅ User cancellation flow

### Code Quality

- [ ] ✅ Purchase errors handled gracefully
- [ ] ✅ Loading states shown during purchase
- [ ] ✅ Success confirmation displayed
- [ ] ✅ Trial countdown visible
- [ ] ✅ Subscription status persists offline
- [ ] ✅ User can restore on new device

---

## 🎓 Best Practices

### 1. Always Test Restore Purchases

- Users switch devices
- Users reinstall app
- Must be able to restore access
- Test on fresh install

### 2. Handle Edge Cases

- Network failures mid-purchase
- App killed during purchase
- Subscription expires while using app
- User cancels during free trial

### 3. Clear Communication

- Show what trial includes
- Explain when charged
- Display cancellation policy
- Provide support contact

### 4. Graceful Degradation

- Free tier still useful
- Don't block core features
- Show value of premium
- Don't spam upgrade prompts

### 5. Analytics

- Track conversion rates
- Monitor trial-to-paid conversion
- Track feature usage by tier
- Identify upgrade triggers

---

## 📞 Support Resources

### RevenueCat
- Docs: https://docs.revenuecat.com
- Community: https://community.revenuecat.com
- Support: support@revenuecat.com

### Apple
- StoreKit Docs: https://developer.apple.com/storekit
- App Store Connect: https://appstoreconnect.apple.com
- Sandbox Testing: https://developer.apple.com/apple-pay/sandbox-testing/

### Forma-Specific
- Subscription Store: `mobile/src/store/useSubscriptionStore.ts`
- Paywall Screen: `mobile/src/screens/PaywallScreen.tsx`
- Subscription Screen: `mobile/src/screens/SubscriptionScreen.ts`

---

## 🎉 You're Ready!

The payment flow is fully configured and ready to test. Follow the testing scenarios above to verify everything works correctly.

**Next Steps:**
1. ✅ Test all scenarios with StoreKit Configuration
2. ✅ Create sandbox testers for real device testing
3. ⏳ Set up products in App Store Connect
4. ⏳ Submit for review when ready to launch

Happy testing! 🚀

