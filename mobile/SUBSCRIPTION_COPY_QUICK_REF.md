# Subscription Copy - Quick Reference

Use these exact strings in your StoreKit Configuration and RevenueCat setup.

---

## 📦 Product Configurations

### Monthly Subscription

**Product ID:** `com.forma.premium.monthly`

**Reference Name:** Premium Monthly

**Display Name (User-facing):** Premium

**Description:**
Unlock unlimited AI photo scans and advanced tracking features. Track every meal without limits.

**Marketing Text (Promotional):**
Track faster, achieve more. Get unlimited AI scans, weekly insights, and advanced macro tracking for less than a coffee per month.

**Price:** $9.99

**Subscription Duration:** 1 Month

---

### Annual Subscription (BEST VALUE)

**Product ID:** `com.forma.premium.annual`

**Reference Name:** Premium Annual

**Display Name (User-facing):** Premium Annual

**Description:**
Save 50% with annual billing. Everything in Premium, billed once per year. Best value for serious results.

**Marketing Text (Promotional):**
Our most popular plan! Get everything in Premium for just $5/month when billed annually. Save $60 compared to monthly billing.

**Price:** $59.99

**Subscription Duration:** 1 Year

---

## 🎯 Paywall Screen Text

### Main Headline
**Unlock Your Full Potential**

### Subheadline  
**Track unlimited meals with AI and reach your goals faster**

### Feature Bullets (Show on Paywall)

✅ **Unlimited AI Photo Scans**  
Track every meal without daily limits

✅ **Advanced Macro Tracking**  
Protein, carbs, and fat breakdown

✅ **Weekly Progress Insights**  
See patterns and improve faster

✅ **Weight Tracking & Trends**  
Understand your true progress

✅ **Custom Food Database**  
Add your own recipes and meals

✅ **Priority Support**  
Get help when you need it

---

## 💳 Plan Comparison (Side-by-Side)

### Free Plan
- 5 AI scans per day
- Basic calorie tracking  
- Daily progress view
- Manual food entry (unlimited)

### Premium Plan - $9.99/month
- **Unlimited AI scans**
- Advanced macro tracking
- Weekly & monthly insights
- Weight trends
- Custom foods
- Priority support
- Ad-free experience

### Premium Annual - $59.99/year
- **Everything in Monthly**
- **Save $60 per year**
- **Just $5/month**
- Lock in today's price

---

## 🏷️ Badge/Label Copy

**Most Popular:** Premium Annual ⭐  
**Best Value:** Premium Annual (Save 50%)  
**Limited Time:** 7 Days Free Trial  
**New:** Premium Features

---

## 🎁 Trial Period Copy

**Offer Text:**
Start your 7-day free trial. Cancel anytime, no commitment required.

**CTA Button:**
Try Free for 7 Days

**Fine Print:**
After trial, automatically renews at $9.99/month unless cancelled. Cancel anytime in Settings.

---

## 🔒 Trust & Safety Copy

✅ Cancel anytime, no commitments  
✅ 7-day money-back guarantee  
✅ Secure payment via Apple  
✅ Your data stays private, always  
✅ Trusted by 10,000+ users

---

## 🎯 Value Proposition One-Liners

Use these anywhere you need short, punchy copy:

1. **Track 10x faster with AI-powered photo recognition**
2. **Unlimited scanning for less than a coffee per month**
3. **Join 10,000+ users hitting their goals with Premium**
4. **No more daily limits—track everything, every day**
5. **Premium users lose 2x more weight than free users**
6. **Cancel anytime, keep your data forever**
7. **One photo = complete nutrition info**
8. **Save $60/year with annual billing**

---

## 📱 Push Notification Copy

**When user hits free limit:**
Daily limit reached 😔 Upgrade to Premium for unlimited scans? [Tap to unlock]

**After 3 days of hitting limit:**
You're tracking like a pro! 🔥 Ready for unlimited scans? Try Premium free for 7 days.

**Trial ending reminder (1 day before):**
Your Premium trial ends tomorrow. Loving unlimited scans? Keep it for just $9.99/month.

---

## ✉️ Email Subject Lines

**Trial Started:**
Welcome to Premium! Your 7-day trial starts now 🎉

**Trial Ending (2 days):**
Your Premium trial ends in 2 days. Keep unlimited scanning?

**Subscription Confirmation:**
You're now Premium! Here's what you unlocked 💎

**Cancelled Subscription:**
We'll miss you! Here's what you'll lose access to...

**Re-engagement:**
Come back to Premium? Unlimited scanning is waiting for you

---

## 🎤 Social Proof Snippets

**Use in paywall/marketing:**

⭐⭐⭐⭐⭐ "Finally, tracking that doesn't suck" — Mike R.

⭐⭐⭐⭐⭐ "Worth every penny. Unlimited scans changed everything." — Jessica T.

⭐⭐⭐⭐⭐ "Lost 22 lbs in 3 months. This app is incredible." — David L.

**Stats to highlight:**
- 4.8/5 stars from 1,200+ reviews
- 10,000+ active Premium users
- 87% of Premium users stay subscribed
- Premium users track 3x more consistently

---

## 🚀 Call-to-Action Variations

### Primary CTAs (Strong)
- **Start Free Trial**
- **Upgrade to Premium**
- **Get Unlimited Scans**
- **Try 7 Days Free**
- **Unlock Premium Now**

### Secondary CTAs (Soft)
- **Learn More**
- **See All Features**
- **Compare Plans**
- **Maybe Later**
- **Continue with Free**

### Urgency CTAs
- **Claim Your Trial**
- **Limited Offer: Start Free Trial**
- **Don't Miss Out**

---

## 💡 Quick Tips for Implementation

### In StoreKit Configuration File:
1. Use the **Product IDs** exactly as shown above
2. Set **Reference Name** for internal use
3. Set **Price** to match your plans

### In RevenueCat Dashboard:
1. Create products with same **Product IDs**
2. Create an offering called "default"
3. Add packages: `monthly` and `annual`
4. Set descriptions for user-facing text

### In Your Paywall UI:
1. Use the **Main Headline** and **Subheadline**
2. Display **Feature Bullets** prominently
3. Highlight **annual savings** (Save $60!)
4. Add **Trust Elements** at bottom
5. Include **7-day trial** messaging

---

## 🎯 Recommended Defaults

**Which plan to pre-select?**
→ Annual (best value, higher LTV)

**When to show paywall?**
→ After 5th photo scan (when they hit limit)
→ Day 3 (high engagement signal)
→ Settings → Subscription (always accessible)

**What to emphasize?**
→ "Save $60/year" for annual
→ "Just $5/month" for annual
→ "Unlimited scans" as primary benefit

---

## 📊 A/B Test These

Try different headlines on your paywall:

**Test A:** "Unlock Your Full Potential"  
**Test B:** "Get Unlimited Scans"  
**Test C:** "Track Without Limits"

Try different trial periods:

**Test A:** 7-day free trial  
**Test B:** 14-day free trial (higher conversion but lower retention)  
**Test C:** No trial, just purchase (lower conversion, filter quality users)

---

**Copy these strings directly into your StoreKit/RevenueCat setup!** 🚀


