# Camera & Photo Recognition Wireframes

## Screen 1: Camera Capture
```
┌─────────────────────────────┐
│ [✕]               Flash [⚡] │
│                             │
│                             │
│    ┌───────────────────┐   │
│    │                   │   │
│    │                   │   │
│    │   📷 CAMERA       │   │
│    │    VIEWFINDER     │   │
│    │                   │   │
│    │                   │   │
│    │                   │   │
│    │  [Focus Square]   │   │
│    │                   │   │
│    │                   │   │
│    │                   │   │
│    └───────────────────┘   │
│                             │
│                             │
│  💡 Frame your entire meal  │
│                             │
│  [Gallery] ⊙  CAPTURE  ⊙ [↻]│
│                             │
└─────────────────────────────┘
```

**Elements:**
- **Header:**
  - Close button (X)
  - Flash toggle (auto/on/off)
- **Viewfinder:**
  - Full screen camera preview
  - Focus indicator
  - Grid overlay (optional)
- **Footer:**
  - Gallery button (access recent photos)
  - Capture button (large, center)
  - Flip camera button (front/back)
- **Tip:** Helpful hint at bottom

**Interactions:**
- Tap to focus on specific area
- Pinch to zoom
- Tap capture → Processing screen
- Tap gallery → Photo picker
- Tap flip → Switch camera

**Permissions:**
- First time: Request camera permission
- Denied: Show explanation + settings link

---

## Screen 2: Photo Gallery Picker
```
┌─────────────────────────────┐
│   [← Cancel]  Select Photo  │
├─────────────────────────────┤
│                             │
│  Recent Photos              │
│                             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │ 🖼️ │ │ 🖼️ │ │ 🖼️ │      │
│  │    │ │    │ │    │      │
│  └────┘ └────┘ └────┘      │
│                             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │ 🖼️ │ │ 🖼️ │ │ 🖼️ │      │
│  │    │ │    │ │    │      │
│  └────┘ └────┘ └────┘      │
│                             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │ 🖼️ │ │ 🖼️ │ │ 🖼️ │      │
│  │    │ │    │ │    │      │
│  └────┘ └────┘ └────┘      │
│                             │
│                             │
│  [Camera] [Albums] [Recents]│
│                             │
└─────────────────────────────┘
```

**Elements:**
- Grid of photos (3 columns)
- Tabs: Camera, Albums, Recents
- Selected photo has checkmark/highlight
- Cancel button

**Interactions:**
- Tap photo → Select and go to Processing
- Tap Camera tab → Camera Capture
- Tap Albums → Album list
- Long press → Preview

---

## Screen 3: Processing / Analyzing
```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│      ┌───────────────┐      │
│      │               │      │
│      │  [Photo       │      │
│      │   Preview]    │      │
│      │               │      │
│      └───────────────┘      │
│                             │
│                             │
│      ⊙ Analyzing...         │
│                             │
│   AI is recognizing your    │
│   food and calculating      │
│   nutrition                 │
│                             │
│      ━━━━━━━━━              │
│        Loading              │
│                             │
│                             │
│                             │
│   [Cancel]                  │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Photo preview (medium size)
- Loading spinner
- Status message
- Progress bar (if API provides progress)
- Cancel button

**States:**
- Uploading image
- AI analyzing
- Fetching nutrition data

**Typical Duration:** 1-3 seconds

---

## Screen 4: AI Results - Food Recognition
```
┌─────────────────────────────┐
│   [← Back]  Review & Edit   │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │   [Photo Thumbnail] │   │
│  └─────────────────────┘   │
│                             │
│  ✨ We found 3 items         │
│                             │
│  ┌─────────────────────┐   │
│  │ ☑ Grilled Chicken   │   │
│  │   150g • 248 cal    │   │
│  │   P: 37g C: 0g F:8g │   │
│  │   Confidence: 95%   │   │
│  │   [Edit] [✏️]        │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ ☑ White Rice        │   │
│  │   200g • 260 cal    │   │
│  │   P: 5g C: 58g F:1g │   │
│  │   Confidence: 90%   │   │
│  │   [Edit] [✏️]        │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ ☑ Broccoli          │   │
│  │   100g • 34 cal     │   │
│  │   P: 3g C: 7g F:0g  │   │
│  │   Confidence: 85%   │   │
│  │   [Edit] [✏️]        │   │
│  └─────────────────────┘   │
│                             │
│  [+ Add Item]               │
│                             │
│  ─────────────────────      │
│  Total: 542 calories        │
│                             │
│  [Save to Diary]            │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Photo thumbnail (tap to view full)
- Success message with item count
- List of recognized foods:
  - Checkbox (selected by default)
  - Food name
  - Portion size
  - Calories
  - Macros
  - Confidence score (shown if < 90%)
  - Edit button
