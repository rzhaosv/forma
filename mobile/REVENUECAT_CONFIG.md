# RevenueCat Configuration

## Quick Setup

### For Development (Expo Go)

1. **Get Test Store API key:**
   - Go to https://rev.cat/sdk-test-store
   - Copy your Test Store API key (starts with `rcb_`)

2. **Update the Test Store key:**
   - Edit `mobile/src/store/useSubscriptionStore.ts`
   - Replace `rcb_YOUR_TEST_STORE_KEY` with your Test Store key
   
   OR set environment variable:
   ```
   EXPO_PUBLIC_REVENUECAT_TEST_KEY=rcb_...
   ```

### For Production Builds

1. **Get your API keys from RevenueCat dashboard:**
   - Go to https://app.revenuecat.com
   - Select your project
   - Navigate to API Keys section
   - Copy your iOS and Android API keys

2. **Update the API keys in the code:**
   - Edit `mobile/src/store/useSubscriptionStore.ts`
   - Replace `appl_YOUR_IOS_API_KEY` with your iOS key
   - Replace `goog_YOUR_ANDROID_API_KEY` with your Android key

   OR set environment variables:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
   ```

3. **Configure products in RevenueCat:**
   - Create an entitlement: "premium"
   - Add subscription products (monthly and annual)
   - Create an offering named "default" with both packages

## Testing

- **Expo Go**: Use Test Store API key (no real purchases, testing only)
- **Development Build**: Use regular API keys with sandbox test accounts
- Test purchases will appear in RevenueCat dashboard
- Subscription status syncs automatically

## Important Notes

- **Expo Go**: RevenueCat native features require Test Store API key
- **Production**: Use regular iOS/Android API keys
- The app will gracefully fall back to free tier if RevenueCat isn't configured

## Documentation

See `docs/infrastructure/REVENUECAT_SETUP.md` for detailed setup instructions.

