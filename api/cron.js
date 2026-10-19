// Called every minute by an external scheduler (cron-job.org): /api/cron?key=CRON_SECRET
// Sends due reminders and the morning summary as Web Push to every device a person has turned notifications on for.
const L = require('./_lib');

const TEXT = {
  sr: {
    now: (time) => `Sada · ${time}`, before: (lbl, time) => `Za ${lbl} · ${time}`,
    min: (n) => (n >= 1440 ? `${n / 1440} dan` : n >= 60 ? `${n / 60} sat` : `${n} min`),
    morningTitle: 'Dobro jutro! ☀️', today: 'Danas', general: 'Opšte', late: 'Kasni', more: (n) => `i još ${n}`,
  },
  en: {
    now: (time) => `Now · ${time}`, before: (lbl, time) => `In ${lbl} · ${time}`,
    min: (n) => (n >= 1440 ? `${n / 1440} day` : n >= 60 ? `${n / 60} hour` : `${n} min`),
    morningTitle: 'Good morning! ☀️', today: 'Today', general: 'General', late: 'Overdue', more: (n) => `and ${n} more`,
  },
};
const WINDOW = 20; // minutes: a late scheduler run still sends, each notification goes out once

module.exports = async (req, res) => {
  const key = (req.query && req.query.key) || req.headers['x-cron-key'];
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) return res.status(401).json({ error: 'unauthorized' });
  try {
    const [subs, users, items] = await Promise.all([L.listAll('pushSubs'), L.listAll('users'), L.listAll('reminders')]);
    const byUid = {}; for (const s of subs) if (s.uid && s.sub && s.sub.endpoint) (byUid[s.uid] = byUid[s.uid] || []).push(s);
    const userById = Object.fromEntries(users.map((u) => [u.id, u]));
    const report = { users: 0, sent: 0, removed: 0, errors: [] };

    for (const uid of Object.keys(byUid)) {
      const u = userById[uid] || {}; const st = u.settings || {}; const notif = st.notif || {};
      const tx = TEXT[st.lang === 'en' ? 'en' : 'sr'];
      const { today, min: nowMin } = L.localNow(u.tz || 'Europe/Belgrade');
      const mine = items.filter((it) => (Array.isArray(it.members) ? it.members.includes(uid) : it.owner === uid));
      const out = [];
      report.users++;

      // 1) items with a time: at the time, or N minutes before (it.remind; -1 = off)
      if (notif.reminders !== false) {
        for (const it of mine) {
          if (!it.time) continue;
          const remind = it.remind == null ? 0 : Number(it.remind);
          if (remind < 0) continue;
          for (const off of [0, 1, 2]) { // a reminder set a day early fires today for tomorrow's item
            const d = L.addDays(today, off);
            if (!L.occursOn(it, d) || (!L.isEvent(it) && L.isDoneOn(it, d))) continue;
            const late = nowMin - (off * 1440 + L.timeToMin(it.time) - remind);
            if (late < 0 || late > WINDOW) continue;
            if (!(await L.createOnce('pushLog', `${uid}_${it.id}_${L.dkey(d)}`, { uid, at: new Date().toISOString() }))) continue;
            const list = it.kind === 'list' ? ` · ${L.checkedOn(it, d).length}/${(it.items || []).length}` : '';
            out.push({ title: it.name, body: (remind ? tx.before(tx.min(remind), it.time) : tx.now(it.time)) + list, tag: `${it.id}_${L.dkey(d)}`, url: '/' });
          }
        }
      }

      // 2) morning summary: today's items without a time, overdue one-offs, open "General" items
      const mt = L.timeToMin(notif.morningTime || '08:00'); const late = nowMin - mt;
      if (notif.morning !== false && late >= 0 && late <= WINDOW) {
        const todays = mine.filter((it) => !it.time && L.occursOn(it, today) && !(L.isEvent(it) ? false : L.isDoneOn(it, today)));
        const overdue = mine.filter((it) => it.date && (!it.repeat || it.repeat.type === 'none') && !L.isEvent(it) && L.fromKey(it.date) < today && !L.isDoneOn(it, L.fromKey(it.date)));
        const general = mine.filter((it) => L.isFloating(it) && !L.isDoneOn(it, today));
        if (todays.length + overdue.length + general.length && (await L.createOnce('pushLog', `${uid}_${L.dkey(today)}_morning`, { uid, at: new Date().toISOString() }))) {
          const names = todays.map((x) => x.name);
          const parts = [];
          if (names.length) parts.push(`${tx.today}: ${names.slice(0, 4).join(', ')}${names.length > 4 ? ' ' + tx.more(names.length - 4) : ''}`);
          if (overdue.length) parts.push(`${tx.late}: ${overdue.length}`);
          if (general.length) parts.push(`${tx.general}: ${general.length}`);
          out.push({ title: tx.morningTitle, body: parts.join(' · '), tag: `morning_${L.dkey(today)}`, url: '/' });
        }
      }

      for (const msg of out) {
        for (const s of byUid[uid]) {
          try {
            const code = await L.sendPush(s.sub, msg);
            if (code === 404 || code === 410) { await L.deleteDoc('pushSubs', s.id); report.removed++; }
            else if (code >= 200 && code < 300) report.sent++;
            else report.errors.push(`push ${code}`);
          } catch (e) { report.errors.push(String(e.message || e)); }
        }
      }
    }
    res.status(200).json(report);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
