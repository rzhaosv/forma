# BodyApp - Technology Stack

## Tech Stack Decision - November 2025

---

## Frontend (Mobile App)

### Primary Framework: **React Native with Expo**
**Why:**
- ✅ Single codebase for iOS and Android (faster development)
- ✅ Large community and ecosystem
- ✅ Hot reload for rapid iteration
- ✅ Expo provides camera, file system, and native modules out-of-the-box
- ✅ Easier to find developers
- ✅ Can eject to bare React Native if needed for advanced features
- ✅ OTA (Over-The-Air) updates without app store approval

**Alternatives Considered:**
- Flutter: Excellent performance but smaller ecosystem for nutrition/health APIs
- Native (Swift/Kotlin): Best performance but 2x development time

### UI Component Library: **React Native Paper + NativeBase**
- Material Design components
- Dark mode support built-in
- Customizable theming
- Accessibility compliant

### Navigation: **React Navigation v6**
- Stack, tab, and drawer navigation
- Deep linking support
- Authentication flow handling

### State Management: **Zustand + React Query**
- **Zustand**: Lightweight state management (simpler than Redux)
- **React Query (TanStack Query)**: Server state management, caching, and data fetching
- Built-in optimistic updates

### Camera & Image Processing:
- **expo-camera**: Camera access
- **expo-image-picker**: Gallery access
- **expo-image-manipulator**: Image compression before upload
- **react-native-vision-camera** (if Expo limitations hit): Advanced camera features

### Barcode Scanning:
- **expo-barcode-scanner**: Built-in barcode scanning

### Form Handling:
- **React Hook Form**: Performant form validation
- **zod**: TypeScript-first schema validation

### Charts/Visualization:
- **Victory Native**: React Native charts (line, bar, pie)
- Declarative and performant

---

## Backend

### Framework: **Node.js with Express.js + TypeScript**
**Why:**
- ✅ JavaScript/TypeScript full-stack (same language as frontend)
- ✅ Fast development
- ✅ Excellent for REST APIs
- ✅ Large ecosystem of packages
- ✅ Non-blocking I/O good for handling many requests

**Alternative Considered:**
- Python/FastAPI: Great for ML but JavaScript ecosystem is sufficient

### API Architecture: **RESTful API + WebSockets (for real-time features later)**
- Standard REST endpoints for CRUD operations
- WebSocket for future real-time features (coaching, notifications)

### Authentication: **Firebase Authentication**
**Why:**
- ✅ Email/password + OAuth (Google, Apple) out of the box
- ✅ Secure token management
- ✅ No need to build auth from scratch
- ✅ Rate limiting and security built-in
- ✅ Free tier: 50k MAU (Monthly Active Users)

### API Documentation: **Swagger/OpenAPI**
- Auto-generate API docs
- Testing interface

---

## Database

