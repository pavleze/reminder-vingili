/* Reminder service worker: the app opens offline, updates arrive on the next open. */
const CACHE = 'reminder-v3';
const CORE = ['/', '/index.html', '/app.js', '/i18n.js', '/manifest.webmanifest', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // never touch sign-in or database traffic
  if (url.pathname.startsWith('/__/') || url.pathname.startsWith('/api/') || /googleapis\.com$|firebaseio\.com$|gstatic\.com$/.test(url.hostname) && !/fonts\./.test(url.hostname)) return;

  const sameOrigin = url.origin === self.location.origin;
  const cacheable = sameOrigin || /^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)$/.test(url.hostname);
  if (!cacheable) return;

  if (sameOrigin) {
    // network first, so a new deploy shows up right away; cache when offline
    e.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('/index.html') : Response.error())))
    );
  } else {
    // fonts and the Firebase SDK are versioned: cache first
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
});

/* Push notifications sent by api/cron.js */
self.addEventListener('push', (e) => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (err) { m = { title: 'Reminder', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(m.title || 'Reminder', {
    body: m.body || '', tag: m.tag || undefined, renotify: !!m.tag, data: { url: m.url || '/' },
    icon: '/assets/icon-192.png', badge: '/assets/icon-192.png',
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
