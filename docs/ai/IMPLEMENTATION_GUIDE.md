# OpenAI Vision API - Implementation Guide

**Service:** OpenAI GPT-4 Vision API  
**Purpose:** Food recognition and nutrition analysis from photos

---

## Setup (5 minutes)

### 1. Get API Key

```bash
# Visit: https://platform.openai.com/api-keys
# Click: "Create new secret key"
# Copy: sk-...
```

### 2. Install SDK

```bash
cd backend
npm install openai
```

### 3. Add to Environment

```bash
# backend/.env
OPENAI_API_KEY=sk-your-api-key-here
```

---

## Basic Implementation

### Service Layer (`backend/src/services/ai.service.ts`)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FOOD_ANALYSIS_PROMPT = `
Analyze this meal photo and identify all visible foods.

Return a JSON array with this structure:
[
  {
    "name": "Food name (e.g., 'Grilled Chicken Breast')",
    "portion": "Human-readable serving (e.g., '1 medium breast')",
    "portion_g": estimated weight in grams,
    "calories": estimated calories,
    "protein_g": protein in grams,
    "carbs_g": carbohydrates in grams,
    "fat_g": fat in grams,
    "fiber_g": fiber in grams (optional),
    "confidence": your confidence level (0.0 to 1.0)
  }
]

Guidelines:
- Identify all visible foods
- Estimate portions based on image context
- Use standard USDA nutrition values
- Be conservative with portion estimates
- Return only valid JSON, no markdown or explanations
`;

export async function analyzeFoodPhoto(imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: FOOD_ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high' // or 'low' for faster/cheaper
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.2, // Lower = more consistent
    });

    const content = response.choices[0].message.content;
    
    // Parse JSON response
    const foods = JSON.parse(content);
    
    // Calculate totals
    const totals = {
      total_calories: foods.reduce((sum, f) => sum + f.calories, 0),
      total_protein_g: foods.reduce((sum, f) => sum + f.protein_g, 0),
      total_carbs_g: foods.reduce((sum, f) => sum + f.carbs_g, 0),
      total_fat_g: foods.reduce((sum, f) => sum + f.fat_g, 0),
    };

    return {
      success: true,
      foods,
      totals,
      processing_time_ms: Date.now() - Date.now(), // Add timing
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      success: false,
      error: 'Failed to analyze image',
      foods: [],
    };
  }
}
```

---

## API Endpoint

### Controller (`backend/src/controllers/ai.controller.ts`)

```typescript
import { Request, Response } from 'express';
import { analyzeFoodPhoto } from '../services/ai.service.js';
import supabaseAdmin from '../config/supabase.js';

export const analyzePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { image_url } = req.body;

    if (!image_url) {
      res.status(400).json({ error: 'image_url is required' });
      return;
    }

    // Check free tier limits (5 scans per day)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', req.user.uid)
      .single();

    if (user?.subscription_tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabaseAdmin
        .from('photo_scan_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.uid)
        .eq('scan_date', today);

      if (count !== null && count >= 5) {
        res.status(429).json({
          error: 'Daily limit reached',
          message: 'Free tier limited to 5 photo scans per day',
          scans_used: count,
          upgrade_url: '/api/v1/subscription/plans'
        });
        return;
      }
    }

    // Analyze the photo
    const startTime = Date.now();
    const result = await analyzeFoodPhoto(image_url);
    const processingTime = Date.now() - startTime;

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    // Track usage
    await supabaseAdmin.from('photo_scan_usage').insert({
      user_id: req.user.uid,
      scan_date: new Date().toISOString().split('T')[0],
      was_successful: true,
    });

    res.json({
      success: true,
      data: {
        foods: result.foods,
        totals: result.totals,
        processing_time_ms: processingTime,
      }
    });
  } catch (error: any) {
    console.error('Photo analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze photo',
      message: error.message
    });
  }
};
```

### Route (`backend/src/routes/ai.routes.ts`)

```typescript
import { Router } from 'express';
import { analyzePhoto } from '../controllers/ai.controller.js';
import { authenticateUser, checkPhotoScanLimit } from '../middleware/auth.middleware.js';

const router = Router();

router.post(
  '/analyze',
  authenticateUser,
  checkPhotoScanLimit,
  analyzePhoto
);

export default router;
```

### Mount Route (`backend/src/server.ts`)

```typescript
import aiRoutes from './routes/ai.routes.js';

// ...
app.use('/api/v1/ai', aiRoutes);
```

---

## Testing

### Test Endpoint

