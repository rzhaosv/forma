// Backend for the Ascension app (AI self-improvement coach for young men).
//
// Modeled on api/identify.js: the Gemini key stays server-side, requests are
// gated by a static app header (casual-abuse deterrent) and rate-limited by
// client IP through Firestore (fails open if the counter is unavailable).
//
// Request (POST, JSON):
//   mode "scan":  { mode:"scan", front:"<base64>", side?:"<base64>", mime, profile:{ageBand,goals,notes?}, baseline?:{categories:[{key,score}],overall} }
//   mode "coach": { mode:"coach", messages:[{role:"user"|"assistant",content}], context }
// Header:  x-ascension-app: asc_v1_7d2k1
// Env:     GEMINI_API_KEY (fallback GOOGLE_AI_API_KEY)
//          FIREBASE_SERVICE_ACCOUNT (optional; enables IP rate cap)
//
// Scan responses are normalised server-side into a fixed shape (see
// normalizeScan) so the app can render them without defensive parsing.
// When isFace is false the shape is still returned, with empty arrays.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const APP_TOKEN = 'asc_v1_7d2k1';
const HOURLY_IP_CAP = 30;
const USAGE_COLLECTION = 'ascensionUsage';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // per image; app should JPEG-compress before upload

if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
    } else {
      initializeApp({ projectId: 'forma-3803d' });
    }
  } catch (e) {
    console.error('firebase init failed:', e);
  }
}

// ---------------------------------------------------------------------------
// Fixed vocabulary
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { key: 'skin', label: 'Skin' },
  { key: 'hair', label: 'Hair' },
  { key: 'jawline', label: 'Jawline & leanness' },
  { key: 'eyes', label: 'Eye area & brows' },
  { key: 'grooming', label: 'Grooming' },
  { key: 'style', label: 'Style & presentation' },
  { key: 'physique', label: 'Physique & posture' },
];
// Weights used to sanity-check the model's "overall" against its own category scores.
const CATEGORY_WEIGHTS = { skin: 0.2, hair: 0.15, jawline: 0.2, eyes: 0.1, grooming: 0.1, style: 0.1, physique: 0.15 };
const TIERS = ['Below average', 'Average', 'Above average', 'Top 20%', 'Top 10%', 'Top 5%'];
const AGE_BANDS = ['16-19', '20-24', '25-29', '30-39', '40+'];
const HABIT_CATEGORIES = ['skin', 'hair', 'jawline', 'eyes', 'grooming', 'style', 'physique', 'sleep', 'mind'];
const CADENCES = ['daily', 'weekly'];
const TIMES = ['am', 'pm', 'any'];

// Universally safe fallbacks used only to pad a short model response.
const DEFAULT_HABITS = [
  { id: 'sleep-7-9-hours', title: 'Sleep 7–9 hours', category: 'sleep', cadence: 'daily', time: 'pm', detail: 'Same bedtime every night, phone out of reach. Sleep is the cheapest skin, eye and body-composition upgrade there is.' },
  { id: 'morning-spf', title: 'Sunscreen every morning', category: 'skin', cadence: 'daily', time: 'am', detail: 'Broad-spectrum SPF 30+ on face and neck after moisturiser, even on cloudy days.' },
  { id: 'pm-cleanse-moisturise', title: 'Cleanse + moisturise at night', category: 'skin', cadence: 'daily', time: 'pm', detail: 'Gentle cleanser, pat dry, fragrance-free moisturiser. Two minutes, no skipping.' },
  { id: 'drink-3l-water', title: 'Drink ~3 L of water', category: 'physique', cadence: 'daily', time: 'any', detail: 'Carry a bottle. Hydration shows in skin and reduces facial puffiness.' },
  { id: 'lift-3x-week', title: 'Strength train 3× a week', category: 'physique', cadence: 'weekly', time: 'any', detail: 'Full-body sessions built on squat, hinge, push, pull. Log the weights and add a little each week.' },
  { id: 'posture-reset', title: 'Posture reset', category: 'physique', cadence: 'daily', time: 'any', detail: 'Three times a day: chin back, shoulders down, ribs stacked over hips. Hold for 30 seconds.' },
  { id: 'daily-walk-8k', title: 'Walk 8,000+ steps', category: 'jawline', cadence: 'daily', time: 'any', detail: 'Low-effort calorie burn that makes leaning out sustainable without crash dieting.' },
  { id: 'brush-floss-pm', title: 'Brush 2 min + floss', category: 'grooming', cadence: 'daily', time: 'pm', detail: 'Electric brush if possible, floss before brushing, tongue scrape. A clean smile reads instantly.' },
  { id: 'weekly-grooming-block', title: 'Weekly grooming block', category: 'grooming', cadence: 'weekly', time: 'any', detail: 'Trim nose/ear hair, tidy brows along the natural line, clean up neckline and nails. 15 minutes on Sunday.' },
  { id: 'protein-target', title: 'Hit your protein target', category: 'physique', cadence: 'daily', time: 'any', detail: 'Roughly 1.6–2.2 g per kg of bodyweight spread across meals. Makes fat loss and muscle gain both easier.' },
  { id: 'phone-off-30-before-bed', title: 'Screens off 30 min before bed', category: 'mind', cadence: 'daily', time: 'pm', detail: 'Read, stretch, or plan tomorrow instead. Better sleep, calmer mornings.' },
  { id: 'one-social-rep', title: 'One social rep', category: 'mind', cadence: 'daily', time: 'any', detail: 'Do today’s step on the social ladder once. Reps beat theory.' },
];

