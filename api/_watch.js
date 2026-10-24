// Product watch ("Praćenje"): is an IKEA product back in stock, for home delivery and in the store?
// Reads the product page (name, image, price, schema.org availability) and IKEA's own availability service.
const L = require('./_lib');

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IKEA_CLIENT_ID = 'b6c117e5-ae61-4ef5-b4cc-e0b1e37f0631'; // public id the ikea.com pages send with the same request
const EVERY = 150 * 60e3; // re-check after 2.5 h

// https://www.ikea.com/rs/sr/p/<name>-50636918/ → { country: 'rs', lang: 'sr', itemNo: '50636918' } (s-prefixed = combination)
function parseIkeaUrl(raw) {
  let u; try { u = new URL(String(raw).trim()); } catch (e) { return null; }
  if (!/(^|\.)ikea\.com$/.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/([a-z]{2})\/([a-z]{2})\/p\/.*?-(s?\d{8})\/?$/i);
  return m ? { country: m[1].toLowerCase(), lang: m[2].toLowerCase(), itemNo: m[3].toLowerCase(), url: `https://www.ikea.com${u.pathname}` } : null;
}

async function get(url, headers) {
  const res = await fetch(url, { headers: { 'user-agent': UA, ...headers }, redirect: 'follow', signal: AbortSignal.timeout(7000) });
  return { status: res.status, text: await res.text() };
}
const unesc = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (html, prop) => { const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i')); return m ? unesc(m[1]) : ''; };
// '2999', 2999, '2.999,00', '2,999.00' → 2999
function toNum(v) {
  if (typeof v === 'number') return v;
  let s = String(v).replace(/[^\d.,]/g, '');
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); else s = s.replace(/,/g, '');
  const n = parseFloat(s); return Number.isFinite(n) ? n : null;
}
const fmtPrice = (n, cur) => `${Math.round(n).toLocaleString('sr-RS')} ${cur === 'RSD' || !cur ? 'RSD' : cur}`;
const SCHEMA_IN = /InStock|LimitedAvailability|OnlineOnly|InStoreOnly|PreOrder/i, SCHEMA_OUT = /OutOfStock|SoldOut|Discontinued/i;

function readPage(html) {
  const out = { title: meta(html, 'og:title'), image: meta(html, 'og:image'), price: '', priceNum: null, online: 'unknown' };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let j; try { j = JSON.parse(m[1]); } catch (e) { continue; }
    for (const p of [].concat(j['@graph'] || j)) {
      if (!p || !/Product/i.test([].concat(p['@type']).join(' '))) continue;
      out.title = p.name || out.title;
      out.image = [].concat(p.image || [])[0] || out.image;
      const offer = [].concat(p.offers || [])[0] || {};
      const o = [].concat(offer.offers || offer)[0] || {};
      const pr = o.price != null ? o.price : o.lowPrice;
      if (pr != null) { out.priceNum = toNum(pr); out.currency = o.priceCurrency || ''; }
      const av = String(o.availability || '');
      if (SCHEMA_IN.test(av)) out.online = 'in'; else if (SCHEMA_OUT.test(av)) out.online = 'out';
    }
  }
  if (out.priceNum == null) { const a = meta(html, 'product:price:amount'); if (a) { out.priceNum = toNum(a); out.currency = meta(html, 'product:price:currency'); } }
  if (out.priceNum != null) out.price = fmtPrice(out.priceNum, out.currency);
  return out;
}

// messageType: HIGH_IN_STOCK | LOW_IN_STOCK | OUT_OF_STOCK (quantity, when given, wins)
const stockOf = (a) => {
  if (!a) return 'unknown';
  if (typeof a.quantity === 'number') return a.quantity > 0 ? 'in' : 'out';
  const t = (((a.probability || {}).thisDay || {}).messageType) || '';
  return /IN_STOCK/.test(t) && !/OUT/.test(t) ? 'in' : /OUT_OF_STOCK/.test(t) ? 'out' : 'unknown';
};
function readAvailability(j) {
  const r = { online: 'unknown', store: 'unknown', storeQty: null, restock: null };
  for (const a of j.availabilities || []) {
    const kind = (a.classUnitKey || {}).classUnitType; const bo = a.buyingOption || {};
    if (kind === 'RU' && bo.homeDelivery) {
      const hd = bo.homeDelivery; const s = (hd.range || {}).inRange === false ? 'out' : stockOf(hd.availability);
      if (s !== 'unknown') r.online = s;
    }
    if (kind === 'STO' && bo.cashCarry) {
      const av = bo.cashCarry.availability || {}; const s = stockOf(av);
      if (s === 'in' || r.store === 'unknown') r.store = s; // several stores: in stock in any of them counts
      if (typeof av.quantity === 'number') r.storeQty = (r.storeQty || 0) + Math.max(0, av.quantity);
      const rs = (av.restocks || [])[0]; if (rs && rs.earliestDate && !r.restock) r.restock = rs.earliestDate;
    }
  }
  return r;
}

