# Forma Product Backlog

**Last Updated:** November 12, 2025  
**Total Tasks:** 75+  
**Status:** Active Development

---

## 🚀 Current Sprint (Week 1)

### In Progress 🏗️
- None yet - Starting fresh!

### Ready to Start 💪
1. [ ] Set up theme constants in mobile app (**P0**, Mobile, 2h)
2. [ ] Create reusable Button component (**P0**, Mobile, 1h)
3. [ ] Create reusable Input component (**P0**, Mobile, 1h)
4. [ ] Build sign up screen UI (**P0**, Mobile, 3h)

---

## 📋 Backlog by Epic

### Epic 1: Authentication 🔐

#### Critical (P0)
- [ ] #1 Implement Firebase Auth in mobile app (**4h**)
- [ ] #2 Build sign up screen with validation (**4h**)
- [ ] #3 Build sign in screen (**3h**)
- [ ] #4 Connect auth to backend API (**3h**)
- [ ] #5 Handle auth errors gracefully (**2h**)
- [ ] #6 Persist auth state with AsyncStorage (**2h**)

#### High (P1)
- [ ] #7 Add Google OAuth button (**3h**)
- [ ] #8 Add Apple OAuth button (iOS only) (**3h**)
- [ ] #9 Build forgot password screen (**2h**)
- [ ] #10 Add email verification (**2h**)
- [ ] #11 Auto-logout on token expiration (**2h**)

#### Medium (P2)
- [ ] #12 Add loading states to auth screens (**1h**)
- [ ] #13 Add auth error toast notifications (**2h**)
- [ ] #14 Implement biometric auth (Touch ID/Face ID) (**4h**)

**Total:** 32 hours

---

### Epic 2: Onboarding Flow 🎯

#### Critical (P0)
- [ ] #15 Build welcome screen (already done ✅) (**0h**)
- [ ] #16 Build goal setting screen (**4h**)
- [ ] #17 Build physical info form (**4h**)
- [ ] #18 Build goal calculation screen (**3h**)
- [ ] #19 Submit onboarding data to backend (**2h**)
- [ ] #20 Save user profile to Supabase (**2h**)

#### High (P1)
- [ ] #21 Add progress indicator to onboarding (**1h**)
- [ ] #22 Add back button navigation (**1h**)
- [ ] #23 Add skip button (with warning) (**2h**)
- [ ] #24 Add form validation (**3h**)
- [ ] #25 Show calorie target visualization (**2h**)

#### Medium (P2)
- [ ] #26 Add onboarding animations (**3h**)
- [ ] #27 Add referral source tracking (**1h**)
- [ ] #28 A/B test onboarding flow (**4h**)

**Total:** 32 hours

---

### Epic 3: Home Dashboard 🏠

#### Critical (P0)
- [ ] #29 Build home screen layout (**3h**)
- [ ] #30 Implement progress ring component (**4h**)
- [ ] #31 Fetch daily summary from API (**2h**)
- [ ] #32 Display calorie progress (**2h**)
- [ ] #33 Build meal list component (**3h**)
- [ ] #34 Add "Add Meal" button (**1h**)

#### High (P1)
- [ ] #35 Implement macro progress bars (**3h**)
- [ ] #36 Add pull-to-refresh (**2h**)
- [ ] #37 Add date selector (**3h**)
- [ ] #38 Show empty state (no meals) (**2h**)
- [ ] #39 Add loading skeleton (**2h**)
- [ ] #40 Implement meal card tap to edit (**2h**)

#### Medium (P2)
- [ ] #41 Add celebration animation (goal reached) (**3h**)
- [ ] #42 Add warning animation (over goal) (**2h**)
- [ ] #43 Add streak counter (**2h**)
- [ ] #44 Add motivational messages (**2h**)
- [ ] #45 Smooth scroll to today (**1h**)

**Total:** 39 hours

---

### Epic 4: Camera & Photo Logging 📸

