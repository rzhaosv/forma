# Forma Database Schema

## Overview
PostgreSQL database design for Forma calorie tracking application.

---

## Core Tables

### 1. users
Stores user profiles, goals, and calculated nutrition targets.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile
  full_name VARCHAR(255),
  
  -- Physical attributes
  gender VARCHAR(20), -- 'male', 'female', 'other'
  age INTEGER,
  height_cm DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  
  -- Goals
  goal_type VARCHAR(20), -- 'lose_weight', 'maintain', 'gain_muscle'
  goal_weight_kg DECIMAL(5,2),
  activity_level VARCHAR(20), -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
  
  -- Calculated daily targets
  daily_calorie_target INTEGER,
  daily_protein_g INTEGER,
  daily_carbs_g INTEGER,
  daily_fat_g INTEGER,
  
  -- Settings
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free' or 'premium'
  onboarding_completed BOOLEAN DEFAULT false
);

CREATE INDEX idx_users_email ON users(email);
```

---

### 2. meals
Stores meal entries for each day.

```sql
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- When
  meal_date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  
  -- How logged
  entry_method VARCHAR(20) NOT NULL, -- 'photo', 'manual', 'barcode'
  photo_url TEXT, -- If from photo
  
  -- Optional notes
  notes TEXT
);

CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date DESC);
```

---

### 3. food_items
Individual food items within a meal.

```sql
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  
  -- Food identity
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  
  -- Portion
  serving_size VARCHAR(100), -- "1 cup", "100g", etc.
  quantity DECIMAL(5,2) DEFAULT 1,
  
  -- Nutrition (per serving)
  calories INTEGER NOT NULL,
  protein_g DECIMAL(5,2),
  carbs_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),
  fiber_g DECIMAL(5,2),
  
  -- Source tracking
  source VARCHAR(50) -- 'ai', 'manual', 'database'
);

CREATE INDEX idx_food_items_meal ON food_items(meal_id);
```

---

### 4. foods_database
Master food database for quick lookups.

```sql
CREATE TABLE foods_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(100), -- 'protein', 'grains', 'vegetables', etc.
  
  -- Nutrition per 100g
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fat_per_100g DECIMAL(5,2),
  fiber_per_100g DECIMAL(5,2),
  
  -- Metadata
  source VARCHAR(50), -- 'usda', 'user', 'custom'
  barcode VARCHAR(50),
  verified BOOLEAN DEFAULT false
);

CREATE INDEX idx_foods_name ON foods_database(name);
CREATE INDEX idx_foods_barcode ON foods_database(barcode);
CREATE INDEX idx_foods_category ON foods_database(category);
```

---

### 5. daily_summaries
Pre-calculated daily nutrition totals for performance.

```sql
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  
  -- Totals
  total_calories INTEGER DEFAULT 0,
  total_protein_g DECIMAL(6,2) DEFAULT 0,
  total_carbs_g DECIMAL(6,2) DEFAULT 0,
  total_fat_g DECIMAL(6,2) DEFAULT 0,
  
  meals_count INTEGER DEFAULT 0,
  
  UNIQUE(user_id, summary_date)
);

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date DESC);
```

---

### 6. weight_entries
Track weight over time.

```sql
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  recorded_date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, recorded_date)
);

CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, recorded_date DESC);
```

---

## Database Functions

### Calculate Daily Calorie Target
Uses Mifflin-St Jeor equation to calculate TDEE.

```sql
CREATE OR REPLACE FUNCTION calculate_calorie_target(
  p_gender VARCHAR,
  p_age INTEGER,
  p_height_cm DECIMAL,
  p_weight_kg DECIMAL,
  p_activity_level VARCHAR,
  p_goal_type VARCHAR
) RETURNS INTEGER AS $$
DECLARE
  v_bmr DECIMAL;
  v_activity_multiplier DECIMAL;
  v_tdee DECIMAL;
  v_adjustment INTEGER;
BEGIN
  -- Calculate Basal Metabolic Rate
  IF p_gender = 'male' THEN
    v_bmr := (10 * p_weight_kg) + (6.25 * p_height_cm) - (5 * p_age) + 5;
  ELSE
    v_bmr := (10 * p_weight_kg) + (6.25 * p_height_cm) - (5 * p_age) - 161;
  END IF;
  
  -- Activity level multiplier
  v_activity_multiplier := CASE p_activity_level
    WHEN 'sedentary' THEN 1.2
    WHEN 'light' THEN 1.375
    WHEN 'moderate' THEN 1.55
    WHEN 'active' THEN 1.725
    WHEN 'very_active' THEN 1.9
    ELSE 1.2
  END;
  
  -- Calculate TDEE (Total Daily Energy Expenditure)
  v_tdee := v_bmr * v_activity_multiplier;
  
  -- Adjust for goal
  v_adjustment := CASE p_goal_type
    WHEN 'lose_weight' THEN -500  -- 0.5kg/week
    WHEN 'gain_muscle' THEN 300   -- Lean bulk
    ELSE 0                         -- Maintain
  END;
  
  RETURN ROUND(v_tdee + v_adjustment);
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

### Auto-update daily summaries when food items change

