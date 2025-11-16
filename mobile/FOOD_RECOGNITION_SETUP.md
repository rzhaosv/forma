# 🤖 Food Recognition API Setup

AI-powered food identification using OpenAI Vision API (GPT-4 Vision)

---

## 🎯 Quick Start

### Option 1: Test with Mock Data (No API Key Needed)
The app will automatically use mock data if no API key is configured. This lets you test the flow immediately!

**Just take a photo and see:**
- Mock chicken breast, rice, and broccoli
- Full nutrition breakdown
- Beautiful results screen

### Option 2: Use Real AI Recognition (Requires API Key)
Get actual food identification with OpenAI's powerful vision model.

---

## 🔑 Setting Up OpenAI API

### Step 1: Get Your API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create an OpenAI account
3. Click **"Create new secret key"**
4. Give it a name like "Forma Food Recognition"
5. **Copy the key** (starts with `sk-...`)
   - ⚠️ Save it now - you can't see it again!

### Step 2: Add API Key to Your App

Create a `.env` file in the `mobile` directory:

```bash
cd /Users/rayzhao/workspace/bodyapp/mobile
touch .env
```

Add your API key to `.env`:

```
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 3: Restart Expo

```bash
npx expo start --clear
```

That's it! The app will now use real AI food recognition! 🎉

---

## 💰 API Costs

**OpenAI Vision API Pricing:**
- Model: `gpt-4o-mini` (cost-effective vision model)
- Cost: ~$0.15 per 1000 images
- Each food photo analysis: ~$0.00015 (less than 1/100th of a cent!)

**Example monthly costs:**
- 100 photos/month: $0.015 (basically free!)
- 1000 photos/month: $0.15
- 10,000 photos/month: $1.50

---

## 🔍 How It Works

### The Flow:

```
User takes photo
  ↓
Photo captured (base64 encoded)
  ↓
Sent to OpenAI Vision API
  ↓
GPT-4 Vision analyzes image
  ↓
Returns JSON with:
  - Food names
  - Serving sizes
  - Calories
  - Macros (protein, carbs, fat)
  - Confidence levels
  ↓
Display on FoodResultsScreen
  ↓
Add to meal log (coming soon!)
```

### What the AI Does:

1. **Identifies all food items** in the photo
2. **Estimates serving sizes** (e.g., "150g", "1 cup")
3. **Calculates nutrition** per item
4. **Assigns confidence** (0-100%) to each identification
5. **Returns structured data** in JSON format

---

## 📸 Best Practices for Photos

**For Best AI Results:**
- ✅ **Good lighting** - Natural light is best
- ✅ **Clear view** - Show food from above
- ✅ **Single plate** - One meal at a time
- ✅ **Identifiable foods** - Whole items work better than mixed dishes
- ✅ **Stable photo** - Hold still for clarity

**Less Accurate:**
- ❌ Dark/poor lighting
- ❌ Blurry photos
- ❌ Complex mixed dishes
- ❌ Multiple plates
- ❌ Extreme angles

---

## 🧪 Testing

### With Mock Data (Default):
1. Open app → Sign in
2. Tap **"📸 Photo"**
3. Take any photo
4. See mock results (chicken, rice, broccoli)
5. Test the results screen flow

### With Real API:
1. Add API key to `.env`
2. Restart app
3. Take photo of actual food
4. Wait 2-5 seconds for analysis
5. See real AI-identified foods! 🎉

---

## 🔧 Technical Details

### API Configuration:

```typescript
// Using gpt-4o-mini (latest, fastest, cheapest vision model)
model: 'gpt-4o-mini'

// Optimized prompt for food recognition
// Returns structured JSON with nutrition data
// Max 1000 tokens (keeps costs low)
```

### Error Handling:

- ✅ API key missing → Uses mock data
- ✅ API request fails → Shows error message
- ✅ No food detected → Prompts to retake
- ✅ Network error → User-friendly message

### Features:

- **Fallback to mock** - Always works, even without API key
- **Loading states** - "Analyzing food..." overlay
- **Confidence levels** - Shows AI certainty for each item
- **Multiple foods** - Identifies all items in photo
- **Detailed nutrition** - Calories + macros per food

---

## 📊 Current Status

**Implemented:**
- ✅ OpenAI Vision API integration
- ✅ Food photo analysis
- ✅ Mock data fallback
- ✅ Results screen with nutrition
- ✅ Loading states
- ✅ Error handling
- ✅ Confidence indicators

**Coming Soon:**
- 🔄 Add to meal log integration
- 🔄 Edit identified foods
- 🔄 Adjust serving sizes
- 🔄 History of analyzed foods
- 🔄 Offline caching

---

## 🐛 Troubleshooting

### "API key not configured" message
**Solution:** Create `.env` file with your API key and restart Expo

### Analysis fails every time
**Possible causes:**
- Invalid API key
- No internet connection
- API quota exceeded
- Server error

**Check:**
```bash
# View console logs
npx expo start
# Look for error messages after taking photo
```

### Mock data shows instead of real results
**Reason:** App automatically falls back to mock if API call fails
**Solution:** Check API key is correct in `.env`

---

## 💡 Pro Tips

1. **Start with mock data** to test the flow
2. **Add API key** when ready for real recognition
3. **Take clear photos** for best results
4. **Check console logs** for debugging
5. **Monitor API usage** on OpenAI dashboard

---

## 🔐 Security

**Safe to commit:**
- ✅ `.env.example` (template)
- ✅ Service code
- ✅ Mock data functions

**Never commit:**
- ❌ `.env` (contains your API key)
- ❌ Actual API keys anywhere

The `.env` file is in `.gitignore` to keep your key safe!

---

Your food recognition API is ready! Start with mock data, then add your API key when ready for real AI magic! 🚀

