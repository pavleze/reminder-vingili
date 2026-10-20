# Handoff — Todays / Reminder web app

_Stanje na dan 19. 10. 2026._

## Šta je ovo
Web verzija stare Flutter/Android aplikacije **Reminder** (Scampy Software Solutions), prepravljena u jednostavniju aplikaciju za
dnevne zadatke, događaje i liste koju koriste dve osobe (Kristina + partner), sa deljenjem stavki.

- **Repo:** `github.com/pavleze/reminder-vingili` (grana `main`; svaki push → Vercel deploy)
- **Sajt:** https://reminder-vingili.vercel.app
- **Firebase projekat:** `reminder-c29a5` (isti kao stara Android aplikacija `com.scumpy.reminder`)
- **Lokalna kopija:** `C:\Users\krist\Desktop\projects\reminder\reminder-web` (stara Flutter app: `...\reminder\reminder-reminder-feature`)

## Tehnika
- Vanilla JS + CSS, **bez framework-a i bez build alata** (statični fajlovi).
- Izvor: `src/head.html` (title, fontovi, sav CSS) i `src/app.js` (sva logika, jedan IIFE).
- `python build.py` → generiše `index.html` (za Vercel/lokalno), `app.html` (fragment za Claude artifact) i kopira `app.js`;
  automatski skuplja nazive Material Symbols ikonica za Google Fonts URL (nove ikonice koje se prosleđuju kao promenljive dodati u listu u `build.py`).
- `i18n.js` — prevodi iz starih `.arb` fajlova (7 jezika); dodatni ključevi su u `EXTRA` na vrhu `app.js` (en + sr, ostali padaju na en).
- **Srpski je podrazumevani jezik.** Zelena tema (`--primary #1E9E6A`), tamna/svetla tema (dugme u gornjoj traci).
- Fontovi: Poppins + Material Symbols Rounded (Google Fonts).

## Dva režima rada (`cloudHost()` u app.js)
1. **Pravi sajt (Vercel, localhost):** Firebase (compat SDK 10.12.2 sa jsDelivr) — Google prijava, email/lozinka, Firestore sinhronizacija.
2. **Claude artifact / iframe / file://:** lokalni demo u `localStorage` (ključ `todays-v3`), demo nalog `demo@reminder.app` / `demo123`.

## Model podataka
Firestore (deli bazu sa starom aplikacijom):
- `users/{uid}` — postojeći profil stare aplikacije (`name`, `email`, `photoUrl`, `language`, `isDarkMode`, `lastLogIn`, stari niz `reminders` — **ne dira se**).
  Web dodaje: `settings`, `emailLower`, `partnerUid` (i `migratedAt` kod naloga prijavljenih dok je prenos još postojao).
- `reminders/{id}` — jedna stavka po dokumentu:
```
{ kind: 'task'|'list', type: 'task'|'event', name, description (UI: "Beleška"),
  date: 'YYYY-MM-DD'|'' , anchor? (početak ponavljanja za stavke bez datuma), time: 'HH:MM'|'',
  important, repeat: { type: 'none'|'interval'|'weekdays'|'monthday', every, unit: 'day'|'week'|'month'|'year', days:[0-6, pon=0], monthDay },
  items: [{id,text}],                 // lista
  done:   { 'YYYY-MM-DD': true, any?: 'YYYY-MM-DD' },   // 'any' = stavka bez datuma (vrednost = dan završetka)
  checks: { 'YYYY-MM-DD'|'any': [itemId] }, doneAt?, lateDoneOn?,
  owner: uid, members: [uid, partnerUid?], createdAt, updatedAt }
```
- Pravila: `firestore.rules` (pokriva `users`, `reminders`, `feedback` za obe aplikacije). Svaki prijavljen korisnik može da čita profile u `users` (zbog traženja partnera po emailu).
- `syncCloud()` poredi JSON svake stavke sa poslednjim snapshotom i upisuje samo izmene; brisanje: vlasnik briše dokument, partner samo sebe skida iz `members`.

## Funkcije (stanje UI-ja)
- **Početna:** pozdrav, „Danas“, krug napretka (zadaci + liste-zadaci + zakasneli), filter *Sve / Zadaci / Događaji*,
  stavke za danas (zakasneli jednokratni na vrhu sa „(kasni N dana)“ desno), „Bez datuma“, „Urađeno“ (čekirano ide dole). „+“ dole desno.
- **Forma:** prekidač *Pojedinačno | Lista*, Naziv + Tip (Zadatak/Događaj), stavke (lista), „Dodaj datum“ (native date picker, prikaz „3. dec 2026.“),
  vreme (opciono, samo uz datum ili ponavljanje), Ponavljanje, Beleška, Važno, „Podeli sa: {partner}“ (kad postoji partner).
