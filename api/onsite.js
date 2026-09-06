// Backend for Onsite (AI-lab interview prep coach).
//
// Modeled on api/identify.js: the Gemini key stays server-side, requests are
// gated by a static app header (casual-abuse deterrent) and rate-limited by
// client IP through Firestore (fails open if the counter is unavailable).
//
// Request (POST, JSON), by mode:
//   plan:    { mode:"plan", profile, weeksLeft }                        -> { weeks:[{title, focus, tasks:[...]}], note, zh? }
//   mock:    { mode:"mock", lab, round, role, question?, messages:[{role,text}], zh, finish? }
//            -> { reply }  or, when finish:true, { scorecard }
//   grade:   { mode:"grade", card:{prompt,keys}, answer, zh }           -> { grade(0-5), feedback, missing:[...], zh? }
//   sharpen: { mode:"sharpen", story:{...}, lab, zh }                    -> { sharpened, notes, zh? }
// Header:  x-onsite-app: onsite_v1_7c4d9
// Env:     GEMINI_API_KEY (fallback GOOGLE_AI_API_KEY); FIREBASE_SERVICE_ACCOUNT optional

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const APP_TOKEN = 'onsite_v1_7c4d9';
const HOURLY_IP_CAP = 60;
const USAGE_COLLECTION = 'onsiteUsage';

if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
    else initializeApp({ projectId: 'forma-3803d' });
  } catch (e) {
    console.error('firebase init failed:', e);
  }
}

const LAB_NOTES = {
  anthropic:
    'Anthropic: rigorous engineering plus a genuine, calibrated safety orientation. Coding rounds are "build to a spec, then levels get added"; design is ML infra at scale (annotation platforms, model serving, data pipelines); a values round probes responsible-scaling thinking. Interviewers dislike slogans and dismissiveness equally.',
  openai:
    'OpenAI: engineering velocity and pragmatism. ML coding from scratch (attention, training loops, KV cache), system design in tokens per second and dollars, ML debugging with hypothesis discipline, research discussion on the candidate\'s own work.',
  deepmind:
    'Google DeepMind: academic rigour. A fundamentals quiz (linear algebra, probability, optimisation, autodiff), ML implementation, debugging, large-scale design, and a research discussion that rewards research taste and honest critique.',
  meta: 'Meta: classic Big Tech loop with two fast coding rounds, product-scale or ML system design, an ML depth interview on the candidate\'s project, and a behavioral round that affects leveling.',
  bigtech: 'Big Tech: standard loop of coding, system design (requirements, estimates, high level, deep dive, trade-offs), and behavioral against the company rubric.',
};

const ROUND_NOTES = {
  coding: 'a live coding round: pose one practical problem, then add constraints in levels like a real pair-programming spec interview',
  mlcoding: 'an ML coding round: ask the candidate to implement or sketch an ML component from scratch and probe shapes, numerics, and gradients',
  design: 'a system design round: one open problem; push on bottlenecks, numbers, storage split, cost, and failure modes',
  debugging: 'an ML debugging round: describe symptoms of a broken training run or service and probe hypothesis discipline',
  behavioral: 'a behavioral round: STAR stories with numbers; probe for specifics, ownership, and reflection',
  values: 'a values and safety conversation: open-ended questions about capabilities, risk, and judgment; reward calibrated, specific thinking; penalise slogans and dismissiveness',
  research: 'a research discussion: the candidate\'s own best project and a critique of a paper; probe five levels deep',
  quiz: 'a fundamentals quiz: rapid undergraduate-depth questions on linear algebra, probability, optimisation, and autodiff; ask for derivations',
};

const VOICE = `You are the interviewer at a frontier AI lab, conducting a realistic mock interview for a candidate who is preparing seriously. Be professional, warm but not soft, and concise: one question or follow-up per turn, two to four sentences, no lists, no praise unless earned. Ask follow-ups the way a real senior interviewer does: probe vagueness, ask for numbers, push one level deeper. Never reveal the scorecard until asked to finish. Never claim to be affiliated with the lab; you are a simulation built from public information.`;

