// Called every 1–5 minutes by an external scheduler (cron-job.org): /api/cron?key=CRON_SECRET
// Sends due reminders, the morning summary and the eDPK reminder as Web Push to every device a person has turned
// notifications on for.
//
// Firestore reads are kept low (Spark plan: 50,000/day): the whole database is read only to build a *plan* — every
// notification due in the next HORIZON minutes — stored in one document, cronState/plan. A normal run reads that one
// document plus a query for profiles changed since the plan was built (the app sets users/{uid}.changedAt after every
// edit); the plan is rebuilt when something changed or after REBUILD_MIN minutes. ?rebuild=1 forces a rebuild,
// ?debug=1 adds the plan to the answer.
const L = require('./_lib');
const W = require('./_watch');

const TEXT = {
  sr: {
    now: (time) => `Sada · ${time}`, before: (lbl, time) => `Za ${lbl} · ${time}`,
    min: (n) => (n >= 1440 ? `${n / 1440} dan` : n >= 60 ? `${n / 60} sat` : `${n} min`),
    edpkTitle: 'Proveri eDPK 🚗', edpkBody: (pl) => `${pl} · dodirni za proveru neplaćenih parking karata`, morningTitle: 'Dobro jutro! ☀️', today: 'Danas', general: 'Opšte', late: 'Kasni', more: (n) => `i još ${n}`,
  },
  en: {
    now: (time) => `Now · ${time}`, before: (lbl, time) => `In ${lbl} · ${time}`,
    min: (n) => (n >= 1440 ? `${n / 1440} day` : n >= 60 ? `${n / 60} hour` : `${n} min`),
    edpkTitle: 'Check eDPK 🚗', edpkBody: (pl) => `${pl} · tap to check unpaid parking tickets`, morningTitle: 'Good morning! ☀️', today: 'Today', general: 'General', late: 'Overdue', more: (n) => `and ${n} more`,
  },
};
const WINDOW = 20; // minutes: a late scheduler run still sends, each notification goes out once
const HORIZON = 30; // minutes ahead the plan covers
const REBUILD_MIN = 15; // rebuild at least this often, even when nothing changed
const WATCH_MIN = 10; // product watches: a batch every 10 minutes
const PLAN_VERSION = 1;