const DEFAULT_SOCIAL = [
  { level: 1, title: 'Eye contact + nod', detail: 'Make brief eye contact with three strangers today and give a small nod or smile. Hold the gaze one beat longer than feels natural.' },
  { level: 2, title: 'Say hello', detail: 'Greet three people out loud: cashier, neighbour, gym staff. Clear voice, chin up.' },
  { level: 3, title: 'Ask a real question', detail: 'Ask someone a question that isn’t transactional — “how’s your day going?” — and actually listen to the answer.' },
  { level: 4, title: 'Give a specific compliment', detail: 'Compliment something a person chose (shoes, playlist, work), not something they were born with. Move on without lingering.' },
  { level: 5, title: 'Small talk for 60 seconds', detail: 'Turn a greeting into a minute-long exchange. Two follow-up questions, then exit cleanly: “good talking to you.”' },
  { level: 6, title: 'Join a group conversation', detail: 'At the gym, a class, or work, add one comment to a conversation already happening. Stay for a few exchanges.' },
  { level: 7, title: 'Start and hold a 2-minute conversation with a stranger', detail: 'Open with an observation about the shared situation, ask two open questions, share something about yourself, and end it on your terms.' },
];

const DEFAULT_WEEKLY_FOCUS = [
  'Lock in the non-negotiables: sleep, water, AM/PM skincare.',
  'Fix what people see first: hair, brows, facial hair lines.',
  'Build the body base: three lifts, daily steps, protein.',
  'Show up: social ladder reps and one style upgrade.',
];

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const SAFETY_RULES = `SAFETY AND TONE RULES (non-negotiable):
- ONLY recommend low-risk, reversible actions: skincare, hair and beard care, brow grooming, dental hygiene, body-fat reduction and muscle gain through normal training and nutrition, posture, sleep, hydration, clothing fit and style, social skills and confidence practice.
- NEVER recommend or mention surgery, cosmetic procedures, fillers, implants, "bonesmashing", "mewing" as a bone-changing technique, jaw or chin implants, steroids, SARMs, hormones, prescription drugs, extreme dieting, fasting beyond normal healthy eating, or any medical procedure. If the user asks, decline briefly and redirect to what works.
- NEVER mention or infer race, ethnicity, or nationality.
- NEVER use slurs, dehumanising language, or incel/looksmax jargon: no "subhuman", "it's over", "PSL", "mog"/"mogged", "chad", "ratio", "hunter eyes", "canthal tilt", "blackpill", or similar.
- Be honest and direct, but respectful and never hopeless. No doom, no flattery. Every criticism comes with a concrete fix.
- Talk like a calibrated coach: short sentences, specific, practical, second person ("you").`;

