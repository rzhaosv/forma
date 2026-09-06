// Kotatsu: AI Companion Crew — group-chat reply generator.
// POST { device, mode: 'group'|'dm', speaker?, messages: [{role:'user'|'crew', id?, text}], memory?, user: {name, pronouns?},
//        daysAway?, hour?, pro?: boolean, rcId?: string, crew?: string[] }
// -> { replies: [{id, text}], memory, risk, remaining, limit }
const fs = require('fs');
const path = require('path');

const CREW = JSON.parse(fs.readFileSync(path.join(__dirname, '_kotatsu', 'crew.json'), 'utf8'));
const BIBLE = fs.readFileSync(path.join(__dirname, '_kotatsu', 'bible.md'), 'utf8');
const FREE_LIMIT = 20;
const PRO_LIMIT = 600; // abuse cap
const MODEL = process.env.KOTATSU_MODEL || 'gemini-2.5-flash';

const RISK = [
  /\b(kill|end|off)\s*(myself|my life)\b/i, /\bsuicid/i, /\bwant(ing)? to die\b/i, /\bbetter off dead\b/i,
  /\bno reason to (live|be here|go on)\b/i, /\b(hang|shoot|cut) myself\b/i, /\boverdose\b/i, /\bself[- ]?harm/i,
  /\bnot (going to|gonna) be (here|around) (much longer|tomorrow)\b/i, /\bgoodbye (everyone|all|world)\b/i, /\b(nobody|no one|no-one) would (notice|care|miss)\b/i, /\bif i (disappeared|vanished|was(n't| not) here|wasn't around)\b/i, /\bdon'?t want to (be here|exist|wake up)\b/i, /\bwish i (was|were) dead\b/i,
];
const REFUSE = [/\bblackpill/i, /\b(all|every) (women|men) are\b/i, /\bfemoid/i, /\broastie/i, /\bhow (do|can) i (kill|hurt)\b/i];

function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function verifyPro(rcId) {
  const key = process.env.KOTATSU_RC_PUBLIC_KEY;
  if (!key || !rcId) return false;
  try {
    const r = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(rcId)}`, {
      headers: { Authorization: `Bearer ${key}`, 'X-Platform': 'ios' },
    });
    if (!r.ok) return false;
    const d = await r.json();
    const ent = d && d.subscriber && d.subscriber.entitlements && d.subscriber.entitlements.pro;
    if (!ent) return false;
    return !ent.expires_date || new Date(ent.expires_date).getTime() > Date.now();
  } catch { return false; }
}

async function bump(device, limit) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return 1; // fail open in dev
  try {
  const r = await fetch(`${url}/rest/v1/rpc/kt_bump`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_device: device, p_limit: limit }),
  });
  if (!r.ok) return 1;
  const n = await r.json();
  return typeof n === 'number' ? n : 1;
  } catch { return 1; }
}

function crewFor(ids) {
  const set = new Set(ids && ids.length ? ids : CREW.map((c) => c.id));
  return CREW.filter((c) => set.has(c.id));
}

function sheet(c) {
  return [
    `### ${c.name} (id: ${c.id}) — ${c.role}, ${c.age}`,
    c.backstory,
    'Voice: ' + c.voice.map((v) => `(${v})`).join(' '),
    'Sample lines: ' + c.samples.map((s) => `"${s}"`).join(' / '),
    'Never: ' + c.never.join('; '),
    `If the user has been gone for days: ${c.greet_after_absence}`,
    `If the user says nobody would notice if they disappeared: ${c.on_disappear}`,
  ].join('\n');
}

