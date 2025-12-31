# Analytics Aggregation & Growth Guide

This guide explains how to use your new analytics setup to maximize conversions and track growth.

## 📊 Where to See Your Stats

### 1. Real-time Signups (Self-Hosted)
**URL**: `/stats.html` (e.g., `forma-blush.vercel.app/stats.html`)
- **What it shows**: Raw real-time counts from your Firebase database.
- **Use case**: Quick check on today's performance and total waitlist size.

### 2. Full Funnel Tracking (Mixpanel)
**URL**: [mixpanel.com](https://mixpanel.com)
- **What it shows**: Every user action (clicks, scrolls, hovers, signups).
- **Setup recommendation**: Create a "Funnel" report with these steps:
    1. `Page View`
    2. `Scroll Depth` (50% or 90%)
    3. `CTA Clicked`
    4. `Email Captured`
- **Why**: This tells you exactly where users are dropping off.

### 3. Marketing Performance (Google Analytics 4)
**URL**: [analytics.google.com](https://analytics.google.com)
- **What it shows**: Traffic sources (where users are coming from) and conversion rate.
- **Use case**: Seeing which TikTok videos or Ads are driving the most traffic.

---

## 🚀 Growth & Conversion Tweaks (Done)

### 📱 Floating CTA (Mobile)
I added a "Floating CTA" that appears on mobile after a user scrolls past the hero section. 
- **Goal**: Keep the conversion goal always within thumb-reach.
- **Tracking**: Clicks on this button are tracked as `CTA Clicked` with location `hero` or `navigation`.

### 🎵 TikTok Pixel Ready
The foundation for TikTok ad tracking is live.
- **Current Status**: Code is integrated but placeholder ID is being used.
- **Next Step**: Once you have your **Pixel ID**, update it in `index.html` (Look for `REPLACE_WITH_ACTUAL_PIXEL_ID`).

---

## 💡 Pro-Tips for Maximizing Conversions

1.  **Iterate on the Hero Video**: Based on your TikTok content, if a specific video gets high engagement, consider making it the background of the hero section phone mockup.
2.  **A/B Test CTA Text**: Currently using "Get Early Access". You could test "Join the Beta" or "Track for Free".
3.  **Monitor the Stats Page**: If you notice a spike in signups, check GA4 immediately to see which source driven that traffic so you can double down on it.