#### Critical (P0)
- [ ] #46 Request camera permissions (**2h**)
- [ ] #47 Build camera screen UI (**4h**)
- [ ] #48 Implement photo capture (**3h**)
- [ ] #49 Compress and resize image (**2h**)
- [ ] #50 Upload to Supabase Storage (**3h**)
- [ ] #51 Create backend photo analysis endpoint (**4h**)
- [ ] #52 Integrate OpenAI Vision API (**4h**)
- [ ] #53 Build AI results screen (**4h**)
- [ ] #54 Display recognized foods (**3h**)
- [ ] #55 Save analyzed meal to database (**3h**)

#### High (P1)
- [ ] #56 Implement photo picker from gallery (**2h**)
- [ ] #57 Add loading animation during analysis (**2h**)
- [ ] #58 Allow editing AI results (**4h**)
- [ ] #59 Handle AI errors gracefully (**2h**)
- [ ] #60 Show confidence scores (**2h**)
- [ ] #61 Add retake photo option (**1h**)

#### Medium (P2)
- [ ] #62 Add flash toggle (**1h**)
- [ ] #63 Add zoom controls (**2h**)
- [ ] #64 Add grid overlay (**1h**)
- [ ] #65 Cache AI responses (**3h**)
- [ ] #66 Batch photo uploads (**3h**)

**Total:** 51 hours

---

### Epic 5: Manual Food Entry 🔍

#### High (P1)
- [ ] #67 Build food search screen (**4h**)
- [ ] #68 Implement search API integration (**3h**)
- [ ] #69 Display search results (**3h**)
- [ ] #70 Build food detail modal (**3h**)
- [ ] #71 Add serving size selector (**3h**)
- [ ] #72 Add quantity adjuster (**2h**)
- [ ] #73 Add food to meal (**2h**)

#### Medium (P2)
- [ ] #74 Add recent foods list (**3h**)
- [ ] #75 Add favorite foods (**4h**)
- [ ] #76 Implement barcode scanner (**6h**)
- [ ] #77 Build custom food creator (**4h**)
- [ ] #78 Add food categories filter (**2h**)

**Total:** 39 hours

---

### Epic 6: Progress & Analytics 📊

#### High (P1)
- [ ] #79 Build progress screen layout (**3h**)
- [ ] #80 Implement calorie line chart (**4h**)
- [ ] #81 Fetch weekly summary from API (**2h**)
- [ ] #82 Display weekly averages (**2h**)

#### Medium (P2)
- [ ] #83 Implement weight tracking chart (**4h**)
- [ ] #84 Build weight entry form (**3h**)
- [ ] #85 Add macro breakdown chart (**4h**)
- [ ] #86 Show monthly trends (**3h**)
- [ ] #87 Add goal progress visualization (**3h**)
- [ ] #88 Calculate and show streak (**2h**)

#### Low (P3)
- [ ] #89 Add export data feature (**4h**)
- [ ] #90 Generate PDF reports (**6h**)
- [ ] #91 Add achievement badges (**4h**)

**Total:** 44 hours

---

### Epic 7: Profile & Settings ⚙️

#### High (P1)
- [ ] #92 Build profile screen layout (**3h**)
- [ ] #93 Display user info (**2h**)
- [ ] #94 Implement logout (**1h**)
- [ ] #95 Build edit profile screen (**3h**)
- [ ] #96 Update profile API integration (**2h**)

#### Medium (P2)
- [ ] #97 Add avatar upload (**3h**)
- [ ] #98 Build settings screen (**3h**)
- [ ] #99 Implement theme switcher (light/dark) (**4h**)
- [ ] #100 Add units switcher (metric/imperial) (**3h**)
- [ ] #101 Add notification settings (**3h**)
- [ ] #102 Build help & support screen (**2h**)
- [ ] #103 Add privacy policy screen (**1h**)
- [ ] #104 Add terms of service screen (**1h**)

#### Low (P3)
- [ ] #105 Add account deletion (**3h**)
- [ ] #106 Add data export (**3h**)