const SCORECARD_SHAPE = `{
  "overall": number,             // 1-4: 1 No Hire, 2 Lean No Hire, 3 Hire, 4 Strong Hire
  "verdict": string,             // exactly one of: "Strong Hire", "Hire", "Lean No Hire", "No Hire"
  "summary": string,             // 2-3 sentences, the debrief paragraph an interviewer would write
  "dimensions": [ { "key": string, "label": string, "score": number, "note": string } ],  // 4-5 dimensions, score 1-4, note max 18 words
  "strengths": string[],         // 2-3 short phrases
  "gaps": string[],              // 2-3 short phrases, specific and fixable
  "nextDrills": string[]         // 2-3 concrete practice tasks for this week
}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-onsite-app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'server_not_configured' });
  if ((req.headers['x-onsite-app'] || '') !== APP_TOKEN) return res.status(403).json({ error: 'forbidden' });
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!(await underHourlyCap(ip))) return res.status(429).json({ error: 'rate_limited' });
  try {
    switch (body.mode) {
      case 'plan':
        return await handlePlan(body, res);
      case 'mock':
        return await handleMock(body, res);
      case 'grade':
        return await handleGrade(body, res);
      case 'sharpen':
        return await handleSharpen(body, res);
      default:
        return res.status(400).json({ error: 'bad_mode' });
    }
  } catch (e) {
    console.error('onsite failed:', e);
    return res.status(500).json({ error: 'internal' });
  }
}

function zhLine(zh) {
  return zh
    ? 'Also include a field "zh": 3-5 sentences of coaching in Simplified Chinese (简体中文), written for a Chinese-speaking engineer preparing for US AI-lab interviews: direct, specific, encouraging without flattery. Keep all other fields in English.'
    : 'Do not include a "zh" field.';
}

async function handlePlan(body, res) {
  const { profile = {}, weeksLeft } = body;
  const labs = (Array.isArray(profile.labs) ? profile.labs : []).map((l) => LAB_NOTES[l] || l).join('\n');
  const weeks = Math.max(1, Math.min(12, Number(weeksLeft) || 6));
  const prompt = `You are a senior interview coach for frontier AI labs. Build a ${weeks}-week preparation plan.
CANDIDATE: role ${profile.role || 'swe'}; experience ${profile.years || 'unknown'}; background: ${String(profile.background || '').slice(0, 600) || 'not given'}.
TARGET LOOPS:\n${labs}
Rules: each week has a title, a one-line focus, and 4-6 concrete tasks (specific problems types, papers, mocks, and a rest instruction). Front-load the round they are weakest in given the background. Weeks near the end are mocks and review. Be concrete and honest; no motivational filler.
Respond with ONLY JSON: { "weeks": [ { "title": string, "focus": string, "tasks": string[] } ], "note": string /* 2 sentences: the single biggest risk and how the plan addresses it */ ${profile.zh ? ', "zh": string' : ''} }
${zhLine(profile.zh)}`;
  const parsed = await gemini([{ text: prompt }], 3500);
  if (!parsed || !Array.isArray(parsed.weeks)) return res.status(502).json({ error: 'unparseable' });
  return res.status(200).json({
    weeks: parsed.weeks.slice(0, 12).map((w) => ({ title: str(w.title, 'Week'), focus: str(w.focus, ''), tasks: strList(w.tasks).slice(0, 6) })),
    note: str(parsed.note, ''),
    zh: str(parsed.zh, ''),
  });
}

async function handleMock(body, res) {
  const { lab, round, role, question, messages = [], zh, finish } = body;
  const context = `LAB CONTEXT: ${LAB_NOTES[lab] || LAB_NOTES.bigtech}\nROUND: ${ROUND_NOTES[round] || ROUND_NOTES.behavioral}\nCANDIDATE ROLE: ${role || 'swe'}.${question ? `\nOPENING QUESTION ALREADY ASKED: ${String(question).slice(0, 500)}` : ''}`;
  const transcript = (Array.isArray(messages) ? messages : [])
    .slice(-30)
    .map((m) => `${m.role === 'candidate' ? 'CANDIDATE' : 'INTERVIEWER'}: ${String(m.text).slice(0, 2500)}`)
    .join('\n\n');
  if (finish) {
    const prompt = `${VOICE}\n\n${context}\n\nTRANSCRIPT:\n${transcript || '(no answers given)'}\n\nThe round is over. Write the debrief scorecard exactly as a calibrated senior interviewer at this lab would, using the lab's real bar. Score only what was demonstrated; missing answers score low. Respond with ONLY JSON matching:\n${SCORECARD_SHAPE}\n${zhLine(zh)}`;
    const parsed = await gemini([{ text: prompt }], 3000);
    if (!parsed) return res.status(502).json({ error: 'unparseable' });
    return res.status(200).json({ scorecard: normalizeScorecard(parsed) });
  }
  const prompt = `${VOICE}\n\n${context}\n\nTRANSCRIPT SO FAR:\n${transcript || '(nothing yet)'}\n\n${
    transcript ? 'Respond with your next interviewer turn: a follow-up or the next question. If the candidate has clearly finished a strong answer, move on. After roughly 6-8 candidate turns, tell them this is the last question.' : 'Open the round: one sentence of framing, then the first question.'
  }\nRespond with ONLY JSON: { "reply": string }`;
  const parsed = await gemini([{ text: prompt }], 800);
  if (!parsed || !parsed.reply) return res.status(502).json({ error: 'unparseable' });
  return res.status(200).json({ reply: String(parsed.reply).slice(0, 1500) });
}

