# Home Dashboard Wireframes

## Screen 1: Home Dashboard (Main Screen)
```
┌─────────────────────────────┐
│  ☰  BodyApp    🔔   [👤]    │
├─────────────────────────────┤
│                             │
│  Good morning, John! 👋     │
│                             │
│  Tuesday, Nov 11, 2025      │
│  [< Today >]                │
│                             │
│  ┌─────────────────────┐   │
│  │   1,245 / 2,150     │   │
│  │                     │   │
│  │      ◐  58%         │   │
│  │   Calories Left     │   │
│  │       905           │   │
│  │                     │   │
│  │  P: 85g / 161g      │   │
│  │  C: 120g / 242g     │   │
│  │  F: 45g / 72g       │   │
│  └─────────────────────┘   │
│                             │
│  ─────  Quick Add  ─────    │
│                             │
│  [📸 Photo] [▓ Scan] [✏ Manual]  │
│                             │
│  ─────  Today's Meals  ───  │
│                             │
│  ┌─────────────────────┐   │
│  │ 🌅 Breakfast  385cal│   │
│  │ ○ Oatmeal      250  │   │
│  │ ○ Banana       105  │   │
│  │ ○ Coffee        30  │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ ☀️ Lunch       860cal│   │
│  │ ○ Chicken salad    │   │
│  └─────────────────────┘   │
│                             │
│  [+ Add Dinner]             │
│  [+ Add Snack]              │
│                             │
└─────────────────────────────┘
│ [🏠] [📊] [➕] [📖] [👤] │
└─────────────────────────────┘
```

**Elements:**
- **Header:**
  - Hamburger menu (left)
  - App name
  - Notification bell (badge if unread)
  - Profile avatar (right)
- **Greeting:** Personalized with time of day
- **Date Selector:** Navigate to different dates
- **Calorie Ring/Progress:**
  - Large circular progress indicator
  - Current calories / daily goal
  - Percentage consumed
  - Calories remaining
  - Macro progress bars
- **Quick Add Section:**
  - 3 prominent buttons for adding food
- **Meals Timeline:**
  - Grouped by meal type
  - Show individual items
  - Tap to expand/edit
- **Bottom Tab Navigation:**
  - Home (active)
  - Progress/Stats
  - Add (center, elevated)
  - Diary
  - Profile

**Interactions:**
- Tap avatar → Profile Screen
- Tap notification → Notifications
- Tap date selector → Calendar picker
- Tap calorie ring → Detailed macro view
- Tap "Photo/Scan/Manual" → Respective add flows
- Tap meal → Expand/collapse items
- Tap food item → Edit/delete options
- Swipe meal left → Delete
- Long press food → Quick actions

**States:**
- Empty state (no meals logged)
- Loading state
- Over goal (red indicators)
- Goal met (green celebration)

---

## Screen 2: Add Food Menu (Bottom Sheet)
```
┌─────────────────────────────┐
│                             │
│         (Dimmed)            │
│                             │
│                             │
│  ╔═════════════════════╗   │
│  ║                     ║   │
│  ║  Add Food           ║   │
│  ║  ─────────────────  ║   │
│  ║                     ║   │
│  ║  📸 Take Photo      ║   │
│  ║  Snap your meal     ║   │
│  ║  ───────────────    ║   │
│  ║                     ║   │
│  ║  ▓▓ Scan Barcode    ║   │
│  ║  Packaged foods     ║   │
│  ║  ───────────────    ║   │
│  ║                     ║   │
│  ║  ✏️ Manual Entry    ║   │
│  ║  Search foods       ║   │
│  ║  ───────────────    ║   │
│  ║                     ║   │
│  ║  [Cancel]           ║   │
│  ║                     ║   │
│  ╚═════════════════════╝   │
└─────────────────────────────┘
```

**Interactions:**
- Tap "Take Photo" → Camera Screen
- Tap "Scan Barcode" → Barcode Scanner
- Tap "Manual Entry" → Food Search
- Tap outside or Cancel → Dismiss

---

