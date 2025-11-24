# Troubleshooting: "No Packages Available"

If you're seeing "No packages available please configure your RevenueCat offerings" in your development build, follow these debugging steps.

## Step 1: Check Console Logs

Look at your console/terminal for RevenueCat logs. You should see:

```
🔑 Configuring RevenueCat with API key: appl_xxxxx...
✅ RevenueCat configured successfully
👤 Logging in user: [user-id]
✅ User logged in to RevenueCat
🔍 Fetching available packages from RevenueCat...
📦 Offerings response: { current: 'default', all: 'default' }
✅ Found 2 packages in current offering: monthly (...), annual (...)
```

## Step 2: Identify the Issue

### Issue A: API Key Not Configured
**Console shows:**
```
⚠️ RevenueCat API key not configured.
```

**Solution:**
1. Check your `.env` file or environment variables
2. Make sure `EXPO_PUBLIC_REVENUECAT_IOS_KEY` is set correctly
3. Or update `useSubscriptionStore.ts` line 79 directly with your API key

### Issue B: No Current Offering
**Console shows:**
```
⚠️ No current offering found. Available offerings: (empty or none)
```

**Solution:**
This means RevenueCat is configured but offerings aren't set up in the dashboard.

1. Go to https://app.revenuecat.com
2. Select your project
3. Go to "Offerings" tab
4. If no offerings exist:
   - Click "New Offering"
   - Name it "default"
   - Click "Create"
5. Click on your "default" offering
6. If no packages exist:
   - First create products in the "Products" tab
   - Then come back and click "Add Package"
   - Select your product
   - Choose package identifier (e.g., "monthly", "annual")
   - Select "premium" entitlement
7. **Important:** Make sure the offering is marked as "Current"
   - Look for a toggle or button that says "Set as Current"

### Issue C: Offerings Exist But Not Current
**Console shows:**
```
⚠️ No current offering found. Available offerings: default, test, etc.
```

**Solution:**
You have offerings but none is set as current.

1. Go to RevenueCat dashboard → Offerings
2. Find your "default" offering
3. Click "Set as Current" or toggle it to active
4. Wait 1-2 minutes for changes to propagate
5. Restart your app

### Issue D: Products Not Configured
**Console shows:**
```
✅ Found 0 packages in current offering:
```

**Solution:**
Your offering exists but has no packages.

1. Go to RevenueCat dashboard → Offerings → [Your Offering]
2. Click "Add Package"
3. If you see "No products available":
   - Go to "Products" tab first
   - Click "New"
   - Create products (e.g., `com.forma.premium.monthly`)
   - Type: Auto-renewable subscription
   - Store: Apple App Store
   - Then return to Offerings and add packages

## Step 3: Verify Configuration

### Check API Key Format
- iOS key should start with: `appl_`
- Android key should start with: `goog_`
- Test Store key should start with: `rcb_`

### Check Environment Variables
```bash
# In mobile directory, check your .env file
cat .env

# Should show:
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
```

### Check Code
Open `mobile/src/store/useSubscriptionStore.ts` line 78-83:
```typescript
const REVENUECAT_API_KEY = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'appl_YOUR_IOS_API_KEY',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'goog_YOUR_ANDROID_API_KEY',
  testStore: process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY || 'rcb_YOUR_TEST_STORE_KEY',
};
```

If using `.env`, make sure:
1. File is named exactly `.env` (not `.env.local` or `.env.example`)
2. No spaces around the `=` sign
3. No quotes around the value
4. File is in the `mobile/` directory

If not using `.env`, replace the placeholder values directly in the code.

## Step 4: Common Mistakes

### Mistake 1: Using Test Store Key in Development Build
- Test Store keys (`rcb_...`) only work in Expo Go
- Development builds need regular iOS keys (`appl_...`)
- Make sure you're using the correct key type

### Mistake 2: App Bundle ID Mismatch
Your RevenueCat project needs to match your app's bundle ID:
- Bundle ID: `com.raymondzhao3000.forma`
- Check `app.json` → `ios.bundleIdentifier`
- Check RevenueCat dashboard → Project Settings → iOS App

### Mistake 3: Products Not Created in App Store Connect
For real testing (not sandbox), products must exist in:
1. App Store Connect (for iOS)
2. Google Play Console (for Android)

For sandbox testing, you can use any product IDs.

### Mistake 4: Offering Not Set as Current
Multiple offerings can exist, but only one can be "current".
The SDK fetches the current offering by default.

## Step 5: Force Refresh

1. **Completely close and restart your app**
   - Don't just reload, actually kill the app
   - Reopen it fresh

2. **Clear RevenueCat cache**
   - Sign out of your account in the app
   - Sign back in
   - This re-initializes RevenueCat

3. **Check dashboard sync time**
   - Changes in RevenueCat dashboard can take 1-2 minutes to sync
   - Wait a bit after making changes

## Step 6: Test with RevenueCat Dashboard

1. Go to RevenueCat dashboard → Customers
2. Search for your user (by app user ID or email)
3. Click on the user
4. See what offerings they should see
5. This helps verify the dashboard configuration

## Step 7: Still Not Working?

### Enable Debug Logging
The updated store now includes extensive logging. Check your console for:
- API key configuration messages
- Offerings fetch messages
- Package count
- Any error messages

### Check RevenueCat Status
- https://status.revenuecat.com
- Make sure services are operational

### Verify Network Connection
- Make sure your device/simulator has internet
- Check if you can access other APIs

### Try the Debug Offering
If you have a "test" offering, you can temporarily set it as current to verify your setup works.

## Quick Test Without Real Products

To test the flow without setting up real products:

1. Create any product ID in RevenueCat dashboard (e.g., `test.monthly`)
2. Create an offering with this product
3. Set offering as current
4. Your app should now show packages (though purchases won't work without App Store products)

This at least confirms the RevenueCat connection is working.

## Need More Help?

Check the detailed logs in your console - they now include:
- What API key is being used (first 10 chars)
- What offerings are found
- How many packages are in each offering
- Detailed error messages if something fails

Share those logs if you need help debugging further.