// every notification for one person whose time falls in [now - WINDOW, now + HORIZON]
function planFor(uid, u, mine, now) {
  const st = u.settings || {}; const notif = st.notif || {};
  const tx = TEXT[st.lang === 'en' ? 'en' : 'sr'];
  const { today, min: nowMin } = L.localNow(u.tz || 'Europe/Belgrade', new Date(now));
  const base = now - (now % 60e3); // this minute
  const inRange = (m) => m >= nowMin - WINDOW && m <= nowMin + HORIZON; // m = minutes from today's local midnight
  const at = (m) => base + (m - nowMin) * 60e3;
  const out = [];

  // 1) items with a time: at the time, or N minutes before (it.remind)
  if (notif.reminders !== false) {
    for (const it of mine) {
      if (!it.time) continue;
      for (const remind of L.remindList(it)) for (const off of [-1, 0, 1, 2]) { // a reminder set a day early fires today for tomorrow's item
        const d = L.addDays(today, off);
        const m = off * 1440 + L.timeToMin(it.time) - remind;
        if (!inRange(m)) continue;
        if (!L.occursOn(it, d) || (!L.isEvent(it) && L.isDoneOn(it, d))) continue;
        const list = it.kind === 'list' ? ` · ${L.checkedOn(it, d).length}/${(it.items || []).length}` : '';
        out.push({
          at: at(m), uid, what: it.name, item: it.id, day: L.dkey(d), time: it.time, remind, logId: `${uid}_${it.id}_${L.dkey(d)}_${String(it.time).replace(':', '')}_${remind}`, // a changed time or reminder fires again
          msg: { title: it.name, body: (remind ? tx.before(tx.min(remind), it.time) : tx.now(it.time)) + list, tag: `${it.id}_${L.dkey(d)}_${remind}`, url: '/' },
        });
      }
    }
  }

  for (const off of [-1, 0, 1]) {
    const day = L.addDays(today, off);
    // 2) morning summary: that day's items without a time, overdue ones, open "General" items
    const mm = off * 1440 + L.timeToMin(notif.morningTime || '08:00');
    if (notif.morning !== false && inRange(mm)) {
      const todays = mine.filter((it) => !it.time && L.occursOn(it, day) && !(L.isEvent(it) ? false : L.isDoneOn(it, day)));
      // late: a past one-off, or a repeating task whose last turn was missed (same rule as the app's Home)
      const lateAt = (it) => {
        if (L.isEvent(it) || L.isFloating(it)) return null;
        if (!it.repeat || it.repeat.type === 'none') return it.date && L.fromKey(it.date) < day ? L.fromKey(it.date) : null;
        if (L.occursOn(it, day)) return null;
        for (let i = 1; i <= 366; i++) { const x = L.addDays(day, -i); if (L.occursOn(it, x)) return x; }
        return null;
      };
      const overdue = mine.filter((it) => { const a = lateAt(it); return a && !L.isDoneOn(it, a); });
      const general = mine.filter((it) => L.isFloating(it) && !L.isDoneOn(it, day));
      if (todays.length + overdue.length + general.length) {
        const names = todays.map((x) => x.name); const parts = [];
        if (names.length) parts.push(`${tx.today}: ${names.slice(0, 4).join(', ')}${names.length > 4 ? ' ' + tx.more(names.length - 4) : ''}`);
        if (overdue.length) parts.push(`${tx.late}: ${overdue.length}`);
        if (general.length) parts.push(`${tx.general}: ${general.length}`);
        out.push({ at: at(mm), uid, what: 'morning', logId: `${uid}_${L.dkey(day)}_morning`, msg: { title: tx.morningTitle, body: parts.join(' · '), tag: `morning_${L.dkey(day)}`, url: '/' } });
      }
    }
    // 3) eDPK (Belgrade parking fines): the official check is behind Cloudflare Turnstile, so it can't be queried by the
    //    server — a daily push opens the check page instead (Profile → Parking kazne)
    const ed = st.edpk || {}; const plates = (Array.isArray(ed.plates) ? ed.plates : []).filter(Boolean);
    const em = off * 1440 + L.timeToMin(ed.time || '09:00');
    if (ed.on && plates.length && inRange(em)) {
      out.push({ at: at(em), uid, what: 'edpk', logId: `${uid}_${L.dkey(day)}_edpk`, msg: { title: tx.edpkTitle, body: tx.edpkBody(plates.join(', ')), tag: `edpk_${L.dkey(day)}`, url: 'https://www.parking-servis.co.rs/edpk' } });
    }
  }
  return out;
}

async function buildPlan(now, old) {
  const builtAt = new Date(now - 5e3).toISOString(); // a little early: an edit made while we read is picked up next run
  const [subs, users, items] = await Promise.all([L.listAll('pushSubs'), L.listAll('users'), L.listAll('reminders')]);
  const uids = [...new Set(subs.filter((s) => s.uid && s.sub && s.sub.endpoint).map((s) => s.uid))];
  const userById = Object.fromEntries(users.map((u) => [u.id, u]));
  const sent = new Set(((old && old.entries) || []).filter((e) => e.sent).map((e) => e.logId));
  const entries = [];
  for (const uid of uids) {
    const mine = items.filter((it) => (Array.isArray(it.members) ? it.members.includes(uid) : it.owner === uid));
    for (const e of planFor(uid, userById[uid] || {}, mine, now)) entries.push(sent.has(e.logId) ? { ...e, sent: true } : e);
  }
  entries.sort((a, b) => a.at - b.at);
  return { v: PLAN_VERSION, builtAt, users: uids.length, entries, watchAt: (old && old.watchAt) || null };
}