const SCAN_SYSTEM_PROMPT = `You are Ascension, an honest, calibrated men's grooming, fitness and style coach. You rate a front-facing photo (and an optional side photo) of a man the way a typical, fair-minded person would perceive him at first glance, then give a practical plan.

${SAFETY_RULES}

FIXED RUBRIC — use these exact anchors every time so repeat scans are consistent. Scores are 1.0–10.0 with one decimal. 5.0 is a typical, average man of the same age. Scores of 9+ are rare. Rate only what is visible; if something cannot be seen (e.g. body below the shoulders), rate conservatively from what is visible and say so in the verdict.

skin — 2: severe active acne or cystic acne, scarring, widespread redness. 3: active acne or redness across cheeks/forehead. 4–5: scattered breakouts, oily shine, uneven tone, visible blackheads or dryness. 6: mostly clear with some texture, enlarged pores or mild redness. 7: clear with minor unevenness. 8: clear, even tone, healthy-looking. 9–10: clear, even, smooth with no visible texture.
hair — 2: greasy, unkempt, visible dandruff, no shape. 3–4: clean but overgrown or a cut that fights the face shape; flat, no styling. 5: clean, generic cut, minimal styling. 6: decent cut with some styling. 7: intentional cut suited to the face shape, styled, clean edges. 8: sharp, healthy, styled with product, clean neckline. 9–10: editorial-level cut and condition. Thinning or recession is rated by how well it is handled — a tight, deliberate short cut can still score 7.
jawline — 2: jawline fully hidden by facial fat, double chin at rest. 3: jaw outline hidden, submental fullness. 4–5: soft definition, some fullness under the chin. 6: visible jaw outline, mild softness. 7: defined jaw and chin, some cheek definition. 8: sharp jawline, visible cheek hollows, lean neck. 9–10: very lean with strong angles.
eyes — 2: heavy dark circles or puffiness, red eyes, brows overgrown, patchy or joined. 3–4: tired look, dark circles, untidy brows. 5: neutral, brows unshaped. 6: alert, brows natural and mostly tidy. 7: rested, brows groomed along their natural line. 8: bright, rested, brows well groomed, no under-eye issues. 9–10: striking and rested with immaculate brows.
grooming — 2: patchy unkempt facial hair, visible nose/ear hair, chapped lips, dirty skin or nails. 3–4: scruff with no neckline or cheek line, untidy. 5: clean but no intentional shape. 6: tidy; beard or shave mostly maintained. 7: intentional shape, clean lines, moisturised skin. 8: precise lines, teeth clean, lips cared for. 9–10: flawless.
style — 2: stained, worn-out or badly fitting clothes. 3–4: ill-fitting or mismatched, no intent. 5: clean but baggy or generic. 6: acceptable fit, coordinated colours. 7: well-fitted, cohesive palette that suits the body. 8: fitted and intentional, details (collar, glasses, watch) coherent. 9–10: editorial. If only the neckline/collar is visible, rate what is visible and say the view was limited.
physique — 2: forward head, rounded shoulders, visibly high body fat or very underweight. 3–4: slouched, soft build. 5: average build, slight slouch. 6: upright, some muscle or lean. 7: visibly athletic or lean, good posture. 8: clearly trained, upright, broad shoulder-to-waist. 9–10: elite conditioning. If the body is not visible, infer from neck, shoulders and posture only and note the limited view.

overall — the first-glance impression. It must stay within 0.7 of the weighted mean of the category scores (skin 0.20, hair 0.15, jawline 0.20, eyes 0.10, grooming 0.10, style 0.10, physique 0.15).
potential — realistic ceiling after 12 months of consistent low-risk habits: usually +0.5 to +2.5 above the score, never more than +3.0, never lower than the score. Give a potential for each category too.
tier from overall — below 4.5 "Below average"; 4.5–5.9 "Average"; 6.0–6.9 "Above average"; 7.0–7.9 "Top 20%"; 8.0–8.9 "Top 10%"; 9.0+ "Top 5%".

OTHER RULES:
- isFace: false if the front photo does not contain one clear human face (blurry, obscured, cartoon, multiple people, no person). In that case still return the full shape with your best short summary explaining what to retake.
- If the person appears under 16, set isFace true, keep scores neutral (5.0–6.5), and restrict every verdict, fix, lever and habit to hygiene, sleep, hydration, fitness basics and confidence; no style, body-fat or dating advice.
- Poor lighting or a low-quality photo: rate what you see, mention it in the summary, and do not punish the scores for it more than 0.5.
- Verdicts: one specific sentence about what you see. Fixes: one specific, actionable sentence.
- levers: the 3 highest-impact changes for THIS person, ordered by impact, each concrete (product type, cut, routine, target).
- plan.habits: 10 to 14 habits tailored to the lowest-scoring categories, ids in unique kebab-case, each detail one or two practical sentences.
- plan.social: a 7-level confidence ladder. Level 1 = eye contact + nod; level 7 = start a conversation with a stranger and hold it for 2 minutes. Personalise the details, keep the progression.
- plan.weeklyFocus: 4 short themes, one per week for the first month.
- When a BASELINE is provided: it is this same person's previous scan under this same rubric. Re-rate independently with the rubric, then for each category write one honest note comparing to the baseline. Small changes (±0.3) are normal and expected; do not inflate progress or invent decline. Report deltas as new score minus baseline score.

Respond with ONLY a JSON object, no markdown, matching exactly:
{
  "isFace": boolean,
  "overall": number, "potential": number,
  "tier": string,
  "summary": string,            // exactly 2 sentences, honest and direct
  "categories": [ { "key": "skin"|"hair"|"jawline"|"eyes"|"grooming"|"style"|"physique", "label": string, "score": number, "potential": number, "verdict": string, "fix": string } ],   // all 7, in that order
  "levers": [string, string, string],
  "plan": {
    "habits": [ { "id": string, "title": string, "category": "skin"|"hair"|"jawline"|"eyes"|"grooming"|"style"|"physique"|"sleep"|"mind", "cadence": "daily"|"weekly", "time": "am"|"pm"|"any", "detail": string } ],
    "social": [ { "level": 1-7, "title": string, "detail": string } ],
    "weeklyFocus": [string, string, string, string]
  },
  "deltas": [ { "key": string, "delta": number, "note": string } ] | null
}`;