```sql
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_meal_date DATE;
BEGIN
  -- Get user_id and meal_date
  SELECT m.user_id, m.meal_date INTO v_user_id, v_meal_date
  FROM meals m
  WHERE m.id = COALESCE(NEW.meal_id, OLD.meal_id);
  
  -- Recalculate daily summary
  INSERT INTO daily_summaries (user_id, summary_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, meals_count)
  SELECT 
    m.user_id,
    m.meal_date,
    COALESCE(SUM(fi.calories * fi.quantity), 0) as total_calories,
    COALESCE(SUM(fi.protein_g * fi.quantity), 0) as total_protein_g,
    COALESCE(SUM(fi.carbs_g * fi.quantity), 0) as total_carbs_g,
    COALESCE(SUM(fi.fat_g * fi.quantity), 0) as total_fat_g,
    COUNT(DISTINCT m.id) as meals_count
  FROM meals m
  LEFT JOIN food_items fi ON m.id = fi.meal_id
  WHERE m.user_id = v_user_id AND m.meal_date = v_meal_date
  GROUP BY m.user_id, m.meal_date
  ON CONFLICT (user_id, summary_date) 
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g = EXCLUDED.total_carbs_g,
    total_fat_g = EXCLUDED.total_fat_g,
    meals_count = EXCLUDED.meals_count;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_summary_on_food_insert
  AFTER INSERT ON food_items
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();

CREATE TRIGGER trigger_update_summary_on_food_update
  AFTER UPDATE ON food_items
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();

CREATE TRIGGER trigger_update_summary_on_food_delete
  AFTER DELETE ON food_items
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();
```

---

## Entity Relationships

```
users (1) ----< (*) meals
             |
             +----< (*) weight_entries
             |
             +----< (*) daily_summaries

meals (1) ----< (*) food_items

foods_database (reference table, not directly linked)
```

---

## Sample Data

### Seed common foods

```sql
INSERT INTO foods_database (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, verified) VALUES
  ('Chicken Breast (Cooked)', 'protein', 165, 31.0, 0.0, 3.6, 'usda', true),
  ('Brown Rice (Cooked)', 'grains', 123, 2.6, 25.6, 0.9, 'usda', true),
  ('Broccoli (Raw)', 'vegetables', 34, 2.8, 6.6, 0.4, 'usda', true),
  ('Banana', 'fruits', 89, 1.1, 22.8, 0.3, 'usda', true),
  ('Eggs (Large)', 'protein', 155, 13.0, 1.1, 11.0, 'usda', true),
  ('Salmon (Cooked)', 'protein', 206, 22.0, 0.0, 12.0, 'usda', true),
  ('Oatmeal (Cooked)', 'grains', 71, 2.5, 12.0, 1.5, 'usda', true),
  ('Greek Yogurt (Plain)', 'dairy', 59, 10.0, 3.6, 0.4, 'usda', true),
  ('Almonds', 'nuts', 579, 21.0, 22.0, 50.0, 'usda', true),
  ('Apple', 'fruits', 52, 0.3, 13.8, 0.2, 'usda', true);
```

---

## Example Queries

### Get daily nutrition summary for a user

```sql
SELECT 
  ds.summary_date,
  ds.total_calories,
  u.daily_calorie_target,
  (u.daily_calorie_target - ds.total_calories) as calories_remaining,
  ds.total_protein_g,
  ds.total_carbs_g,
  ds.total_fat_g,
  ds.meals_count
FROM daily_summaries ds
JOIN users u ON u.id = ds.user_id
WHERE ds.user_id = 'user-uuid-here'
  AND ds.summary_date = CURRENT_DATE;
```

### Get all meals for a specific date

```sql
SELECT 
  m.id as meal_id,
  m.meal_type,
  m.entry_method,
  fi.name as food_name,
  fi.calories,
  fi.protein_g,
  fi.carbs_g,
  fi.fat_g,
  fi.quantity
FROM meals m
LEFT JOIN food_items fi ON fi.meal_id = m.id
WHERE m.user_id = 'user-uuid-here'
  AND m.meal_date = '2025-11-12'
ORDER BY m.meal_type, fi.name;
```

### Search foods database

```sql
SELECT 
  id,
  name,
  brand,
  category,
  calories_per_100g,
  protein_per_100g,
  carbs_per_100g,
  fat_per_100g
FROM foods_database
WHERE name ILIKE '%chicken%'
  AND verified = true
ORDER BY name
LIMIT 20;
```

### Get weight tracking history

```sql
SELECT 
  recorded_date,
  weight_kg,
  notes
FROM weight_entries
WHERE user_id = 'user-uuid-here'
ORDER BY recorded_date DESC
LIMIT 30;
```

---

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Daily Summaries**: Pre-calculated via triggers to avoid complex aggregations
3. **Partitioning**: Consider partitioning meals table by date if data grows large
4. **Caching**: Food database searches should be cached (Redis)

---

## Setup Instructions

### 1. Create Database

```sql
CREATE DATABASE forma_db;
```

### 2. Run Schema

Execute the CREATE TABLE statements in order:
1. users
2. meals
3. food_items
4. foods_database
5. daily_summaries
6. weight_entries

### 3. Create Functions & Triggers

Run the function and trigger definitions

### 4. Seed Data

Insert sample foods data

### 5. Test

Run example queries to verify setup

---

## Next Steps

- [ ] Set up Row Level Security (RLS) policies
- [ ] Add database backups
- [ ] Configure connection pooling
- [ ] Add more seed data
- [ ] Create database migration files