```bash
# With image URL
curl -X POST http://localhost:3000/api/v1/ai/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/meal-photo.jpg"
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "name": "Grilled Chicken Breast",
        "portion": "150g (1 medium breast)",
        "portion_g": 150,
        "calories": 248,
        "protein_g": 46.5,
        "carbs_g": 0,
        "fat_g": 5.4,
        "confidence": 0.92
      },
      {
        "name": "Brown Rice",
        "portion": "1 cup (cooked)",
        "portion_g": 195,
        "calories": 218,
        "protein_g": 4.5,
        "carbs_g": 45.8,
        "fat_g": 1.6,
        "confidence": 0.88
      }
    ],
    "totals": {
      "total_calories": 466,
      "total_protein_g": 51,
      "total_carbs_g": 45.8,
      "total_fat_g": 7
    },
    "processing_time_ms": 2341
  }
}
```

---

## Error Handling

### Common Issues

1. **Invalid API Key**
```typescript
if (error.code === 'invalid_api_key') {
  return { error: 'Configuration error. Contact support.' };
}
```

2. **Rate Limit**
```typescript
if (error.code === 'rate_limit_exceeded') {
  return { error: 'Too many requests. Please try again in a moment.' };
}
```

3. **Invalid Image**
```typescript
if (error.code === 'invalid_image_url') {
  return { error: 'Could not access image. Please try another photo.' };
}
```

4. **Parsing Error**
```typescript
try {
  const foods = JSON.parse(content);
} catch (e) {
  // GPT didn't return valid JSON
  return { error: 'Could not analyze image. Please try again.' };
}
```

---

## Optimization Tips

### 1. Image Preprocessing

```typescript
// Resize images before sending to API
import sharp from 'sharp';

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1024, 1024, { fit: 'inside' }) // Max 1024x1024
    .jpeg({ quality: 85 }) // Compress to reduce tokens
    .toBuffer();
}
```

### 2. Response Caching

```typescript
// Cache identical image analyses
import crypto from 'crypto';

function getImageHash(imageUrl: string): string {
  return crypto.createHash('md5').update(imageUrl).digest('hex');
}

// In Redis:
const cached = await redis.get(`analysis:${imageHash}`);
if (cached) return JSON.parse(cached);

// After analysis:
await redis.setex(`analysis:${imageHash}`, 3600, JSON.stringify(result));
```

### 3. Prompt Optimization

```typescript
// Shorter, more efficient prompts
const SHORT_PROMPT = `
Analyze meal. Return JSON array:
[{name, portion, portion_g, calories, protein_g, carbs_g, fat_g, confidence}]
`;
```

### 4. Lower Image Detail

```typescript
// Use 'low' detail for faster/cheaper processing
image_url: {
  url: imageUrl,
  detail: 'low' // vs 'high'
}
// Trade-off: Slightly less accurate for complex images
```

---

## Cost Tracking

### Add Usage Logging

```typescript
await supabaseAdmin.from('photo_scan_usage').insert({
  user_id: req.user.uid,
  scan_date: today,
  tokens_used: response.usage.total_tokens,
  cost_usd: (response.usage.total_tokens / 1000) * 0.01,
});
```

### Monitor Spending

```sql
-- Daily cost report
SELECT 
  scan_date,
  COUNT(*) as scans,
  SUM(cost_usd) as total_cost
FROM photo_scan_usage
WHERE scan_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY scan_date
ORDER BY scan_date DESC;
```

---

## Mobile Integration

### Upload Photo to Storage First

```typescript
// Mobile app
import * as ImagePicker from 'expo-image-picker';

// 1. Pick image
const result = await ImagePicker.launchCameraAsync({
  quality: 0.8,
  base64: true,
});

// 2. Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('meal-photos')
  .upload(`${userId}/${Date.now()}.jpg`, result.base64);

// 3. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('meal-photos')
  .getPublicUrl(data.path);

// 4. Analyze via API
const response = await fetch('/api/v1/ai/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ image_url: publicUrl }),
});

const result = await response.json();
```

---

## Production Checklist

- [ ] Set up OpenAI account with payment method
- [ ] Add OPENAI_API_KEY to production environment
- [ ] Implement rate limiting (max 10 requests/minute per user)
- [ ] Add request logging and monitoring
- [ ] Set up usage alerts (> $100/day)
- [ ] Test with 50+ diverse food images
- [ ] Implement user feedback mechanism
- [ ] Add fallback to manual entry if AI fails
- [ ] Configure retry logic (3 attempts)
- [ ] Document common failure modes

---

## Next Steps

1. **Week 1:** Basic integration and testing
2. **Week 2:** Add error handling and user corrections
3. **Week 3:** Optimize prompts based on feedback
4. **Month 2:** Implement caching and monitoring

---

## Resources

- OpenAI Vision API Docs: https://platform.openai.com/docs/guides/vision
- Pricing Calculator: https://openai.com/pricing
- Rate Limits: https://platform.openai.com/docs/guides/rate-limits

