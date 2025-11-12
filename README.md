# Forma - AI-Powered Calorie Tracking

An intelligent calorie tracking application that uses AI to analyze food photos and provide instant nutritional information. Forma creates long-term results through effortless tracking.

## 🚀 Project Status

**Current Phase:** Day 1 - Foundation Setup  
**Started:** November 11, 2025

## 📋 Project Structure

```
forma/
├── mobile/              # React Native (Expo) mobile app
├── backend/             # Node.js + Express API server
├── docs/                # Documentation and wireframes
├── FEATURES.md          # Complete feature specification
├── TECH_STACK.md        # Technology stack documentation
└── README.md            # This file
```

## 🛠️ Tech Stack

### Mobile App
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **State Management:** Zustand + React Query
- **UI Library:** React Native Paper + NativeBase
- **Navigation:** React Navigation v6

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Firebase Auth
- **AI:** OpenAI GPT-4 Vision API

### Infrastructure
- **Hosting:** Railway.app (backend)
- **Database:** Supabase (PostgreSQL + Storage)
- **Mobile Builds:** Expo EAS
- **Payments:** Stripe + RevenueCat
- **Analytics:** Mixpanel
- **Error Tracking:** Sentry

## 📦 Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- Git
- iOS: Xcode (Mac only)
- Android: Android Studio

## 🏃 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd forma
```

### 2. Set up mobile app

```bash
cd mobile
npm install
npx expo start
```

### 3. Set up backend

```bash
cd backend
npm install
npm run dev
```

## 📱 Development Workflow

### Running on iOS Simulator (Mac only)
```bash
cd mobile
npx expo start
# Press 'i' to open iOS simulator
```

### Running on Android Emulator
```bash
cd mobile
npx expo start
# Press 'a' to open Android emulator
```

### Running on Physical Device
1. Install Expo Go app from App Store or Google Play
2. Scan the QR code shown in terminal

## 🔑 Environment Variables

### Backend (.env)
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
```

## 📚 Documentation

- [Features Specification](./FEATURES.md)
- [Tech Stack Details](./TECH_STACK.md)
- [Wireframes](./docs/wireframes/)
- [API Documentation](./backend/docs/API.md) *(Coming soon)*

## 🗓️ Development Roadmap

### Week 1-2: Planning & Setup ✅ (In Progress)
- [x] Define feature set
- [x] Choose tech stack
- [x] Set up repositories
- [ ] Create wireframes
- [ ] Design database schema

### Week 3-6: Core Development
- [ ] User authentication
- [ ] Camera integration
- [ ] AI food recognition
- [ ] Manual food entry
- [ ] Daily food diary

### Week 7-8: AI & Accuracy
- [ ] Train/refine food recognition
- [ ] Build food database
- [ ] Portion size estimation

### Week 9-10: User Experience
- [ ] Dark mode
- [ ] Onboarding flow
- [ ] Progress tracking
- [ ] Charts and visualizations

### Week 11-12: Monetization
- [ ] Subscription tiers
- [ ] Payment integration
- [ ] Free trial system

### Week 13+: Launch & Growth
- [ ] App store optimization
- [ ] Beta testing
- [ ] Marketing campaigns
- [ ] Influencer partnerships

## 🤝 Contributing

This is a solo project in development. Contributions will be welcomed after MVP launch.

## 📄 License

Proprietary - All rights reserved

## 📧 Contact

For questions or inquiries: [Your email]

---

**Built with ❤️ by Ray Zhao**

