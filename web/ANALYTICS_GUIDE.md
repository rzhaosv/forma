# Analytics Setup Guide

Complete guide for Google Analytics 4 and Mixpanel integration.

## 🎯 What's Tracked

### Automatic Tracking
- ✅ Page views
- ✅ Scroll depth (25%, 50%, 75%, 90%, 100%)
- ✅ Time on page (every 30 seconds)
- ✅ Outbound link clicks
- ✅ Form submissions (success/failure)

### Custom Events
- ✅ Email captures (waitlist signups)
- ✅ CTA button clicks
- ✅ Pricing plan views/clicks
- ✅ App download clicks (iOS/Android)
- ✅ Errors and failures

---

## 🚀 Quick Start

### 1. Get Your Analytics IDs

#### Google Analytics 4

1. Go to https://analytics.google.com
2. Create an account (or use existing)
3. Click **Admin** (bottom left)
4. Click **Create Property**
5. Fill in property details:
   - Property name: "Forma Landing Page"
   - Timezone & currency
6. Click **Next** → **Create**
7. Add a **Data Stream**:
   - Platform: Web
   - Website URL: Your domain
   - Stream name: "Forma Web"
8. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

#### Mixpanel

1. Go to https://mixpanel.com
2. Sign up / Log in
3. Create a new project: "Forma"
4. Go to **Project Settings** (gear icon)
5. Copy your **Project Token**

### 2. Configure Analytics

Edit `web/analytics-config.js`:

```javascript
const ANALYTICS_CONFIG = {
    gaId: 'G-YOUR-ACTUAL-ID',           // ← Replace with your GA4 ID
    mixpanelToken: 'YOUR_MIXPANEL_TOKEN', // ← Replace with your token
    debug: true,  // Set to false in production
};
```

### 3. Test It

1. Open your landing page
2. Open browser console (F12)
3. You should see:
   ```
   📊 Analytics: Google Analytics initialized
   📊 Analytics: Mixpanel initialized
   ```
4. Try actions:
   - Click a CTA button
   - Submit email
   - Scroll down the page
   - Click pricing cards
5. Check console for tracking logs

---

## 📊 Tracked Events

### Email Capture Events

**Event**: `Email Captured`

**Properties**:
- `source`: "waitlist"
- `timestamp`: ISO 8601 timestamp

**Triggered when**: User successfully submits email

**User Properties Set**:
- `email_captured`: true
- `capture_source`: "waitlist"
- `capture_date`: ISO timestamp

---

### CTA Click Events

**Event**: `CTA Clicked`

**Properties**:
- `cta_text`: Button text (e.g., "Get Started Free")
- `cta_location`: Section (e.g., "hero", "pricing", "download")
- `timestamp`: ISO 8601 timestamp

**Triggered when**: User clicks any CTA button

**Locations**:
- `hero`: Hero section
- `pricing`: Pricing section
- `download`: Download section
- `waitlist`: Waitlist section
- `navigation`: Navigation bar

---

### Form Submission Events

**Event**: `Form Submitted`

**Properties**:
- `form_name`: "waitlist"
- `success`: true/false
- `timestamp`: ISO 8601 timestamp

**Triggered when**: User submits waitlist form (success or failure)

---

### Scroll Depth Events

**Event**: `Scroll Depth`

**Properties**:
- `percentage`: 25, 50, 75, 90, or 100
- `timestamp`: ISO 8601 timestamp

**Triggered when**: User scrolls past threshold (once per threshold)

---

### Time on Page Events

**Event**: `Time on Page`

**Properties**:
- `seconds`: Time in seconds
- `minutes`: Time in minutes (rounded)
- `timestamp`: ISO 8601 timestamp

**Triggered when**: 
- Every 30 seconds
- Page unload

---

### Pricing Plan Events

**Event**: `Pricing Plan Viewed`

**Properties**:
- `plan`: "Free", "Premium", or "Annual"
- `action`: "hover"

**Triggered when**: User hovers over pricing card

---

**Event**: `Pricing Plan Clicked`

**Properties**:
- `plan`: Plan name
- `price`: Price amount
- `timestamp`: ISO 8601 timestamp

**Triggered when**: User clicks on pricing card

---

### App Download Events

**Event**: `App Download Started`

**Properties**:
- `platform`: "iOS" or "Android"
- `location`: Section where clicked
- `timestamp`: ISO 8601 timestamp

**Triggered when**: User clicks App Store or Google Play button

---