- Add item manually button
- Total calories summary
- Save button

**Interactions:**
- Uncheck item → Remove from total
- Tap "Edit" → Edit food details
- Tap food card → Expand details
- Tap photo → Full screen view
- "Add Item" → Manual search
- "Save" → Confirm and save

---

## Screen 5: Edit Food Item
```
┌─────────────────────────────┐
│   [← Cancel]  Edit Item   ✓ │
├─────────────────────────────┤
│                             │
│  Grilled Chicken            │
│                             │
│  Serving Size               │
│  ┌─────────────────────┐   │
│  │  150         g  ▼   │   │
│  └─────────────────────┘   │
│                             │
│  Common Portions:           │
│  [100g] [1 breast] [1 cup]  │
│                             │
│  ─────────────────────      │
│                             │
│  Nutrition (per serving)    │
│                             │
│  Calories                   │
│  ┌─────────────────────┐   │
│  │  248        kcal    │   │
│  └─────────────────────┘   │
│                             │
│  Protein                    │
│  ┌─────────────────────┐   │
│  │  37         g       │   │
│  └─────────────────────┘   │
│                             │
│  Carbs                      │
│  ┌─────────────────────┐   │
│  │  0          g       │   │
│  └─────────────────────┘   │
│                             │
│  Fat                        │
│  ┌─────────────────────┐   │
│  │  8          g       │   │
│  └─────────────────────┘   │
│                             │
│  [Delete Item]              │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Food name (editable)
- Portion size input with unit selector
- Quick portion buttons
- Nutrition inputs (auto-calculate based on portion)
- Delete button
- Save (✓) in header
- Cancel in header

**Interactions:**
- Change portion → Auto-recalculate nutrition
- Tap quick portion → Set portion size
- Manual edit nutrition values
- "Delete" → Remove item
- "✓" → Save changes
- "Cancel" → Discard changes

---

## Screen 6: Low Confidence Warning
```
┌─────────────────────────────┐
│   [← Back]  Review & Edit   │
├─────────────────────────────┤
│                             │
│  ⚠️ Please verify results   │
│                             │
│  ┌─────────────────────┐   │
│  │   [Photo Thumbnail] │   │
│  └─────────────────────┘   │
│                             │
│  We detected these items,   │
│  but confidence is low.     │
│  Please review carefully.   │
│                             │
│  ┌─────────────────────┐   │
│  │ ☑ Unknown Food      │   │
│  │   Looks like pasta  │   │
│  │   100g • 131 cal    │   │
│  │   ⚠️ Confidence: 60%│   │
│  │   [Edit] [✏️]        │   │
│  └─────────────────────┘   │
│                             │
│  💡 Tip: For better         │
│     accuracy, try:          │
│     • Better lighting       │
│     • Closer photo          │
│     • Less overlapping food │
│                             │
│  [+ Add Manually]           │
│                             │
│  [Retake Photo]             │
│                             │
│  [Save Anyway]              │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Warning banner
- Photo with issue indicator
- Explanation message
- Items with low confidence marked
- Helpful tips
- Action buttons:
  - Add manually
  - Retake photo
  - Save anyway (if confident)

---

## Screen 7: AI Failed / No Results
```
┌─────────────────────────────┐
│   [← Back]  Add Food        │
├─────────────────────────────┤
│                             │
│                             │
│      ┌───────────────┐      │
│      │  [Photo]      │      │
│      └───────────────┘      │
│                             │
│         😕                   │
│                             │
│   We couldn't identify      │
│   any food in this photo    │
│                             │
│                             │
│   This might help:          │
│                             │
│   • Ensure good lighting    │
│   • Show the full meal      │
│   • Avoid blurry photos     │
│   • Remove packaging        │
│                             │
│                             │
│   [Try Again]               │
│                             │
│   [Add Manually]            │
│                             │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Photo preview
- Error icon/illustration
- Friendly error message
- Helpful suggestions
- Action buttons

**Reasons for Failure:**
- No food detected
- Image too blurry
- Poor lighting
- API error
- Network issue

---

## Screen 8: Meal Saved Success
```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│           ✓                 │
│                             │
│      Meal Added!            │
│                             │
│     542 calories            │
│                             │
│   Added to Lunch            │
│                             │
│                             │
│   (Auto-dismiss in 2s)      │
│                             │
│   [View Diary]              │
│                             │
│   [Add Another]             │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Success checkmark with animation
- Confirmation message
- Calorie total
- Which meal it was added to
- Quick actions
- Auto-dismiss (returns to home)