// one read per notification actually sent: the item must still exist with the same time and reminder, and not be done
async function stillDue(e) {
  const it = await L.getDoc('reminders', e.item).catch(() => null);
  if (!it || it.time !== e.time || !L.remindList(it).includes(e.remind)) return false;
  const d = L.fromKey(e.day);
  if (!(Array.isArray(it.members) ? it.members.includes(e.uid) : it.owner === e.uid)) return false;
  return L.occursOn(it, d) && (L.isEvent(it) || !L.isDoneOn(it, d));
}

module.exports = async (req, res) => {
  const key = String((req.query && req.query.key) || req.headers['x-cron-key'] || '').trim();
  const secret = String(process.env.CRON_SECRET || '').trim().replace(/^["']|["']$/g, '');
  if (!secret || key !== secret) {
    // names only, never values: helps spot a missing or misnamed variable
    const has = (n) => !!String(process.env[n] || '').trim();
    return res.status(401).json({ error: 'unauthorized', env: { CRON_SECRET: has('CRON_SECRET'), VAPID_PRIVATE_KEY: has('VAPID_PRIVATE_KEY'), FIREBASE_SERVICE_ACCOUNT: has('FIREBASE_SERVICE_ACCOUNT') }, vercelEnv: process.env.VERCEL_ENV || null });
  }
  try {
    const now = Date.now();
    const q = req.query || {};
    let plan = await L.getDoc('cronState', 'plan');
    let rebuilt = null;
    if (q.rebuild) rebuilt = 'asked';
    else if (!plan || plan.v !== PLAN_VERSION || !plan.builtAt) rebuilt = 'no plan';
    else if (now - Date.parse(plan.builtAt) > REBUILD_MIN * 60e3) rebuilt = 'age';
    else if ((await L.query('users', [['changedAt', 'GREATER_THAN', { timestampValue: plan.builtAt }]], 1)).length) rebuilt = 'changed';
    if (rebuilt) plan = await buildPlan(now, plan);
    let dirty = !!rebuilt;

    const report = { users: plan.users || 0, sent: 0, removed: 0, errors: [], plan: rebuilt ? `rebuilt (${rebuilt})` : 'kept' };
    const due = (plan.entries || []).filter((e) => !e.sent && e.at <= now && now - e.at <= WINDOW * 60e3);
    const subsCache = {};
    for (const e of due) {
      e.sent = true; dirty = true;
      if (e.item && !(await stillDue(e))) continue; // deleted, moved or checked off since the plan was built
      if (!(await L.createOnce('pushLog', e.logId, { uid: e.uid, at: new Date().toISOString(), what: e.what }))) continue; // already sent
      const subs = subsCache[e.uid] || (subsCache[e.uid] = await L.subsOf(e.uid));
      const results = [];
      for (const s of subs) {
        try {
          const detail = {}; const code = await L.sendPush(s.sub, e.msg, detail);
          results.push(`${new URL(s.sub.endpoint).host} ${code}${detail.text ? ' ' + detail.text : ''}`);
          if (code === 404 || code === 410) { await L.deleteDoc('pushSubs', s.id); report.removed++; }
          else if (code >= 200 && code < 300) report.sent++;
          else report.errors.push(`push ${code}`);
        } catch (err) { report.errors.push(String(err.message || err)); results.push('error ' + String(err.message || err).slice(0, 150)); }
      }
      await L.patchDoc('pushLog', e.logId, { result: results.join(' | ') || 'no devices' }).catch(() => {});
    }

    // product watches ("Praćenje"): a few every WATCH_MIN minutes, each re-checked about every 2.5 h
    if (!plan.watchAt || now - Date.parse(plan.watchAt) > WATCH_MIN * 60e3) {
      plan.watchAt = new Date(now).toISOString(); dirty = true;
      report.watches = await W.runDueWatches(3).catch((err) => ({ error: String(err.message || err) }));
    }

    if (dirty) await L.setDoc('cronState', 'plan', plan);
    if (q.debug) report.debug = { builtAt: plan.builtAt, entries: (plan.entries || []).map((e) => ({ at: new Date(e.at).toISOString(), uid: e.uid.slice(0, 6), what: e.what, sent: !!e.sent })) };
    res.status(200).json(report);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
