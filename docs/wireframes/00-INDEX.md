# Forma Wireframes Index

Complete wireframe documentation for Forma MVP.

---

## 📋 Wireframe Documents

### 1. [Onboarding Flow](./01-ONBOARDING.md)
First-time user experience and account creation.

**Key Screens:**
- Welcome splash
- Feature walkthrough (3 slides)
- Goal setting (4-step flow)
- Goal calculation results
- Sign up / Sign in

**User Journey:**
```
Welcome → Features → Goals → Account → Home
```

---

### 2. [Home Dashboard](./02-HOME-DASHBOARD.md)
Main screen and daily tracking interface.

**Key Screens:**
- Home dashboard (default view)
- Empty state
- Quick add menu (bottom sheet)
- Date selector (calendar)
- Over goal warning
- Goal achieved celebration
- Hamburger menu
- Notifications

**Core Features:**
- Calorie progress ring
- Macro tracking bars
- Meal timeline
- Quick add buttons
- Bottom tab navigation

---

### 3. [Camera & Photo Recognition](./03-CAMERA-PHOTO.md)
AI-powered food scanning workflow.

**Key Screens:**
- Camera capture
- Photo gallery picker
- Processing/analyzing
- AI recognition results
- Edit food items
- Low confidence warning
- AI failed / no results
- Save success
- Meal type selector
- Premium limit reached

**User Journey:**
```
Camera → Capture → Process → Review → Edit → Save → Success
```

---

### 4. [Profile & Settings](./04-PROFILE-SETTINGS.md)
User account, preferences, and app settings.

**Key Screens:**
- Profile overview
- Edit profile
- App settings
- Notification settings
- Goals & targets
- Subscription (free user)
- Subscription (premium user)
- Data & privacy
- Help center
- Sign out confirmation
- Delete account confirmation

**Sections:**
- Personal profile
- Appearance & units
- Notifications management
- Subscription management
- Data controls
- Support & help

---

## 🎨 Design System Overview

### Color Palette

**Primary Colors:**
- Primary Blue: #007AFF (iOS blue)
- Success Green: #34C759
- Warning Orange: #FF9500
- Error Red: #FF3B30
- Neutral Gray: #8E8E93

