# Week 7: Food Recognition Model Refinement

**Goal:** Improve AI food recognition accuracy through prompt optimization, feedback collection, and accuracy tracking.

---

## Current State

- ✅ Basic OpenAI Vision API integration working
- ✅ Simple prompt for food identification
- ⚠️ No feedback mechanism for corrections
- ⚠️ No accuracy tracking
- ⚠️ No nutrition validation

---

## Week 7 Tasks

### 1. Enhanced Prompt Engineering ✅

**Goal:** Improve nutrition accuracy and food identification

**Changes:**
- Add USDA nutrition database context to prompt
- Include portion size estimation guidelines
- Add confidence scoring instructions
- Improve multi-food detection

**Expected Improvement:**
- 10-15% better calorie accuracy
- Better portion size estimation
- Higher confidence scores for common foods

---

### 2. User Feedback System

**Goal:** Collect data on AI accuracy to improve prompts

**Features:**
- Thumbs up/down on AI results
- Track when users edit AI-suggested foods
- Log corrections (what AI said vs. what user changed)
- Store feedback in database

**Implementation:**
- Add feedback buttons to FoodResultsScreen
- Create `ai_feedback` table in database
- Track edit frequency per food type

---

### 3. Accuracy Tracking & Analytics

**Goal:** Measure and monitor AI performance

**Metrics to Track:**
- Recognition accuracy (% of foods correctly identified)
- Calorie accuracy (AI estimate vs. user correction)
- Portion size accuracy
- Confidence score correlation with actual accuracy
- Most commonly corrected foods

**Dashboard:**
- Weekly accuracy reports
- Identify problem foods
- Track improvements over time

---

### 4. Nutrition Database Validation

**Goal:** Validate AI estimates against USDA database

**Implementation:**
- After AI recognition, cross-reference with USDA API
- Flag foods with significant calorie discrepancies
- Suggest corrections when AI is off by >20%
- Learn from validated data

---

### 5. Prompt A/B Testing

**Goal:** Systematically improve prompts

**Framework:**
- Version prompts (v1, v2, v3)
- Randomly assign prompts to users
- Track accuracy per version
- Roll out best-performing prompt

---

## Implementation Plan

### Phase 1: Enhanced Prompt (Day 1-2)
1. Research USDA nutrition values for common foods
2. Create improved prompt with nutrition context
3. Test with 20 diverse food images
4. Compare accuracy vs. current prompt

### Phase 2: Feedback System (Day 3-4)
1. Design feedback UI
2. Create database schema for feedback
3. Implement feedback collection
4. Add analytics tracking

### Phase 3: Accuracy Tracking (Day 5-6)
1. Build analytics queries
2. Create accuracy dashboard
3. Set up weekly reports
4. Identify improvement opportunities

### Phase 4: Validation & Testing (Day 7)
1. Integrate USDA API validation
2. Test end-to-end flow
3. Document findings
4. Plan Week 8 improvements

---

## Success Metrics

**Accuracy Targets:**
- Food identification: 85%+ (currently ~80%)
- Calorie accuracy: ±10% (currently ±15%)
- Portion size: ±20% (currently ±30%)

**Engagement:**
- 30%+ users provide feedback
- Average confidence score increases
- Edit rate decreases by 20%

---

## Database Schema

```sql
-- AI Feedback Table
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  meal_id UUID REFERENCES meals(id),
  food_item_id UUID REFERENCES food_items(id),
  
  -- AI Prediction
  ai_food_name TEXT,
  ai_calories DECIMAL,
  ai_protein_g DECIMAL,
  ai_carbs_g DECIMAL,
  ai_fat_g DECIMAL,
  ai_confidence INTEGER,
  
  -- User Correction (if edited)
  user_food_name TEXT,
  user_calories DECIMAL,
  user_protein_g DECIMAL,
  user_carbs_g DECIMAL,
  user_fat_g DECIMAL,
  
  -- Feedback
  was_accurate BOOLEAN,
  feedback_type TEXT, -- 'accurate', 'edited', 'deleted'
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Accuracy Metrics Table
CREATE TABLE ai_accuracy_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE,
  prompt_version TEXT,
  
  total_scans INTEGER,
  foods_identified INTEGER,
  foods_edited INTEGER,
  foods_deleted INTEGER,
  
  avg_confidence DECIMAL,
  avg_calorie_error_percent DECIMAL,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Next Steps

1. **This Week:** Implement enhanced prompt and feedback system
2. **Week 8:** Analyze feedback data and refine prompts
3. **Week 9:** Implement USDA validation
4. **Ongoing:** Continuous improvement based on user feedback

---

**Status:** In Progress  
**Started:** Week 7  
**Target Completion:** End of Week 7

