# Forma Project Management Guide

**Purpose:** Track features, bugs, and improvements for solo development  
**Last Updated:** November 12, 2025

---

## Recommended Tools

### Option 1: GitHub Projects (Recommended) ⭐
**Why:** Integrated with your code, free, powerful

**Pros:**
- ✅ Built into GitHub (already using git)
- ✅ Automatic issue tracking
- ✅ Can link PRs and commits
- ✅ Multiple view types (Kanban, Table, Roadmap)
- ✅ Free for solo developers
- ✅ Mobile app available

**Setup:**
1. Go to your GitHub repo
2. Click "Projects" tab
3. Click "New project"
4. Choose "Board" template
5. Customize columns

### Option 2: Linear
**Why:** Beautiful, fast, built for developers

**Pros:**
- ✅ Best-in-class UX
- ✅ Keyboard shortcuts
- ✅ Git integration
- ✅ Free for solo developers

**Cons:**
- ⚠️ External tool (not in GitHub)
- ⚠️ Requires separate account

### Option 3: Notion
**Why:** All-in-one workspace

**Pros:**
- ✅ Very flexible
- ✅ Can include docs, notes, roadmap
- ✅ Beautiful databases
- ✅ Free for personal use

**Cons:**
- ⚠️ Can be slow
- ⚠️ Not code-specific

### Option 4: Markdown Files (Simple)
**Why:** Zero dependencies, works offline

**Pros:**
- ✅ Lives in your repo
- ✅ Version controlled
- ✅ No external dependencies
- ✅ Works offline

**Cons:**
- ⚠️ Manual management
- ⚠️ No automation
- ⚠️ Limited features

---

## Board Structure

### Columns (Kanban Style)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Backlog  │  Ready   │  Doing   │ Review   │   Done   │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ Ideas    │ To-do    │ Active   │ Testing  │ Complete │
│ Not yet  │ Planned  │ 1-2 max  │ QA       │ Shipped  │
│ prioriti │ Next up  │ focus    │ Polish   │ Closed   │
│ -zed     │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Column Definitions:**

1. **Backlog** - Ideas and future features
   - Not prioritized yet
   - No deadline
   - Might never be done

2. **Ready** - Prioritized and ready to start
   - Requirements clear
   - Design approved (if applicable)
   - No blockers
   - Can be picked up immediately

3. **Doing** - Currently working on
   - **Maximum 1-2 items** (focus!)
   - Has assignee (you)
   - Has target completion date

4. **Review** - Done coding, needs testing
   - Code complete
   - Testing in progress
   - Bugs found go back to Doing

5. **Done** - Completed and shipped
   - Tested and verified
   - Merged to main
   - Deployed (if applicable)
   - Archive after 2 weeks

---

## Labels System

### Priority Labels
```
🔴 P0 - Critical     | Blocking, fix ASAP
🟠 P1 - High         | Important, do this week
🟡 P2 - Medium       | Should do this month
🟢 P3 - Low          | Nice to have
⚪ P4 - Backlog      | Someday maybe
```

### Type Labels
```
✨ Feature           | New functionality
🐛 Bug               | Something broken
🔧 Improvement       | Enhance existing
📝 Documentation     | Docs, guides, comments
🎨 Design            | UI/UX changes
⚡ Performance       | Speed, optimization
🔒 Security          | Security improvements
🧪 Testing           | Add/fix tests
♿ Accessibility     | A11y improvements
```

### Status Labels
```
🚧 Blocked           | Can't proceed, waiting
💭 Discussion        | Needs decision
❓ Question          | Needs clarification
💪 Ready for Dev     | Specified, can start
👀 Needs Review      | PR ready for review
✅ Verified          | Tested and confirmed
```

### Component Labels
```
📱 Mobile            | React Native app
🖥️ Backend           | Node.js API
🗄️ Database          | Supabase/PostgreSQL
🤖 AI                | OpenAI integration
🔐 Auth              | Firebase Auth
📊 Analytics         | Tracking, metrics
```

---

## Issue Template

### Feature Request
```markdown
## Feature: [Feature Name]

### Description
Brief description of what this feature does.

### User Story
As a [user type], I want to [action] so that [benefit].

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Design
- Mockup: Link to design
- Wireframe: docs/wireframes/XX.md

### Technical Notes
- API endpoints needed
- Database changes required
- External services involved

### Estimate
Small (< 4 hours) | Medium (4-8 hours) | Large (> 8 hours)

### Priority
P0 | P1 | P2 | P3

### Labels
feature, mobile, backend, etc.
```

### Bug Report
```markdown
## Bug: [Bug Title]

### Description
What's broken and how it manifests.

### Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

### Expected Behavior
What should happen.

### Actual Behavior
What actually happens.

### Screenshots
(if applicable)

### Environment
- Device: iPhone 14 Pro / Pixel 7
- OS: iOS 17 / Android 13
- App Version: 1.0.0

### Priority
P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)

### Labels
bug, mobile/backend, etc.
```