async function handleGrade(body, res) {
  const { card = {}, answer, zh } = body;
  if (!answer || typeof answer !== 'string') return res.status(400).json({ error: 'missing_answer' });
  const prompt = `You are a calibrated senior interviewer at a frontier AI lab grading a practice answer.\nQUESTION: ${String(card.prompt || '').slice(0, 800)}\nA STRONG ANSWER COVERS: ${(Array.isArray(card.keys) ? card.keys : []).join('; ')}\nCANDIDATE ANSWER: ${answer.slice(0, 4000)}\n\nGrade 0-5 (5 = would impress at this lab; 3 = acceptable; 1 = off-target). Be specific and brief.\nRespond with ONLY JSON: { "grade": number, "feedback": string /* max 60 words, direct */, "missing": string[] /* key points not covered, max 4 */ ${zh ? ', "zh": string' : ''} }\n${zhLine(zh)}`;
  const parsed = await gemini([{ text: prompt }], 900);
  if (!parsed) return res.status(502).json({ error: 'unparseable' });
  return res.status(200).json({ grade: clamp(parsed.grade, 0, 5, 2), feedback: str(parsed.feedback, ''), missing: strList(parsed.missing).slice(0, 4), zh: str(parsed.zh, '') });
}

async function handleSharpen(body, res) {
  const { story = {}, lab, zh } = body;
  const prompt = `You are a senior interview coach. Rewrite this STAR story as the candidate should tell it in a 2-minute behavioral answer at ${LAB_NOTES[lab] ? lab : 'a top lab'}: first person, specific, numbers where possible, no fluff, ending with the lesson. Keep every fact; invent nothing; if a number is missing, write [NUMBER] as a placeholder to fill.\nSITUATION: ${str(story.situation, '').slice(0, 800)}\nTASK: ${str(story.task, '').slice(0, 500)}\nACTION: ${str(story.action, '').slice(0, 1200)}\nRESULT: ${str(story.result, '').slice(0, 600)}\nRespond with ONLY JSON: { "sharpened": string /* 150-220 words */, "notes": string[] /* 2-3 coaching notes on what to strengthen */ ${zh ? ', "zh": string' : ''} }\n${zhLine(zh)}`;
  const parsed = await gemini([{ text: prompt }], 1500);
  if (!parsed) return res.status(502).json({ error: 'unparseable' });
  return res.status(200).json({ sharpened: str(parsed.sharpened, ''), notes: strList(parsed.notes).slice(0, 3), zh: str(parsed.zh, '') });
}

function normalizeScorecard(p) {
  const verdicts = ['Strong Hire', 'Hire', 'Lean No Hire', 'No Hire'];
  const overall = Math.round(clamp(p.overall, 1, 4, 2));
  const verdict = verdicts.includes(p.verdict) ? p.verdict : ['No Hire', 'Lean No Hire', 'Hire', 'Strong Hire'][overall - 1];
  const dims = Array.isArray(p.dimensions) ? p.dimensions : [];
  return {
    overall,
    verdict,
    summary: str(p.summary, ''),
    dimensions: dims
      .filter((d) => d && typeof d === 'object')
      .slice(0, 5)
      .map((d, i) => ({ key: str(d.key, `d${i}`), label: str(d.label, 'Dimension'), score: Math.round(clamp(d.score, 1, 4, 2)), note: str(d.note, '') })),
    strengths: strList(p.strengths).slice(0, 3),
    gaps: strList(p.gaps).slice(0, 3),
    nextDrills: strList(p.nextDrills).slice(0, 3),
    zh: str(p.zh, ''),
  };
}

async function gemini(parts, maxOutputTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const gRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.5, maxOutputTokens, thinkingConfig: { thinkingBudget: 0 } } }),
  });
  if (!gRes.ok) {
    console.error('gemini error', gRes.status, await gRes.text());
    return null;
  }
  const data = await gRes.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    return JSON.parse(text);
  } catch {
    console.error('gemini unparseable', data?.candidates?.[0]?.finishReason, text.slice(0, 300));
    const m = text.match(/\{[\s\S]*\}/);
    try {
      return m ? JSON.parse(m[0]) : null;
    } catch {
      return null;
    }
  }
}

function str(v, fallback) {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}
function strList(v) {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [];
}
function clamp(v, lo, hi, fallback) {
  const n = Number(v);
  if (!isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
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
    return true;
  }
}
