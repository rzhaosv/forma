# Quick StoreKit Configuration Setup (5 Minutes)

## The Problem
Your app shows "no packages available" because the product IDs in RevenueCat don't exist in Apple's system yet.

## The Solution
Create a StoreKit Configuration file to simulate the products during development.

---

## Step-by-Step Instructions

### 1. Open Xcode
```bash
cd /Users/rayzhao/workspace/bodyapp/mobile/ios
open Forma.xcworkspace
```

### 2. Create StoreKit Configuration File

In Xcode:
1. **File** → **New** → **File...**
2. Scroll down to **"StoreKit Configuration File"**
3. Click **Next**
4. Name: `Products.storekit`
5. Location: Make sure it's in the `ios/` folder
6. Click **Create**

### 3. Add Your Monthly Subscription

In the StoreKit Configuration editor (should open automatically):

1. Click the **"+"** button at the bottom left
2. Select **"Add Auto-Renewable Subscription"**
3. Fill in these fields:

   **Product ID**: Check your RevenueCat dashboard for the exact ID
   - Example: `com.forma.premium.monthly`
   - ⚠️ MUST match exactly what's in RevenueCat!
   
   **Reference Name**: `Premium Monthly`
   
   **Price**: `9.99`
   
   **Subscription Duration**: `1 Month`
   
   **Subscription Group**: Click the "+" to create new
   - Name it: `Premium Subscriptions`

4. Click somewhere else to save

### 4. Add Your Annual Subscription

1. Click **"+"** again
2. Select **"Add Auto-Renewable Subscription"**
3. Fill in:

   **Product ID**: Your annual product ID from RevenueCat
   - Example: `com.forma.premium.annual`
   - ⚠️ MUST match exactly!
   
   **Reference Name**: `Premium Annual`
   
   **Price**: `59.99`
   
   **Subscription Duration**: `1 Year`
   
   **Subscription Group**: Select `Premium Subscriptions` (the one you just created)

4. Click somewhere else to save

### 5. Enable StoreKit Configuration in Your Scheme

1. At the top of Xcode, click the scheme dropdown (should say "Forma")
2. **Product** → **Scheme** → **Edit Scheme...**
3. Select **"Run"** from the left sidebar
4. Click the **"Options"** tab
5. Find **"StoreKit Configuration"**
6. Select `Products.storekit` from the dropdown
7. Click **Close**

### 6. Save Everything

Press **⌘+S** to save all files in Xcode.

---

## Verify Your Product IDs

Before continuing, double-check your product IDs match between:

**RevenueCat Dashboard** (Products tab):
- Monthly: `_____________________`
- Annual: `_____________________`

**StoreKit Configuration** (Products.storekit):
- Monthly: `_____________________`
- Annual: `_____________________`

They MUST be identical!

---

## Next Steps

After completing the setup above:

1. Close Xcode (optional, but recommended)
2. Rebuild your app:
   ```bash
   cd /Users/rayzhao/workspace/bodyapp/mobile
   npx expo run:ios
   ```
3. Wait for the build to complete and the app to launch
4. Go to Settings → Subscription
5. You should now see your subscription packages!

---

## Troubleshooting

**Still seeing "no packages available"?**

1. ✅ Verify product IDs match exactly (case-sensitive!)
2. ✅ Ensure StoreKit Configuration is selected in scheme options
3. ✅ Rebuild the app completely (`npx expo run:ios`)
4. ✅ Check console logs for errors

**Can't find StoreKit Configuration File option when creating?**

- Make sure you're scrolling down in the template list
- It's under the "Resource" section
- If you still can't find it, you might need to update Xcode

---

## What Product IDs Are In Your RevenueCat?

Check your RevenueCat dashboard → Products tab and write them here:

1. Monthly: `_____________________`
2. Annual: `_____________________`

Use these EXACT IDs in the StoreKit Configuration file!

