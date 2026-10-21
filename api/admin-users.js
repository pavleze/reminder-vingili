// Who uses the app — for the app owner only. GET with header Authorization: Bearer <Firebase ID token>.
// Returns profile basics only (never the old app's reminders or anyone's items).
const L = require('./_lib');

const ADMINS = ['kristinatodorovic2403@gmail.com'];
const when = (v) => { const ms = Date.parse(v); return Number.isFinite(ms) ? new Date(ms).toISOString() : null; };

module.exports = async (req, res) => {
  try {
    const claims = await L.verifyIdTokenClaims(String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')).catch(() => null);
    if (!claims || !claims.email_verified || !ADMINS.includes(String(claims.email || '').toLowerCase())) return res.status(403).json({ error: 'forbidden' });
    const [users, items, subs] = await Promise.all([L.listAll('users'), L.listAll('reminders'), L.listAll('pushSubs')]);
    const count = (list, f) => list.reduce((m, x) => { const k = f(x); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
    const itemsBy = count(items, (x) => x.owner); const devicesBy = count(subs, (x) => x.uid);
    const out = users.map((u) => ({
      name: u.name || '', email: u.email || '',
      created: when(u.creationDate), lastLogin: when(u.lastLogIn),
      web: !!u.settings, // the web app writes `settings`; old-app-only profiles don't have it
      items: itemsBy[u.id] || 0, devices: devicesBy[u.id] || 0, partner: !!u.partnerUid,
    })).sort((a, b) => String(b.lastLogin || '').localeCompare(String(a.lastLogin || '')));
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ users: out });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
