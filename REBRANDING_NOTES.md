# Rebranding: BodyApp → Forma

## Brand Identity

**New Name:** Forma  
**Tagline:** "Forma creates long-term results"  
**Positioning:** AI-powered calorie tracking focused on sustainable, long-term health outcomes

---

## Changes Made

### 1. Documentation Updates
- ✅ `README.md` - Updated project name and descriptions
- ✅ `FEATURES.md` - Updated product vision and branding
- ✅ `TECH_STACK.md` - Updated all references
- ✅ `SETUP_GUIDE.md` - Updated paths and commands
- ✅ `DAY_1_SUMMARY.md` - Added project name

### 2. Mobile App Configuration
- ✅ `mobile/app.json` - Changed app name to "Forma", slug to "forma"
- ✅ `mobile/package.json` - Renamed to "forma-mobile"

### 3. Backend Configuration
- ✅ `backend/package.json` - Renamed to "forma-backend"
- ✅ `backend/src/server.ts` - Updated API service name and console logs

### 4. Wireframes
- ✅ `docs/wireframes/00-INDEX.md` - Updated title
- ✅ `docs/wireframes/01-ONBOARDING.md` - Changed app logo text to "Forma"
- ✅ `docs/wireframes/02-HOME-DASHBOARD.md` - Updated header to show "Forma"

---

## Onboarding Questions Updated

Based on user feedback, added new questions to onboarding:

**Added:**
- "Where did you hear about us?" - Marketing attribution
- "Have you tried other calorie tracking apps?" - User experience context
- "Forma creates long-term results" - Brand messaging

**Removed:**
- Gender (simplified)
- Activity level (can be calculated differently)

---

## Brand Rationale

### Why "Forma"?

1. **Meaning:** Latin for "shape" or "form" - relates to body transformation
2. **Short & Memorable:** Easy to say, spell, and remember
3. **International:** Works across languages
4. **Available:** Likely available as domain and social handles
5. **Professional:** Sounds premium and trustworthy

### Tagline: "Forma creates long-term results"

- Emphasizes sustainability over quick fixes
- Positions against fad diets
- Appeals to serious users
- Differentiates from competitors

---

## Next Steps for Branding

### Design Assets Needed
- [ ] App icon/logo design
- [ ] Color palette finalization
- [ ] Typography selection
- [ ] Brand guidelines document

### Marketing Materials
- [ ] Landing page copy
- [ ] App store descriptions
- [ ] Social media profiles
- [ ] Press kit

### Domain & Social
- [ ] Check domain availability (forma.app, getforma.com, etc.)
- [ ] Register social media handles (@forma, @formaapp)
- [x] Set up brand email (tryformaapp@gmail.com)

---

## File Paths Still Using "bodyapp"

**Note:** The workspace directory is still `/Users/rayzhao/workspace/bodyapp/`

This is intentional and doesn't need to change. The internal project name in code and documentation is now "Forma", but the local directory name doesn't affect the app.

If you want to rename the directory:
```bash
cd /Users/rayzhao/workspace
mv bodyapp forma
cd forma
```

Then update git remote if needed.

---

## Commit History

1. **Initial Setup** - "BodyApp" branding
2. **Rebranding** - Changed to "Forma" throughout

All changes committed in: `9a1fb7d - Rebrand project from BodyApp to Forma`

---

**Updated:** November 11, 2025  
**Status:** ✅ Complete

