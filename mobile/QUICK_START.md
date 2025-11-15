# 🚀 Quick Start - Forma Meal Logging

## Run the App
```bash
cd /Users/rayzhao/workspace/bodyapp/mobile
npx expo start
```

## What You Can Do Right Now

### 1. **View Dashboard** (Home Screen)
- See your daily calorie progress
- View today's meals
- Check macro totals (protein, carbs, fat)

### 2. **Add Food via Camera**
- Tap "📸 Scan Food" button
- Take photo of your meal
- Tap "Analyze Food" (uses mock AI for now)
- Tap "Save Meal" to add to your log

### 3. **Add Food Manually**
- Tap "➕ Add Manually" button
- Select meal type (breakfast, lunch, dinner, snack)
- Enter food name, portion, calories, macros
- Tap "Add to [meal type]"

### 4. **Scan Barcode**
- From camera screen, tap "🏷️ Barcode"
- Scan product barcode
- Adjust serving size
- Tap "Add to Meal"

### 5. **View Meal Details**
- Tap any meal card on home screen
- See all foods in the meal
- Remove individual foods
- Delete entire meal

## 📊 Default Goals
- **Calories**: 2000/day
- **Protein**: 150g/day

## 🎯 App Flow

```
📱 Open App
   ↓
🏠 Home Dashboard
   - See today's meals
   - View calorie progress
   - Check macro totals
   ↓
➕ Add Meal (2 options):
   │
   ├─→ 📸 Scan Food
   │     - Take photo
   │     - AI analyzes (mock)
   │     - Save to log
   │
   └─→ ✍️ Add Manually
         - Enter food details
         - Choose meal type
         - Save to log
   ↓
👀 View Meal Details
   - See all foods
   - Edit or delete
```

## 🎨 Features Highlighted

✅ **Clean UI** - Modern design with cards and colors
✅ **Real-time Updates** - Instant calorie/macro calculations
✅ **Smart Meal Types** - Auto-assigns based on time of day
✅ **Barcode Scanner** - Scan packaged foods
✅ **Photo Analysis** - AI food recognition (mock for now)
✅ **Progress Tracking** - Visual progress bars
✅ **Meal Management** - Edit and delete meals

## 🔄 State Management

All data is stored in memory using Zustand. When you:
- Add a meal → Updates daily summary
- Remove food → Recalculates totals
- Delete meal → Updates home screen

*Next step: Connect to backend API for persistence*

## 📱 Test Scenarios

### Scenario 1: Morning Routine
1. Open app at 8 AM
2. Add breakfast via camera or manual
3. See calories update on home
4. Check protein goal progress

### Scenario 2: Lunch Break
1. Scan barcode of packaged lunch
2. Adjust serving size
3. Add to meal
4. View updated daily totals

### Scenario 3: Review Day
1. View home screen in evening
2. Tap each meal to review
3. Remove any incorrect entries
4. See final day totals

## 🛠️ Tech Stack

- **React Native + Expo** - Mobile framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **React Navigation** - Screen navigation
- **expo-camera** - Camera + barcode scanner

## 📁 Key Files

```
mobile/
├── App.tsx                         # App entry point
├── src/
│   ├── types/meal.types.ts        # Data models
│   ├── store/useMealStore.ts      # State management
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Dashboard
│   │   ├── CameraScreen.tsx       # Camera/barcode
│   │   ├── AddFoodScreen.tsx      # Manual entry
│   │   └── MealDetailScreen.tsx   # Meal details
│   └── navigation/
│       └── AppNavigator.tsx       # Navigation
└── MEAL_LOGGING_GUIDE.md          # Full documentation
```

## 🎉 You're Ready!

Open the app and start tracking your meals. Everything works out of the box!

**Need help?** Check `MEAL_LOGGING_GUIDE.md` for detailed documentation.
