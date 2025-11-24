# RevenueCat Offerings Setup - Step by Step

You're seeing "no packages available" because offerings haven't been configured in your RevenueCat dashboard yet. Follow these steps to set it up.

## Quick Fix

### Option 1: Use Test Store (for Expo Go development)

If you're using Expo Go, you can test with the Test Store:

1. No offerings configuration needed
2. Go to Settings → Subscription in the app
3. Click "Test Valid Purchase" to test premium access
4. This simulates a successful purchase

### Option 2: Configure Real Offerings (for production)

## Step-by-Step: Configure Offerings in RevenueCat Dashboard

### 1. Sign in to RevenueCat
- Go to https://app.revenuecat.com
- Sign in or create a free account

### 2. Create a Project
- Click "Create a project"
- Name it "Forma" or similar
- Choose your platform (iOS/Android)

### 3. Add Your App
- Click "Add app"
- For iOS: Enter your Bundle ID: `com.raymondzhao3000.forma`
- You don't need App Store Connect integration yet for testing

### 4. Create an Entitlement
Entitlements represent access levels in your app.

1. Go to "Entitlements" tab
2. Click "Create Entitlement"
3. Enter:
   - **Identifier**: `premium`
   - **Display name**: `Premium Access`
4. Click "Create"

### 5. Create Products

#### For iOS Testing (Sandbox):
1. Go to "Products" tab
2. Click "New"
3. Create Monthly subscription:
   - **Product ID**: `com.forma.premium.monthly` (or any ID)
   - **Type**: Auto-renewable subscription
   - **Store**: Apple App Store
   - Click "Create"
4. Create Annual subscription:
   - **Product ID**: `com.forma.premium.annual`
   - **Type**: Auto-renewable subscription
   - **Store**: Apple App Store
   - Click "Create"

**Note**: For testing in sandbox, you don't need to set up products in App Store Connect first. RevenueCat will work with any product ID.

### 6. Create an Offering
Offerings group products together to show in your app.

1. Go to "Offerings" tab
2. Click "New Offering"
3. Enter:
   - **Identifier**: `default`
   - **Description**: `Default Premium Offering`
4. Click "Create"

### 7. Add Packages to Offering
1. Click on your "default" offering
2. Click "Add Package"
3. Add Monthly package:
   - **Package identifier**: `monthly`
   - **Product**: Select `com.forma.premium.monthly`
   - **Entitlement**: Select `premium`
   - Click "Save"
4. Add Annual package:
   - **Package identifier**: `annual`
   - **Product**: Select `com.forma.premium.annual`
   - **Entitlement**: Select `premium`
   - Click "Save"

### 8. Set as Current Offering
1. Make sure "default" offering is marked as "Current"
2. This is the offering that will be shown to users

### 9. Get Your API Keys
1. Go to "API Keys" in the left sidebar
2. Copy your iOS API key (starts with `appl_`)
3. Update your app configuration:

**Option A: Environment Variable (Recommended)**
Create/edit `.env` file in `mobile/` folder:
```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_YOUR_KEY_HERE
```

**Option B: Direct in Code**
Edit `mobile/src/store/useSubscriptionStore.ts` line ~79:
```typescript
const REVENUECAT_API_KEY = {
  ios: 'appl_YOUR_KEY_HERE',
  android: 'goog_YOUR_ANDROID_KEY',
};
```

### 10. ⚠️ IMPORTANT: Create StoreKit Configuration (Development Build)

**If you're using a development build (not Expo Go), you MUST create a StoreKit Configuration file.**

This error means the product IDs don't exist in App Store Connect:
```
None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect
```

**Solution: Create StoreKit Configuration File**

1. **Open Xcode**:
   ```bash
   cd mobile/ios
   open Forma.xcworkspace
   ```

2. **Create StoreKit Configuration File**:
   - File → New → File...
   - Scroll down and select **"StoreKit Configuration File"**
   - Name it: `Products.storekit`
   - Save location: `ios/` folder
   - Click **Create**