**Semantic Colors:**
- On Track: Green (#34C759)
- Warning: Orange (#FF9500)
- Over Goal: Red (#FF3B30)
- Premium: Gold (#FFD700)

**Background:**
- Light Mode: #FFFFFF (white), #F2F2F7 (light gray)
- Dark Mode: #000000 (black), #1C1C1E (dark gray)

---

### Typography

**Font Family:** SF Pro (iOS), Roboto (Android)

**Sizes:**
- H1: 34pt, Bold - Screen titles
- H2: 28pt, Bold - Section headers
- H3: 22pt, Semibold - Card titles
- Body: 17pt, Regular - Main text
- Caption: 13pt, Regular - Secondary info
- Large Number: 48pt, Bold - Calorie count

---

### Spacing

**Base Unit:** 8px

**Common Spacings:**
- XXS: 4px
- XS: 8px
- S: 12px
- M: 16px
- L: 24px
- XL: 32px
- XXL: 48px

**Component Padding:**
- Screen edges: 16px
- Cards: 16px
- Buttons: 12px vertical, 24px horizontal

---

### Components

#### Buttons

**Primary Button:**
```
Background: Blue (#007AFF)
Text: White, 17pt Semibold
Height: 50px
Border Radius: 12px
Full Width: Yes (with 16px margins)
```

**Secondary Button:**
```
Background: Light Gray (#F2F2F7)
Text: Blue (#007AFF), 17pt Semibold
Height: 50px
Border Radius: 12px
```

**Icon Button:**
```
Size: 44x44px (minimum touch target)
Icon Size: 24x24px
Background: Transparent or light fill
```

#### Cards

```
Background: White (light) / Dark Gray (dark)
Shadow: 0 2px 8px rgba(0,0,0,0.1)
Border Radius: 16px
Padding: 16px
Margin: 12px horizontal
```

#### Input Fields

```
Height: 50px
Border: 1px solid #E5E5EA
Border Radius: 10px
Padding: 12px
Font: 17pt Regular
Focus: Blue border (#007AFF)
Error: Red border (#FF3B30)
```

#### Toggle Switch

```
Width: 51px
Height: 31px
Active: Green (#34C759)
Inactive: Gray (#E5E5EA)
```

#### Progress Ring/Circle

```
Size: 200x200px (home screen)
Stroke Width: 12px
Background: Light gray
Fill: Green (on track), Orange (warning), Red (over)
```

---

### Icons

**Style:** Line icons, 2px stroke, rounded corners

**Common Icons:**
- Home: House outline
- Stats: Bar chart
- Add: Plus in circle (elevated)
- Diary: Book/Calendar
- Profile: Person silhouette
- Camera: Camera outline
- Barcode: Barcode lines
- Search: Magnifying glass
- Settings: Gear
- Help: Question mark in circle
- Notification: Bell
- Menu: 3 horizontal lines

**Sources:**
- iOS: SF Symbols
- Android: Material Icons

---

## 📱 Screen Sizes & Breakpoints

### Target Devices

**iOS:**
- iPhone SE (3rd gen): 375x667pt
- iPhone 14/15: 390x844pt
- iPhone 14/15 Pro Max: 430x932pt

**Android:**
- Small: 360x640dp
- Medium: 360x800dp
- Large: 412x915dp

### Safe Areas

- Top: Account for notch/status bar (44-59pt)
- Bottom: Account for home indicator (34pt) or navigation bar
- Sides: 16px minimum margin

---

## 🎯 Interaction Patterns

### Navigation

**Tab Bar Navigation (Bottom):**
- 5 tabs: Home, Stats, Add (center), Diary, Profile
- Active tab: Blue color, bold
- Inactive: Gray color, regular
- Add button: Elevated, larger

**Stack Navigation:**
- Push/pop for hierarchical screens
- Slide from right animation
- Back button always visible (top left)

### Modals & Sheets

**Bottom Sheet:**
- Drag handle at top
- Dimmed background
- Swipe down to dismiss
- Used for: Quick add menu, pickers

**Full Screen Modal:**
- Close button (X) top left or right
- Save/Done button if needed
- Used for: Camera, detailed forms

### Gestures

- **Tap:** Primary interaction
- **Long Press:** Quick actions menu
- **Swipe Left:** Delete item (on list items)
- **Swipe Right:** Complete/check item
- **Pull to Refresh:** Update data
- **Pinch:** Zoom (in camera)

---

## ♿ Accessibility

### Requirements

**VoiceOver/TalkBack:**
- All interactive elements labeled
- Meaningful labels (not "button", but "Add meal button")
- Correct element types (button, link, etc.)
- Reading order matches visual hierarchy

**Dynamic Text:**
- Support 7 text sizes
- Layout adjusts without truncation
- Critical info always visible

**Color Contrast:**
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Don't rely on color alone

**Touch Targets:**
- Minimum 44x44pt (iOS) / 48x48dp (Android)
- Adequate spacing between targets

**Reduced Motion:**
- Respect system preference
- Fade instead of slide
- No auto-playing animations

---

## 🔄 State Management

### Loading States

**Skeleton Screens:**
- Show content structure while loading
- Pulsing animation
- Matches final content layout

**Spinners:**
- Use for short waits (< 2 seconds)
- Center of screen or button
- iOS: Activity Indicator, Android: Circular Progress

**Progress Bars:**
- Show for longer operations
- Display percentage if available
- Example: Photo upload

### Empty States

**Components:**
- Icon/illustration
- Headline: "No [items] yet"
- Description: Brief explanation
- CTA button: Primary action

**Examples:**
- No meals logged today
- No search results
- No notifications

### Error States

**Types:**
1. **Network Error:** Retry button
2. **API Error:** Contact support link
3. **Validation Error:** Inline below field
4. **Generic Error:** Friendly message + action

**Design:**
- Error icon (triangle with !)
- Clear error message
- Actionable next steps
- Never blame the user

---

## 📊 Animations & Transitions

### Screen Transitions

**Navigation:**
- Push: Slide from right (iOS) / Material motion (Android)
- Pop: Slide to right
- Duration: 300ms
- Easing: Ease-in-out

**Modal:**
- Present: Slide up from bottom
- Dismiss: Slide down
- Duration: 250ms

### Micro-interactions

**Button Press:**
- Scale down to 0.95
- Duration: 100ms
- Spring animation

**Toggle Switch:**
- Slide and fade
- Duration: 200ms

**Progress Ring:**
- Animated fill on change
- Duration: 500ms
- Ease-out

**Success/Error:**
- Checkmark/X animation
- Scale up + fade in
- Duration: 400ms

---

## 🎬 User Flows Summary

### Primary Flows

1. **Onboarding Flow**
```
Splash → Features → Goals (4 steps) → Sign Up → Home
```

2. **Photo Food Logging**
```
Home → Quick Add → Camera → Capture → Process → Review → Edit → Save → Home
```

3. **Manual Food Entry**
```
Home → Quick Add → Manual → Search → Select → Adjust → Save → Home
```

4. **View Progress**
```
Home → Stats Tab → View Charts → Filter Date Range
```

5. **Update Goals**
```
Profile → Goals & Targets → Edit → Recalculate → Save
```

6. **Subscribe to Premium**
```
Any Premium Feature → Paywall → Select Plan → Free Trial → Payment → Success
```

### Secondary Flows

7. **Edit Profile**
8. **Manage Notifications**
9. **Export Data**
10. **Contact Support**

---

## 📐 Grid System

### Layout Grid

**Columns:** 12-column grid (for responsive design)
**Gutters:** 16px
**Margins:** 16px (phone), 24px (tablet)

### Card Grid

**Mobile:**
- 1 column for cards
- 2 columns for small items (stats)

**Tablet:**
- 2 columns for cards
- 3-4 columns for small items

---

## 🚦 Design Principles

### 1. Simplicity First
- One primary action per screen
- Minimize cognitive load
- Clear visual hierarchy

### 2. Speed Matters
- Optimize for quick logging
- Reduce taps to complete tasks
- Provide smart defaults

### 3. Encouraging, Not Punitive
- Positive messaging
- Celebrate achievements
- Supportive on mistakes

### 4. Privacy & Control
- User owns their data
- Clear privacy settings
- Easy data export/delete

### 5. Accessible to All
- WCAG 2.1 AA compliance
- Support assistive technologies
- Inclusive design

### 6. Beautiful & Modern
- Clean interface
- Consistent design language
- Delightful interactions

---

## 📋 Screen Inventory

### MVP Screens (Total: 35+)

**Onboarding (9 screens):**
1. Welcome splash
2-4. Feature slides (3)
5-8. Goal setting (4)
9. Goal results
10. Sign up
11. Sign in

**Home & Diary (10 screens):**
12. Home dashboard
13. Empty state
14. Quick add menu
15. Date picker
16. Over goal state
17. Success state
18. Hamburger menu
19. Notifications
20. Meal detail
21. Food item detail

**Food Logging (12 screens):**
22. Camera capture
23. Gallery picker
24. Processing
25. AI results
26. Edit food
27. Low confidence
28. AI failed
29. Save success
30. Meal type selector
31. Barcode scanner
32. Food search
33. Manual entry

**Profile & Settings (14+ screens):**
34. Profile overview
35. Edit profile
36. Settings
37. Notifications settings
38. Goals & targets
39. Subscription (free)
40. Subscription (premium)
41. Data & privacy
42. Help center
43. Sign out confirmation
44. Delete account
45. Stats/progress
46. Diary history
47. Food database

---

## ✅ Next Steps

### After Wireframes

1. **Create High-Fidelity Mockups in Figma**
   - Apply design system
   - Add real content
   - Create component library

2. **Build Interactive Prototype**
   - Link screens
   - Add transitions
   - Simulate interactions

3. **User Testing**
   - Test with 5-10 users
   - Gather feedback
   - Iterate on design

4. **Design Handoff**
   - Export assets
   - Document spacing
   - Provide component specs

5. **Start Development**
   - Build component library
   - Implement screens
   - Test on devices

---

## 📚 Resources

### Design Tools
- **Figma:** https://figma.com (recommended)
- **Sketch:** https://sketch.com
- **Adobe XD:** https://adobe.com/products/xd

### Inspiration
- **Dribbble:** https://dribbble.com/tags/calorie-tracker
- **Mobbin:** https://mobbin.com (mobile UI patterns)
- **Cal AI:** https://calai.app (direct competitor)

### Design Systems
- **iOS HIG:** https://developer.apple.com/design/human-interface-guidelines/
- **Material Design:** https://m3.material.io/
- **Ant Design Mobile:** https://mobile.ant.design/

### Icon Resources
- **SF Symbols:** https://developer.apple.com/sf-symbols/ (iOS)
- **Material Icons:** https://fonts.google.com/icons (Android)
- **Feather Icons:** https://feathericons.com/ (cross-platform)

---

**Last Updated:** November 11, 2025  
**Version:** 1.0 (MVP Wireframes)  
**Status:** ✅ Complete

