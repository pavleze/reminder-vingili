// Firestore usage per day (reads / writes / deletes), for the app owner only — the same numbers as
// Firebase console → Firestore → Usage. GET with header Authorization: Bearer <Firebase ID token>.
// Reads Cloud Monitoring with the service account, which needs the role "Monitoring Viewer" (roles/monitoring.viewer).
// Days follow the free-quota day: it resets at midnight Pacific time.
const L = require('./_lib');

const ADMINS = ['kristinatodorovic2403@gmail.com'];
const LIMITS = { reads: 50000, writes: 20000, deletes: 20000 }; // Spark (free) plan, per day
const METRICS = { reads: 'read_count', writes: 'write_count', deletes: 'delete_count' };
const TZ = 'America/Los_Angeles';
const DAYS = 30;

// UTC instant of the next midnight in TZ
function nextMidnight(now) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((x) => [x.type, x.value]));
  const wall = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  const offset = wall - Math.floor(now.getTime() / 1000) * 1000; // TZ minus UTC, in ms
  return new Date(Date.UTC(+p.year, +p.month - 1, +p.day + 1) - offset);
}
const dayOf = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

async function series(metric, start, end) {
  const qs = new URLSearchParams({
    filter: `metric.type="firestore.googleapis.com/document/${metric}"`,
    'interval.startTime': start.toISOString(), 'interval.endTime': end.toISOString(),
    'aggregation.alignmentPeriod': '86400s', 'aggregation.perSeriesAligner': 'ALIGN_SUM', 'aggregation.crossSeriesReducer': 'REDUCE_SUM',
  });
  const token = await L.accessToken('https://www.googleapis.com/auth/monitoring.read');
  const r = await fetch(`https://monitoring.googleapis.com/v3/projects/${L.projectId()}/timeSeries?${qs}`, { headers: { authorization: `Bearer ${token}` } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error((j.error && j.error.message) || `monitoring ${r.status}`); e.status = r.status; throw e; }
  const out = {};
  for (const ts of j.timeSeries || []) for (const pt of ts.points || []) {
    // a bucket ending at midnight belongs to the day before it
    const day = dayOf(new Date(Date.parse(pt.interval.endTime) - 1000));
    out[day] = (out[day] || 0) + Number(pt.value.int64Value || pt.value.doubleValue || 0);
  }
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const claims = await L.verifyIdTokenClaims(String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')).catch(() => null);
    if (!claims || !claims.email_verified || !ADMINS.includes(String(claims.email || '').toLowerCase())) return res.status(403).json({ error: 'forbidden' });
    const now = new Date(); const end = nextMidnight(now); const start = new Date(end.getTime() - DAYS * 864e5);
    let got;
    try {
      got = await Promise.all(Object.values(METRICS).map((m) => series(m, start, end)));
    } catch (e) {
      // tell the owner what to switch on, without exposing anything secret (the service-account email is not a secret)
      const sa = (() => { try { return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).client_email; } catch (x) { return null; } })();
      const code = e.status === 403 && /has not been used|is disabled|SERVICE_DISABLED/i.test(e.message) ? 'monitoring_api_off' : e.status === 403 ? 'monitoring_denied' : 'monitoring_error';
      return res.status(200).json({ error: code, detail: String(e.message).slice(0, 300), serviceAccount: sa, project: L.projectId() });
    }
    const keys = Object.keys(METRICS); const days = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const day = dayOf(new Date(end.getTime() - 1000 - i * 864e5));
      const row = { day }; keys.forEach((k, n) => { row[k] = got[n][day] || 0; });
      days.push(row);
    }
    res.status(200).json({ limits: LIMITS, resetAt: end.toISOString(), days });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