## Screen 3: Empty State (No Meals Logged)
```
┌─────────────────────────────┐
│  ☰  BodyApp    🔔   [👤]    │
├─────────────────────────────┤
│                             │
│  Good morning, John! 👋     │
│                             │
│  Tuesday, Nov 11, 2025      │
│  [< Today >]                │
│                             │
│  ┌─────────────────────┐   │
│  │   0 / 2,150         │   │
│  │                     │   │
│  │      ○  0%          │   │
│  │   Calories Left     │   │
│  │      2,150          │   │
│  │                     │   │
│  │  P: 0g / 161g       │   │
│  │  C: 0g / 242g       │   │
│  │  F: 0g / 72g        │   │
│  └─────────────────────┘   │
│                             │
│                             │
│        🍽️                   │
│                             │
│   Start tracking your       │
│   first meal                │
│                             │
│   Take a photo or scan      │
│   to get started            │
│                             │
│                             │
│  [📸 Take Photo]            │
│                             │
│  [▓ Scan Barcode]           │
│                             │
│  [✏ Manual Entry]           │
│                             │
│                             │
└─────────────────────────────┘
│ [🏠] [📊] [➕] [📖] [👤] │
└─────────────────────────────┘
```

**Elements:**
- Empty calorie ring (0%)
- Icon illustration
- Encouraging message
- Large CTAs to add first meal

---

## Screen 4: Over Goal Warning
```
┌─────────────────────────────┐
│  ☰  BodyApp    🔔   [👤]    │
├─────────────────────────────┤
│                             │
│  Tuesday, Nov 11, 2025      │
│  [< Today >]                │
│                             │
│  ┌─────────────────────┐   │
│  │  ⚠️ 2,450 / 2,150   │   │
│  │                     │   │
│  │      ⊗  114%        │   │
│  │   Over Goal by      │   │
│  │       300           │   │
│  │                     │   │
│  │  P: 180g / 161g ⚠️  │   │
│  │  C: 250g / 242g     │   │
│  │  F: 85g / 72g ⚠️    │   │
│  └─────────────────────┘   │
│                             │
│  ⚠️ You've exceeded your    │
│     daily goal              │
│                             │
│  That's okay! What matters  │
│  is consistency over time.  │
│                             │
│  💡 Try a light dinner to   │
│     balance your day        │
│                             │
│  [View Suggestions]         │
│                             │
│  ─────  Today's Meals  ───  │
│                             │
│  (Meals list...)            │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Red/warning color theme
- Exceeded indicator
- Supportive message (not punitive)
- Helpful suggestions
- Macros that are over marked with warning icon

---

## Screen 5: Goal Achieved Celebration
```
┌─────────────────────────────┐
│  ☰  BodyApp    🔔   [👤]    │
├─────────────────────────────┤
│                             │
│  Tuesday, Nov 11, 2025      │
│                             │
│  ┌─────────────────────┐   │
│  │   2,100 / 2,150     │   │
│  │                     │   │
│  │      ✓  98%         │   │
│  │                     │   │
│  │    🎉 Perfect!      │   │
│  │                     │   │
│  │  P: 158g / 161g ✓   │   │
│  │  C: 240g / 242g ✓   │   │
│  │  F: 70g / 72g ✓     │   │
│  └─────────────────────┘   │
│                             │
│  ✨ Amazing work, John!     │
│                             │
│  You hit your goal today    │
│  and kept all macros on     │
│  track!                     │
│                             │
│  🔥 3-day streak!           │
│                             │
│  [Share Progress]           │
│                             │
│  ─────  Today's Meals  ───  │
│                             │
│  (Meals list...)            │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Green/success color theme
- Celebration animation (confetti)
- Encouraging message
- Streak counter
- Share button

---