### Error Events

**Event**: `Error Occurred`

**Properties**:
- `error_message`: Error description
- `error_type`: Type of error
- `timestamp`: ISO 8601 timestamp

**Triggered when**: 
- Form submission fails
- Network errors
- Any tracked errors

---

### Outbound Link Events

**Event**: `External Link Clicked`

**Properties**:
- `url`: External URL
- `link_text`: Link text/label
- `timestamp`: ISO 8601 timestamp

**Triggered when**: User clicks external link (automatically)

---

## 🔧 Custom Tracking

### Track Custom Event

```javascript
window.analytics.track('Custom Event Name', {
    property1: 'value1',
    property2: 'value2',
});
```

### Track Email Capture

```javascript
window.analytics.trackEmailCapture('user@example.com', 'newsletter');
```

### Track CTA Click

```javascript
window.analytics.trackCTAClick('Sign Up Now', 'hero');
```

### Track Form Submission

```javascript
window.analytics.trackFormSubmission('contact-form', true);
```

### Identify User

```javascript
window.analytics.identify('user-123', {
    name: 'John Doe',
    plan: 'premium',
    signup_date: '2024-11-24',
});
```

---

## 📈 View Your Data

### Google Analytics

1. Go to https://analytics.google.com
2. Select your property: "Forma Landing Page"
3. Navigate through reports:

**Real-time**: See current visitors
- Realtime → Overview
- Watch events as they happen

**Events**: See all tracked events
- Reports → Engagement → Events
- View: Email Captured, CTA Clicked, etc.

**Conversions**: Track email signups
- Configure → Events → Mark "Email Captured" as conversion

**User Properties**: See user traits
- Configure → Custom Definitions → User Properties

**Create Custom Report**:
1. Explore → Create new exploration
2. Add dimensions: Event name, CTA location
3. Add metrics: Event count, Users
4. Visualize: Table, Line chart, etc.

---

### Mixpanel

1. Go to https://mixpanel.com
2. Select project: "Forma"

**Events**: View all events
- Reports → Insights
- Select: "Email Captured"
- Breakdown by: source, date

**Funnels**: Track conversion funnel
- Reports → Funnels
- Create funnel:
  1. Page View
  2. CTA Clicked
  3. Email Captured

**User Profiles**: See individual users
- Users → View Users
- Filter by: email_captured = true

**Cohorts**: Group users
- Users → Cohorts
- Create: "Email Subscribers"
- Condition: email_captured = true

**Live View**: Watch real-time events
- Board → Live View
- See events as they happen

---

## 🎨 Customize Tracking

### Add New Event

Edit `script.js`:

```javascript
// Track video play
document.querySelector('.video-player').addEventListener('play', () => {
    window.analytics.track('Video Played', {
        video_title: 'Product Demo',
        duration: 60,
    });
});
```

### Track Custom Property

```javascript
window.analytics.track('Purchase Intent', {
    plan: 'premium',
    price: 9.99,
    billing: 'monthly',
});
```

### Modify Tracked Properties

Edit `analytics.js`:

```javascript
trackEmailCapture(email, source = 'waitlist') {
    this.track('Email Captured', {
        source: source,
        timestamp: new Date().toISOString(),
        // Add your custom properties here
        page_referrer: document.referrer,
        user_agent: navigator.userAgent,
    });
}
```

---

## 🔒 Privacy & GDPR

### Anonymize IP (Already Enabled)

```javascript
gtag('config', this.config.gaId, {
    anonymize_ip: true,  // ✅ Already enabled
});
```

### Respect Do Not Track

Add to `analytics-config.js`:

```javascript
// Check for Do Not Track
const respectDNT = navigator.doNotTrack === '1';

if (!respectDNT) {
    window.analytics.init(ANALYTICS_CONFIG);
} else {
    console.log('Analytics disabled: Do Not Track enabled');
}
```

### Cookie Consent

Add before initializing analytics:

```javascript
// Check for cookie consent
const hasConsent = localStorage.getItem('analytics_consent') === 'true';

if (hasConsent) {
    window.analytics.init(ANALYTICS_CONFIG);
} else {
    // Show consent banner
    showCookieConsentBanner();
}
```

### Email Hashing

Emails are automatically hashed before being sent as user IDs:

```javascript
hashEmail(email) {
    // Simple hash for privacy
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'user_' + Math.abs(hash).toString(36);
}
```

---

## 🐛 Troubleshooting

### Events Not Showing in GA4

