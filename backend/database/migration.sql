-- Forma Database Migration
-- PostgreSQL Schema for Calorie Tracking App
-- Run this in Supabase SQL Editor or any PostgreSQL database

-- ============================================
-- 1. USERS TABLE
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile
  full_name VARCHAR(255),
  
  -- Physical attributes
  gender VARCHAR(20),
  age INTEGER,
  height_cm DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  
  -- Goals
  goal_type VARCHAR(20),
  goal_weight_kg DECIMAL(5,2),
  activity_level VARCHAR(20),
  
  -- Calculated daily targets
  daily_calorie_target INTEGER,
  daily_protein_g INTEGER,
  daily_carbs_g INTEGER,
  daily_fat_g INTEGER,
  
  -- Settings
  subscription_tier VARCHAR(20) DEFAULT 'free',
  onboarding_completed BOOLEAN DEFAULT false
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. MEALS TABLE
-- ============================================

CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- When
  meal_date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  
  -- How logged
  entry_method VARCHAR(20) NOT NULL,
  photo_url TEXT,
  
  -- Optional notes
  notes TEXT
);

CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date DESC);

-- ============================================
-- 3. FOOD ITEMS TABLE
-- ============================================

CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  
  -- Food identity
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  
  -- Portion
  serving_size VARCHAR(100),
  quantity DECIMAL(5,2) DEFAULT 1,
  
  -- Nutrition (per serving)
  calories INTEGER NOT NULL,
  protein_g DECIMAL(5,2),
  carbs_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),
  fiber_g DECIMAL(5,2),
  
  -- Source tracking
  source VARCHAR(50)
);

CREATE INDEX idx_food_items_meal ON food_items(meal_id);

-- ============================================
-- 4. FOODS DATABASE TABLE
-- ============================================

CREATE TABLE foods_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(100),
  
  -- Nutrition per 100g
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fat_per_100g DECIMAL(5,2),
  fiber_per_100g DECIMAL(5,2),
  
  -- Metadata
  source VARCHAR(50),
  barcode VARCHAR(50),
  verified BOOLEAN DEFAULT false
);

CREATE INDEX idx_foods_name ON foods_database(name);
CREATE INDEX idx_foods_barcode ON foods_database(barcode);
CREATE INDEX idx_foods_category ON foods_database(category);

-- ============================================
-- 5. DAILY SUMMARIES TABLE
-- ============================================

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

-- ============================================
-- 6. WEIGHT ENTRIES TABLE
-- ============================================

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

-- ============================================
-- FUNCTIONS
-- ============================================

-- Calculate daily calorie target using Mifflin-St Jeor equation
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
    WHEN 'lose_weight' THEN -500
    WHEN 'gain_muscle' THEN 300
    ELSE 0
  END;
  
  RETURN ROUND(v_tdee + v_adjustment);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update daily summaries when food items change
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

-- ============================================
-- SEED DATA
-- ============================================

-- Insert common foods
INSERT INTO foods_database (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source, verified) VALUES
  ('Chicken Breast (Cooked)', 'protein', 165, 31.0, 0.0, 3.6, 'usda', true),
  ('Brown Rice (Cooked)', 'grains', 123, 2.6, 25.6, 0.9, 'usda', true),
  ('White Rice (Cooked)', 'grains', 130, 2.7, 28.2, 0.3, 'usda', true),
  ('Broccoli (Raw)', 'vegetables', 34, 2.8, 6.6, 0.4, 'usda', true),
  ('Spinach (Raw)', 'vegetables', 23, 2.9, 3.6, 0.4, 'usda', true),
  ('Banana', 'fruits', 89, 1.1, 22.8, 0.3, 'usda', true),
  ('Apple', 'fruits', 52, 0.3, 13.8, 0.2, 'usda', true),
  ('Eggs (Large)', 'protein', 155, 13.0, 1.1, 11.0, 'usda', true),
  ('Salmon (Cooked)', 'protein', 206, 22.0, 0.0, 12.0, 'usda', true),
  ('Ground Beef (Cooked)', 'protein', 250, 26.0, 0.0, 17.0, 'usda', true),
  ('Oatmeal (Cooked)', 'grains', 71, 2.5, 12.0, 1.5, 'usda', true),
  ('Bread (Whole Wheat)', 'grains', 247, 13.0, 41.0, 3.4, 'usda', true),
  ('Greek Yogurt (Plain)', 'dairy', 59, 10.0, 3.6, 0.4, 'usda', true),
  ('Milk (2%)', 'dairy', 50, 3.3, 4.8, 2.0, 'usda', true),
  ('Cheddar Cheese', 'dairy', 403, 25.0, 1.3, 33.0, 'usda', true),
  ('Almonds', 'nuts', 579, 21.0, 22.0, 50.0, 'usda', true),
  ('Peanut Butter', 'nuts', 588, 25.0, 20.0, 50.0, 'usda', true),
  ('Avocado', 'fruits', 160, 2.0, 8.5, 14.7, 'usda', true),
  ('Sweet Potato (Baked)', 'vegetables', 90, 2.0, 20.7, 0.2, 'usda', true),
  ('Pasta (Cooked)', 'grains', 131, 5.0, 25.0, 1.1, 'usda', true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that all tables were created
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check foods count
SELECT COUNT(*) as foods_count FROM foods_database;

-- Migration complete!
SELECT 'Database migration completed successfully!' as status;