function buildPrompt({ mode, speaker, crew, user, memory, daysAway, hour, risk, refuse }) {
  const active = mode === 'dm' && speaker ? crew.filter((c) => c.id === speaker) : crew;
  const timeNote = typeof hour === 'number' ? `Local hour for the user: ${hour}:00.` : '';
  const awayNote = daysAway >= 2 ? `The user has been away for ${daysAway} days. Someone should notice, lightly, without guilt-tripping.` : daysAway === 1 ? 'The user was away yesterday.' : '';
  const name = (user && user.name) || 'them';
  const lines = [
    BIBLE,
    '',
    `## Who is at the table right now`,
    active.map(sheet).join('\n\n'),
    '',
    `## The user`,
    `They asked to be called "${name}".${user && user.pronouns ? ` Pronouns: ${user.pronouns}.` : ''}`,
    memory ? `What the crew remembers about them (keep this accurate, update it when you learn something):\n${memory}` : 'The crew does not know much about them yet. Learn one true thing at a time; do not interrogate.',
    '',
    `## Right now`,
    `Mode: ${mode === 'dm' ? `private DM with ${active[0] ? active[0].name : 'one crew member'}` : 'group chat around the kotatsu'}. ${timeNote} ${awayNote}`,
    risk ? `IMPORTANT: The latest message contains language that may indicate the user is at risk of harming themselves. Respond as the crew, in character, with warmth and directness: stay with them, ask one plain question about right now, do not lecture, do not say "seek professional help" as a brush-off. Exactly one crew member should mention, in their own voice, that a real person is available: in the US call or text 988, elsewhere findahelpline.com. No other crew member repeats the number.` : '',
    refuse ? `The latest message leans on an ideology the crew does not buy (blackpill / contempt for a whole gender / instructions to harm). Do not validate it and do not lecture. Redirect to the person and the actual feeling under it, in character.` : '',
    '',
    `## Output`,
    `Return JSON only: {"replies":[{"id":"<crew id>","text":"<message>"}], "memory":"<updated memory, max 600 characters, plain sentences>"}.`,
    mode === 'dm' ? 'Exactly one reply, from the DM partner.' : 'Between 1 and 3 replies, each a different crew member, in a natural order. Not everyone speaks every time. Short messages (1 to 3 sentences each), like real group chat. At most one reply may be longer if the moment calls for it.',
  ];
  return lines.filter(Boolean).join('\n');
}

async function generate(system, history) {
  const key = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('no model key');
  const contents = history.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.role === 'user' ? m.text : `[${m.id || 'crew'}] ${m.text}` }],
  }));
  if (!contents.length || contents[contents.length - 1].role !== 'user') contents.push({ role: 'user', parts: [{ text: '(the user is here, quiet)' }] });
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 2500, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 }, responseSchema: { type: 'OBJECT', properties: { replies: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, text: { type: 'STRING' } }, required: ['id', 'text'] } }, memory: { type: 'STRING' } }, required: ['replies', 'memory'] } },
    safetySettings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error('model ' + r.status + ' ' + JSON.stringify(d).slice(0, 200));
  const cand = d.candidates && d.candidates[0];
  const text = cand && cand.content && cand.content.parts && cand.content.parts.map((p) => p.text).join('');
  if (!text) throw new Error('empty ' + (cand && cand.finishReason));
  let parsed;
  try { parsed = JSON.parse(text); } catch (e) { console.error('kotatsu raw', (cand && cand.finishReason), text.slice(0, 400)); parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); }
  return parsed;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'POST'); return json(res, 204, {}); }
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b.device !== 'string' || b.device.length < 8 || !Array.isArray(b.messages)) return json(res, 400, { error: 'bad request' });

  const messages = b.messages.slice(-24).map((m) => ({ role: m.role === 'user' ? 'user' : 'crew', id: typeof m.id === 'string' ? m.id.slice(0, 24) : undefined, text: String(m.text || '').slice(0, 1500) })).filter((m) => m.text);
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const lastText = last ? last.text : '';
  const risk = RISK.some((re) => re.test(lastText));
  const refuse = REFUSE.some((re) => re.test(lastText));

  const pro = b.pro ? await verifyPro(b.rcId) : false;
  const limit = pro ? PRO_LIMIT : FREE_LIMIT;
  const n = await bump(b.device.slice(0, 64), limit);
  if (n < 0 && !risk) return json(res, 429, { error: 'limit', limit, remaining: 0, pro });

  const crew = crewFor(pro ? b.crew : (b.crew || []).slice(0, 3));
  const system = buildPrompt({ mode: b.mode === 'dm' ? 'dm' : 'group', speaker: b.speaker, crew, user: b.user || {}, memory: pro ? String(b.memory || '').slice(0, 1200) : String(b.memory || '').slice(0, 300), daysAway: Number(b.daysAway) || 0, hour: Number.isFinite(b.hour) ? b.hour : undefined, risk, refuse });

  try {
    const out = await generate(system, messages);
    const ids = new Set(crew.map((c) => c.id));
    const replies = (Array.isArray(out.replies) ? out.replies : []).filter((r) => r && ids.has(r.id) && typeof r.text === 'string' && r.text.trim()).slice(0, 3).map((r) => ({ id: r.id, text: r.text.trim().slice(0, 1200) }));
    if (!replies.length) throw new Error('no replies');
    return json(res, 200, { replies, memory: typeof out.memory === 'string' ? out.memory.slice(0, 1200) : (b.memory || ''), risk, remaining: n < 0 ? 0 : Math.max(0, limit - n), limit, pro });
  } catch (e) {
    console.error('kotatsu', e.message);
    const c = crew[0];
    return json(res, 200, { replies: [{ id: c.id, text: c.fallback || 'connection wobbled. still here. say it again?' }], memory: b.memory || '', risk, remaining: Math.max(0, limit - n), limit, pro, degraded: true });
  }
};