**Total:** 37 hours

---

### Epic 8: Subscription & Monetization 💰

#### High (P1)
- [ ] #107 Display subscription status (**2h**)
- [ ] #108 Show free tier limits (5 scans/day) (**2h**)
- [ ] #109 Build upgrade screen (**4h**)
- [ ] #110 List subscription plans (**2h**)

#### Medium (P2)
- [ ] #111 Integrate RevenueCat SDK (**6h**)
- [ ] #112 Implement purchase flow (**6h**)
- [ ] #113 Handle subscription status (**3h**)
- [ ] #114 Add free trial (7 days) (**3h**)
- [ ] #115 Build paywall screen (**4h**)
- [ ] #116 Track conversion metrics (**2h**)

**Total:** 34 hours

---

### Epic 9: Backend API 🖥️

#### Critical (P0)
- [ ] #117 Create user endpoints (GET, POST, PUT) (**4h**)
- [ ] #118 Create meal endpoints (CRUD) (**6h**)
- [ ] #119 Create food search endpoint (**3h**)
- [ ] #120 Implement auth middleware (**2h**)

#### High (P1)
- [ ] #121 Add input validation (**3h**)
- [ ] #122 Add error handling (**3h**)
- [ ] #123 Implement daily summary endpoint (**3h**)
- [ ] #124 Implement weekly summary endpoint (**3h**)
- [ ] #125 Add photo upload endpoint (**3h**)
- [ ] #126 Integrate OpenAI Vision API (**4h**)

#### Medium (P2)
- [ ] #127 Add request logging (**2h**)
- [ ] #128 Add rate limiting (**3h**)
- [ ] #129 Implement caching (Redis) (**6h**)
- [ ] #130 Add API documentation (Swagger) (**4h**)

**Total:** 49 hours

---

### Epic 10: Database & Data 🗄️

#### Critical (P0)
- [ ] #131 Run Supabase migration (**0.5h**)
- [ ] #132 Verify all tables created (**0.5h**)
- [ ] #133 Test RLS policies (**1h**)

#### High (P1)
- [ ] #134 Add more seed foods (100+ common foods) (**4h**)
- [ ] #135 Integrate USDA API for food lookup (**6h**)
- [ ] #136 Implement food search optimization (**3h**)

#### Medium (P2)
- [ ] #137 Set up database backups (**2h**)
- [ ] #138 Add database monitoring (**2h**)
- [ ] #139 Optimize slow queries (**4h**)

**Total:** 23 hours

---

### Epic 11: Testing & Quality 🧪

#### High (P1)
- [ ] #140 Write user controller tests (**4h**)
- [ ] #141 Write meal controller tests (**4h**)
- [ ] #142 Write auth middleware tests (**3h**)
- [ ] #143 Test on real iOS device (**2h**)
- [ ] #144 Test on real Android device (**2h**)

#### Medium (P2)
- [ ] #145 Write component tests (**8h**)
- [ ] #146 Add E2E tests (Detox) (**12h**)
- [ ] #147 Set up test coverage reporting (**2h**)
- [ ] #148 Fix accessibility issues (**4h**)
- [ ] #149 Performance audit (**3h**)

#### Low (P3)
- [ ] #150 Add linting rules (**2h**)
- [ ] #151 Add pre-commit hooks (**1h**)
- [ ] #152 Set up continuous testing (**3h**)

**Total:** 50 hours

---

### Epic 12: DevOps & Deployment 🚀

#### Critical (P0)
- [ ] #153 Set up Railway.app account (**0.5h**)
- [ ] #154 Deploy backend to Railway (**2h**)
- [ ] #155 Configure production environment variables (**1h**)

#### High (P1)
- [ ] #156 Set up CI/CD with GitHub Actions (**4h**)
- [ ] #157 Configure Expo EAS for mobile builds (**3h**)
- [ ] #158 Build iOS app (TestFlight) (**2h**)
- [ ] #159 Build Android app (internal testing) (**2h**)

