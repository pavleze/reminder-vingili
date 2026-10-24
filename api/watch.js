// "Proveri sad" on a watched product: POST { id } with header Authorization: Bearer <Firebase ID token>.
// Only a member of the watch may run it; returns what was found and where it came from.
const L = require('./_lib');
const W = require('./_watch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const uid = await L.verifyIdToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')).catch(() => null);
    if (!uid) return res.status(401).json({ error: 'unauthorized' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    let w = null;
    for (let i = 0; i < 4 && !w; i++) { // a just-added watch may land a moment after this call
      w = await L.getDoc('watches', String(body.id || ''));
      if (!w) await new Promise((r) => setTimeout(r, 700));
    }
    if (!w || !Array.isArray(w.members) || !w.members.includes(uid)) return res.status(404).json({ error: 'not found' });
    const r = await W.runWatch(w);
    res.status(200).json({ kind: r.kind, online: r.online, store: r.store, storeQty: r.storeQty, error: r.error, sources: r.sources });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
