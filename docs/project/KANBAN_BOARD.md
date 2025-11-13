# Forma Kanban Board

**Visual task tracking**  
**Last Updated:** November 12, 2025

---

## 📋 Current Board State

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│    BACKLOG      │     READY       │   IN PROGRESS   │     REVIEW      │      DONE       │
│      (10)       │      (6)        │       (0)       │       (0)       │       (0)       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │                 │
│ • Build recipe  │ • Setup theme   │                 │                 │  ✅ Day 1      │
│   builder       │   constants     │   [Empty]       │   [Empty]       │  Planning      │
│   [P3, 12h]     │   [P0, 2h]      │                 │                 │                 │
│                 │                 │   Focus on      │                 │  ✅ Day 3      │
│ • Add social    │ • Create Button │   1-2 items     │                 │  Database      │
│   features      │   component     │   at a time!    │                 │                 │
│   [P3, 8h]      │   [P0, 2h]      │                 │                 │  ✅ Day 4      │
│                 │                 │                 │                 │  AI Research   │
│ • Water         │ • Create Input  │                 │                 │                 │
│   tracking      │   component     │                 │                 │  ✅ Day 5      │
│   [P3, 4h]      │   [P0, 2h]      │                 │                 │  Infra Setup   │
│                 │                 │                 │                 │                 │
│ • Exercise      │ • Install       │                 │                 │  ✅ Day 6      │
│   logging       │   Firebase SDK  │                 │                 │  UI Mockups    │
│   [P3, 6h]      │   [P0, 1h]      │                 │                 │                 │
│                 │                 │                 │                 │                 │
│ • Recipe import │ • Configure     │                 │                 │                 │
│   [P3, 8h]      │   Firebase      │                 │                 │                 │
│                 │   [P0, 2h]      │                 │                 │                 │
│ • Meal planning │                 │                 │                 │                 │
│   [P3, 12h]     │ • Build Sign Up │                 │                 │                 │
│                 │   screen        │                 │                 │                 │
│ • Apple Health  │   [P0, 4h]      │                 │                 │                 │
│   sync [P3,8h]  │                 │                 │                 │                 │
│                 │                 │                 │                 │                 │
│ • Google Fit    │                 │                 │                 │                 │
│   sync [P3,8h]  │                 │                 │                 │                 │
│                 │                 │                 │                 │                 │
│ • Meal photos   │                 │                 │                 │                 │
│   gallery       │                 │                 │                 │                 │
│   [P2, 4h]      │                 │                 │                 │                 │
│                 │                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

## 🏃 How to Use This Board

### Moving Tasks

**Backlog → Ready**
- Task is well-defined
- Requirements are clear
- No blockers
- Can be started immediately

**Ready → In Progress**
- You're actively working on it
- **Limit: 1-2 tasks max!**
- Has a branch (if code)

**In Progress → Review**
- Code is complete
- Self-tested locally
- Ready for QA
- PR created (if applicable)

**Review → Done**
- Tested thoroughly
- No bugs found
- Merged to main
- Deployed (if backend)

**Review → In Progress** (if bugs found)
- Issues discovered
- Needs fixes
- Re-test after fixing

---

## 📊 WIP (Work In Progress) Limits

### Rules
- **Backlog:** Unlimited (ideas are free!)
- **Ready:** Maximum 10 tasks (next 2 weeks of work)
- **In Progress:** Maximum 2 tasks (stay focused!)
- **Review:** Maximum 5 tasks (test regularly)
- **Done:** Archive after 2 weeks

### Why Limits?
- ✅ Forces focus on completion
- ✅ Prevents context switching
- ✅ Reduces work in progress
- ✅ Speeds up delivery
- ✅ Reduces stress

---

## 🎨 Visual Indicators

### By Priority
```
🔴 P0 - Critical       Red cards
🟠 P1 - High           Orange cards
🟡 P2 - Medium         Yellow cards
🟢 P3 - Low            Green cards
```

