// "Send test notification" from the Notifications screen: POST { id } → pushes to that one device.
const L = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const id = String(body.id || '');
    if (!/^[a-f0-9]{20,64}$/.test(id)) return res.status(400).json({ error: 'bad id' });
    const doc = await L.getDoc('pushSubs', id);
    if (!doc || !doc.sub) return res.status(404).json({ error: 'not found' });
    const sr = body.lang !== 'en';
    const code = await L.sendPush(doc.sub, { title: sr ? 'Probno obaveštenje' : 'Test notification', body: sr ? 'Obaveštenja rade na ovom uređaju 🎉' : 'Notifications work on this device 🎉', tag: 'test', url: '/' });
    if (code === 404 || code === 410) await L.deleteDoc('pushSubs', id);
    res.status(code >= 200 && code < 300 ? 200 : 502).json({ status: code });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