const COACH_SYSTEM_PROMPT = `You are Ascension, the user's personal grooming, fitness, style and confidence coach. You already know his latest scan and plan (CONTEXT below). Answer as that coach: direct, warm, specific, practical, second person. Maximum 120 words. No headings, no markdown bullets unless listing 2–4 short steps. Reference his actual scores and habits when relevant.

${SAFETY_RULES}

MENTAL HEALTH: if the user expresses hopelessness, worthlessness, self-harm or suicidal thoughts, drop the coaching frame. Respond with warmth and without judgement, remind him that his looks do not decide his worth, encourage him to talk to someone he trusts, and include the 988 Suicide & Crisis Lifeline (call or text 988 in the US, available 24/7). Do not lecture, do not continue with grooming advice in that message.`;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ascension-app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if ((req.headers['x-ascension-app'] || '') !== APP_TOKEN) return res.status(403).json({ error: 'forbidden' });
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'server_not_configured' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const mode = body.mode;
  if (mode !== 'scan' && mode !== 'coach') return res.status(400).json({ error: 'bad_mode' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!(await underHourlyCap(ip))) return res.status(429).json({ error: 'rate_limited' });

  try {
    return mode === 'scan' ? await handleScan(body, res) : await handleCoach(body, res);
  } catch (e) {
    console.error('ascension failed:', e);
    return res.status(500).json({ error: 'internal' });
  }
}

// ---------------------------------------------------------------------------
// mode: scan
// ---------------------------------------------------------------------------

