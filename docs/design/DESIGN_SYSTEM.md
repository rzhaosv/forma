# Forma Design System

**Version:** 1.0  
**Purpose:** Visual design specifications for Forma calorie tracking app  
**Platform:** iOS & Android (React Native)

---

## Color Palette

### Primary Colors

```
Primary (Indigo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#6366F1 | rgb(99, 102, 241)
Used for: Primary buttons, active states, links

Primary Light
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#818CF8 | rgb(129, 140, 248)
Used for: Hover states, highlights

Primary Dark
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#4F46E5 | rgb(79, 70, 229)
Used for: Pressed states, depth
```

### Secondary Colors

```
Success Green
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#10B981 | rgb(16, 185, 129)
Used for: Success messages, positive trends

Warning Orange
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#F59E0B | rgb(245, 158, 11)
Used for: Warnings, approaching limits

Error Red
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#EF4444 | rgb(239, 68, 68)
Used for: Errors, over goals
```

### Macro Colors

```
Protein (Red)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#EF4444 | rgb(239, 68, 68)
Used for: Protein progress bars/rings

Carbs (Orange)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#F59E0B | rgb(245, 158, 11)
Used for: Carbs progress bars/rings

Fat (Indigo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#6366F1 | rgb(99, 102, 241)
Used for: Fat progress bars/rings
```

### Neutral Colors

```
Gray 900 (Almost Black)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#111827 | rgb(17, 24, 39)
Used for: Primary text

Gray 700
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#374151 | rgb(55, 65, 81)
Used for: Secondary text

Gray 500
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#6B7280 | rgb(107, 114, 128)
Used for: Tertiary text, placeholders

Gray 300
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#D1D5DB | rgb(209, 213, 219)
Used for: Borders, dividers

Gray 100
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#F3F4F6 | rgb(243, 244, 246)
Used for: Card backgrounds

Gray 50
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#F9FAFB | rgb(249, 250, 251)
Used for: Page backgrounds

White
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#FFFFFF | rgb(255, 255, 255)
Used for: Cards, modals, buttons
```

---

## Typography

### Font Family
**Primary:** System Default (SF Pro on iOS, Roboto on Android)

### Font Sizes

```
Display Large    → 36px (2.25rem) | Line height: 40px
Display Medium   → 30px (1.875rem)| Line height: 36px
Display Small    → 24px (1.5rem)  | Line height: 32px

Heading Large    → 20px (1.25rem) | Line height: 28px
Heading Medium   → 18px (1.125rem)| Line height: 24px
Heading Small    → 16px (1rem)    | Line height: 24px

Body Large       → 16px (1rem)    | Line height: 24px
Body Medium      → 14px (0.875rem)| Line height: 20px
Body Small       → 12px (0.75rem) | Line height: 16px

Caption          → 11px (0.6875rem)| Line height: 16px
```

### Font Weights

```
Regular   → 400
Medium    → 500
Semibold  → 600
Bold      → 700
```

### Text Styles

```typescript
// Example usage in React Native
const textStyles = {
  displayLarge: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    color: '#111827',
  },
  headingLarge: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#111827',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#374151',
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
    color: '#6B7280',
  },
};
```

---

## Spacing Scale

```
xs   → 4px   (0.25rem)
sm   → 8px   (0.5rem)
md   → 16px  (1rem)
lg   → 24px  (1.5rem)
xl   → 32px  (2rem)
2xl  → 48px  (3rem)
3xl  → 64px  (4rem)

// Common uses:
Card padding        → md (16px)
Section spacing     → lg (24px)
Screen padding      → lg (24px)
Icon-text spacing   → sm (8px)
Button padding      → md horizontal, sm vertical
```

---

## Border Radius

```
Small    → 4px   | Small elements, tags
Medium   → 8px   | Input fields
Large    → 12px  | Cards, buttons
XLarge   → 16px  | Modals, bottom sheets
Full     → 9999px| Pills, circular avatars
```

---

## Shadows

### iOS Style Shadows

```
Small Shadow (Cards)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
shadowColor: '#000000'
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.05
shadowRadius: 2
elevation: 1 (Android)

Medium Shadow (Buttons)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
shadowColor: '#000000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
shadowRadius: 4
elevation: 3 (Android)

Large Shadow (Modals)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
shadowColor: '#000000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.15
shadowRadius: 12
elevation: 8 (Android)
```

---

## Component Library

### Buttons

#### Primary Button
```
Background: #6366F1 (Primary)
Text: #FFFFFF (White)
Height: 48px
Padding: 16px horizontal
Border Radius: 12px
Font: 16px, Semibold (600)
Shadow: Medium

States:
- Default: Primary color
- Hover: Primary Light (#818CF8)
- Pressed: Primary Dark (#4F46E5)
- Disabled: 40% opacity
```

#### Secondary Button
```
Background: #F3F4F6 (Gray 100)
Text: #111827 (Gray 900)
Height: 48px
Padding: 16px horizontal
Border Radius: 12px
Font: 16px, Semibold (600)
Shadow: Small

States:
- Default: Gray 100
- Hover: Gray 200
- Pressed: Gray 300
- Disabled: 40% opacity
```

#### Text Button
```
Background: Transparent
Text: #6366F1 (Primary)
Height: Auto
Padding: 8px horizontal
Border Radius: 0
Font: 16px, Medium (500)
Shadow: None
```

### Input Fields

```
Background: #FFFFFF (White)
Border: 1px solid #D1D5DB (Gray 300)
Height: 48px
Padding: 12px horizontal
Border Radius: 8px
Font: 16px, Regular (400)
Text Color: #111827 (Gray 900)
Placeholder: #6B7280 (Gray 500)

States:
- Default: Border Gray 300
- Focus: Border Primary, 2px width
- Error: Border Error Red, 2px width
- Disabled: Background Gray 100, 40% opacity
```