3. **Add Products**:
   - Click the **"+"** button in the editor
   - Select **"Add Auto-Renewable Subscription"**
   
   **Monthly Subscription:**
   - Product ID: Use the EXACT ID from RevenueCat (e.g., `com.forma.premium.monthly`)
   - Reference Name: `Premium Monthly`
   - Price: `$9.99`
   - Subscription Duration: `1 Month`
   - Subscription Group: Create new → `Premium Subscriptions`
   
   **Annual Subscription:**
   - Click **"+"** again
   - Product ID: Use the EXACT ID from RevenueCat (e.g., `com.forma.premium.annual`)
   - Reference Name: `Premium Annual`
   - Price: `$59.99`
   - Subscription Duration: `1 Year`
   - Subscription Group: Select `Premium Subscriptions`

4. **Enable StoreKit Configuration**:
   - In Xcode toolbar, click the scheme (should say "Forma")
   - Product → Scheme → Edit Scheme...
   - Select **"Run"** from sidebar
   - Click **"Options"** tab
   - Under **"StoreKit Configuration"**, select `Products.storekit`
   - Click **Close**

5. **Rebuild**:
   ```bash
   npx expo run:ios
   ```

**⚠️ Critical: Product IDs must match EXACTLY between RevenueCat and StoreKit file.**

### 11. Test the App
1. Restart your app completely
2. Go to Settings → Subscription
3. You should now see "Choose your plan" with Monthly and Annual options
4. Click one to test the purchase flow

## Testing Purchases

### Sandbox Testing (iOS)
1. In App Store Connect, create a Sandbox Test User
2. Sign out of your real Apple ID on device
3. When testing a purchase, sign in with the sandbox account
4. Purchases won't charge real money

### RevenueCat Test Store (Expo Go)
1. Use Test Store API key (get from https://rev.cat/sdk-test-store)
2. Update `testStore` key in `useSubscriptionStore.ts`
3. Use "Test Valid Purchase" button to simulate purchases
4. No real transactions occur

## Troubleshooting

### ❌ Error: "None of the products could be fetched from App Store Connect"

**This is the most common error for development builds.**

**Solution**: Create a StoreKit Configuration file (see Step 10 above).

Why this happens:
- You created product IDs in RevenueCat (e.g., `com.forma.premium.monthly`)
- These products don't exist in App Store Connect yet
- Development builds need a StoreKit Configuration file to simulate the products

**Quick fix:**
1. Open `mobile/ios/Forma.xcworkspace` in Xcode
2. Create StoreKit Configuration file (`Products.storekit`)
3. Add subscriptions with the SAME product IDs from RevenueCat
4. Enable the StoreKit Configuration file in your scheme
5. Rebuild with `npx expo run:ios`

### "No packages available" still shows
- Wait 1-2 minutes after creating offerings (RevenueCat needs to sync)
- Check that offering is marked as "Current"
- Verify API key is correct (should be iOS key `appl_...` for development builds)
- Restart the app completely

### "Purchase failed"
- Check you're using the correct API key
- For sandbox testing, make sure you're signed in with a sandbox account
- Check RevenueCat dashboard for error messages

### Products don't show up
- Verify products are added to the offering
- Check product IDs don't have typos
- Make sure offering is set as current
- **For development builds**: Ensure StoreKit Configuration file has matching product IDs

## Quick Testing Without App Store Setup

For rapid testing without setting up App Store Connect:

1. Create a project in RevenueCat
2. Create entitlement: `premium`
3. Create products with any IDs (e.g., `test.monthly`, `test.annual`)
4. Create offering `default` with these products
5. Add your API key to the app
6. Use sandbox test accounts or Test Store mode

The products won't be real but you can test the UI and flow.

## Need Help?

- RevenueCat Docs: https://docs.revenuecat.com
- Sandbox Testing Guide: https://docs.revenuecat.com/docs/sandbox
- Community: https://community.revenuecat.com


