// Eastwind — the older brother. Chat ("talk") and dating-photo notes ("photo").
// POST { device, mode: 'talk', messages: [{role:'user'|'him', text}], memory?, user: {name, situation, preps, lastWarm}, hour?, pro?, rcId? }
//   -> { reply, memory, risk, remaining, limit, pro }
// POST { device, mode: 'photo', image: <base64 jpeg>, pro, rcId, user: {name} }
//   -> { verdict, keep, fixes: [..3], remaining, limit, pro }
const fs = require('fs');
const path = require('path');
const BIBLE = fs.readFileSync(path.join(__dirname, '_eastwind', 'bible.md'), 'utf8');
const FREE_LIMIT = 15;
const PRO_LIMIT = 400; // abuse cap
const PHOTO_LIMIT = 30; // per day, Pro only
const MODEL = process.env.EASTWIND_MODEL || 'gemini-2.5-flash';

const RISK = [
  /\b(kill|end|off|unalive)\s*(myself|my life)\b/i, /(?<!would |gonna |going to |will |'d |d )\bkill me\b/i, /\bsu[i1*]c[i1*]d/i, /\bkms\b/i, /\bunalive\b/i,
  /\b(hang|shoot|cut|drown|stab) myself\b/i, /\boverdos/i,
  /\b(have|got|made|wrote) (a|my|the) (plan|note|letter)\b/i, /\bwant(ing)? to die\b/i, /\bbetter off dead\b/i,
  /\bdon'?t want to (be here|exist|wake up)\b/i, /\bwish i (was|were) dead\b/i, /\bno reason to (live|be here|go on)\b/i,
  /\bgoodbye (everyone|all|world)\b/i, /\bonly way out\b/i,
];
const MINOR = [/\bi'?m (1[0-7]|[1-9])\b(?! (years|yrs)? ?(ago|old(er)?\b.*than))/i, /\b(1[0-7]|[1-9]) years? old\b/i, /\bin (middle|high) school\b/i, /\bmy parents won'?t let\b/i];

function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function verifyPro(rcId) {
  const key = process.env.EASTWIND_RC_PUBLIC_KEY;
  if (!key || !rcId) return false;
  try {
    const r = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(rcId)}`, { headers: { Authorization: `Bearer ${key}`, 'X-Platform': 'ios' } });
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
    const r = await fetch(`${url}/rest/v1/rpc/ew_bump`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_device: device, p_limit: limit }),
    });
    if (!r.ok) return 1;
    const n = await r.json();
    return typeof n === 'number' ? n : 1;
  } catch { return 1; }
}

async function gemini(parts, system, schemaHint) {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error('no key');
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: parts,
    generationConfig: { temperature: 0.85, maxOutputTokens: 900, responseMimeType: 'application/json' },
    safetySettings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) throw new Error('model ' + r.status + ' ' + JSON.stringify(d).slice(0, 200));
  const cand = d.candidates && d.candidates[0];
  const text = cand && cand.content && cand.content.parts && cand.content.parts.map((p) => p.text).join('');
  if (!text) throw new Error('empty ' + (cand && cand.finishReason));
  try { return JSON.parse(text); } catch { return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); }
}

function talkSystem({ user, memory, hour, risk, minor }) {
  const u = user || {};
  const situation = { years: 'has fought this for years and is tired of fighting', cycle: 'quits, then goes back; the streak apps made it worse', burnout: 'says it is the only relief he gets; works and works and nothing comes back', lonely: 'has no one in his life right now; no woman, few friends, long evenings', want: 'wants a woman and is scared to ask, to be seen, to be bad at it' }[u.situation] || '';
  const preps = Array.isArray(u.preps) && u.preps.length ? `What he has been preparing with: ${u.preps.join(', ')}.` : '';
  return [
    BIBLE, '',
    '## Him',
    `He asked to be called "${u.name || 'man'}".`,
    situation ? `Where he said he is: ${situation}.` : '',
    preps,
    u.lastWarm ? `The last time he said he felt warm: "${String(u.lastWarm).slice(0, 200)}". Bring it back when it fits.` : '',
    memory ? `What you remember about him (facts, not a log):\n${memory}` : 'You do not know much about him yet. Learn one true thing at a time. Do not interrogate.',
    '',
    '## Right now',
    typeof hour === 'number' ? `His local hour is ${hour}:00.${hour >= 22 || hour < 5 ? ' It is late. Late is when the hunger talks loudest; keep it short. Mention sleep at most once in the whole conversation, not every turn.' : ''}` : '',
    risk ? 'RISK: his last message has language about wanting to die or a plan. Follow the Safety section exactly: hotline once, plainly, then stay as yourself and ask what tonight looks like.' : '',
    minor ? 'He may be under 18. Follow the Safety section: kind, plain, this app is for adults, point to one trusted adult, no dating advice, no sexual content.' : '',
  ].filter(Boolean).join('\n');
}

const PHOTO_SYSTEM = `You are an older brother helping a man pick a dating-profile photo. Warm, plain, specific, no jargon, no flattery. Never comment on his body, weight, race, age, or attractiveness as a verdict; only on the photo as a photo: light, expression, framing, background, what it says about his life. Never suggest filters, retouching, or changing his face. Never invent details you cannot see.
Return strict JSON: {"verdict": one sentence, plain, kind, honest, e.g. "good bones, wrong light"; "keep": one thing that already works; "fixes": exactly three short, concrete, doable changes (light, angle, expression, crop, background, what he is doing, who took it), each under 20 words}.
If the image is not a person, is a screenshot, or shows a minor, return {"verdict":"can't use this one","keep":"","fixes":["a photo of you, taken by someone else, outside in daylight","a real smile: think of something funny just before the shutter","one photo doing something you actually do"]}.`;

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'POST'); return json(res, 204, {}); }
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b.device !== 'string' || b.device.length < 8) return json(res, 400, { error: 'bad request' });
  const device = b.device.slice(0, 64);

  if (b.mode === 'photo') {
    const pro = b.pro ? await verifyPro(b.rcId) : false;
    if (!pro) return json(res, 402, { error: 'pro' });
    if (typeof b.image !== 'string' || b.image.length < 100 || b.image.length > 2_800_000) return json(res, 400, { error: 'bad image' });
    const n = await bump('photo:' + device.slice(0, 50), PHOTO_LIMIT);
    if (n < 0) return json(res, 429, { error: 'limit', limit: PHOTO_LIMIT, remaining: 0, pro });
    try {
      const out = await gemini([{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: b.image } }, { text: 'Is this a good first photo for a dating profile? Follow the JSON contract.' }] }], PHOTO_SYSTEM);
      const fixes = (Array.isArray(out.fixes) ? out.fixes : []).map((f) => String(f).slice(0, 160)).filter(Boolean).slice(0, 3);
      if (fixes.length < 1) throw new Error('no fixes');
      return json(res, 200, { verdict: String(out.verdict || '').slice(0, 200), keep: String(out.keep || '').slice(0, 200), fixes, remaining: Math.max(0, PHOTO_LIMIT - n), limit: PHOTO_LIMIT, pro });
    } catch (e) {
      console.error('eastwind photo', e.message);
      return json(res, 200, { verdict: 'could not read that one', keep: '', fixes: ['try a photo taken by someone else, outside, in daylight', 'a real smile: think of something funny just before the shutter', 'one photo doing something you actually do'], remaining: Math.max(0, PHOTO_LIMIT - n), limit: PHOTO_LIMIT, pro, degraded: true });
    }
  }

  if (!Array.isArray(b.messages)) return json(res, 400, { error: 'bad request' });
  const messages = b.messages.slice(-20).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: String(m.text || '').slice(0, 1500) })).filter((m) => m.text);
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const lastText = last ? last.text : '';
  const risk = RISK.some((re) => re.test(lastText));
  const minor = MINOR.some((re) => re.test(lastText));

  const pro = b.pro ? await verifyPro(b.rcId) : false;
  const limit = pro ? PRO_LIMIT : FREE_LIMIT;
  const n = await bump(device, limit);
  if (n < 0 && !risk) return json(res, 429, { error: 'limit', limit, remaining: 0, pro });

  const memory = String(b.memory || '').slice(0, pro ? 900 : 300);
  const system = talkSystem({ user: b.user, memory, hour: Number.isFinite(b.hour) ? b.hour : undefined, risk, minor });
  // Gemini wants alternating roles starting with user; collapse runs.
  const contents = [];
  for (const m of messages) {
    const prev = contents[contents.length - 1];
    if (prev && prev.role === m.role) prev.parts[0].text += '\n' + m.text;
    else contents.push({ role: m.role, parts: [{ text: m.text }] });
  }
  if (!contents.length || contents[0].role !== 'user') contents.unshift({ role: 'user', parts: [{ text: '(he opened the app)' }] });

  try {
    const out = await gemini(contents, system);
    const reply = String(out.reply || '').trim().slice(0, 1600);
    if (!reply) throw new Error('no reply');
    return json(res, 200, { reply, memory: typeof out.memory === 'string' ? out.memory.slice(0, 900) : memory, risk, remaining: n < 0 ? 0 : Math.max(0, limit - n), limit, pro });
  } catch (e) {
    console.error('eastwind', e.message);
    return json(res, 200, { reply: risk ? "I'm here. If it's that kind of night: in the US call or text 988, elsewhere findahelpline.com. Then tell me what tonight looks like." : 'connection wobbled. still here. say it again?', memory, risk, remaining: Math.max(0, limit - n), limit, pro, degraded: true });
  }
};
