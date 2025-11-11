# BodyApp - MVP Feature Specification

## Product Vision
An AI-powered calorie tracking app that makes nutrition tracking effortless through photo recognition, similar to Cal AI.

---

## MVP Features (Must-Have for Launch)

### 1. User Authentication & Onboarding
**Priority: P0 (Critical)**

- [ ] Sign up with email/password
- [ ] Sign in with Google (OAuth)
- [ ] Sign in with Apple (OAuth)
- [ ] Password reset flow
- [ ] Onboarding questionnaire:
  - Current weight
  - Goal weight
  - Height
  - Age
  - Gender
  - Activity level
  - Goal (lose weight, maintain, gain muscle)
- [ ] Auto-calculate daily calorie target using Mifflin-St Jeor equation

**User Stories:**
- As a new user, I want to quickly sign up so I can start tracking immediately
- As a user, I want to set my goals so the app can calculate my calorie needs

---

### 2. Photo-Based Food Logging
**Priority: P0 (Critical)**

- [ ] Camera integration (native camera access)
- [ ] Take photo of meal
- [ ] Photo gallery selection (choose existing photo)
- [ ] AI food recognition using GPT-4 Vision or similar
- [ ] Display recognized foods with confidence scores
- [ ] Edit recognized foods (add/remove/modify)
- [ ] Portion size estimation (small/medium/large multipliers)
- [ ] Automatic calorie and macro calculation
- [ ] Save meal with timestamp

**User Stories:**
- As a user, I want to snap a photo of my meal and get instant calorie info
- As a user, I want to correct AI mistakes so my tracking is accurate

---

### 3. Manual Food Entry (Fallback)
**Priority: P0 (Critical)**

- [ ] Search food database (USDA + custom database)
- [ ] Display search results with nutrition info
- [ ] Select portion/serving size
- [ ] Add to daily log
- [ ] Create custom foods
- [ ] Quick add (calories only, skip macros)

**User Stories:**
- As a user, I want to manually add foods when photos don't work well
- As a user, I want to create custom entries for my home-cooked meals

---

### 4. Barcode Scanner
**Priority: P1 (High)**

- [ ] Barcode scanning using device camera
- [ ] Look up nutrition info from barcode database (Open Food Facts API)
- [ ] Display product details
- [ ] Add scanned item to log
- [ ] Handle products not found (allow manual entry)

**User Stories:**
- As a user, I want to quickly scan packaged foods instead of searching

---

### 5. Daily Food Diary
**Priority: P0 (Critical)**

- [ ] View today's meals organized by meal type:
  - Breakfast
  - Lunch
  - Dinner
  - Snacks
- [ ] Display running totals:
  - Calories consumed / daily goal
  - Protein (g)
  - Carbs (g)
  - Fat (g)
- [ ] Progress ring/bar visualization
- [ ] Edit logged meals
- [ ] Delete logged meals
- [ ] Copy meals to another day
- [ ] Navigate between dates (calendar view)

**User Stories:**
- As a user, I want to see my daily progress at a glance
- As a user, I want to easily edit or delete entries if I made mistakes

---

### 6. Weekly Progress Dashboard
**Priority: P1 (High)**

- [ ] Weekly calorie chart (bar or line graph)
- [ ] Weekly macro breakdown (pie chart or stacked bars)
- [ ] Weight tracking (weekly weigh-ins)
- [ ] Weight trend chart
- [ ] Streak counter (consecutive days logged)
- [ ] Weekly summary statistics

**User Stories:**
- As a user, I want to see my weekly trends to understand my progress
- As a user, I want to track my weight changes over time

---

### 7. User Profile & Settings
**Priority: P1 (High)**

- [ ] View/edit profile information
- [ ] Update goals and calorie targets
- [ ] Notification settings
- [ ] Units preference (imperial/metric)
- [ ] Dark mode toggle
- [ ] App tutorial/help
- [ ] Logout

**User Stories:**
- As a user, I want to update my goals as my weight changes
- As a user, I want dark mode for nighttime tracking

---

## Free vs Premium Features

### Free Tier Limitations:
- 5 photo scans per day
- Basic food database
- 7-day history view
- Manual entry unlimited

### Premium Features ($9.99/month):
- Unlimited photo scans
- Barcode scanning unlimited
- Advanced analytics (30-day+ history)
- Meal planning (future feature)
- Recipe builder (future feature)
- Fitness tracker integrations (future feature)
- Export data (CSV/PDF)
- Priority support
- Ad-free experience

---

## Post-MVP Features (Phase 2+)

### Phase 2 (Weeks 9-12):
- [ ] Recipe builder with ingredient scanning
- [ ] Meal templates/favorites
- [ ] Water intake tracking
- [ ] Exercise logging
- [ ] Social features (share meals, follow friends)

### Phase 3 (Weeks 13-16):
- [ ] Apple Health integration
- [ ] Google Fit integration
- [ ] MyFitnessPal import
- [ ] Fitbit/Garmin sync
- [ ] Meal planning with shopping lists

### Phase 4 (Weeks 17+):
- [ ] AI meal suggestions based on goals
- [ ] Restaurant menu scanning
- [ ] Nutrition coach chatbot
- [ ] Community challenges
- [ ] Macro coaching programs

---

## Technical Requirements

### Performance:
- Photo analysis: < 3 seconds
- App launch: < 2 seconds
- Search results: < 1 second
- Offline mode: Cache last 7 days of data

### Accuracy:
- AI food recognition: 80%+ accuracy target
- Calorie calculations: Match USDA database within 5%

### Platforms:
- iOS 14+
- Android 10+

### Accessibility:
- VoiceOver/TalkBack support
- Dynamic text sizing
- High contrast mode support

---

## Success Metrics

### Engagement:
- Daily Active Users / Monthly Active Users > 30%
- Average sessions per day: 3+
- Average meals logged per day: 2+

### Retention:
- Day 1: 60%+
- Day 7: 40%+
- Day 30: 20%+

### Monetization:
- Free trial start rate: 50%+
- Free trial → Paid conversion: 8%+
- Monthly churn: < 5%

### Quality:
- App Store rating: 4.5+ stars
- Crash-free rate: 99.5%+
- AI accuracy satisfaction: 85%+

