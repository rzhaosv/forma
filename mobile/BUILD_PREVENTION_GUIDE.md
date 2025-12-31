# 🛡️ Build Stability & Prevention Guide

This guide explains why the recent "Missing API Key" error occurred and how we've prevented it from happening again.

## 🔍 Why it Happened: The "Cloud Gap"
When you build an app with EAS, there is a disconnect between your dashboard and the build server:
1.  **EAS Secrets** (in the dashboard) are safe storage, but they aren't automatically "poured" into your app.
2.  **EAS Build** takes your code, but it doesn't know which secrets it needs unless told.
3.  **The Result**: The build finished successfully, but the app was "empty"—it had no keys to talk to OpenAI or RevenueCat.

---

## 🚀 How we fixed it permanently

### 1. Explicit Mapping (`eas.json`)
I added an `env` section to your production profile. This acts as a bridge. Every time you build, EAS now knows exactly which secrets to pull from your dashboard and bake into the app.

```json
"production": {
  "env": {
    "EXPO_PUBLIC_OPENAI_API_KEY": "EXPO_PUBLIC_OPENAI_API_KEY"
  }
}
```

### 2. Runtime Safety Nets
I added code that checks for the key **before** it tries to use it. 
- **Old Behavior**: Failed with a generic "Could not understand meal." (Confusing)
- **New Behavior**: Alerts you with "OpenAI API Key is missing or invalid in this build." (Actionable)

---

## 📝 Rules for adding new services in the future
If you add a new API (e.g., Google Maps, Anthropic, etc.):

1.  **Add to Dashboard**: Add the key as a secret on `expo.dev`.
2.  **Update `eas.json`**: Add the variable name to the `env` section under `production`.
3.  **Use `EXPO_PUBLIC_` prefix**: Always prefix your variable names with `EXPO_PUBLIC_` so the app code can read them.
4.  **Local Sync**: Add the same key to your local `.env` file for development.

Following these steps will ensure your production builds are always "wired up" correctly!
