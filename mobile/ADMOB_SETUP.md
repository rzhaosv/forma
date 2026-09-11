# AdMob in Nibble — integration plan (not yet built)

**Status 2026-09-10.** AdMob account is prepared; the app is not. Publisher `ca-app-pub-5844884651380174`. AdMob app "Forma iOS" `~4273331628` is now linked to the App Store listing (id 6755325879). `https://tryforma.app/app-ads.txt` is live with `google.com, pub-5844884651380174, DIRECT, f08c47fec0942fa0`; AdMob's crawler had not yet picked it up at the time of writing (it can take 24h) so the app still shows "Requires review". Account verification itself is pending (up to two weeks). No ads SDK is in this repo.

## Why this is a decision, not a chore
- Nibble ships with **no tracking** on its privacy label and an Android plugin that strips AD_ID. Adding Google Mobile Ads reintroduces the advertising identifier, requires the **App Tracking Transparency** prompt and a **privacy-label change** ("Data used to track you: Identifiers, Usage data" for third-party advertising). That is a visible change to the one clean app on the account.
- It is a new native SDK in an app rejected twice for crash-on-launch, and it means a 1.7 App Review while Lapis is under 4.3(a) scrutiny. Ship it as a deliberate release, not a patch.
- Nibble's free tier today is "Continue with the free version" → full Main. There is no scan limit to gate with a rewarded ad. The honest first integration is a **banner for non-premium users** plus "Ad-free" on the paywall; a rewarded-unlock only makes sense once a real free-tier limit exists.

## Ad unit IDs (iOS)
| Unit | ID | Use |
|---|---|---|
| Banner | ca-app-pub-5844884651380174/4537781859 | Bottom of Main tabs, non-premium only |
| Interstitial | ca-app-pub-5844884651380174/1911618518 | Do not use in a logger (uninstalls) |
| Rewarded | ca-app-pub-5844884651380174/2955562286 | Only after a free-tier limit exists |
Use Google's test IDs (`ca-app-pub-3940256099942544/2934735716` banner) in dev builds.

## Steps (≈1 day + review)
1. `npm i react-native-google-mobile-ads expo-tracking-transparency` (RN 0.81 / Expo 54 compatible; `useFrameworks: static` is already set, which the SDK requires).
2. `app.json` → plugins:
   ```json
   ["react-native-google-mobile-ads", {
     "iosAppId": "ca-app-pub-5844884651380174~4273331628",
     "androidAppId": "ca-app-pub-5844884651380174~8167765982",
     "userTrackingUsageDescription": "Nibble uses this to show ads that are more relevant to you in the free version. Your meals and health data are never shared.",
     "skAdNetworkItems": "default"
   }],
   ["expo-tracking-transparency", { "userTrackingPermission": "…same text…" }]
   ```
   Remove `./plugins/withRemoveAdId` only for the Android build that ships ads (Play Data Safety must then declare advertising ID).
3. `src/services/ads.ts`: on first Main render for non-premium users, `requestTrackingPermissionsAsync()` then `mobileAds().initialize()`; run the UMP consent form (`AdsConsent.requestInfoUpdate` / `gatherConsent`) — required for EEA/UK; harmless in the US. Never initialise for premium users.
4. `src/components/AdBanner.tsx`: `<BannerAd unitId=… size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />` rendered under the tab bar in `MainNavigator` when `!isPremium`; `requestNonPersonalizedAdsOnly` when ATT is denied.
5. Paywall: add the bullet "No ads" to the premium benefits (`PaywallScreen.tsx` benefits list) and make `isPremium` hide the banner immediately after purchase (already reactive via the store).
6. App Store Connect → App Privacy: add Identifiers (Device ID) and Usage Data under "Data used to track you" and "Third-party advertising"; answer the ATT question yes. Review notes: "The free tier shows a Google AdMob banner; premium removes it."
7. Build via `.github/workflows/ios-build.yml` (free macOS runner, `eas build --local`), test on a device that ads render and that premium hides them, then submit 1.7 **only when Lapis is out of review** (one review at a time on this account).

## What it is worth
Banner eCPM in the US for a utility app is ~$0.50–$2. At a few hundred free daily users that is single-digit dollars a month. The value is (a) the machinery exists before Lapis, where a rewarded-unlock free tier is the standard model, and (b) AdMob **Campaigns** (house ads) become usable to cross-promote Forma apps for free once two are live.