#### Medium (P2)
- [ ] #160 Set up error tracking (Sentry) (**3h**)
- [ ] #161 Set up analytics (Mixpanel) (**3h**)
- [ ] #162 Configure app monitoring (**2h**)
- [ ] #163 Set up logging (CloudWatch/Datadog) (**3h**)

**Total:** 25.5 hours

---

### Epic 13: Polish & UX 💎

#### Medium (P2)
- [ ] #164 Add loading skeletons (**4h**)
- [ ] #165 Add smooth transitions (**3h**)
- [ ] #166 Add haptic feedback (**2h**)
- [ ] #167 Add pull-to-refresh everywhere (**3h**)
- [ ] #168 Polish animations (60fps) (**4h**)
- [ ] #169 Add empty states for all screens (**4h**)
- [ ] #170 Add error states for all screens (**4h**)

#### Low (P3)
- [ ] #171 Add micro-interactions (**4h**)
- [ ] #172 Add celebration confetti (**2h**)
- [ ] #173 Add sound effects (optional) (**2h**)
- [ ] #174 Add app icon and splash screen (**2h**)
- [ ] #175 Add onboarding tooltips (**3h**)

**Total:** 37 hours

---

### Epic 14: Advanced Features 🌟

#### Medium (P2)
- [ ] #176 Implement barcode scanner (**6h**)
- [ ] #177 Add meal templates/favorites (**6h**)
- [ ] #178 Add copy meal to another day (**2h**)
- [ ] #179 Add meal notes (**2h**)
- [ ] #180 Add food diary export (CSV) (**4h**)

#### Low (P3)
- [ ] #181 Add recipe builder (**12h**)
- [ ] #182 Add meal planning (**12h**)
- [ ] #183 Add water intake tracking (**4h**)
- [ ] #184 Add exercise logging (**6h**)
- [ ] #185 Integrate Apple Health (**8h**)
- [ ] #186 Integrate Google Fit (**8h**)
- [ ] #187 Add social sharing (**6h**)

**Total:** 76 hours

---

### Epic 15: Documentation 📝

#### High (P1)
- [ ] #188 Write API documentation (**4h**)
- [ ] #189 Create deployment guide (**2h**)
- [ ] #190 Write user guide (**3h**)

#### Medium (P2)
- [ ] #191 Create video demo (**3h**)
- [ ] #192 Write contributing guide (**2h**)
- [ ] #193 Create code comments (**4h**)

#### Low (P3)
- [ ] #194 Create technical architecture doc (**4h**)
- [ ] #195 Write API changelog (**1h**)

**Total:** 23 hours

---

## 🐛 Known Bugs

### High Priority
- None yet (no bugs in infrastructure!)

### Medium Priority
- None yet

### Low Priority
- None yet

---

## 💡 Improvements / Tech Debt

### Performance
- [ ] #196 Optimize image loading (**3h**)
- [ ] #197 Implement image caching (**4h**)
- [ ] #198 Optimize API response time (**4h**)
- [ ] #199 Reduce app bundle size (**3h**)

### Code Quality
- [ ] #200 Add TypeScript strict mode (**2h**)
- [ ] #201 Fix ESLint warnings (**2h**)
- [ ] #202 Add JSDoc comments (**4h**)
- [ ] #203 Refactor duplicate code (**3h**)

### Developer Experience
- [ ] #204 Add VS Code snippets (**1h**)
- [ ] #205 Create component storybook (**6h**)
- [ ] #206 Add debug menu (**2h**)
- [ ] #207 Improve error messages (**2h**)

**Total:** 36 hours

---

## 📊 Summary Statistics

### By Priority
```
P0 (Critical):    20 tasks  |  78 hours
P1 (High):        35 tasks  |  145 hours
P2 (Medium):      28 tasks  |  112 hours
P3 (Low):         17 tasks  |  98 hours
──────────────────────────────────────────
Total:           100 tasks  |  433 hours
```

