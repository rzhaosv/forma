# Forma - AI-Powered Calorie Tracking

An intelligent calorie tracking application that uses AI to analyze food photos and provide instant nutritional information. Forma creates long-term results through effortless tracking.

## 🚀 Project Status

**Current Phase:** Days 3-5 Complete - Infrastructure Ready  
**Started:** November 11, 2025  
**Last Updated:** November 12, 2025

### Completed ✅
- ✅ Day 1: Planning, wireframes, and project setup
- ✅ Day 3: Database schema design (PostgreSQL)
- ✅ Day 4: AI service research and selection (OpenAI Vision API)
- ✅ Day 5: Backend infrastructure setup (Firebase + Supabase)
- ✅ Day 6: UI mockups and design system
- ✅ Day 6.5: Project management board and backlog (176+ tasks)

### Current Status
- **Database:** 100% ready (6 tables, functions, triggers, RLS)
- **Authentication:** 100% configured (Firebase Auth)
- **Storage:** 100% configured (Supabase Storage)
- **AI Service:** Selected and documented (OpenAI Vision API)
- **Infrastructure:** Ready for development
- **Design System:** Complete (colors, typography, components)
- **UI Mockups:** 8 key screens designed

### Next Steps (Week 1 Sprint)
- Set up theme constants and reusable components
- Implement Firebase Auth in mobile app
- Build sign up and sign in screens
- Create user profiles in Supabase
- Test complete authentication flow

**Ready to start coding!** See `docs/project/CURRENT_SPRINT.md` for this week's plan.

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

### Quick Links
- **[📋 Project Overview](./PROJECT_OVERVIEW.md)** - Complete status and overview
- **[🎯 Current Sprint](./docs/project/CURRENT_SPRINT.md)** - This week's tasks
- **[📝 Full Backlog](./docs/project/BACKLOG.md)** - All 176+ tasks
- **[🗺️ Roadmap](./docs/project/ROADMAP.md)** - 16-week timeline

### Planning & Design
- [Features Specification](./FEATURES.md)
- [Tech Stack Details](./TECH_STACK.md)
- [Wireframes](./docs/wireframes/)
- [Design System](./docs/design/DESIGN_SYSTEM.md)
- [UI Mockups](./docs/design/SCREEN_MOCKUPS.md)
- [Component Library](./docs/design/COMPONENT_LIBRARY.md)

### Technical Setup
- [Database Schema](./docs/database/SCHEMA.md)
- [Firebase Setup](./docs/infrastructure/FIREBASE_SETUP.md)
- [Supabase Setup](./docs/infrastructure/SUPABASE_SETUP.md)
- [AI Service Guide](./docs/ai/IMPLEMENTATION_GUIDE.md)

### Daily Summaries
- [Day 1](./DAY_1_SUMMARY.md), [Day 3](./DAY_3_SUMMARY.md), [Day 4](./DAY_4_SUMMARY.md), [Day 5](./DAY_5_SUMMARY.md), [Day 6](./DAY_6_SUMMARY.md), [Day 6.5](./DAY_6.5_SUMMARY.md)

## 🗓️ Development Roadmap

### Week 1-2: Planning & Setup ✅ COMPLETE
- [x] Define feature set
- [x] Choose tech stack
- [x] Set up repositories
- [x] Create wireframes
- [x] Design database schema
- [x] Research AI service
- [x] Set up infrastructure
- [x] Create UI mockups
- [x] Set up project management

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

