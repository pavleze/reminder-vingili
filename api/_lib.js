// Shared server code for push notifications. No npm dependencies: Firestore over REST with the
// service-account key, and Web Push (VAPID + aes128gcm, RFC 8291/8292) with Node's own crypto.
const crypto = require('crypto');

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const fromB64u = (s) => Buffer.from(String(s).replace(/=+$/, ''), 'base64url');

/* ---------------- Google auth (service account → OAuth token) ---------------- */
let tokenCache = null;
function serviceAccount() {
  const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
  const sa = JSON.parse(raw);
  sa.private_key = String(sa.private_key).replace(/\\n/g, '\n');
  return sa;
}
async function accessToken() {
  if (tokenCache && tokenCache.exp > Date.now() + 60e3) return tokenCache.token;
  const sa = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = crypto.sign('RSA-SHA256', Buffer.from(`${head}.${body}`), sa.private_key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${body}.${b64u(sig)}` }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('Google token error: ' + JSON.stringify(j));
  tokenCache = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return tokenCache.token;
}

/* ---------------- Firestore REST ---------------- */
const projectId = () => process.env.FIREBASE_PROJECT_ID || serviceAccount().project_id;
const docsBase = () => `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents`;
function decodeValue(v) {
  if (!v || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return null;
}
function decodeFields(f) { const o = {}; for (const k of Object.keys(f || {})) o[k] = decodeValue(f[k]); return o; }
function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, encodeValue(x)])) } };
  return { stringValue: String(v) };
}
async function fsFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...(opts.headers || {}) } });
  return res;
}
async function listAll(collection) {
  const out = []; let pageToken = '';
  do {
    const res = await fsFetch(`${docsBase()}/${collection}?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`);
    const j = await res.json();
    if (!res.ok) throw new Error(`Firestore list ${collection}: ${JSON.stringify(j)}`);
    for (const d of j.documents || []) out.push({ id: d.name.split('/').pop(), ...decodeFields(d.fields) });
    pageToken = j.nextPageToken || '';
  } while (pageToken);
  return out;
}
async function getDoc(collection, id) {
  const res = await fsFetch(`${docsBase()}/${collection}/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  const j = await res.json();
  if (!res.ok) throw new Error(`Firestore get: ${JSON.stringify(j)}`);
  return { id, ...decodeFields(j.fields) };
}
// creates the doc only if it does not exist yet → true; already there → false (used to send each notification once)
async function createOnce(collection, id, data) {
  const res = await fsFetch(`${docsBase()}/${collection}?documentId=${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify({ fields: encodeValue(data).mapValue.fields }) });
  if (res.status === 409) return false;
  if (!res.ok) throw new Error(`Firestore create: ${await res.text()}`);
  return true;
}
async function patchDoc(collection, id, data) {
  const mask = Object.keys(data).map((k) => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&');
  await fsFetch(`${docsBase()}/${collection}/${encodeURIComponent(id)}?${mask}`, { method: 'PATCH', body: JSON.stringify({ fields: encodeValue(data).mapValue.fields }) });
}
async function deleteDoc(collection, id) {
  await fsFetch(`${docsBase()}/${collection}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/* ---------------- Web Push ---------------- */
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || 'BM92mCsLUOMAMnxqP2lZqy7ys02Hcm2LzPYLSLEo9KUfAqsJfyuqIG1m5-pdWa6_H_S77LfdiCa7xDUb3zunr_4';
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();

// RFC 8291 (aes128gcm), single record
function encryptPayload(payload, p256dh, authSecret, opts = {}) {
  const uaPublic = fromB64u(p256dh); const auth = fromB64u(authSecret);
  const ecdh = crypto.createECDH('prime256v1');
  if (opts.asPrivate) ecdh.setPrivateKey(opts.asPrivate); else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const shared = ecdh.computeSecret(uaPublic);
  const prkKey = hmac(auth, shared);
  const ikm = hmac(prkKey, Buffer.concat([Buffer.from('WebPush: info\0'), uaPublic, asPublic, Buffer.from([1])]));
  const salt = opts.salt || crypto.randomBytes(16);
  const prk = hmac(salt, ikm);
  const cek = hmac(prk, Buffer.concat([Buffer.from('Content-Encoding: aes128gcm\0'), Buffer.from([1])])).subarray(0, 16);
  const nonce = hmac(prk, Buffer.concat([Buffer.from('Content-Encoding: nonce\0'), Buffer.from([1])])).subarray(0, 12);
  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const ct = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, ct]);
}
function vapidAuth(endpoint) {
  const priv = String(process.env.VAPID_PRIVATE_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (!priv) throw new Error('VAPID_PRIVATE_KEY is not set');
  const pub = fromB64u(VAPID_PUBLIC);
  const key = crypto.createPrivateKey({ key: { kty: 'EC', crv: 'P-256', d: priv, x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) }, format: 'jwk' });
  const head = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const body = b64u(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 3600, sub: 'https://reminder-vingili.vercel.app' }));
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key, dsaEncoding: 'ieee-p1363' });
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${VAPID_PUBLIC}`;
}
// → HTTP status from the push service (201 ok; 404/410 = subscription gone)
async function sendPush(sub, message, detail) {
  const body = encryptPayload(JSON.stringify(message), sub.keys.p256dh, sub.keys.auth);
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { TTL: '3600', Urgency: 'high', 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', Authorization: vapidAuth(sub.endpoint) },
    body,
  });
  if (detail) detail.text = res.status >= 300 ? (await res.text().catch(() => '')).slice(0, 200) : '';
  return res.status;
}

/* ---------------- Recurrence (same rules as the app) ---------------- */
const pad = (n) => String(n).padStart(2, '0');
const dkey = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const fromKey = (k) => { const [y, m, d] = String(k).slice(0, 10).split('-').map(Number); return new Date(Date.UTC(y, (m || 1) - 1, d || 1)); };
const addDays = (d, n) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));
const lastDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
const weekdayIdx = (d) => (d.getUTCDay() + 6) % 7;
const timeToMin = (hhmm) => { const [h, m] = String(hhmm || '00:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const isEvent = (it) => it.type === 'event';
const isFloating = (it) => !it.date && (!it.repeat || it.repeat.type === 'none');
const okey = (it, d) => (isFloating(it) ? 'any' : dkey(d));
function occursOn(it, d) {
  if (isFloating(it)) return false;
  const start = fromKey(it.date || it.anchor || String(it.createdAt || new Date().toISOString()).slice(0, 10));
  if (d < start) return false;
  const r = it.repeat || { type: 'none' };
  switch (r.type) {
    case 'interval': {
      const n = Math.max(1, Number(r.every) || 1);
      if (r.unit === 'year') return (d.getUTCFullYear() - start.getUTCFullYear()) % n === 0 && d.getUTCMonth() === start.getUTCMonth() && d.getUTCDate() === Math.min(start.getUTCDate(), lastDay(d));
      if (r.unit === 'month') { const md = (d.getUTCFullYear() - start.getUTCFullYear()) * 12 + d.getUTCMonth() - start.getUTCMonth(); return md % n === 0 && d.getUTCDate() === Math.min(start.getUTCDate(), lastDay(d)); }
      const diff = Math.round((d - start) / 864e5);
      return diff % (r.unit === 'week' ? 7 * n : n) === 0;
    }
    case 'weekdays': return (r.days || []).includes(weekdayIdx(d));
    case 'monthday': return d.getUTCDate() === Math.min(Number(r.monthDay) || 1, lastDay(d));
    default: return dkey(d) === dkey(start);
  }
}
const checkedOn = (it, d) => { const ids = new Set((it.items || []).map((x) => x.id)); return ((it.checks || {})[okey(it, d)] || []).filter((id) => ids.has(id)); };
function isDoneOn(it, d) {
  if (it.kind === 'list') return (it.items || []).length > 0 && checkedOn(it, d).length === it.items.length;
  return !!(it.done || {})[okey(it, d)];
}
// minutes-before list: [0, 15] = at the time and 15 min before; [] = none. Any earlier one brings 'at the time' with it.
// Older items keep a single number (-1 = none).
function remindList(it) {
  const l = (Array.isArray(it.remind) ? it.remind : [it.remind == null ? 0 : it.remind]).map(Number).filter((n) => n >= 0);
  return l.length ? [...new Set([0, ...l])].sort((a, b) => a - b) : [];
}
// wall-clock date and minute of day in a time zone
function localNow(tz, now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((x) => [x.type, x.value]));
  return { today: fromKey(`${p.year}-${p.month}-${p.day}`), min: Number(p.hour) * 60 + Number(p.minute) };
}

/* ---------------- Firebase ID token check (who is calling) ---------------- */
let certCache = null;
async function verifyIdTokenClaims(token) {
  const [h, p, s] = String(token || '').split('.');
  if (!s) throw new Error('no token');
  const head = JSON.parse(fromB64u(h)); const pl = JSON.parse(fromB64u(p));
  if (!certCache || certCache.exp < Date.now()) {
    const r = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    certCache = { certs: await r.json(), exp: Date.now() + 3600e3 };
  }
  const cert = certCache.certs[head.kid];
  if (head.alg !== 'RS256' || !cert) throw new Error('bad token header');
  if (!crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), cert, fromB64u(s))) throw new Error('bad signature');
  const pid = projectId(); const now = Date.now() / 1000;
  if (pl.aud !== pid || pl.iss !== `https://securetoken.google.com/${pid}` || pl.exp < now || !pl.sub) throw new Error('token not valid');
  return pl;
}
const verifyIdToken = async (token) => (await verifyIdTokenClaims(token)).sub;
// send one message to every device of each uid; drops dead subscriptions
async function pushToUids(uids, makeMsg, logWhat) {
  const subs = await listAll('pushSubs'); let sent = 0;
  for (const uid of uids) {
    const user = await getDoc('users', uid).catch(() => null);
    const msg = makeMsg(user || {});
    const mine = subs.filter((x) => x.uid === uid && x.sub && x.sub.endpoint);
    const results = [];
    if (!msg) results.push('turned off in settings');
    else if (!mine.length) results.push('no devices with notifications on');
    else for (const s of mine) {
      const detail = {};
      const code = await sendPush(s.sub, msg, detail).catch((e) => { detail.text = String(e.message || e).slice(0, 150); return 0; });
      results.push(`${new URL(s.sub.endpoint).host} ${code}${detail.text ? ' ' + detail.text : ''}`);
      if (code === 404 || code === 410) await deleteDoc('pushSubs', s.id); else if (code >= 200 && code < 300) sent++;
    }
    // visible in /api/cron?debug=1 for that person
    if (logWhat) await createOnce('pushLog', `${uid}_${new Date().toISOString().slice(0, 10)}_share_${Date.now()}`, { uid, at: new Date().toISOString(), what: logWhat, result: results.join(' | ') }).catch(() => {});
  }
  return sent;
}

module.exports = { remindList, patchDoc, verifyIdToken, verifyIdTokenClaims, pushToUids, listAll, getDoc, createOnce, deleteDoc, sendPush, encryptPayload, vapidAuth, occursOn, isDoneOn, checkedOn, isEvent, isFloating, localNow, addDays, dkey, fromKey, timeToMin };
