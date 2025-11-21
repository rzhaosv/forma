# Apple HealthKit Integration Setup

This app integrates with Apple HealthKit to sync weight and nutrition data with Apple Health.

## Prerequisites

⚠️ **Important**: HealthKit requires native code and will NOT work in Expo Go. You must create a development build.

## Setup Steps

### 1. Install Dependencies

Dependencies are already installed:
- `react-native-health` - HealthKit integration
- `@expo/config-plugins` - Expo config plugin support

### 2. Create Development Build

Since HealthKit requires native code, you need to create a development build:

```bash
# For iOS
npx expo prebuild
npx expo run:ios

# Or use EAS Build
eas build --profile development --platform ios
```

### 3. Configure HealthKit in Xcode

After running `npx expo prebuild`, you'll need to:

1. Open the iOS project in Xcode:
   ```bash
   open ios/Forma.xcworkspace
   ```

2. Enable HealthKit capability:
   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Click "+ Capability"
   - Add "HealthKit"

3. The Info.plist already includes the required usage descriptions:
   - `NSHealthShareUsageDescription`
   - `NSHealthUpdateUsageDescription`

### 4. Test HealthKit Integration

1. Run the app on a physical iOS device (HealthKit doesn't work in simulator)
2. Go to Settings → Apple Health
3. Enable HealthKit sync
4. Grant permissions when prompted
5. Log a weight entry or meal to test sync

## Features

### Weight Sync
- Automatically syncs weight entries to Apple Health
- Can be toggled on/off in Settings

### Meal Sync
- Automatically syncs calories, protein, carbs, and fat to Apple Health
- Can be toggled on/off in Settings

### Permissions
- Read: Weight, Height, Steps, Active Energy, Dietary Energy
- Write: Weight, Dietary Energy, Protein, Carbohydrates, Total Fat

## Troubleshooting

### HealthKit not available
- Make sure you're running on a physical iOS device (not simulator)
- Ensure you've created a development build (not Expo Go)
- Check that HealthKit capability is enabled in Xcode

### Permissions denied
- Go to iOS Settings → Privacy & Security → Health → Forma
- Enable the required permissions

### Sync not working
- Check Settings → Apple Health to ensure sync is enabled
- Verify individual sync toggles (Weight Sync, Meal Sync) are on
- Check console logs for error messages

## Notes

- HealthKit is iOS-only (Android uses Google Fit, not implemented yet)
- Data sync happens automatically when weight/meals are logged
- Sync failures don't prevent app functionality - they're logged but don't block operations