### By Epic
```
Authentication:        14 tasks  |  32 hours
Onboarding:           14 tasks  |  32 hours
Home Dashboard:       17 tasks  |  39 hours
Camera & Photo:       21 tasks  |  51 hours
Manual Entry:         12 tasks  |  39 hours
Progress:             13 tasks  |  44 hours
Profile:              15 tasks  |  37 hours
Subscription:         10 tasks  |  34 hours
Backend API:          14 tasks  |  49 hours
Database:              9 tasks  |  23 hours
Testing:              13 tasks  |  50 hours
DevOps:               11 tasks  |  25.5 hours
Polish:               12 tasks  |  37 hours
Advanced:             12 tasks  |  76 hours
Documentation:         9 tasks  |  23 hours
──────────────────────────────────────────────────
Total:               176 tasks  |  591.5 hours
```

### MVP Only (P0 + P1)
```
Critical + High:   55 tasks  |  223 hours
Estimated weeks:   ~6-8 weeks (25-30 hours/week)
```

---

## 🎯 Milestones

### Milestone 1: Authentication Working
**Target:** End of Week 2  
**Tasks:** #1-6, #15-20  
**Hours:** ~30 hours  
**Definition of Done:**
- User can sign up
- User can sign in
- User can complete onboarding
- User profile saved to database

### Milestone 2: Basic Logging Working
**Target:** End of Week 4  
**Tasks:** #29-34, #46-55  
**Hours:** ~45 hours  
**Definition of Done:**
- User can take photo
- AI analyzes photo
- User can save meal
- Dashboard shows meals

### Milestone 3: Complete Food Logging
**Target:** End of Week 6  
**Tasks:** #35-44, #56-66, #67-75  
**Hours:** ~65 hours  
**Definition of Done:**
- Photo logging polished
- Manual entry works
- Search works well
- Dashboard complete

### Milestone 4: MVP Complete
**Target:** End of Week 8  
**Tasks:** Remaining P0 and P1  
**Hours:** ~80 hours  
**Definition of Done:**
- All core features working
- Tested on real devices
- No critical bugs
- Ready for beta

### Milestone 5: Launch Ready
**Target:** End of Week 12  
**Tasks:** All MVP + Polish  
**Hours:** All P0, P1, critical P2  
**Definition of Done:**
- App Store assets ready
- Privacy policy done
- Terms of service done
- Beta testing complete
- Ready to submit

---

## 🚦 Status Legend

```
⬜ Not Started     | In backlog
🟦 Ready           | Can be picked up
🟨 In Progress     | Currently working on
🟧 Blocked         | Waiting on something
🟩 Review          | Code complete, testing
✅ Done            | Verified and shipped
❌ Cancelled       | Won't do
```

---

## 📝 How to Use This Backlog

### Adding New Tasks
1. Add to appropriate Epic
2. Assign priority (P0-P3)
3. Estimate hours
4. Add labels
5. Add to GitHub Issues (if using)

### Starting a Task
1. Move from Backlog to Ready (or In Progress)
2. Create branch: `feature/task-name` or `fix/bug-name`
3. Work on it
4. Test it
5. Move to Review

### Completing a Task
1. Mark as Done ✅
2. Add actual time spent
3. Note any learnings
4. Archive after 2 weeks

### Weekly Review
1. Review what got done
2. Adjust priorities
3. Move tasks between columns
4. Add new tasks discovered
5. Remove stale tasks

---

## 🎓 Tips for Solo Developers

### Planning
- Plan weekly, not daily
- Leave buffer time (20-30%)
- Don't overcommit
- Be realistic with estimates

### Execution
- Work on 1-2 tasks at a time
- Finish before starting new
- Test as you go
- Commit frequently

### Tracking
- Update board daily (5 min)
- Review weekly (30 min)
- Adjust as needed
- Don't be rigid

### Staying Motivated
- Small wins daily
- Visible progress
- Take breaks
- Celebrate milestones

---

**Next:** Move tasks to GitHub Projects or track in this file

