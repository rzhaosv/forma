# Macra — App Store Optimization

**Last updated:** March 2026

---

## App Store Listing (iOS)

### App Name (30 chars)
```
Macra: AI Calorie Tracker
```

### Subtitle (30 chars)
```
Photo Food Log & Macro Count
```

### Keywords (100 chars, no spaces after commas)
```
calorie counter,food diary,weight loss,nutrition,diet,meal planner,macro,barcode scanner
```
> Don't repeat words already in title/subtitle — algorithm already indexes those.

---

### Full Description

> **Note:** The user updates first 3 lines (above-the-fold) in App Store Connect directly.
> Below is the full body copy for the description field.

---

**Log any meal in under 30 seconds.**

Point your camera at your plate. Macra's AI identifies every item and fills in the calories, protein, carbs, and fat — no searching, no typing. Works on home cooking, restaurant meals, and packaged food.

**Four ways to log**

📷 **Photo** — snap your meal, AI does the rest
🎙️ **Voice** — say what you ate, Macra parses it
🔲 **Barcode** — scan packaged food for exact nutrition
✏️ **Search** — 900,000+ food database with manual entry

**Built around macros, not just calories**

Macra sets personalised protein, carb, and fat targets based on your height, weight, age, activity level, and goal. Every log updates your daily macro rings in real time.

**Syncs with Apple Health**

Weight and nutrition data flows both ways. Log in Macra, see it in Health. Already tracking in Health? Macra pulls that data in.

**Progress that makes sense**

Weight trend chart, 7-day calorie history, and streak tracking — so you can see whether your week was actually as good (or bad) as it felt.

**Honest about what it is**

Macra is a paid app. You get a 7-day free trial, then it's $9.99/month, $59.99/year, or $149.99 once for lifetime access. No ads, no data selling, no watered-down free tier designed to frustrate you into paying.

---

## Paywall

### Plans
| Plan | Price | Trial |
|------|-------|-------|
| Monthly | $9.99/mo | 7 days free |
| Annual | $59.99/yr (~$5/mo) | 7 days free |
| Lifetime | $149.99 once | 7 days free |

### Hard paywall flow
- New user → Onboarding → Paywall (Annual pre-selected)
- If trial or subscription lapses → Paywall shown on next open
- "Maybe later" exits to Main but all premium features are gated

---

## Screenshots (6 required for iPhone)

| # | Caption | Screen |
|---|---------|--------|
| 1 | Log any meal in seconds | Home screen with calorie ring + filled day |
| 2 | Snap → AI fills everything | Camera result / FoodResults screen |
| 3 | Hit your macros, not just calories | Home screen macro bars detail |
| 4 | Track weight & see the trend | Progress screen, weight chart |
| 5 | Barcode, voice, or search | Quick-add row visible |
| 6 | 7 days free, then one price | Paywall screen |

---

## Review Prompt Strategy

**Triggers (win moments only):**
1. **Streak badge earned** — after FoodResults, BarcodeScanner, or ManualEntry saves a meal that triggers a streak milestone badge
2. **Weight logged after consistent week** — after `handleAddWeight` succeeds and `currentWeek.daysLogged >= 5`

**Gate:**
- Min 5 meals logged total
- Min 3 unique days used
- 30-day cooldown between prompts

**Sentiment funnel:**
- "Yes 😊" → native App Store review prompt
- "Not really" → Telegram community / email feedback (negative reviews diverted)
- Dismissed → no cooldown recorded, tries again next eligible trigger

---

## Pricing Psychology Notes

- Annual is pre-selected (highest LTV, best value perception)
- Monthly shown as anchor — makes annual look cheap
- Lifetime available for high-intent buyers who convert poorly on subscriptions
- "67% savings" badge on annual (vs monthly annualized) is accurate
- Trial end date shown explicitly ("free until March 11") — builds trust, reduces churn from surprise charges