### Improvement
```markdown
## Improvement: [Title]

### Current State
How it works now.

### Proposed Change
How it should work.

### Why This Matters
User impact or technical benefit.

### Implementation Ideas
- Option 1: ...
- Option 2: ...

### Estimate
Small | Medium | Large

### Priority
P1 | P2 | P3

### Labels
improvement, performance, UX, etc.
```

---

## Initial Backlog

### MVP Features (Must Have)

#### Authentication & Onboarding
- [ ] #1 Build sign up screen (**P0**, Feature, Mobile)
- [ ] #2 Build sign in screen (**P0**, Feature, Mobile)
- [ ] #3 Implement Firebase Auth integration (**P0**, Feature, Mobile, Backend)
- [ ] #4 Build onboarding flow (goal setting) (**P1**, Feature, Mobile)
- [ ] #5 Calculate daily calorie target (**P0**, Feature, Backend)

#### Home Dashboard
- [ ] #6 Build home screen layout (**P0**, Feature, Mobile)
- [ ] #7 Implement progress ring component (**P1**, Feature, Mobile)
- [ ] #8 Build macro bars component (**P1**, Feature, Mobile)
- [ ] #9 Fetch and display daily summary (**P0**, Feature, Mobile, Backend)
- [ ] #10 Add meal card component (**P0**, Feature, Mobile)

#### Food Logging
- [ ] #11 Build camera screen (**P0**, Feature, Mobile)
- [ ] #12 Implement photo capture (**P0**, Feature, Mobile)
- [ ] #13 Upload photo to Supabase Storage (**P0**, Feature, Backend)
- [ ] #14 Integrate OpenAI Vision API (**P0**, Feature, Backend)
- [ ] #15 Build AI results screen (**P0**, Feature, Mobile)
- [ ] #16 Allow editing AI results (**P1**, Feature, Mobile)
- [ ] #17 Save meal to database (**P0**, Feature, Backend)

#### Manual Entry
- [ ] #18 Build food search screen (**P1**, Feature, Mobile)
- [ ] #19 Implement food database search (**P1**, Feature, Backend)
- [ ] #20 Build manual food entry form (**P1**, Feature, Mobile)
- [ ] #21 Calculate nutrition from 100g values (**P1**, Feature, Backend)

#### Progress Tracking
- [ ] #22 Build progress screen layout (**P2**, Feature, Mobile)
- [ ] #23 Implement calorie line chart (**P2**, Feature, Mobile)
- [ ] #24 Implement weight tracking chart (**P2**, Feature, Mobile)
- [ ] #25 Add weight entry form (**P2**, Feature, Mobile)
- [ ] #26 Calculate weekly averages (**P2**, Feature, Backend)

#### Profile & Settings
- [ ] #27 Build profile screen (**P1**, Feature, Mobile)
- [ ] #28 Implement edit profile (**P2**, Feature, Mobile)
- [ ] #29 Add settings (theme, units, notifications) (**P2**, Feature, Mobile)
- [ ] #30 Implement logout (**P1**, Feature, Mobile)

### Infrastructure & DevOps
- [ ] #31 Set up error tracking (Sentry) (**P1**, Infrastructure)
- [ ] #32 Set up analytics (Mixpanel) (**P2**, Infrastructure)
- [ ] #33 Deploy backend to Railway (**P1**, Infrastructure)
- [ ] #34 Set up CI/CD pipeline (**P2**, Infrastructure)
- [ ] #35 Configure environment variables (**P0**, Infrastructure)

### Testing & Quality
- [ ] #36 Write unit tests for API endpoints (**P2**, Testing, Backend)
- [ ] #37 Write component tests (**P3**, Testing, Mobile)
- [ ] #38 Test on real devices (iOS & Android) (**P1**, Testing)
- [ ] #39 Fix accessibility issues (**P2**, Accessibility)
- [ ] #40 Performance optimization (**P3**, Performance)

### Documentation
- [ ] #41 Write API documentation (**P2**, Documentation)
- [ ] #42 Create user guide (**P3**, Documentation)
- [ ] #43 Write deployment guide (**P2**, Documentation)

---

## Workflow

### Daily
1. **Morning:** Review board, pick 1-2 items for "Doing"
2. **During:** Focus on Doing items, update progress
3. **Evening:** Move completed items to Review/Done

### Weekly
1. **Monday:** Plan week, move items from Backlog to Ready
2. **Wednesday:** Mid-week review, adjust priorities
3. **Friday:** Wrap up, move Done items to archive

### Monthly
1. **Review progress:** What got done?
2. **Adjust roadmap:** What's next priority?
3. **Clean backlog:** Remove stale items
4. **Plan next month:** Set goals

---

## Prioritization Framework

### How to Prioritize

