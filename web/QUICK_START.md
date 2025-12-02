# Forma Landing Page - Quick Start

## 🚀 Start the Server

```bash
cd web
node server.js
```

**Then open:** http://localhost:3001

## ✨ What's Included

- ✅ **Beautiful Landing Page** (Cal.ai-inspired design)
- ✅ **Email Capture System** (Waitlist/Early Access)
- ✅ **Automatic Email Storage** (emails.json)
- ✅ **CSV Export** (Download subscriber list)
- ✅ **Real-time Validation** (Duplicate detection, format checking)

## 📧 Test Email Capture

1. Open http://localhost:3001 in your browser
2. Scroll to "Join the Waitlist" section
3. Enter your email
4. Click "Join Waitlist"
5. See success message and animated counter!

## 📊 View Captured Emails

```bash
# View JSON file
cat web/emails.json

# Export to CSV
curl http://localhost:3001/api/export -o subscribers.csv

# Or use npm script
npm run export
```

## 🎯 Key URLs

- **Landing Page**: http://localhost:3001
- **API Endpoint**: http://localhost:3001/api/subscribe
- **Export CSV**: http://localhost:3001/api/export
- **Get Count**: http://localhost:3001/api/count

## 🔧 Commands

```bash
# Start server
npm start

# Export emails
npm run export

# Test API
curl -X POST http://localhost:3001/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📁 Files

- `index.html` - Landing page with waitlist form
- `styles.css` - All styling
- `script.js` - Form handling and validation
- `server.js` - Backend API
- `emails.json` - Stored emails (auto-created)

## 🌐 Deploy

Ready to deploy! Works with:
- Vercel
- Heroku
- Railway
- Netlify (with serverless functions)
- Any Node.js host

See `EMAIL_CAPTURE_GUIDE.md` for deployment instructions.

## 🎨 Customize

1. **Colors**: Edit CSS variables in `styles.css`
2. **Content**: Edit text in `index.html`
3. **Success Message**: Edit `script.js` line 46
4. **Initial Count**: Edit `index.html` subscriber count

## 📖 Full Documentation

- `README.md` - Landing page overview
- `EMAIL_CAPTURE_GUIDE.md` - Complete email capture docs

## 🎉 You're All Set!

The landing page is live with full email capture functionality!

