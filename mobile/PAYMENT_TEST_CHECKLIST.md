# Payment Flow Testing Checklist

Use this checklist to verify the payment flow is working correctly.

## ✅ Pre-Testing Setup

- [ ] StoreKit Configuration file exists: `ios/Products.storekit`
- [ ] Both products configured (monthly & annual)
- [ ] Xcode scheme has StoreKit Configuration enabled
- [ ] RevenueCat API keys configured
- [ ] App built with: `npx expo run:ios`

---

## 🧪 Test Cases

### 1. View Subscription Options

**Steps:**
1. Launch app
2. Go to Settings → Subscription
3. Tap "Manage Subscription"

**Expected:**
- [ ] See Monthly plan ($9.99/month)
- [ ] See Annual plan ($59.99/year)
- [ ] Both show "3-day free trial"
- [ ] "Best Value" badge on annual
- [ ] Features list displayed
- [ ] No loading errors

---

### 2. Subscribe to Monthly Plan

**Steps:**
1. Tap "Start Free Trial" on Monthly plan
2. Review StoreKit modal
3. Confirm purchase

**Expected:**
- [ ] StoreKit modal appears
- [ ] Shows correct price ($9.99/month)
- [ ] Shows 3-day free trial
- [ ] Can confirm or cancel
- [ ] On confirm: Success message appears
- [ ] Premium status activated
- [ ] Trial countdown shows "2 days, 23 hours..." (1 minute trial for testing)
- [ ] Settings shows "Free Trial Active"

---

### 3. Verify Premium Features Unlocked

**After subscribing:**

**Photo Scanning:**
- [ ] Can take unlimited photos
- [ ] No limit warning appears
- [ ] "Remaining scans" removed from header

**Barcode Scanning:**
- [ ] Can scan unlimited barcodes  
- [ ] No limit warning
- [ ] "Remaining scans" removed

**Recipe Builder:**
- [ ] Can access recipe builder
- [ ] Can create recipes
- [ ] No paywall appears

---

### 4. Subscribe to Annual Plan

**Steps:**
1. If already subscribed, restore app to free tier
2. Tap "Start Free Trial" on Annual plan
3. Confirm purchase

**Expected:**
- [ ] Shows $59.99/year
- [ ] Shows 3-day free trial
- [ ] Purchase completes successfully
- [ ] Premium activated

---

### 5. Restore Purchases

**Steps:**
1. Settings → Subscription
2. Scroll to bottom
3. Tap "Restore Purchases"

**Expected:**
- [ ] Loading indicator appears
- [ ] Success message: "Purchases restored successfully"
- [ ] If subscription exists: Premium activated
- [ ] If no subscription: "No purchases to restore"

---

### 6. Test Free Tier Limits

**Before subscribing:**

**Photo Scanning:**
1. Take 3 photos
2. Try 4th photo

**Expected:**
- [ ] After 3rd photo: Warning message
- [ ] On 4th attempt: Paywall appears
- [ ] Paywall shows upgrade prompt

**Barcode Scanning:**
1. Scan 2 barcodes
2. Try 3rd barcode

**Expected:**
- [ ] After 2nd scan: Warning
- [ ] On 3rd attempt: Paywall appears

**Recipe Builder:**
1. Try to create recipe

**Expected:**
- [ ] Paywall appears immediately
- [ ] Shows recipe builder as premium feature

---

### 7. Test User Cancellation

**Steps:**
1. Attempt to subscribe
2. In StoreKit modal, tap Cancel

**Expected:**
- [ ] Modal dismisses
- [ ] No error message
- [ ] Remains on free tier
- [ ] Can try again

---

### 8. Test Sign Out / Sign In

**Steps:**
1. Subscribe to plan
2. Verify trial active
3. Sign out of app
4. Sign back in

**Expected:**
- [ ] After sign in: Premium status restored
- [ ] Trial info persists
- [ ] Countdown timer continues
- [ ] No data lost

---

### 9. Test Trial Expiration

**Steps:**
1. Start trial (set to 1 minute for testing)
2. Wait 61 seconds
3. Check subscription status

**Expected:**
- [ ] Trial expires after 1 minute
- [ ] Status changes to "free"
- [ ] Premium features locked
- [ ] Can see "Trial expired" message
- [ ] Can subscribe to full plan

---

### 10. Test Error Handling

**Network Error Simulation:**
1. Turn on Airplane mode
2. Try to subscribe

**Expected:**
- [ ] Error message: "Connection Error"
- [ ] Graceful failure
- [ ] Can retry after reconnecting

**Double Subscribe:**
1. Already subscribed
2. Try to subscribe again

**Expected:**
- [ ] Prevented or shows "Already subscribed"
- [ ] No duplicate charges

---

## 🎯 StoreKit Transaction Manager

**In Xcode (during testing):**

1. Debug → StoreKit → Manage Transactions
2. View all test purchases
3. Try these actions:

**Refund:**
- [ ] Right-click transaction → Refund
- [ ] App detects and revokes premium

**Cancel Subscription:**
- [ ] Right-click → Cancel
- [ ] App shows "Subscription cancelled"
- [ ] Access until period end

**Fast-forward Time:**
- [ ] Edit Scheme → Options → Time Rate → 10x
- [ ] Monthly subscription renews in minutes
- [ ] Trial expires quickly

---

## 📊 RevenueCat Dashboard Verification

**After testing, check dashboard:**

1. Customers:
- [ ] See your test user
- [ ] Shows active entitlement
- [ ] Trial or premium status correct

2. Events:
- [ ] Purchase events logged
- [ ] Trial start events
- [ ] Restore events

3. Charts:
- [ ] Active subscribers count
- [ ] Revenue tracking

---

## 🐛 Known Issues & Fixes

### Issue: "No packages available"
**Fix:** Check RevenueCat offering is set as "Current"

### Issue: Purchase completes but no premium
**Fix:** Check console logs for trial activation errors

### Issue: Can't restore purchases
**Fix:** Ensure RevenueCat customer ID matches user ID

### Issue: StoreKit not working
**Fix:** Verify scheme has StoreKit Configuration enabled

---

## ✅ Sign-Off

**Tester:** __________________

**Date:** __________________

**Device/Simulator:** __________________

**iOS Version:** __________________

**App Version:** __________________

**All Tests Passed:** [ ] Yes  [ ] No

**Notes:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 🚀 Ready for Production

Once all tests pass:

- [ ] ✅ All test cases completed
- [ ] ✅ No critical bugs
- [ ] ✅ Error handling verified
- [ ] ✅ User experience smooth
- [ ] ✅ Restore purchases works
- [ ] ✅ Trial flow correct
- [ ] ✅ Revenue Cat tracking verified

**Next:** Set up products in App Store Connect for production!