Use **RICE Score:**
- **R**each: How many users affected? (1-10)
- **I**mpact: How much impact? (1-3)
- **C**onfidence: How sure are you? (0.5-1.0)
- **E**ffort: How many hours? (1-100)

**Score = (R × I × C) / E**

Higher score = Higher priority

### Example
Feature: "Add photo filters"
- Reach: 8 (80% of users would use)
- Impact: 2 (medium improvement)
- Confidence: 0.8 (pretty sure it helps)
- Effort: 8 hours

Score = (8 × 2 × 0.8) / 8 = 1.6

Compare scores to prioritize.

### Quick Prioritization
If RICE is too complex, use this:

**P0 (Critical):** Blocking launch or major feature  
**P1 (High):** Core MVP functionality  
**P2 (Medium):** Important but not launch-blocking  
**P3 (Low):** Nice to have  
**P4 (Backlog):** Future consideration  

---

## Sprint Planning (Optional)

### 1-Week Sprint
**Monday:** Planning (1 hour)
- Review last week
- Select tasks for this week
- Break down large tasks
- Estimate effort

**Daily:** Standup (5 min with yourself!)
- What did I do yesterday?
- What will I do today?
- Any blockers?

**Friday:** Review (30 min)
- What got done?
- What didn't? Why?
- Lessons learned

### Sprint Goals
Week 1: Authentication working  
Week 2: Home dashboard with data  
Week 3: Photo logging working  
Week 4: Manual entry working  
Week 5: Progress charts  
Week 6: Polish and testing  

---

## Tracking Metrics

### Velocity
Track completed story points per week:
- Small task: 1 point
- Medium task: 3 points
- Large task: 8 points

Average over 3-4 weeks = your velocity

### Burn Down
Track remaining tasks:
- Total tasks at start: 50
- After week 1: 45 (5 done)
- After week 2: 38 (7 done)
- After week 3: 32 (6 done)

**Average:** 6 tasks/week  
**Remaining:** 32 tasks  
**Estimate:** ~5 weeks to complete

### Focus Time
Track actual coding time:
- Goal: 20-25 hours/week
- Track with timer
- Identify time wasters
- Optimize workflow

---

## Tools Setup

### GitHub Projects Setup

1. **Create Project**
   ```
   Go to: github.com/your-username/forma
   Click: Projects tab
   Click: New project
   Name: Forma Development
   Template: Board
   ```

2. **Configure Columns**
   ```
   Backlog → Ready → In Progress → Review → Done
   ```

3. **Add Labels**
   ```
   Settings → Labels → Add labels from list above
   ```

4. **Create Issues**
   ```
   Issues → New issue
   Use template above
   Add labels
   Add to project
   ```

5. **Connect to Code**
   ```
   In commit messages, reference issues:
   "Implement sign up screen (#1)"
   
   In PR descriptions:
   "Closes #1"
   ```

### Simple Markdown Approach

If you want to keep it simple, use the files in this repo:

```
docs/project/
├── BACKLOG.md        → All tasks (this file below)
├── CURRENT_SPRINT.md → This week's tasks
└── COMPLETED.md      → Done tasks (archive)
```

---

## Best Practices

### Do's ✅
- ✅ Keep Doing column small (1-2 items max)
- ✅ Write clear, specific tasks
- ✅ Break large tasks into smaller ones
- ✅ Update status regularly
- ✅ Celebrate completed tasks
- ✅ Review and adjust weekly

### Don'ts ❌
- ❌ Don't have 10 things in progress
- ❌ Don't leave tasks in Doing for weeks
- ❌ Don't create vague tasks ("fix stuff")
- ❌ Don't skip prioritization
- ❌ Don't ignore blockers
- ❌ Don't forget to take breaks!

---

## For Solo Developers

### Stay Motivated
- 🎯 Set small, achievable goals
- 📅 Work in focused blocks (Pomodoro)
- 🎉 Celebrate small wins
- 📊 Track progress visually
- 🔄 Review progress weekly
- 💪 Don't be too hard on yourself

### Avoid Burnout
- 🚫 Don't work 12 hour days
- ⏰ Set working hours (9am-6pm)
- 🌴 Take days off
- 🏃 Exercise regularly
- 😴 Get enough sleep
- 🎮 Have hobbies outside coding

### When Stuck
1. Take a break (walk, coffee)
2. Write down the problem
3. Search for solutions
4. Ask for help (forums, Discord)
5. Work on something else
6. Come back fresh tomorrow

---

## Resources

### Project Management
- GitHub Projects: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- Linear: https://linear.app/
- Notion: https://notion.so/

### Productivity
- Pomodoro Technique: 25 min work, 5 min break
- Time blocking: Schedule specific tasks
- Deep work: Eliminate distractions

### Tools
- Toggl Track: Time tracking
- Forest: Stay focused
- Notion: All-in-one workspace

---

**Next:** See `BACKLOG.md` for the complete task list