### By Type
```
✨ Feature             Star icon
🐛 Bug                 Bug icon
🔧 Improvement         Wrench icon
📝 Documentation       Document icon
```

### By Size
```
S  - Small (< 4h)      Thin border
M  - Medium (4-8h)     Normal border
L  - Large (> 8h)      Thick border
XL - Huge (> 16h)      Break into smaller tasks!
```

---

## 📈 Progress Tracking

### Weekly Velocity

**Week 1:** (target)
- Tasks started: 6
- Tasks completed: 5
- Hours: 25
- Velocity: 5 tasks/week

Update each week to track your average velocity.

### Burndown

**Start:** 176 tasks, 591.5 hours  
**Week 1:** ??? tasks, ??? hours  
**Week 2:** ??? tasks, ??? hours  
**...continue tracking...**

**Projected completion:** 
If velocity = 5 tasks/week  
176 tasks / 5 = ~35 weeks  

Adjust expectations based on actual velocity!

---

## 🎯 Quick Actions

### Daily (5 min)
```
Morning:
1. Review board
2. Pick today's task(s)
3. Move to In Progress

Evening:
1. Update task status
2. Move completed to Review/Done
3. Note any blockers
```

### Weekly (30 min)
```
Friday or Monday:
1. Review last week
2. Calculate velocity
3. Move Ready tasks from Backlog
4. Prioritize Ready column
5. Plan next week's focus
```

### Monthly (1 hour)
```
First of month:
1. Review last month's progress
2. Update roadmap
3. Adjust priorities
4. Clean up backlog (remove stale items)
5. Plan next month
```

---

## 🚀 Getting Started

### This Week (Choose Your Approach)

**Option A: Use GitHub Projects** (Recommended)
1. Go to your repo on GitHub
2. Create new project
3. Add issues from BACKLOG.md
4. Use Kanban board view
5. Update as you work

**Option B: Use This File**
1. Copy BACKLOG.md
2. Move tasks between sections below
3. Update daily
4. Commit changes to git

**Option C: Use External Tool**
1. Sign up for Linear or Notion
2. Import tasks from BACKLOG.md
3. Customize workflow
4. Sync with git

---

## 📊 Current Sprint Board (Markdown)

### 🟦 Ready (6 tasks)
- [ ] Set up theme constants (**2h**, P0, Mobile)
- [ ] Create Button component (**2h**, P0, Mobile)
- [ ] Create Input component (**2h**, P0, Mobile)
- [ ] Install Firebase SDK (**1h**, P0, Mobile)
- [ ] Configure Firebase (**2h**, P0, Mobile)
- [ ] Build Sign Up screen UI (**4h**, P0, Mobile)

### 🟨 In Progress (0 tasks)
*Start here!*

### 🟩 Review (0 tasks)
*Move tasks here when code complete*

### ✅ Done This Sprint (0 tasks)
*Completed tasks go here*

---

## 🎯 Definition of Done

A task is "Done" when:
- [x] Code is written and working
- [x] Tested on iOS and Android
- [x] No console errors or warnings
- [x] Code is committed to git
- [x] Documentation updated (if needed)
- [x] Task moved to Done column

---

## 📝 Sprint Notes

### Decisions Made
*Add decisions here as you make them*

### Blockers Encountered
*Note any blockers and how you resolved them*

### Lessons Learned
*What went well? What could be better?*

---

## 🔄 Next Sprint Preview

**Sprint 2 (Week 2):** Backend API development  
**Focus:** Get API endpoints working with database  
**Estimated:** 25-30 hours

**Planned Tasks:**
- Create user controller
- Create meal controller
- Create food search endpoint
- Test API with Postman
- Connect mobile to API

---

**Sprint Start:** November 13, 2025  
**Sprint End:** November 19, 2025  
**Last Updated:** November 12, 2025