### Cards

```
Background: #FFFFFF (White)
Border Radius: 12px
Padding: 16px
Shadow: Small
Border: None (shadow provides depth)

Card with Border:
Background: #FFFFFF (White)
Border: 1px solid #E5E7EB (Gray 200)
Border Radius: 12px
Padding: 16px
Shadow: None
```

### Progress Rings

```
Size: 160px × 160px (large), 80px × 80px (small)
Stroke Width: 12px (large), 8px (small)
Track Color: #F3F4F6 (Gray 100)
Fill Color: Gradient (Primary → Primary Light)

States:
- Under Goal: Green gradient
- At Goal: Primary gradient
- Over Goal: Red gradient
```

### Badges

```
Background: #EFF6FF (Light blue)
Text: #1E40AF (Dark blue)
Height: 24px
Padding: 6px horizontal
Border Radius: Full (9999px)
Font: 12px, Medium (500)

Variants:
- Success: Green background, Dark green text
- Warning: Orange background, Dark orange text
- Error: Red background, Dark red text
- Info: Blue background, Dark blue text
```

---

## Icons

### Icon Set: Feather Icons (or similar)
- Consistent line weight: 2px
- Size: 24×24px (default), 20×20px (small), 32×32px (large)
- Color: Matches text color or brand colors

### Common Icons
```
home              → Home tab
camera            → Photo scan
trending-up       → Progress tab
user              → Profile tab
plus-circle       → Add meal
search            → Search foods
calendar          → Date selector
settings          → Settings
help-circle       → Help
log-out           → Logout
check-circle      → Success
alert-circle      → Warning/Error
```

---

## Screen Layout

### Safe Area
```
Top: Device safe area + 16px
Bottom: Device safe area + 16px
Left: 24px
Right: 24px
```

### Status Bar
```
iOS: Light/Dark based on screen
Android: Match app theme
Height: System default
```

### Navigation Bar
```
Height: 64px
Background: #FFFFFF (White)
Shadow: Small
Items: Title (center), Back button (left), Action (right)
```

### Tab Bar
```
Height: 60px + safe area
Background: #FFFFFF (White)
Shadow: Medium (inverted, top shadow)
Active Color: #6366F1 (Primary)
Inactive Color: #9CA3AF (Gray 400)
Icon Size: 24×24px
Label: 11px, Medium (500)
```

---

## Dark Mode (Future)

### Colors
```
Background: #111827 (Gray 900)
Surface: #1F2937 (Gray 800)
Primary: #818CF8 (Primary Light)
Text Primary: #F9FAFB (Gray 50)
Text Secondary: #D1D5DB (Gray 300)
Border: #374151 (Gray 700)
```

---

## Accessibility

### Minimum Touch Targets
```
iOS: 44×44 points
Android: 48×48 dp
Forma: 48×48 px minimum
```

### Color Contrast Ratios
```
Primary text: 7:1 (AAA)
Secondary text: 4.5:1 (AA)
Disabled text: 3:1 (minimum)
```

### Font Scaling
```
Support iOS Dynamic Type
Support Android font scaling
Test at 200% scale
```

---

## Animation Guidelines

### Duration
```
Fast: 150ms   | Toggle switches, checkboxes
Medium: 250ms | Button presses, sheet slides
Slow: 400ms   | Screen transitions, modals

Never exceed: 600ms
```

### Easing
```
Standard: ease-in-out
Enter: ease-out
Exit: ease-in
Spring: For natural feel (iOS default)
```

### Common Animations
```
Button Press:
- Scale: 0.98
- Duration: 150ms
- Easing: ease-in-out

Sheet Slide Up:
- Transform: translateY(100% → 0%)
- Duration: 250ms
- Easing: ease-out

Fade In:
- Opacity: 0 → 1
- Duration: 250ms
- Easing: ease-out
```

---

## Usage Examples

### Complete Button Component

```typescript
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, variant = 'primary' }) => (
  <TouchableOpacity 
    style={[
      styles.button,
      variant === 'primary' && styles.buttonPrimary,
      variant === 'secondary' && styles.buttonSecondary,
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[
      styles.buttonText,
      variant === 'primary' && styles.buttonTextPrimary,
      variant === 'secondary' && styles.buttonTextSecondary,
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: '#6366F1',
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0.05,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#111827',
  },
});
```

### Card Component

```typescript
import { View, StyleSheet } from 'react-native';

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
```

---

## Design Checklist

### Before Implementing Any Screen

- [ ] Uses colors from defined palette
- [ ] Uses standard spacing (4, 8, 16, 24, 32px)
- [ ] Text uses defined font sizes and weights
- [ ] Touch targets minimum 48×48px
- [ ] Includes all button states (default, pressed, disabled)
- [ ] Has loading states for async actions
- [ ] Has error states with helpful messages
- [ ] Has empty states with clear CTAs
- [ ] Animations use standard durations
- [ ] Accessible color contrast
- [ ] Works on small screens (iPhone SE)
- [ ] Works on large screens (iPad, Android tablets)

---

## Resources

### Figma File
*(To be created)*

### Icon Library
- Feather Icons: https://feathericons.com/
- React Native Vector Icons: https://oblador.github.io/react-native-vector-icons/

### Color Palette Tools
- Coolors: https://coolors.co/
- Adobe Color: https://color.adobe.com/

### Accessibility
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- iOS Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Material Design: https://material.io/design

---

**Version:** 1.0.0  
**Last Updated:** November 12, 2025  
**Maintained by:** Forma Design Team

