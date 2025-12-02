# Email Capture System

Complete email capture and waitlist management system for the Forma landing page.

## ✨ Features

- ✅ Beautiful, responsive email capture form
- ✅ Real-time email validation
- ✅ Duplicate detection
- ✅ Loading states and success/error messages
- ✅ Subscriber count animation
- ✅ Local JSON storage
- ✅ CSV export functionality
- ✅ Privacy-friendly (no IP tracking)

## 🚀 Quick Start

### Start the Server

```bash
cd web
node server.js
```

The server will start on **http://localhost:3001** and serve your landing page.

### Alternative: Using npm

```bash
cd web
npm start
```

## 📁 File Structure

```
web/
├── server.js              # Backend API server
├── index.html             # Landing page with waitlist form
├── script.js              # Frontend form handling
├── styles.css             # Email capture styling
├── emails.json            # Stored emails (auto-created)
└── EMAIL_CAPTURE_GUIDE.md # This file
```

## 🎯 How It Works

### 1. User Submits Email

When a user enters their email and clicks "Join Waitlist":

1. **Frontend Validation**: JavaScript validates the email format
2. **API Call**: Sends POST request to `/api/subscribe`
3. **Backend Processing**:
   - Validates email format again
   - Checks for duplicates
   - Saves to `emails.json`
   - Returns success/error response
4. **UI Update**:
   - Shows success message
   - Animates subscriber count
   - Clears the form

### 2. Data Storage

Emails are stored in `emails.json`:

```json
{
  "emails": [
    {
      "email": "user@example.com",
      "timestamp": "2024-11-24T01:30:00.000Z",
      "ip": null
    }
  ],
  "count": 1
}
```

## 📊 API Endpoints

### POST /api/subscribe

Submit a new email address.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully subscribed!",
  "count": 42
}
```

**Error Response (400):**
```json
{
  "error": "Invalid email address"
}
```

**Duplicate Response (409):**
```json
{
  "error": "This email is already registered"
}
```

### GET /api/count

Get current subscriber count.

**Response:**
```json
{
  "count": 42
}
```

### GET /api/export

Export all emails as CSV file.

**Response:** Downloads `subscribers.csv` file:
```csv
Email,Timestamp
user1@example.com,2024-11-24T01:30:00.000Z
user2@example.com,2024-11-24T02:15:00.000Z
```

## 🔧 Configuration

### Change Port

Edit `server.js` line 11:

```javascript
const PORT = 3001; // Change to your preferred port
```

### Change Storage Location

Edit `server.js` line 12:

```javascript
const EMAILS_FILE = path.join(__dirname, 'emails.json');
```

## 📥 Export Emails

### Option 1: Using npm script

```bash
cd web
npm run export
```

This will create `subscribers.csv` in the `web/` directory.

### Option 2: Direct download

While the server is running, visit:
```
http://localhost:3001/api/export
```

Your browser will download the CSV file.

### Option 3: Using curl

```bash
curl http://localhost:3001/api/export -o subscribers.csv
```

## 📧 Integrate with Email Services

### Mailchimp Integration

Add to `server.js` after saving email:

```javascript
const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
  apiKey: 'YOUR_API_KEY',
  server: 'us1',
});

await mailchimp.lists.addListMember('LIST_ID', {
  email_address: email,
  status: 'subscribed',
});
```

### ConvertKit Integration

```javascript
const convertKit = require('convertkit-api');

const ck = new convertKit('YOUR_API_KEY');
await ck.addSubscriberToForm('FORM_ID', {
  email: email,
});
```

### Sendgrid Integration

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_API_KEY');

await sgMail.send({
  to: email,
  from: 'hello@forma.app',
  subject: 'Welcome to Forma!',
  html: '<strong>Thanks for joining our waitlist!</strong>',
});
```

## 🔒 Security Best Practices

### For Production

1. **Add Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per IP
});
```

2. **Add CAPTCHA**

Use Google reCAPTCHA v3:

```html
<script src="https://www.google.com/recaptcha/api.js"></script>
```

3. **Validate Server-Side**

Already implemented! The server validates emails before saving.

4. **Use Environment Variables**

```javascript
const API_KEY = process.env.MAILCHIMP_API_KEY;
```

5. **Add Authentication for Export**

```javascript
if (req.url === '/api/export') {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }
  // ... export logic
}
```

## 🎨 Customization

### Change Success Message

Edit `script.js` line 46:

```javascript
showMessage(message, '🎉 Success! Check your email for confirmation.', 'success');
```

### Change Initial Subscriber Count

Edit `index.html` line with `subscriber-count`:

```html
<p class="waitlist-count"><span id="subscriber-count">2,847</span> people already signed up!</p>
```

### Styling

All styles are in `styles.css` under the `/* Waitlist Section */` comment.

## 📱 Testing

### Test Email Submission

```bash
curl -X POST http://localhost:3001/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Duplicate

Run the same command twice - second time should return error.

### Test Invalid Email

```bash
curl -X POST http://localhost:3001/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Emails Not Saving

Check if `emails.json` was created:

```bash
cd web
ls -la emails.json
cat emails.json
```

### Form Not Submitting

1. Check browser console for errors
2. Verify server is running
3. Check network tab in dev tools
4. Ensure API endpoint is correct

### CORS Errors

The server already has CORS headers. If still getting errors, check:

1. API endpoint URL is correct
2. Server is running on the expected port
3. Browser console for specific error messages

## 🚀 Deployment

### Deploy to Heroku

```bash
# Add Procfile
echo "web: node server.js" > Procfile

# Deploy
git add .
git commit -m "Add email capture"
heroku create forma-landing
git push heroku main
```

### Deploy to Vercel

Add `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

### Deploy to Railway

```bash
railway init
railway up
```

## 📈 Analytics

Track email capture events:

```javascript
// Add to script.js after successful submission
gtag('event', 'sign_up', {
  method: 'email',
  value: 1
});

// Facebook Pixel
fbq('track', 'Lead');

// Plausible
plausible('Email Captured');
```

## 🎯 Next Steps

1. ✅ Set up email welcome sequence
2. ✅ Add double opt-in confirmation
3. ✅ Create thank you page
4. ✅ Set up email marketing platform
5. ✅ Add social proof (display live signups)
6. ✅ A/B test different copy
7. ✅ Add referral incentives

## 📝 License

MIT - Feel free to use and modify!

