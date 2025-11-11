# BodyApp Development Setup Guide

## Day 1 Completed Setup ✅

This guide walks you through setting up your development environment for BodyApp.

---

## ✅ What's Already Done

1. **Project Structure Created**
   ```
   bodyapp/
   ├── mobile/              # Expo React Native app (initialized)
   ├── backend/             # Express API server (initialized)
   ├── docs/                # Documentation folder
   ├── FEATURES.md          # Feature specifications
   ├── TECH_STACK.md        # Tech stack documentation
   └── README.md            # Project overview
   ```

2. **Git Repository Initialized**
   - `.gitignore` configured for Node.js, React Native, and mobile development
   - Ready for first commit

3. **Mobile App (Expo) Set Up**
   - Created with TypeScript template
   - Dependencies installed
   - Ready to run

4. **Backend Server Scaffolded**
   - Express + TypeScript configured
   - Basic server with health check endpoint
   - Folder structure created

---

## 🔧 Prerequisites Installed

- ✅ Node.js v24.7.0
- ✅ npm v11.5.1
- ✅ Git v2.39.5

---

## 🚀 Next Steps to Complete Setup

### Step 1: Test Mobile App

```bash
cd /Users/rayzhao/workspace/bodyapp/mobile
npx expo start
```

**Expected Result:**
- QR code appears in terminal
- Metro bundler starts
- Can open on iOS Simulator (press `i`) or Android Emulator (press `a`)
- Or scan QR with Expo Go app on your phone

### Step 2: Test Backend Server

```bash
cd /Users/rayzhao/workspace/bodyapp/backend
npm run dev
```

**Expected Result:**
- Server starts on http://localhost:3000
- Visit http://localhost:3000/health to see health check response
- Visit http://localhost:3000/api/v1 to see API info

### Step 3: Create Environment Files

**Backend:**
```bash
cd /Users/rayzhao/workspace/bodyapp/backend
cp env.example .env
```

Then edit `.env` with your API keys (we'll set these up in Day 2).

**Mobile:**
```bash
cd /Users/rayzhao/workspace/bodyapp/mobile
touch .env
```

Add to mobile `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 📦 What to Install Next (Day 2)

### 1. Supabase Account Setup
- Go to https://supabase.com
- Create free account
- Create new project
- Get project URL and API keys
- Update backend `.env`

### 2. OpenAI Account Setup
- Go to https://platform.openai.com
- Create account
- Add payment method (pay-as-you-go)
- Generate API key
- Update backend `.env`

### 3. Firebase Account Setup
- Go to https://console.firebase.google.com
- Create new project
- Enable Authentication
- Enable Email/Password, Google, and Apple Sign-In
- Get configuration
- Update backend `.env` and mobile app

### 4. Development Tools (Optional but Recommended)

**Postman or Insomnia:**
- For testing API endpoints
- Download from https://www.postman.com or https://insomnia.rest

**React Native Debugger:**
```bash
brew install --cask react-native-debugger
```

**VS Code Extensions:**
- ESLint
- Prettier
- React Native Tools
- GitLens
- ES7+ React/Redux/React-Native snippets

---

## 🧪 Verify Installation

### Test 1: Mobile App Runs
```bash
cd /Users/rayzhao/workspace/bodyapp/mobile
npx expo start
```
Press `i` for iOS or `a` for Android. Should see "Open up App.tsx to start working on your app!"

### Test 2: Backend Runs
```bash
cd /Users/rayzhao/workspace/bodyapp/backend
npm run dev
```
Visit http://localhost:3000/health - should see JSON response.

### Test 3: TypeScript Compilation
```bash
cd /Users/rayzhao/workspace/bodyapp/backend
npm run build
```
Should compile without errors and create `dist/` folder.

---

## 🎯 Current Development Commands

### Mobile Development
```bash
cd mobile

# Start Expo dev server
npx expo start

# Start on iOS (Mac only)
npx expo start --ios

# Start on Android
npx expo start --android

# Clear cache
npx expo start --clear

# Install new package
npm install <package-name>
```

### Backend Development
```bash
cd backend

# Start development server (with auto-reload)
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Install new package
npm install <package-name>
```

---

## 📱 iOS Simulator Setup (Mac Only)

1. Install Xcode from Mac App Store
2. Open Xcode once to accept license
3. Install command line tools:
   ```bash
   xcode-select --install
   ```
4. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

---

## 🤖 Android Emulator Setup

1. Download Android Studio from https://developer.android.com/studio
2. Open Android Studio
3. Go to Tools → Device Manager
4. Create Virtual Device
5. Select a phone (Pixel 5 recommended)
6. Download system image (API 33 recommended)
7. Finish setup

To run emulator from command line:
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd <emulator_name>
```

---

## 🐛 Troubleshooting

### Mobile app won't start
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### Backend TypeScript errors
```bash
cd backend
rm -rf node_modules dist
npm install
npm run dev
```

### Port 3000 already in use
Change PORT in backend/.env or kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

### Expo Go app can't connect
Make sure your phone and computer are on the same WiFi network.

---

## 📚 Useful Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Express.js Docs](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

### Learning Resources
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [TypeScript for Beginners](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🎉 Setup Complete!

You're ready to start Day 2 development. Next up:
1. ✅ Complete wireframes
2. Design database schema
3. Set up external services (Supabase, OpenAI, Firebase)
4. Start building authentication

---

**Last Updated:** November 11, 2025

