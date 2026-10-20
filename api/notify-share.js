// A shared item was added or edited: tell the other member(s).
// POST { id, action: 'added' | 'edited' } with header Authorization: Bearer <Firebase ID token>
const L = require('./_lib');

const TEXT = {
  sr: { added: (who) => `${who}: nova stavka`, edited: (who) => `${who}: izmenjena stavka`, someone: 'Partner' },
  en: { added: (who) => `${who} added an item`, edited: (who) => `${who} edited an item`, someone: 'Your partner' },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const uid = await L.verifyIdToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')).catch(() => null);
    if (!uid) return res.status(401).json({ error: 'unauthorized' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const action = body.action === 'edited' ? 'edited' : 'added';
    let item = null;
    for (let i = 0; i < 4 && !item; i++) { // the app's write may land a moment after this call
      item = await L.getDoc('reminders', String(body.id || ''));
      if (!item) await new Promise((r) => setTimeout(r, 700));
    }
    if (!item || !Array.isArray(item.members) || !item.members.includes(uid)) return res.status(404).json({ error: 'not found' });
    const others = item.members.filter((m) => m !== uid);
    if (!others.length) return res.status(200).json({ sent: 0 });
    const me = (await L.getDoc('users', uid)) || {};
    const first = String(me.name || '').trim().split(/\s+/)[0];
    const when = [item.date ? item.date.split('-').reverse().slice(0, 2).join('.') + '.' : '', item.time || ''].filter(Boolean).join(' ');
    const sent = await L.pushToUids(others, (u) => {
      const st = u.settings || {};
      if ((st.notif || {}).shared === false) return null;
      const tx = TEXT[st.lang === 'en' ? 'en' : 'sr'];
      return { title: tx[action](first || tx.someone), body: item.name + (when ? ` · ${when}` : ''), tag: `share_${item.id}`, url: '/' };
    }, `podeljeno (${action}): ${item.name}`);
    res.status(200).json({ sent });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