// → { title, image, price, online, store, storeQty, restock, error, sources }
async function checkIkea(url) {
  const p = parseIkeaUrl(url);
  if (!p) return { online: 'unknown', store: 'unknown', error: 'not an IKEA product link' };
  const res = { title: '', image: '', price: '', priceNum: null, online: 'unknown', store: 'unknown', storeQty: null, restock: null, error: '', sources: {} };
  const [page, api] = await Promise.allSettled([
    get(p.url, { 'accept-language': `${p.lang}-${p.country.toUpperCase()},${p.lang};q=0.9` }),
    get(`https://api.ingka.ikea.com/cia/availabilities/ru/${p.country}?itemNos=${p.itemNo.replace(/^s/, '')}&expand=StoresList,Restocks`, { 'x-client-id': IKEA_CLIENT_ID, accept: 'application/json;version=2' }),
  ]);
  if (page.status === 'fulfilled' && page.value.status < 400) {
    Object.assign(res, readPage(page.value.text)); res.sources.page = `ok (${res.online})`;
  } else res.sources.page = page.status === 'fulfilled' ? `HTTP ${page.value.status}` : String(page.reason && page.reason.message || page.reason);
  if (api.status === 'fulfilled' && api.value.status < 400) {
    let j = null; try { j = JSON.parse(api.value.text); } catch (e) { /* not json */ }
    if (j) {
      const a = readAvailability(j);
      if (a.online !== 'unknown') res.online = a.online; // the service is more precise than the page
      Object.assign(res, { store: a.store, storeQty: a.storeQty, restock: a.restock });
      res.sources.api = `ok (${(j.availabilities || []).length} entries)`;
    } else res.sources.api = 'not json';
  } else res.sources.api = api.status === 'fulfilled' ? `HTTP ${api.value.status}` : String(api.reason && api.reason.message || api.reason);
  if (!res.title) res.title = decodeURIComponent(p.url.split('/p/')[1] || '').replace(/-s?\d{8}\/?$/, '').replace(/-/g, ' ');
  if (res.online === 'unknown' && res.store === 'unknown') res.error = `page: ${res.sources.page}; stock: ${res.sources.api}`;
  return res;
}

const TEXT = {
  sr: { back: 'Ponovo na stanju 🎉', online: 'dostava na kuću', store: 'IKEA robna kuća', pcs: (n) => `${n} kom`, cheaper: 'Cena je pala 💸' },
  en: { back: 'Back in stock 🎉', online: 'home delivery', store: 'IKEA store', pcs: (n) => `${n} pcs`, cheaper: 'Price dropped 💸' },
};

// checks one watch doc, saves the result, and tells its members when something went from "out" to "in"
async function runWatch(w) {
  const r = await checkIkea(w.url);
  // last known state ignores failed checks, so "in → unknown → in" doesn't notify again
  const known = { online: r.online !== 'unknown' ? r.online : w.knownOnline || null, store: r.store !== 'unknown' ? r.store : w.knownStore || null };
  // what to watch is chosen per product: stock (default on) and/or a price drop
  const wantStock = w.notifyStock !== false, wantPrice = !!w.notifyPrice;
  const backOnline = wantStock && w.knownOnline === 'out' && known.online === 'in';
  const backStore = wantStock && w.knownStore === 'out' && known.store === 'in';
  const price = r.priceNum != null ? r.priceNum : w.knownPrice != null ? w.knownPrice : null;
  const cheaper = wantPrice && w.knownPrice != null && r.priceNum != null && r.priceNum < w.knownPrice - 0.5;
  await L.patchDoc('watches', w.id, {
    title: r.title || w.title || '', image: r.image || w.image || '', price: r.price || w.price || '',
    online: r.online, store: r.store, storeQty: r.storeQty, restock: r.restock, error: r.error || '',
    knownOnline: known.online, knownStore: known.store, knownPrice: price, checkedAt: new Date().toISOString(),
    // "was …" stays on the card only while the price is still below it
    ...(cheaper ? { priceWas: fmtPrice(w.knownPrice, r.currency), priceWasNum: w.knownPrice, priceDropAt: new Date().toISOString() }
      : r.priceNum != null && w.priceWasNum != null && r.priceNum >= w.priceWasNum ? { priceWas: '', priceWasNum: null } : {}),
  });
  let sent = 0;
  if ((backOnline || backStore || cheaper) && Array.isArray(w.members)) {
    sent = await L.pushToUids(w.members, (u) => {
      const tx = TEXT[((u.settings || {}).lang) === 'en' ? 'en' : 'sr'];
      const where = [backOnline ? tx.online : '', backStore ? tx.store + (r.storeQty ? ` (${tx.pcs(r.storeQty)})` : '') : ''].filter(Boolean).join(' · ');
      const drop = cheaper ? `${fmtPrice(w.knownPrice, r.currency)} → ${fmtPrice(r.priceNum, r.currency)}` : '';
      return { title: backOnline || backStore ? tx.back : tx.cheaper, body: [r.title || w.title, where, drop].filter(Boolean).join(' · '), tag: `watch_${w.id}`, url: w.url };
    }, `praćenje: ${r.title || w.title}`);
  }
  return { ...r, backOnline, backStore, cheaper, sent };
}

// from the minute cron: a couple of the stalest watches per run, so each one is checked about every 2.5 h
async function runDueWatches(max = 2) {
  const all = await L.listAll('watches');
  const due = all.filter((w) => w.url && (!w.checkedAt || Date.now() - Date.parse(w.checkedAt) > EVERY))
    .sort((a, b) => String(a.checkedAt || '').localeCompare(String(b.checkedAt || ''))).slice(0, max);
  const done = await Promise.allSettled(due.map(runWatch));
  return { checked: due.length, errors: done.filter((x) => x.status === 'rejected').map((x) => String(x.reason && x.reason.message || x.reason)) };
}

module.exports = { parseIkeaUrl, checkIkea, runWatch, runDueWatches, readPage, readAvailability };