async function handleScan(body, res) {
  const { front, side, mime, profile, baseline } = body;
  if (!front || typeof front !== 'string') return res.status(400).json({ error: 'missing_front' });
  if (Buffer.byteLength(front, 'base64') > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'image_too_large' });
  if (side != null && typeof side !== 'string') return res.status(400).json({ error: 'bad_side' });
  if (side && Buffer.byteLength(side, 'base64') > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'image_too_large' });

  const prof = normalizeProfile(profile);
  const base = normalizeBaseline(baseline);
  const mimeType = typeof mime === 'string' && /^image\/[a-z0-9.+-]+$/i.test(mime) ? mime : 'image/jpeg';

  const userLines = [
    `PROFILE: age band ${prof.ageBand}; goals: ${prof.goals.length ? prof.goals.join(', ') : 'not specified'}.`,
  ];
  if (prof.notes) userLines.push(`USER NOTES: ${prof.notes}`);
  if (base) {
    userLines.push(
      `BASELINE (previous scan, same rubric): overall ${base.overall != null ? base.overall : 'n/a'}; ` +
        base.categories.map((c) => `${c.key} ${c.score}`).join(', ') + '.',
    );
  } else {
    userLines.push('BASELINE: none (first scan). Set "deltas" to null.');
  }
  userLines.push(side ? 'PHOTOS: image 1 is the front view, image 2 is the side profile.' : 'PHOTOS: image 1 is the front view. No side photo.');
  userLines.push('Rate with the fixed rubric and return the JSON object only.');

  const parts = [{ text: userLines.join('\n') }, { inline_data: { mime_type: mimeType, data: front } }];
  if (side) parts.push({ inline_data: { mime_type: mimeType, data: side } });

  const raw = await callGemini({
    systemInstruction: { parts: [{ text: SCAN_SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.15, maxOutputTokens: 2200 },
  });
  if (raw == null) return res.status(502).json({ error: 'upstream' });

  const parsed = parseJsonLoose(raw);
  if (!parsed) return res.status(502).json({ error: 'upstream' });

  return res.status(200).json(normalizeScan(parsed, base));
}

function normalizeProfile(p) {
  const src = p && typeof p === 'object' ? p : {};
  const ageBand = AGE_BANDS.includes(src.ageBand) ? src.ageBand : 'unspecified';
  const goals = Array.isArray(src.goals)
    ? src.goals.filter((g) => typeof g === 'string' && g.trim()).slice(0, 8).map((g) => clean(g, 80))
    : [];
  const notes = typeof src.notes === 'string' ? clean(src.notes, 500) : '';
  return { ageBand, goals, notes };
}

function normalizeBaseline(b) {
  if (!b || typeof b !== 'object' || !Array.isArray(b.categories)) return null;
  const categories = b.categories
    .filter((c) => c && typeof c === 'object' && CATEGORIES.some((k) => k.key === c.key) && isNum(c.score))
    .map((c) => ({ key: c.key, score: score1(c.score) }));
  if (!categories.length) return null;
  return { categories, overall: isNum(b.overall) ? score1(b.overall) : null };
}

function normalizeScan(m, baseline) {
  const isFace = m.isFace !== false; // default to true unless the model explicitly says otherwise
  const summary = sanitizeText(str(m.summary, 400)) || (isFace ? 'Scan complete.' : 'No clear face was detected. Retake in good light, facing the camera, with nothing covering your face.');

  if (!isFace) {
    return {
      isFace: false,
      overall: 0,
      potential: 0,
      tier: '',
      summary,
      categories: [],
      levers: [],
      plan: { habits: [], social: [], weeklyFocus: [] },
      deltas: null,
    };
  }

  const modelCats = Array.isArray(m.categories) ? m.categories : [];
  const categories = CATEGORIES.map(({ key, label }) => {
    const c = modelCats.find((x) => x && x.key === key) || {};
    const score = isNum(c.score) ? score1(c.score) : 5.0;
    const potential = clampPotential(isNum(c.potential) ? c.potential : score + 1, score);
    return {
      key,
      label,
      score,
      potential,
      verdict: sanitizeText(str(c.verdict, 240)) || 'Not enough visible detail to judge; rated conservatively.',
      fix: sanitizeText(str(c.fix, 240)) || 'Keep this area clean and consistent; re-scan in four weeks.',
    };
  });

  const weightedMean = categories.reduce((s, c) => s + c.score * CATEGORY_WEIGHTS[c.key], 0);
  const overallRaw = isNum(m.overall) ? Number(m.overall) : weightedMean;
  const overall = score1(Math.min(Math.max(overallRaw, weightedMean - 0.7), weightedMean + 0.7));
  const potential = clampPotential(isNum(m.potential) ? m.potential : overall + 1.5, overall);
  const tier = tierFor(overall);

  let levers = (Array.isArray(m.levers) ? m.levers : []).filter((s) => typeof s === 'string' && s.trim()).map((s) => sanitizeText(clean(s, 220)));
  if (levers.length < 3) {
    const weakest = [...categories].sort((a, b) => a.score - b.score);
    for (const c of weakest) {
      if (levers.length >= 3) break;
      const lever = `${c.label}: ${c.fix}`;
      if (!levers.includes(lever)) levers.push(lever);
    }
  }
  levers = levers.slice(0, 3);

  const plan = m.plan && typeof m.plan === 'object' ? m.plan : {};
  const habits = normalizeHabits(plan.habits);
  const social = normalizeSocial(plan.social);
  const weeklyFocus = normalizeWeeklyFocus(plan.weeklyFocus);

  let deltas = null;
  if (baseline) {
    const modelDeltas = Array.isArray(m.deltas) ? m.deltas : [];
    deltas = baseline.categories.map((b) => {
      const now = categories.find((c) => c.key === b.key);
      const md = modelDeltas.find((d) => d && d.key === b.key) || {};
      const delta = round1(now.score - b.score);
      return {
        key: b.key,
        delta,
        note: sanitizeText(str(md.note, 200)) || defaultDeltaNote(delta),
      };
    });
    if (baseline.overall != null) {
      const d = round1(overall - baseline.overall);
      const md = modelDeltas.find((x) => x && x.key === 'overall') || {};
      deltas.push({ key: 'overall', delta: d, note: sanitizeText(str(md.note, 200)) || defaultDeltaNote(d) });
    }
  }

  return { isFace: true, overall, potential, tier, summary, categories, levers, plan: { habits, social, weeklyFocus }, deltas };
}

function normalizeHabits(list) {
  const out = [];
  const seen = new Set();
  const push = (h) => {
    if (!h || typeof h !== 'object') return;
    const title = sanitizeText(str(h.title, 80));
    if (!title) return;
    let id = kebab(typeof h.id === 'string' && h.id.trim() ? h.id : title) || `habit-${out.length + 1}`;
    let n = 2;
    while (seen.has(id)) id = `${kebab(id.replace(/-\d+$/, ''))}-${n++}`;
    seen.add(id);
    out.push({
      id,
      title,
      category: HABIT_CATEGORIES.includes(h.category) ? h.category : 'mind',
      cadence: CADENCES.includes(h.cadence) ? h.cadence : 'daily',
      time: TIMES.includes(h.time) ? h.time : 'any',
      detail: sanitizeText(str(h.detail, 300)) || title,
    });
  };
  (Array.isArray(list) ? list : []).forEach(push);
  for (const d of DEFAULT_HABITS) {
    if (out.length >= 10) break;
    if (!seen.has(d.id)) push(d);
  }
  return out.slice(0, 14);
}

function normalizeSocial(list) {
  const given = Array.isArray(list) ? list : [];
  return DEFAULT_SOCIAL.map((d) => {
    const s = given.find((x) => x && Number(x.level) === d.level) || {};
    return {
      level: d.level,
      title: sanitizeText(str(s.title, 80)) || d.title,
      detail: sanitizeText(str(s.detail, 300)) || d.detail,
    };
  });
}

function normalizeWeeklyFocus(list) {
  const out = (Array.isArray(list) ? list : []).filter((s) => typeof s === 'string' && s.trim()).map((s) => sanitizeText(clean(s, 160)));
  for (const d of DEFAULT_WEEKLY_FOCUS) {
    if (out.length >= 4) break;
    if (!out.includes(d)) out.push(d);
  }
  return out.slice(0, 4);
}

function defaultDeltaNote(delta) {
  if (delta >= 0.5) return 'Clear improvement since your last scan. Keep the routine going.';
  if (delta <= -0.5) return 'Slipped a little since your last scan. Check which habits fell off.';
  return 'Roughly unchanged since your last scan — normal for a short window.';
}

// ---------------------------------------------------------------------------
// mode: coach
// ---------------------------------------------------------------------------

const CRISIS_RE = /\b(suicid|kill myself|end my life|end it all|don'?t want to (live|be alive|be here)|self[- ]harm|hurt myself|cutting myself|no point (in )?living|better off dead|want to die|it'?s over for me|hopeless|worthless)\b/i;
const LIFELINE = 'If things feel heavy right now, you can call or text 988 (Suicide & Crisis Lifeline, US, 24/7) and talk to someone who will listen.';

async function handleCoach(body, res) {
  const context = typeof body.context === 'string' ? clean(body.context, 4000) : '';
  const msgs = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: clean(m.content, 2000) }] }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return res.status(400).json({ error: 'missing_user_message' });

  const lastUser = msgs[msgs.length - 1].parts[0].text;
  const crisis = CRISIS_RE.test(lastUser);

  const system = `${COACH_SYSTEM_PROMPT}\n\nCONTEXT (the user's latest scan and plan):\n${context || 'No scan on file yet. Coach from general best practice and encourage a scan.'}`;

  const raw = await callGemini({
    systemInstruction: { parts: [{ text: system }] },
    contents: msgs,
    generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
  });
  if (raw == null) return res.status(502).json({ error: 'upstream' });

  let reply = sanitizeText(raw.trim());
  if (!reply) return res.status(502).json({ error: 'upstream' });
  if (crisis && !/988/.test(reply)) reply = `${reply}\n\n${LIFELINE}`;
  return res.status(200).json({ reply });
}