- **Liste:** okrugli „pizza“ indikator (parče po stavci); lista-događaj ima tačke umesto čekboksova i ne ulazi u krug.
- **Kalendar:** *Kalendar | Lista*. Mesec preko celog ekrana, uspravni dani sa obojenim trakama (zeleno zadatak, ljubičasto događaj, plavo lista), prošli dani sivi;
  klik na dan → dijalog. Lista: „Bez datuma“ na vrhu, pa od sutra 30 dana (+„Prikaži još“), ponavljajuće samo sledeći termin, tanke pune trake sa datumom (sticky).
- **Profil:** Partner (povezivanje po emailu), Nalog (podaci/statistika, sigurnost, povezani nalozi, povratne informacije, brisanje), Obaveštenja, Jezik, Izgled (samo tamni režim), Zasluge.
- **Obaveštenja:** samo dok je aplikacija otvorena (in-app + Notification API, zvuk, odlaganje 10 min). Push kad je zatvorena — **nije urađeno**.
- Pamti ekran/skrol između osvežavanja (`localStorage` ključ `todays-ui`). Zum na telefonu isključen.

## Podešavanje (urađeno)
- Firebase Authorized domains: `reminder-vingili.vercel.app` ✅
- Firestore Rules iz `firestore.rules` ✅
- Google Cloud → „Web client (auto created by Google Service)“: JS origin `https://reminder-vingili.vercel.app`, redirect URI `https://reminder-vingili.vercel.app/__/auth/handler` ✅
- Prijava: u pregledaču koristi `reminder-c29a5.firebaseapp.com` (popup); u iPhone „Add to Home Screen“ aplikaciji koristi sopstveni domen + redirect (`vercel.json` prosleđuje `/__/auth/*`).

## Otvoreno / sledeći koraci
1. **Google prijava radi samo za neke emailove** → verovatno OAuth consent screen u režimu *Testing*: Google Cloud → OAuth consent screen / Audience → **Publish app** (ili dodati test korisnike). Proveriti da li je neki email Workspace (admin može da blokira).
2. **Push obaveštenja** kad je app zatvorena: manifest + service worker (PWA), FCM web push (VAPID ključ), Vercel funkcija `/api/send-due` + spoljni cron svakog minuta (Vercel Hobby cron je samo 1×/dan).
3. **PWA:** `manifest.json` + ikonice za početni ekran iPhone-a (trenutno nema manifesta).
4. Možda: dugme za brisanje starih podsetnika prenetih iz Android app-a (polje `legacyUid`/`source: 'android'`) kod naloga koji su se prijavili pre isključivanja prenosa.
5. Sačuvano u `git stash` (lokalno u sesiji, nije na GitHubu): kompaktni mesečni kalendar za telefon (tačkice + spisak izabranog dana ispod). Korisnica ga je odbila za sada.
6. Ostatak engleskog na srpskom UI-ju: naslov forme „Novi task / Izmeni task“, statistika „Taskovi“ → predloženo „zadatak/Zadaci“ (čeka odgovor).

## Kako testirati
- `python -m http.server 8080` u repou → http://localhost:8080 (localhost = cloud režim; bez interneta pada na lokalni).
- Za proveru bez pravog Firebase-a korišćen je in-memory stub Firebase compat API-ja (Playwright route na jsDelivr URL) — nije u repou.

## Saradnja sa korisnicom
- Komunikacija na srpskom; voli male, česte izmene i kratke potvrde. Posle svake izmene: commit + push na `main` (Vercel), ažurirati Claude artifact i lokalni folder.

## Push notifications (live since 2026-10-20)
- PWA: `manifest.webmanifest`, `sw.js` (offline cache + `push` / `notificationclick`), icons in `assets/` (green R + bell).
- Devices: Profile → Obaveštenja → Uključi saves a Web Push subscription to Firestore `pushSubs/{sha1(endpoint)}` ({uid, sub, tz}).
- Server (no npm deps, Firestore REST + VAPID/aes128gcm with Node crypto, verified against RFC 8291):
  - `api/cron.js?key=CRON_SECRET`, called every minute by cron-job.org. It sends item reminders (`it.remind` = minutes before; -1 = off) and the morning summary (`settings.notif.morning`, `morningTime`). Each notification is sent once, deduplicated by `pushLog/{key}`.
  - `api/notify-share.js`: when a shared item is added or edited, the partner gets "<Ime>: nova/izmenjena stavka". It checks the Firebase ID token and membership. The partner can turn this off with `settings.notif.shared`.
  - `api/push-test.js`: the "Pošalji probno obaveštenje" button.
- Vercel env (Production): `FIREBASE_SERVICE_ACCOUNT` (service-account JSON), `VAPID_PRIVATE_KEY`, `CRON_SECRET`. VAPID public key is hard-coded in `src/app.js` and `api/_lib.js`.
- Firestore rules: `pushSubs` added (see `firestore.rules`).
- iPhone: push only works when the app is opened from the Home Screen (iOS 16.4+).
- Health check: open `/api/cron?key=…` and expect `{"users":N,"sent":…,"errors":[]}`. A 401 response lists which env vars are present.