1. **Check Measurement ID**:
   ```javascript
   console.log(ANALYTICS_CONFIG.gaId); // Should be G-XXXXXXXXXX
   ```

2. **Check gtag is loaded**:
   ```javascript
   console.log(typeof gtag); // Should be "function"
   ```

3. **Test with DebugView**:
   - GA4 → Configure → DebugView
   - Add `?debug_mode=true` to URL
   - Events should appear in real-time

4. **Check browser console** for errors

### Events Not Showing in Mixpanel

1. **Check Project Token**:
   ```javascript
   console.log(ANALYTICS_CONFIG.mixpanelToken);
   ```

2. **Check mixpanel is loaded**:
   ```javascript
   console.log(typeof mixpanel); // Should be "object"
   ```

3. **Use Live View**:
   - Mixpanel → Board → Live View
   - Events appear immediately

4. **Enable debug mode**:
   ```javascript
   debug: true  // In analytics-config.js
   ```

### No Events Tracking

1. **Analytics not initialized**:
   - Check console for initialization messages
   - Make sure IDs are not placeholder values

2. **Script load order**:
   - Ensure `analytics.js` loads before `script.js`
   - Check HTML: analytics scripts should be last

3. **Ad blockers**:
   - Disable ad blocker for testing
   - Some users may have analytics blocked

### Debug Mode

Enable detailed logging:

```javascript
const ANALYTICS_CONFIG = {
    gaId: 'G-XXXXXXXXXX',
    mixpanelToken: 'YOUR_TOKEN',
    debug: true,  // ← Enable this
};
```

You'll see:
```
📊 Analytics: Tracking event: CTA Clicked { cta_text: 'Get Started', ... }
📊 Analytics: Tracking event: Email Captured { source: 'waitlist', ... }
```

---

## 📦 Export Data

### Google Analytics

1. Reports → any report
2. Click **Share** (top right)
3. Choose format: PDF, CSV, Google Sheets

### Mixpanel

1. Any report → Click **Export**
2. Choose: CSV, PNG, or API
3. For bulk export:
   - Use Mixpanel API
   - Or contact support for data export

---

## 🚀 Advanced Setup

### Set Up Conversion Goals

**Google Analytics**:
1. Configure → Events
2. Find "Email Captured"
3. Toggle **Mark as conversion**

**Mixpanel**:
1. Project Settings → Goals
2. Create goal: "Email Signup"
3. Condition: "Email Captured" event count ≥ 1

### Create Funnel Analysis

**Mixpanel Funnel**:
1. Reports → Funnels
2. Add steps:
   - Step 1: Page View
   - Step 2: Scroll Depth (50%)
   - Step 3: CTA Clicked
   - Step 4: Email Captured
3. View conversion rates

### Set Up Alerts

**Mixpanel**:
1. Reports → create report
2. Click bell icon → Add alert
3. Condition: "Email Captured" < 10 per day
4. Send email notification

### Integrate with Other Tools

**Send to Slack**:
```javascript
// After email capture
fetch('https://hooks.slack.com/services/YOUR/WEBHOOK', {
    method: 'POST',
    body: JSON.stringify({
        text: `🎉 New signup: ${hashedEmail}`
    })
});
```

**Send to Zapier**:
- Create Zapier webhook
- Trigger on "Email Captured" event
- Connect to: Email, CRM, Sheets, etc.

---

## 📚 Resources

- [Google Analytics 4 Docs](https://support.google.com/analytics/answer/9304153)
- [Mixpanel Docs](https://docs.mixpanel.com/)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [Mixpanel Best Practices](https://mixpanel.com/blog/tracking-plan-best-practices/)

---

## 🎯 Next Steps

1. ✅ Add GA4 and Mixpanel IDs to `analytics-config.js`
2. ✅ Test all events in browser console
3. ✅ Verify events in GA4 DebugView
4. ✅ Verify events in Mixpanel Live View
5. ✅ Set up conversion goals
6. ✅ Create custom reports
7. ✅ Set up email alerts
8. ✅ Add cookie consent banner (if needed for GDPR)

---

## 💡 Tips

- Start with debug mode enabled to verify tracking
- Use DebugView and Live View during development
- Mark key events as conversions (Email Captured, etc.)
- Create funnels to analyze user journey
- Set up alerts for important metrics
- Export data regularly for backup
- Respect user privacy (anonymize IPs, hash emails)

Your landing page now has enterprise-grade analytics! 📊✨

