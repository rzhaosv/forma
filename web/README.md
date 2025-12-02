# Forma Landing Page

A beautiful, modern landing page for the Forma AI-powered nutrition tracking app.

## 🎨 Features

- **Modern Design**: Clean, gradient-based design inspired by leading SaaS products
- **Fully Responsive**: Looks great on desktop, tablet, and mobile
- **Smooth Animations**: Intersection Observer-based fade-in effects
- **SEO Optimized**: Semantic HTML and meta tags
- **Fast Loading**: Minimal dependencies, optimized for performance
- **Email Capture**: Full waitlist system with backend API
- **Analytics**: Google Analytics 4 and Mixpanel integration
- **Event Tracking**: Comprehensive tracking for all user actions

## 🚀 Quick Start

### Option 1: Python HTTP Server (Simplest)

```bash
cd web
python3 -m http.server 3000
```

Then open: http://localhost:3000

### Option 2: Using npm

```bash
cd web
npm start
```

Then open: http://localhost:3000

### Option 3: Using npx serve

```bash
cd web
npx serve -p 3000
```

Then open: http://localhost:3000

## 📁 Structure

```
web/
├── index.html             # Main HTML file
├── styles.css             # All styles (responsive included)
├── script.js              # Interactive features & animations
├── server.js              # Email capture API server
├── analytics.js           # Analytics wrapper
├── analytics-config.js    # Analytics configuration
├── emails.json            # Stored emails (auto-created)
├── package.json           # Package configuration
├── README.md              # This file
├── ANALYTICS_GUIDE.md     # Analytics documentation
├── EMAIL_CAPTURE_GUIDE.md # Email capture documentation
└── test-analytics.html    # Analytics testing page
```

## 🎯 Sections

1. **Hero** - Main value proposition with CTA
2. **Features** - 6-card grid showcasing key features
3. **How It Works** - 4-step process explanation
4. **Testimonials** - Social proof from users
5. **Pricing** - 3-tier pricing comparison
6. **Download** - Final CTA with app store buttons
7. **Footer** - Links and company info

## 🎨 Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;
    --secondary: #0ea5e9;
    /* ... more colors */
}
```

### Content

All content is in `index.html`. Simply edit the text, headings, and descriptions.

### Images

Replace the phone mockup preview with actual app screenshots for better visual appeal.

## 📱 Mobile Optimization

The page is fully responsive with breakpoints at:
- Desktop: 1024px+
- Tablet: 768px - 1024px
- Mobile: < 768px

## 📊 Analytics Setup

### Quick Setup

1. **Get your IDs**:
   - Google Analytics: https://analytics.google.com (GA4 Measurement ID)
   - Mixpanel: https://mixpanel.com (Project Token)

2. **Configure** in `analytics-config.js`:
   ```javascript
   const ANALYTICS_CONFIG = {
       gaId: 'G-YOUR-ACTUAL-ID',
       mixpanelToken: 'YOUR_MIXPANEL_TOKEN',
       debug: true,
   };
   ```

3. **Test** at http://localhost:3001/test-analytics.html

### What's Tracked

✅ Automatic:
- Page views
- Scroll depth (25%, 50%, 75%, 90%, 100%)
- Time on page
- Outbound links

✅ Custom Events:
- Email captures (waitlist signups)
- CTA button clicks
- Pricing plan views/clicks
- Form submissions
- App download clicks
- Errors

See **`ANALYTICS_GUIDE.md`** for complete documentation.

### Email Collection

Replace the download button hrefs with:
- Actual App Store URLs once published
- Email signup modal
- Beta waitlist form

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
cd web
vercel
```

### Netlify

1. Drag and drop the `web` folder to Netlify
2. Or connect your Git repository

### GitHub Pages

1. Push to GitHub
2. Settings → Pages → Select branch and `web` folder
3. Access at `https://yourusername.github.io/bodyapp/web`

## 📦 Production Checklist

- [ ] Replace placeholder app store links with real URLs
- [ ] Add real app screenshots to phone mockup
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Add meta tags for social sharing (Open Graph, Twitter Cards)
- [ ] Optimize images (compress, convert to WebP)
- [ ] Add favicon and app icons
- [ ] Test on real mobile devices
- [ ] Run Lighthouse audit
- [ ] Set up email collection/waitlist
- [ ] Add privacy policy and terms of service pages

## 🎨 Design Inspiration

This landing page is inspired by modern SaaS products like:
- Cal.ai
- Linear
- Notion
- Superhuman

## 📝 License

MIT License - feel free to use and modify for your project.

