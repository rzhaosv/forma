# Entity Relationship Diagram

## Visual Schema

```
┌─────────────────────────────────────────────────┐
│                    USERS                         │
├─────────────────────────────────────────────────┤
│ • id (PK)                                        │
│ • email (UNIQUE)                                 │
│ • full_name                                      │
│ • gender, age, height_cm, current_weight_kg     │
│ • goal_type, goal_weight_kg, activity_level     │
│ • daily_calorie_target                          │
│ • daily_protein_g, daily_carbs_g, daily_fat_g   │
│ • subscription_tier                              │
│ • onboarding_completed                           │
└──────────────────┬──────────────────────────────┘
                   │
                   │ 1
                   │
                   ├──────────────────────────────┐
                   │                              │
                   │ *                            │ *
         ┌─────────▼──────────┐      ┌───────────▼──────────┐
         │      MEALS         │      │   DAILY_SUMMARIES    │
         ├────────────────────┤      ├──────────────────────┤
         │ • id (PK)          │      │ • id (PK)            │
         │ • user_id (FK)     │      │ • user_id (FK)       │
         │ • meal_date        │      │ • summary_date       │
         │ • meal_type        │      │ • total_calories     │
         │ • entry_method     │      │ • total_protein_g    │
         │ • photo_url        │      │ • total_carbs_g      │
         │ • notes            │      │ • total_fat_g        │
         └─────────┬──────────┘      │ • meals_count        │
                   │                 └──────────────────────┘
                   │ 1
                   │
                   │ *
         ┌─────────▼──────────┐
         │    FOOD_ITEMS      │
         ├────────────────────┤              ┌────────────────────┐
         │ • id (PK)          │              │  WEIGHT_ENTRIES    │
         │ • meal_id (FK)     │              ├────────────────────┤
         │ • name             │              │ • id (PK)          │
         │ • brand            │              │ • user_id (FK)     │
         │ • serving_size     │              │ • recorded_date    │
         │ • quantity         │              │ • weight_kg        │
         │ • calories         │              │ • notes            │
         │ • protein_g        │              └─────────▲──────────┘
         │ • carbs_g          │                        │
         │ • fat_g            │                        │ *
         │ • fiber_g          │                        │
         │ • source           │                        │ 1
         └────────────────────┘          ┌─────────────┘
                                         │
                  
┌──────────────────────────────────────────────────┐
│           FOODS_DATABASE (Reference)             │
├──────────────────────────────────────────────────┤
│ • id (PK)                                        │
│ • name                                           │
│ • brand                                          │
│ • category (protein, grains, vegetables, etc.)  │
│ • calories_per_100g                              │
│ • protein_per_100g                               │
│ • carbs_per_100g                                 │
│ • fat_per_100g                                   │
│ • fiber_per_100g                                 │
│ • source (usda, user, custom)                   │
│ • barcode                                        │
│ • verified                                       │
└──────────────────────────────────────────────────┘
```

## Relationships

### One-to-Many (1:*)

1. **users → meals**
   - One user can have many meals
   - `meals.user_id` references `users.id`
   - CASCADE DELETE: Deleting a user deletes all their meals

2. **users → daily_summaries**
   - One user can have many daily summaries (one per day)
   - `daily_summaries.user_id` references `users.id`
   - CASCADE DELETE: Deleting a user deletes all their summaries

3. **users → weight_entries**
   - One user can have many weight entries
   - `weight_entries.user_id` references `users.id`
   - CASCADE DELETE: Deleting a user deletes all their weight entries

4. **meals → food_items**
   - One meal can have many food items
   - `food_items.meal_id` references `meals.id`
   - CASCADE DELETE: Deleting a meal deletes all its food items

### Reference Table

**foods_database**
- Not directly linked via foreign keys
- Used as a lookup/search reference
- Users search this table and copy data to their food_items

## Data Flow

### Creating a Meal

```
1. User creates meal
   → INSERT into meals table

2. User adds food items
   → INSERT into food_items table
   
3. Trigger fires automatically
   → Updates daily_summaries table
```

### Updating Nutrition

```
1. User edits food item
   → UPDATE food_items table
   
2. Trigger recalculates
   → Updates daily_summaries
   → Ensures totals stay accurate
```

### Viewing Daily Progress

```
1. App queries daily_summaries
   → Get pre-calculated totals (FAST)
   
2. App queries meals
   → Get individual meals with food_items
   
3. Compare with user.daily_calorie_target
   → Show progress to user
```

## Indexing Strategy

### Primary Indexes (Automatic)
- All `id` fields (Primary Keys)
- All UNIQUE constraints

### Custom Indexes (Performance)
- `users.email` - Fast login lookups
- `meals(user_id, meal_date)` - Fast daily meal queries
- `food_items.meal_id` - Fast meal detail queries
- `daily_summaries(user_id, summary_date)` - Fast summary queries
- `weight_entries(user_id, recorded_date)` - Fast weight history
- `foods_database.name` - Fast food searches
- `foods_database.barcode` - Instant barcode lookups
- `foods_database.category` - Filtered searches

## Constraints

### UNIQUE Constraints
- `users.email` - No duplicate accounts
- `(user_id, summary_date)` in daily_summaries - One summary per day
- `(user_id, recorded_date)` in weight_entries - One weight entry per day

### NOT NULL Constraints
Critical fields that must always have values:
- `users.email`
- `meals.user_id`, `meals.meal_date`, `meals.meal_type`
- `food_items.meal_id`, `food_items.name`, `food_items.calories`
- `foods_database.name`, `foods_database.calories_per_100g`

### CASCADE Deletes
All foreign keys use `ON DELETE CASCADE`:
- Delete user → deletes all their data
- Delete meal → deletes all its food items
- Maintains referential integrity

## Calculated vs Stored Data

### Calculated on Demand
- User's current progress percentage
- Days until goal weight
- Weekly/monthly averages (query-time aggregation)

### Pre-calculated (Stored)
- `daily_summaries` table - Updated via triggers
- `users.daily_calorie_target` - Calculated once during onboarding
- Improves performance for frequent queries

## Example User Journey

```
DAY 1: ONBOARDING
┌─────────────────┐
│ Create account  │
│ ↓               │
│ users table     │
│ • email         │
│ • goal_type     │
│ • height/weight │
└─────────────────┘
        ↓
┌─────────────────┐
│ Calculate       │
│ targets         │
│ ↓               │
│ Update user     │
│ • calorie goal  │
│ • macro targets │
└─────────────────┘

DAY 2: FIRST MEAL
┌─────────────────┐
│ Log breakfast   │
│ ↓               │
│ meals           │
│ • meal_date     │
│ • meal_type     │
└─────────────────┘
        ↓
┌─────────────────┐
│ Add foods       │
│ ↓               │
│ food_items      │
│ • eggs: 155 cal │
│ • toast: 80 cal │
└─────────────────┘
        ↓
┌─────────────────┐
│ Auto-update     │
│ ↓               │
│ daily_summaries │
│ • total: 235cal │
└─────────────────┘

WEEK 1: TRACK PROGRESS
┌─────────────────┐
│ Weigh in        │
│ ↓               │
│ weight_entries  │
│ • -0.5 kg       │
└─────────────────┘
```