// ---------------------------------------------------------------------------
// Gemini + helpers
// ---------------------------------------------------------------------------

// Returns the model's text, or null on any upstream failure.
async function callGemini(payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const gRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!gRes.ok) {
    console.error('gemini error', gRes.status, await gRes.text());
    return null;
  }
  const data = await gRes.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  if (!text) {
    console.error('gemini empty response', JSON.stringify(data).slice(0, 500));
    return null;
  }
  return text;
}

function parseJsonLoose(text) {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

// Last line of defence against jargon the prompt already forbids.
const BANNED = [
  [/\bsub-?human\b/gi, 'below where you want to be'],
  [/\bit'?s over\b/gi, 'it is not over'],
  [/\bPSL\b/g, 'rating'],
  [/\bmogg?(ed|ing|s)?\b/gi, 'outshine'],
  [/\bbone-?smash(ing|ed)?\b/gi, 'that (unsafe, not recommended)'],
];
function sanitizeText(s) {
  if (!s) return s;
  let out = s;
  for (const [re, rep] of BANNED) out = out.replace(re, rep);
  return out;
}

function str(v, max) {
  return typeof v === 'string' ? clean(v, max) : '';
}
function clean(s, max) {
  return String(s).replace(/\s+/g, ' ').trim().slice(0, max);
}
function isNum(v) {
  return typeof v === 'number' ? Number.isFinite(v) : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v));
}
function round1(v) {
  return Math.round(Number(v) * 10) / 10;
}
function score1(v) {
  return round1(Math.min(10, Math.max(1, Number(v))));
}
function clampPotential(v, score) {
  return score1(Math.min(Math.max(Number(v), score), score + 3));
}
function tierFor(overall) {
  if (overall < 4.5) return TIERS[0];
  if (overall < 6) return TIERS[1];
  if (overall < 7) return TIERS[2];
  if (overall < 8) return TIERS[3];
  if (overall < 9) return TIERS[4];
  return TIERS[5];
}
function kebab(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
}

async function underHourlyCap(ip) {
  try {
    const hour = new Date().toISOString().slice(0, 13);
    const ref = getFirestore().collection(USAGE_COLLECTION).doc(`${ip}_${hour}`);
    const snap = await ref.get();
    const count = snap.exists ? snap.data().count || 0 : 0;
    if (count >= HOURLY_IP_CAP) return false;
    await ref.set({ count: FieldValue.increment(1), hour, ip }, { merge: true });
    return true;
  } catch (e) {
    console.error('rate counter error (failing open):', e);
    return true; // fail open — a counter outage must not break the app
  }
}