## Screen 6: Date Selector (Calendar)
```
┌─────────────────────────────┐
│   [✕ Close]                 │
│                             │
│  ╔═══ November 2025 ════╗  │
│  ║                       ║  │
│  ║  Su Mo Tu We Th Fr Sa ║  │
│  ║                  1  2 ║  │
│  ║  3  4  5  6  7  8  9  ║  │
│  ║ 10 [11] 12 13 14 15 16║  │
│  ║ 17 18 19 20 21 22 23  ║  │
│  ║ 24 25 26 27 28 29 30  ║  │
│  ║                       ║  │
│  ╚═══════════════════════╝  │
│                             │
│  Legend:                    │
│  ● Logged meals             │
│  ○ No data                  │
│  ✓ Goal met                 │
│                             │
│  Quick Jump:                │
│  [Yesterday] [Today]        │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Month/year selector
- Calendar grid with visual indicators
- Legend explaining indicators
- Quick navigation buttons
- Close button

**Visual Indicators on Calendar:**
- Green dot: Goal achieved
- Orange dot: Partially logged
- Red dot: Over goal
- No dot: No data
- Today: Highlighted border

---

## Bottom Tab Navigation Details
```
┌─────────────────────────────┐
│ [🏠]  [📊]  [➕]  [📖]  [👤] │
│ Home  Stats  Add  Diary Profile│
└─────────────────────────────┘
```

**Tabs:**
1. **Home (🏠):** Current screen
2. **Stats (📊):** Progress/analytics
3. **Add (➕):** Central elevated button
4. **Diary (📖):** Historical log
5. **Profile (👤):** Settings/account

**Add Button (Center):**
- Larger than other tabs
- Elevated/floating style
- Opens quick add menu

---

## Hamburger Menu (Slide-out Drawer)
```
┌─────────────────────────────┐
│                             │
│  [←]                        │
│                             │
│  ┌───────────────┐          │
│  │  [Avatar]     │          │
│  │  John Smith   │          │
│  │  john@ex.com  │          │
│  └───────────────┘          │
│                             │
│  🎯 My Goals                │
│  ───────────────            │
│                             │
│  💎 Upgrade to Premium      │
│  ───────────────            │
│                             │
│  📊 Insights & Reports      │
│  ───────────────            │
│                             │
│  🍽️ Meal Templates          │
│  ───────────────            │
│                             │
│  💧 Water Tracking          │
│  ───────────────            │
│                             │
│  🏃 Exercise Log            │
│  ───────────────            │
│                             │
│  ⚙️ Settings                │
│  ───────────────            │
│                             │
│  ❓ Help & Support          │
│  ───────────────            │
│                             │
│  📤 Sign Out                │
│                             │
│                             │
└─────────────────────────────┘
```

**Elements:**
- User profile card at top
- Menu items with icons
- Premium upsell (if free user)
- Sign out at bottom

---

## Notifications Screen
```
┌─────────────────────────────┐
│   [← Back]  Notifications   │
├─────────────────────────────┤
│                             │
│  Today                      │
│                             │
│  ┌─────────────────────┐   │
│  │ 🎉 Goal Achieved!   │   │
│  │ You hit your calorie│   │
│  │ goal yesterday!     │   │
│  │ 2 hours ago         │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 💡 Meal Reminder    │   │
│  │ Don't forget to log │   │
│  │ your lunch          │   │
│  │ 4 hours ago         │   │
│  └─────────────────────┘   │
│                             │
│  Yesterday                  │
│                             │
│  ┌─────────────────────┐   │
│  │ 🔥 3-Day Streak!    │   │
│  │ Keep it up!         │   │
│  │ Nov 10              │   │
│  └─────────────────────┘   │
│                             │
│                             │
│  [Mark All as Read]         │
│                             │
└─────────────────────────────┘
```

**Notification Types:**
- Goal achievements
- Meal reminders
- Streak milestones
- Feature updates
- Premium offers

---

## Key Design Principles

### Visual Hierarchy
1. **Primary:** Calorie count and progress
2. **Secondary:** Macros and meals
3. **Tertiary:** Actions and navigation

### Color System
- **Green:** On track, success
- **Orange:** Warning, approaching limit
- **Red:** Over goal
- **Blue:** Primary actions
- **Gray:** Secondary info

### Typography
- **Large Bold:** Calorie numbers
- **Medium:** Meal names, headers
- **Small:** Details, timestamps

### Spacing
- Generous padding around main elements
- Card-based design with shadows
- Clear separation between sections

### Accessibility
- High contrast ratios
- Large touch targets (min 44x44 pt)
- Clear labels for screen readers
- Support for dynamic text sizing

**Next Steps:**
- Create camera/photo capture wireframes
- Design meal detail screens
- Build interactive prototype

