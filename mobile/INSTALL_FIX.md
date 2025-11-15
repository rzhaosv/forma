# 🔒 Fix "App Integrity Could Not Be Verified" Error

## Problem
iOS is blocking the app installation because it's not from the App Store.

## Solution: Trust the Developer Certificate

### Step 1: Install the App First
Even though it says it can't be verified, the app should still be on your device (just grayed out).

### Step 2: Trust the Developer Certificate

1. **Open Settings** on your iPhone
2. Go to **General**
3. Scroll down to **VPN & Device Management** (or **Device Management** on older iOS)
4. Tap on the developer certificate (usually shows as your email or "Expo" or "Apple Development")
5. Tap **Trust [Developer Name]**
6. Confirm by tapping **Trust** again

### Step 3: Launch the App
Now go back to your home screen and tap the Forma app - it should launch!

---

## Alternative: Install via TestFlight (Recommended)

If you want a smoother experience, you can distribute via TestFlight:

### Option A: Internal Testing (Free, Instant)
```bash
# Build for TestFlight
eas build --profile production --platform ios

# Then submit to TestFlight
eas submit --platform ios
```

### Option B: Use EAS Build's Direct Install
The EAS build page should have a direct install link that handles this automatically.

---

## Why This Happens

- iOS requires apps to be signed with a trusted certificate
- Development builds use a development certificate (not App Store)
- You need to manually trust it the first time
- This is a one-time setup per device

---

## ✅ After Trusting

Once you trust the certificate:
- ✅ App will launch normally
- ✅ You can use it like any other app
- ✅ Hot reload will work
- ✅ All features (camera, barcode) will work

---

## 🔄 If It Still Doesn't Work

1. **Delete the app** from your device
2. **Re-download** from the EAS build link
3. **Trust the certificate** again
4. **Launch the app**

---

## 💡 Pro Tip

If you're building frequently, consider:
- Using **TestFlight** for easier distribution
- Or keeping the **development build** on your device (certificate stays trusted)

---

**Once you trust the certificate, everything will work!** 🎉