**Interactions:**
- "View Diary" → Go to meal log
- "Add Another" → Camera capture again
- Auto-dismiss → Return to home

---

## Screen 9: Select Meal Type (Before Save)
```
┌─────────────────────────────┐
│                             │
│  Add to which meal?         │
│  ─────────────────────      │
│                             │
│  ╔═════════════════════╗   │
│  ║                     ║   │
│  ║  ○ Breakfast        ║   │
│  ║  ───────────────    ║   │
│  ║                     ║   │
│  ║  ● Lunch            ║   │
│  ║  ───────────────    ║   │
│  ║                     ║   │
│  ║  ○ Dinner           ║   │
│  ║  ───────────────    ║   │
│  ║                     ║   │
│  ║  ○ Snack            ║   │
│  ║  ───────────────    ║   │
│  ║                     ║   │
│  ║  [Cancel]           ║   │
│  ║                     ║   │
│  ╚═════════════════════╝   │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Bottom sheet modal
- Radio button selection
- Auto-select based on time of day
- Cancel button

**Smart Defaults:**
- 5am-10am: Breakfast
- 10am-3pm: Lunch
- 3pm-8pm: Dinner
- Other times: Snack

---

## Photo Tips Overlay (First Time)
```
┌─────────────────────────────┐
│ [Skip]                      │
│                             │
│  📸 Photo Tips              │
│                             │
│  ┌─────────────────────┐   │
│  │   [Example Good]    │   │
│  │   ✓                 │   │
│  └─────────────────────┘   │
│                             │
│  DO:                        │
│  • Good lighting            │
│  • Show entire meal         │
│  • Direct overhead angle    │
│  • Remove packaging         │
│  • Clear, focused shot      │
│                             │
│  ┌─────────────────────┐   │
│  │   [Example Bad]     │   │
│  │   ✗                 │   │
│  └─────────────────────┘   │
│                             │
│  AVOID:                     │
│  • Blurry photos            │
│  • Poor lighting            │
│  • Partial view             │
│  • Too far away             │
│                             │
│  [Got it!]                  │
│                             │
└─────────────────────────────┘
```

**Shown:**
- First time user opens camera
- Can be accessed from settings later
- Skip option available

---

## Premium Limit Reached (Free Tier)
```
┌─────────────────────────────┐
│   [✕ Close]                 │
│                             │
│          💎                  │
│                             │
│   Daily Photo Limit         │
│   Reached                   │
│                             │
│   You've used all 5 photo   │
│   scans for today           │
│                             │
│   ─────────────────────     │
│                             │
│   Upgrade to Premium for:   │
│                             │
│   ✓ Unlimited photo scans   │
│   ✓ Barcode scanning        │
│   ✓ Advanced analytics      │
│   ✓ Meal planning           │
│                             │
│   Only $9.99/month          │
│                             │
│   [Try 3 Days Free]         │
│                             │
│   [Maybe Later]             │
│                             │
│   ─────────────────────     │
│                             │
│   Or add your meal          │
│   manually (always free)    │
│                             │
│   [Manual Entry]            │
│                             │
└─────────────────────────────┘
```

**Elements:**
- Clear limit explanation
- Premium features list
- Pricing
- Free trial CTA
- Fallback option (manual entry)

---

## User Flow Summary

```
Camera Capture / Gallery
    ↓
Processing
    ↓
AI Recognition Results
    ↓ (optional)
Edit Items
    ↓
Select Meal Type
    ↓
Save Success
    ↓
Return to Home
```

**Error Branches:**
- Low confidence → Warning + Edit
- No results → Retry or Manual
- API error → Retry or Manual
- Limit reached → Upgrade or Manual

**Key Design Principles:**
1. **Fast Capture:** Minimize taps to take photo
2. **Clear Feedback:** Show processing status
3. **Editable Results:** Always allow corrections
4. **Helpful Errors:** Provide actionable guidance
5. **Multiple Options:** Camera, gallery, or manual
6. **Smart Defaults:** Auto-select meal type by time

**Next Steps:**
- Design manual entry search interface
- Create barcode scanner wireframes
- Build photo preview/editing features