### Primary Database: **PostgreSQL (Hosted on Supabase)**
**Why:**
- ✅ Relational data model perfect for users, meals, foods
- ✅ ACID compliance (data integrity)
- ✅ Complex queries with JOIN operations
- ✅ JSON support for flexible fields
- ✅ Supabase provides:
  - Hosted PostgreSQL
  - Realtime subscriptions
  - Row Level Security (RLS)
  - Auto-generated REST API
  - Built-in authentication (if we don't use Firebase)
  - File storage
  - Free tier: 500MB database, 1GB file storage

**Schema Design:**
```
users
  - id, email, name, created_at
  - weight, height, age, gender
  - goal_weight, daily_calorie_target
  - activity_level

meals
  - id, user_id, date, meal_type (breakfast/lunch/dinner/snack)
  - created_at, updated_at

food_items
  - id, meal_id
  - name, brand, serving_size
  - calories, protein, carbs, fat
  - image_url, source (ai/manual/barcode)

foods_database
  - id, name, brand
  - calories_per_100g, protein, carbs, fat
  - barcode (optional)
  - source (usda/openfoodfacts/custom)

user_progress
  - id, user_id, date
  - weight, notes
```

### Caching Layer: **Redis (Future optimization)**
- Cache food database queries
- Session storage
- Rate limiting

---

## AI & Machine Learning

### Food Recognition: **OpenAI GPT-4 Vision API**
**Why:**
- ✅ State-of-the-art image understanding
- ✅ Can identify multiple foods in one image
- ✅ Provides detailed descriptions
- ✅ Can estimate portion sizes with prompt engineering
- ✅ No need to train custom models
- ✅ Cost: ~$0.01 per image (for high-quality images)

**Prompt Strategy:**
```
"Analyze this meal photo and list each food item with estimated:
- Food name
- Portion size (grams or standard serving)
- Estimated calories
- Protein (g)
- Carbs (g)
- Fat (g)
Return as JSON array."
```

**Alternative (Cost Optimization Later):**
- **Google Cloud Vision API + Custom Model**: For food detection, then lookup nutrition

### Nutrition Data Sources:
1. **USDA FoodData Central API** (Free)
   - 350,000+ foods
   - Comprehensive nutrition data
2. **Open Food Facts API** (Free)
   - Barcode database
   - User-contributed product info
3. **Nutritionix API** (Paid, fallback)
   - Restaurant meals
   - Branded products

---

## File Storage

### **Supabase Storage**
- Store user meal photos
- Automatic image optimization
- CDN delivery
- Free tier: 1GB storage

---

## Payment Processing

### **Stripe + RevenueCat**
**Why:**
- ✅ **Stripe**: Industry standard payment processing
- ✅ **RevenueCat**: Handles subscription complexity across iOS/Android
- ✅ RevenueCat features:
  - Cross-platform purchase tracking
  - Free trial management
  - Webhooks for subscription events
  - Analytics dashboard
  - Churn prevention tools
- ✅ Free tier: First $2.5k monthly revenue

**Subscription Tiers:**
- Free: 5 photo scans/day
- Premium ($9.99/month or $59.99/year): Unlimited

---

## Analytics & Monitoring

### **Mixpanel** (User Analytics)
- Track user behavior
- Funnel analysis (signup → free trial → paid)
- Cohort retention
- A/B testing
- Free tier: 20M events/month

### **Sentry** (Error Monitoring)
- Crash reporting
- Error tracking
- Performance monitoring
- Free tier: 5k errors/month

### **LogRocket** (Session Replay - Optional)
- Watch user sessions
- Debug issues
- Understand user behavior

---

## DevOps & Deployment

### **Hosting: Railway.app (Backend) + Expo EAS (Mobile)**
**Backend (Railway.app):**
- Easy Node.js deployment
- Auto-scaling
- Free tier: $5 credit/month

**Alternative:**
- Render.com (Free tier for backend)
- AWS Amplify (More complex setup)

**Mobile (Expo EAS - Expo Application Services):**
- Build iOS and Android apps in the cloud
- No Mac required for iOS builds
- Automated app store submissions
- OTA updates
- Free tier: Limited builds

### **CI/CD: GitHub Actions**
- Automated testing
- Automated builds
- Deploy on merge to main

### **Version Control: GitHub**
- Private repositories
- Pull request reviews
- Project boards

---

## Development Tools

### **Code Editor: Visual Studio Code**
Extensions:
- ESLint + Prettier (code formatting)
- React Native Tools
- GitLens
- Tailwind CSS IntelliSense (if using NativeWind)

### **API Testing: Postman**
- Test backend endpoints
- Share API collections with team

### **Design: Figma**
- Wireframes and mockups
- Design system
- Prototype interactions
- Free tier available

### **Project Management: Linear or Notion**
- Linear: Modern issue tracking
- Notion: Documentation + project planning

---

## Tech Stack Summary (Quick Reference)

| Layer | Technology | Cost (Initial) |
|-------|-----------|----------------|
| **Mobile** | React Native + Expo | Free |
| **Backend** | Node.js + Express + TypeScript | Free |
| **Database** | PostgreSQL (Supabase) | Free tier |
| **Auth** | Firebase Auth | Free tier |
| **AI** | OpenAI GPT-4 Vision | ~$0.01/image |
| **Nutrition Data** | USDA API + Open Food Facts | Free |
| **Storage** | Supabase Storage | Free tier |
| **Payments** | Stripe + RevenueCat | Free until revenue |
| **Analytics** | Mixpanel | Free tier |
| **Error Tracking** | Sentry | Free tier |
| **Hosting** | Railway (backend) | $5/month free |
| **Builds** | Expo EAS | Free tier |
| **Version Control** | GitHub | Free |

**Estimated Monthly Cost (First 3 months):**
- $0-50 for development (within free tiers)
- AI costs scale with usage (~$100/month for 10k scans)

**Estimated Monthly Cost (At 10k MAU):**
- Hosting: $50-100
- Database: $25
- AI (GPT-4 Vision): $500-1000 (5 scans/user avg)
- Other services: $50
- **Total: ~$625-1175/month**

**Revenue at 10k MAU (8% conversion, $9.99/month):**
- 800 paid users × $9.99 = **$7,992/month**
- **Profit margin: ~80-85%**

---

## Development Environment Setup Commands

### Prerequisites:
```bash
# Install Node.js (v18+)
# Install Git
# Install VS Code

# For iOS development (Mac only):
# Install Xcode from App Store
# Install CocoaPods: sudo gem install cocoapods

# For Android development:
# Install Android Studio
```

### Initial Setup:
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Create new Expo project
npx create-expo-app bodyapp-mobile --template blank-typescript

# Navigate to project
cd bodyapp-mobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-paper zustand @tanstack/react-query
npm install expo-camera expo-image-picker expo-barcode-scanner
npm install react-hook-form zod

# Start development server
npx expo start
```

### Backend Setup:
```bash
# Create backend directory
mkdir bodyapp-backend
cd bodyapp-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express typescript @types/express @types/node
npm install dotenv cors helmet
npm install openai axios
npm install @supabase/supabase-js

# Install dev dependencies
npm install -D nodemon ts-node @types/cors

# Initialize TypeScript
npx tsc --init
```

---

## Architecture Diagram (Text Format)

```
┌─────────────────────────────────────────────────────┐
│                   MOBILE APP                         │
│              (React Native + Expo)                   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Camera  │  │  Barcode │  │  Manual  │         │
│  │  Capture │  │  Scanner │  │  Entry   │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │             │                 │
│       └─────────────┴─────────────┘                │
│                     │                               │
└─────────────────────┼───────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   REST API GATEWAY     │
         │  (Express + TypeScript)│
         └────────────┬───────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌─────────┐ ┌──────────────┐
│   Supabase   │ │ OpenAI  │ │   Firebase   │
│  PostgreSQL  │ │  GPT-4  │ │     Auth     │
│   + Storage  │ │ Vision  │ │              │
└──────────────┘ └─────────┘ └──────────────┘
        │             │             │
        │             │             │
        └─────────────┴─────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────┐          ┌──────────────┐
│  USDA API    │          │  Stripe +    │
│  Open Food   │          │  RevenueCat  │
│  Facts API   │          │              │
└──────────────┘          └──────────────┘
```

---

## Next Steps (Day 2):
1. Install Node.js and required tools
2. Create Expo project
3. Set up GitHub repositories
4. Configure Supabase account
5. Set up Firebase project
6. Create OpenAI API account


