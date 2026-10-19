/* Reminder — web port of the Flutter app (Scampy Software Solutions).
   Vanilla JS, no build step. Data is stored locally in the browser (localStorage);
   the Store object is the single place to swap in Firebase later. */
(function () {
  'use strict';

  /* ================= i18n ================= */
  const LANGS = [
    { code: 'en', label: 'English' }, { code: 'sr', label: 'Srpski' }, { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' }, { code: 'es', label: 'Español' }, { code: 'it', label: 'Italiano' },
    { code: 'ru', label: 'Русский' },
  ];
  const INTL_LOCALE = { en: 'en-GB', sr: 'sr-Latn-RS', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', it: 'it-IT', ru: 'ru-RU' };

  // Strings that the web version adds on top of the original .arb files.
  const EXTRA = {
    en: {
      welcomeSubtitleAuth: 'Sign in to your account', fullName: 'Full Name', confirmPassword: 'Confirm Password',
      noAccount: "Don't have an account?", registerNow: 'Register', agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
      fillAllFields: 'Please fill all fields', acceptTerms: 'Please accept terms and conditions', wrongCredentials: 'Wrong email or password',
      emailInUse: 'An account with this email already exists', tryDemo: 'Try the demo account',
      demoHint: 'Demo account: demo@reminder.app · password demo123', googleNeedsFirebase: 'Google sign-in needs the Firebase setup (next step). Until then you can continue with the demo account.',
      continueDemo: 'Continue with demo', resetLocalNote: 'This web version stores accounts in your browser, so no email is sent. Set a new password right here.',
      noAccountForEmail: 'No account found for this email', importCalendar: 'Import calendar', importCalendarDesc: 'Import events from an .ics file (Google Calendar, Outlook, Apple)',
      importedN: 'Imported {n} events as reminders', importNone: 'No events found in this file', testNotificationIn: 'Test notification in 5 seconds',
      sampleData: 'You are looking at example reminders.', clearSamples: 'Remove examples', samplesRemoved: 'Example reminders removed',
      search: 'Search reminders', moreN: '+{n} more', today: 'Today', next: 'Next', dontForget: "Don't forget: {name}",
      snooze10: 'Snooze 10 min', done: 'Done', snoozedUntil: 'Snoozed until {time}', reminderSaved: 'Reminder saved', reminderDeleted: 'Reminder deleted',
      markedDone: 'Marked as done', markedUndone: 'Marked as not done', undo: 'Undo', browserNotifications: 'Browser notifications',
      browserNotificationsDesc: 'Show system notifications while Reminder is open in a tab', allow: 'Allow', allowed: 'Allowed', blocked: 'Blocked by the browser',
      notSupported: 'Not available here', completedLabel: 'Completed', importantLabel: 'Important', thisWeek: 'This week',
      comingSoon: 'Coming soon', googleLinked: 'Google account linked', preview: 'Preview', themeFollowsSystem: 'Following your system setting',
      feedbackSent: 'Thanks! Your feedback was saved.', defaultsRestored: 'Default appearance restored', passwordStrength: 'Password strength',
      noResults: 'No reminders match your search', addFirst: 'No reminders yet. Tap the + button to add one!', allCategories: 'All categories',
      libWeb1: 'Vanilla JavaScript (no framework)', libWeb2: 'Google Fonts — Poppins', libWeb3: 'Material Symbols', libWeb4: 'Web Notifications API', libWeb5: 'Browser localStorage',
      thanks1: 'All open source contributors', thanks2: 'Beta testers and supporters', thanks3: 'Everyone who believed in the vision',
      deletedAccount: 'Your account has been deleted.', countReminders: '{n} reminders', ofDone: '{a} of {b}', doneToday: 'done today', webVersion: 'Web version',
      every: 'Every', from: 'from',
    },
    sr: {
      welcomeSubtitleAuth: 'Prijavite se na svoj nalog', fullName: 'Ime i prezime', confirmPassword: 'Potvrdite lozinku',
      noAccount: 'Nemate nalog?', registerNow: 'Registrujte se', agreeTerms: 'Prihvatam Uslove korišćenja i Politiku privatnosti',
      fillAllFields: 'Popunite sva polja', acceptTerms: 'Prihvatite uslove korišćenja', wrongCredentials: 'Pogrešan email ili lozinka',
      emailInUse: 'Nalog sa ovim emailom već postoji', tryDemo: 'Isprobaj demo nalog',
      demoHint: 'Demo nalog: demo@reminder.app · lozinka demo123', googleNeedsFirebase: 'Google prijava zahteva Firebase podešavanje (sledeći korak). Do tada možete nastaviti sa demo nalogom.',
      continueDemo: 'Nastavi sa demo nalogom', resetLocalNote: 'Ova web verzija čuva naloge u pregledaču, pa se email ne šalje. Novu lozinku postavite ovde.',
      noAccountForEmail: 'Ne postoji nalog sa ovim emailom', importCalendar: 'Uvezi kalendar', importCalendarDesc: 'Uvezite događaje iz .ics fajla (Google Calendar, Outlook, Apple)',
      importedN: 'Uvezeno {n} događaja kao podsetnici', importNone: 'U fajlu nema događaja', testNotificationIn: 'Test obaveštenje za 5 sekundi',
      sampleData: 'Gledate primere podsetnika.', clearSamples: 'Ukloni primere', samplesRemoved: 'Primeri podsetnika su uklonjeni',
      search: 'Pretraži podsetnike', moreN: '+{n} još', today: 'Danas', next: 'Sledeće', dontForget: 'Ne zaboravi: {name}',
      snooze10: 'Odloži 10 min', done: 'Gotovo', snoozedUntil: 'Odloženo do {time}', reminderSaved: 'Podsetnik sačuvan', reminderDeleted: 'Podsetnik obrisan',
      markedDone: 'Označeno kao završeno', markedUndone: 'Označeno kao nezavršeno', undo: 'Poništi', browserNotifications: 'Obaveštenja pregledača',
      browserNotificationsDesc: 'Prikaži sistemska obaveštenja dok je Reminder otvoren u kartici', allow: 'Dozvoli', allowed: 'Dozvoljeno', blocked: 'Pregledač je blokirao',
      notSupported: 'Nije dostupno ovde', completedLabel: 'Završeno', importantLabel: 'Važni', thisWeek: 'Ove nedelje',
      comingSoon: 'Uskoro', googleLinked: 'Google nalog povezan', preview: 'Pregled', themeFollowsSystem: 'Prati podešavanje sistema',
      feedbackSent: 'Hvala! Vaše mišljenje je sačuvano.', defaultsRestored: 'Vraćen podrazumevani izgled', passwordStrength: 'Jačina lozinke',
      noResults: 'Nijedan podsetnik ne odgovara pretrazi', addFirst: 'Još nema podsetnika. Dodirnite + da dodate prvi!', allCategories: 'Sve kategorije',
      libWeb1: 'Vanilla JavaScript (bez frameworka)', libWeb2: 'Google Fonts — Poppins', libWeb3: 'Material Symbols', libWeb4: 'Web Notifications API', libWeb5: 'localStorage pregledača',
      thanks1: 'Svim open source saradnicima', thanks2: 'Beta testerima i podržavaocima', thanks3: 'Svima koji su verovali u viziju',
      deletedAccount: 'Vaš nalog je obrisan.', countReminders: '{n} podsetnika', ofDone: '{a} od {b}', doneToday: 'završeno danas', webVersion: 'Web verzija',
      every: 'Svakog', from: 'od',
    },
    de: { search: 'Erinnerungen suchen', today: 'Heute', done: 'Erledigt', snooze10: '10 Min. schlummern', importCalendar: 'Kalender importieren', tryDemo: 'Demo-Konto testen', noAccount: 'Noch kein Konto?', registerNow: 'Registrieren', fullName: 'Vollständiger Name', confirmPassword: 'Passwort bestätigen', dontForget: 'Nicht vergessen: {name}', moreN: '+{n} weitere', reminderSaved: 'Erinnerung gespeichert', reminderDeleted: 'Erinnerung gelöscht', undo: 'Rückgängig', completedLabel: 'Erledigt', doneToday: 'heute erledigt', ofDone: '{a} von {b}' },
    fr: { search: 'Rechercher des rappels', today: "Aujourd'hui", done: 'Terminé', snooze10: 'Reporter 10 min', importCalendar: 'Importer un calendrier', tryDemo: 'Essayer le compte démo', noAccount: "Pas de compte ?", registerNow: "S'inscrire", fullName: 'Nom complet', confirmPassword: 'Confirmer le mot de passe', dontForget: "N'oubliez pas : {name}", moreN: '+{n} de plus', reminderSaved: 'Rappel enregistré', reminderDeleted: 'Rappel supprimé', undo: 'Annuler', completedLabel: 'Terminés', doneToday: "fait aujourd'hui", ofDone: '{a} sur {b}' },
    es: { search: 'Buscar recordatorios', today: 'Hoy', done: 'Hecho', snooze10: 'Posponer 10 min', importCalendar: 'Importar calendario', tryDemo: 'Probar la cuenta demo', noAccount: '¿No tienes cuenta?', registerNow: 'Regístrate', fullName: 'Nombre completo', confirmPassword: 'Confirmar contraseña', dontForget: 'No olvides: {name}', moreN: '+{n} más', reminderSaved: 'Recordatorio guardado', reminderDeleted: 'Recordatorio eliminado', undo: 'Deshacer', completedLabel: 'Completados', doneToday: 'hechos hoy', ofDone: '{a} de {b}' },
    it: { search: 'Cerca promemoria', today: 'Oggi', done: 'Fatto', snooze10: 'Posticipa 10 min', importCalendar: 'Importa calendario', tryDemo: "Prova l'account demo", noAccount: 'Non hai un account?', registerNow: 'Registrati', fullName: 'Nome completo', confirmPassword: 'Conferma password', dontForget: 'Non dimenticare: {name}', moreN: '+{n} altri', reminderSaved: 'Promemoria salvato', reminderDeleted: 'Promemoria eliminato', undo: 'Annulla', completedLabel: 'Completati', doneToday: 'fatti oggi', ofDone: '{a} di {b}' },
    ru: { search: 'Поиск напоминаний', today: 'Сегодня', done: 'Готово', snooze10: 'Отложить на 10 мин', importCalendar: 'Импорт календаря', tryDemo: 'Попробовать демо', noAccount: 'Нет аккаунта?', registerNow: 'Регистрация', fullName: 'Полное имя', confirmPassword: 'Подтвердите пароль', dontForget: 'Не забудьте: {name}', moreN: '+{n} ещё', reminderSaved: 'Напоминание сохранено', reminderDeleted: 'Напоминание удалено', undo: 'Отменить', completedLabel: 'Выполнено', doneToday: 'выполнено сегодня', ofDone: '{a} из {b}' },
  };
  const BASE = window.I18N_BASE || { en: {} };

  function lang() { return settings().lang || 'en'; }
  function t(key, params) {
    const l = lang();
    let s = (BASE[l] && BASE[l][key]) ?? (EXTRA[l] && EXTRA[l][key]) ?? (BASE.en && BASE.en[key]) ?? (EXTRA.en[key]) ?? key;
    if (params) for (const k in params) s = s.split('{' + k + '}').join(params[k]);
    return s;
  }
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const loc = () => INTL_LOCALE[lang()] || 'en-GB';

  /* ================= Constants (from the Flutter app) ================= */
  const CATEGORIES = [
    { key: 'Personal', l10n: 'categoryPersonal', icon: 'person', color: '#8D6E63' },
    { key: 'Home', l10n: 'categoryHome', icon: 'home', color: '#2196F3' },
    { key: 'Work', l10n: 'categoryWork', icon: 'work', color: '#FF9800' },
    { key: 'Family', l10n: 'categoryFamily', icon: 'family_restroom', color: '#E91E63' },
    { key: 'Health', l10n: 'categoryHealth', icon: 'favorite', color: '#F44336' },
    { key: 'Travel', l10n: 'categoryTravel', icon: 'flight', color: '#009688' },
    { key: 'Finance', l10n: 'categoryFinance', icon: 'attach_money', color: '#4CAF50' },
    { key: 'Shopping', l10n: 'categoryShopping', icon: 'shopping_cart', color: '#9C27B0' },
    { key: 'Notes', l10n: 'categoryNotes', icon: 'sticky_note_2', color: '#3F51B5' },
  ];
  const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));
  const catOf = (k) => CAT[k] || { key: k, l10n: 'categoryUncategorized', icon: 'label', color: '#9E9E9E' };
  const catLabel = (k) => (CAT[k] ? t(CAT[k].l10n) : k || t('categoryUncategorized'));
  const PRIORITY_COLORS = { high: '#E53935', medium: '#FB8C00', low: '#43A047' };
  const REPETITIONS = [
    { key: 'daily', l10n: 'daily' }, { key: 'weekly', l10n: 'weekly' }, { key: 'monthly', l10n: 'monthly' },
    { key: 'yearly', l10n: 'yearly' }, { key: 'onetime', l10n: 'oneTime' },
  ];
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const DOW_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const BRAND = '#1E9E6A';
  const COLORS = [
    [BRAND, 'Reminder'], ['#FFE4B5', 'colorMoccasin'], ['#FFF8DC', 'colorCornsilk'], ['#FFC0CB', 'colorPink'], ['#F0BAAC', 'colorLightPink'],
    ['#98FF98', 'colorMint'], ['#AFEEEE', 'colorPaleTurquoise'], ['#FF9800', 'colorOrange'], ['#FFA500', 'colorAmberOrange'],
    ['#F44336', 'colorRed'], ['#DC143C', 'colorCrimson'], ['#800000', 'colorBurgundy'], ['#9C27B0', 'colorPurple'],
    ['#8A2BE2', 'colorBlueViolet'], ['#6A5ACD', 'colorSlateBlue'], ['#2196F3', 'colorBlue'], ['#4682B4', 'colorSteelBlue'],
    ['#00CED1', 'colorDarkTurquoise'], ['#4CAF50', 'colorGreen'], ['#006400', 'colorDarkGreen'], ['#2F4F4F', 'colorCharcoal'],
    ['#000000', 'colorBlack'],
  ];

  /* ================= Utilities ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n, cls = '') => `<span class="ms ${cls}" aria-hidden="true">${n}</span>`;
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => { const [y, m, d] = String(k).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const todayD = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const weekdayIdx = (d) => (d.getDay() + 6) % 7; // Monday = 0
  const timeToMin = (hhmm) => { const [h, m] = String(hhmm || '00:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  function fmtTime(hhmm) {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    return new Intl.DateTimeFormat(loc(), { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, h, m));
  }
  const fmtDate = (d, opts) => new Intl.DateTimeFormat(loc(), opts || { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  const weekdayName = (i, style = 'long') => new Intl.DateTimeFormat(loc(), { weekday: style }).format(new Date(2024, 0, 1 + i)); // 2024-01-01 is Monday
  function hexToRgb(hex) { const h = hex.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); }
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
  function lum(hex) { const c = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function contrast(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  function mix(a, b, w) { const x = hexToRgb(a), y = hexToRgb(b); return rgbToHex(x[0] * (1 - w) + y[0] * w, x[1] * (1 - w) + y[1] * w, x[2] * (1 - w) + y[2] * w); }
  const initials = (name) => (String(name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('') || '?').toUpperCase();
  async function hashPw(pw) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('reminder::' + pw));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 5381; for (const ch of 'reminder::' + pw) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0; return 'x' + h.toString(16);
    }
  }
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  /* ================= Store (swap for Firebase later) ================= */
  const KEY = 'reminder-web-v1';
  const defaultSettings = () => ({
    lang: (() => { const n = (navigator.language || 'en').slice(0, 2).toLowerCase(); if (['sr', 'hr', 'bs', 'me'].includes(n)) return 'sr'; return LANGS.some((l) => l.code === n) ? n : 'en'; })(),
    dark: null, primary: BRAND, reduceMotion: false,
    notif: { reminders: true, snooze: true, sound: true },
  });
  let DB = null;
  function load() {
    try { DB = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { DB = null; }
    if (!DB || typeof DB !== 'object' || !DB.users) DB = { users: {}, session: null, guest: defaultSettings(), fired: {}, feedback: [], seeded: false };
    DB.fired = DB.fired || {}; DB.feedback = DB.feedback || [];
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* storage unavailable: keep in memory */ } }
  const me = () => (DB.session && DB.users[DB.session]) || null;
  const settings = () => (me() ? me().settings : DB.guest);
  const reminders = () => (me() ? me().reminders : []);
  const findUserByEmail = (email) => Object.values(DB.users).find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());

  function newUser({ name, email, passHash, provider = 'password' }) {
    const uid = uuid().replace(/-/g, '').slice(0, 28);
    const now = new Date().toISOString();
    const s = { ...defaultSettings(), ...DB.guest, notif: { ...DB.guest.notif } };
    const u = { uid, name, email, passHash, provider, googleLinked: provider === 'google', createdAt: now, lastLogin: now, settings: s, reminders: [] };
    DB.users[uid] = u; return u;
  }

  function seedDemo() {
    let u = findUserByEmail('demo@reminder.app');
    if (u) return u;
    u = newUser({ name: 'Demo', email: 'demo@reminder.app', passHash: null });
    u.demo = true;
    u.createdAt = addDays(new Date(), -42).toISOString();
    u.reminders = sampleReminders(u.settings.lang);
    return u;
  }
  function sampleReminders(l) {
    const sr = l === 'sr';
    const T = todayD();
    const start = dkey(addDays(T, -30));
    const created = addDays(new Date(), -30).toISOString();
    const w = (n) => WEEKDAYS[weekdayIdx(addDays(T, n))];
    const mk = (o) => ({
      uid: uuid(), description: '', type: 'task', priority: 'medium', repetitionTime: 'onetime', category: 'Personal',
      dayOfMonth: null, dayOfWeek: null, oneTimeDate: null, notificationTime: '09:00', location: '', hasNotification: true,
      isImportant: false, status: 'active', completedDates: [], createdAt: created, startDate: start, sample: true, ...o,
    });
    const list = [
      mk({ name: sr ? 'Jutarnji trening' : 'Morning workout', description: sr ? '20 min istezanje + 5 km trčanja' : '20 min stretching + 5 km run', repetitionTime: 'daily', category: 'Health', notificationTime: '07:30', completedDates: [dkey(T)] }),
      mk({ name: sr ? 'Sastanak tima' : 'Team stand-up', type: 'event', priority: 'high', repetitionTime: 'weekly', dayOfWeek: w(1), category: 'Work', notificationTime: '10:00', location: 'Zoom' }),
      mk({ name: sr ? 'Plati kiriju' : 'Pay the rent', priority: 'high', isImportant: true, repetitionTime: 'monthly', dayOfMonth: addDays(T, 2).getDate(), category: 'Finance', notificationTime: '12:00' }),
      mk({ name: sr ? 'Mamin rođendan' : "Mom's birthday", type: 'event', isImportant: true, repetitionTime: 'yearly', oneTimeDate: dkey(addDays(T, 5)), category: 'Family', notificationTime: '09:00', description: sr ? 'Naruči tortu kod Mladena' : 'Order the cake' }),
      mk({ name: sr ? 'Kupi namirnice' : 'Buy groceries', priority: 'low', oneTimeDate: dkey(T), category: 'Shopping', notificationTime: '18:00', description: sr ? 'Mleko, hleb, jaja, paradajz, kafa' : 'Milk, bread, eggs, tomatoes, coffee' }),
      mk({ name: sr ? 'Zalij biljke' : 'Water the plants', priority: 'low', repetitionTime: 'weekly', dayOfWeek: w(0), category: 'Home', notificationTime: '19:00' }),
      mk({ name: sr ? 'Zubar' : 'Dentist appointment', type: 'event', oneTimeDate: dkey(addDays(T, 3)), category: 'Health', notificationTime: '14:30', location: sr ? 'Bulevar oslobođenja 12' : 'Main Street 12' }),
      mk({ name: sr ? 'Let za Rim' : 'Flight to Rome', type: 'event', priority: 'high', isImportant: true, oneTimeDate: dkey(addDays(T, 12)), category: 'Travel', notificationTime: '06:15', location: sr ? 'Aerodrom Nikola Tesla' : 'Airport, Terminal 2' }),
      mk({ name: sr ? 'Pročitaj 20 strana' : 'Read 20 pages', priority: 'low', repetitionTime: 'daily', category: 'Personal', notificationTime: '21:30' }),
      mk({ name: sr ? 'Ideje za projekat' : 'Project ideas', oneTimeDate: dkey(addDays(T, 1)), category: 'Notes', notificationTime: '11:00', hasNotification: false, description: sr ? 'Web verzija Reminder aplikacije, deljeni podsetnici, widget' : 'Reminder web version, shared reminders, widget' }),
      mk({ name: sr ? 'Servis automobila' : 'Car service', priority: 'medium', oneTimeDate: dkey(addDays(T, -4)), category: 'Personal', notificationTime: '08:00', status: 'completed' }),
    ];
    return list;
  }

  /* ================= Recurrence ================= */
  function occursOn(r, d) {
    const start = r.startDate ? fromKey(r.startDate) : (r.createdAt ? fromKey(r.createdAt.slice(0, 10)) : null);
    const after = !start || d >= start;
    switch (r.repetitionTime) {
      case 'onetime': return r.oneTimeDate ? sameDay(fromKey(r.oneTimeDate), d) : false;
      case 'daily': return after;
      case 'weekly': return after && WEEKDAYS[weekdayIdx(d)] === r.dayOfWeek;
      case 'monthly': {
        if (!after || !r.dayOfMonth) return false;
        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        return d.getDate() === Math.min(Number(r.dayOfMonth), last);
      }
      case 'yearly': { if (!r.oneTimeDate) return false; const a = fromKey(r.oneTimeDate); return a.getMonth() === d.getMonth() && a.getDate() === d.getDate(); }
      case 'custom': return after && Array.isArray(r.customDays) && r.customDays.includes(weekdayIdx(d) + 1);
      default: return false;
    }
  }
  const isDoneOn = (r, d) => (r.repetitionTime === 'onetime' ? r.status === 'completed' : (r.completedDates || []).includes(dkey(d)));
  function nextOccurrence(r, from = todayD()) {
    for (let i = 0; i < 400; i++) { const d = addDays(from, i); if (occursOn(r, d)) return d; }
    return r.oneTimeDate ? fromKey(r.oneTimeDate) : null;
  }
  const byTime = (a, b) => timeToMin(a.notificationTime) - timeToMin(b.notificationTime);
  function remindersOn(d, list = reminders()) { return list.filter((r) => occursOn(r, d)).sort(byTime); }
  function repetitionText(r) {
    switch (r.repetitionTime) {
      case 'daily': return t('daily');
      case 'weekly': return `${t('weekly')} · ${cap(weekdayName(WEEKDAYS.indexOf(r.dayOfWeek), 'short'))}`;
      case 'monthly': return `${t('monthly')} · ${r.dayOfMonth}.`;
      case 'yearly': return r.oneTimeDate ? `${t('yearly')} · ${fmtDate(fromKey(r.oneTimeDate), { day: 'numeric', month: 'short' })}` : t('yearly');
      case 'onetime': return t('oneTime');
      default: return t('custom');
    }
  }

  /* ================= Theme ================= */
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function isDark() {
    const s = settings();
    if (s.dark === true || s.dark === false) return s.dark;
    const host = document.documentElement.getAttribute('data-theme');
    if (host === 'dark') return true; if (host === 'light') return false;
    return mql ? mql.matches : true;
  }
  function applyTheme() {
    const s = settings(); const root = document.documentElement; const dark = isDark();
    root.setAttribute('data-app-theme', dark ? 'dark' : 'light');
    root.setAttribute('data-motion', s.reduceMotion ? 'reduce' : 'full');
    root.lang = s.lang === 'sr' ? 'sr-Latn' : s.lang;
    const p = BRAND; const bg = dark ? '#08110c' : '#f5faf6';
    root.style.setProperty('--primary', p);
    root.style.setProperty('--on-primary', contrast(p, '#ffffff') >= 2.6 ? '#ffffff' : '#141416');
    let ink = p; let i = 0;
    while (contrast(ink, bg) < 3.2 && i < 10) { ink = mix(ink, dark ? '#ffffff' : '#000000', 0.12); i++; }
    root.style.setProperty('--primary-ink', ink);
    root.style.setProperty('--primary-strong', lum(p) < 0.03 ? mix(p, '#ffffff', 0.18) : mix(p, '#000000', 0.22));
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', p);
  }
  if (mql && mql.addEventListener) mql.addEventListener('change', () => { if (settings().dark == null) { applyTheme(); } });

  /* ================= UI state & router ================= */
  const ui = {
    auth: 'login', tab: 'home', stack: [], cat: 'All', remTab: 'calendar', calMonth: todayD(), expanded: new Set(), q: '',
    showPw: {}, splash: false,
  };
  function go(name, params = {}) { ui.stack.push({ name, params }); render(); scrollTop(); }
  function back() { ui.stack.pop(); render(); }
  function setTab(tab) { ui.tab = tab; ui.stack = []; render(); scrollTop(); }
  function scrollTop() { const s = $('.scroller'); if (s) s.scrollTop = 0; }

  /* ================= Toasts ================= */
  function toast(msg, opts = {}) {
    const box = $('#toasts'); if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast' + (opts.error ? ' err' : '');
    el.innerHTML = `${icon(opts.error ? 'error' : (opts.icon || 'check_circle'), 'sm')}<span style="flex:1">${esc(msg)}</span>` + (opts.action ? `<button class="btn btn-text btn-sm" style="color:var(--primary)">${esc(opts.action.label)}</button>` : '');
    if (opts.action) el.querySelector('button').addEventListener('click', () => { opts.action.run(); el.remove(); });
    box.appendChild(el);
    setTimeout(() => el.remove(), opts.ms || 3600);
  }

  /* ================= Render ================= */
  const app = () => $('#app');
  function render() {
    applyTheme();
    if (ui.splash) return;
    const u = me();
    if (!u) { app().innerHTML = renderAuth(); bindAfterRender(); return; }
    const top = ui.stack[ui.stack.length - 1];
    const screen = top ? SCREENS[top.name] : TABS[ui.tab];
    const view = screen(top ? top.params : {});
    app().innerHTML = `
      <div class="shell">
        ${renderRail()}
        <div class="main">
          <header class="topbar">
            ${top ? `<button class="icon-btn" data-a="back" aria-label="Back">${icon('arrow_back')}</button>` : ''}
            <h1>${esc(view.title)}</h1>
            ${view.actions || ''}
          </header>
          <div class="scroller"><main class="content ${view.narrow ? 'narrow' : ''}">${view.html}</main></div>
          ${renderBottomNav()}
        </div>
        ${view.fabs ? `<div class="fabs">${view.fabs}</div>` : ''}
      </div>`;
    bindAfterRender();
  }
  function renderRail() {
    const u = me();
    const item = (tab, ic, label) => `<button class="nav" data-a="tab" data-tab="${tab}" ${ui.tab === tab && !ui.stack.length ? 'aria-current="page"' : ''}>${icon(ic, ui.tab === tab ? 'fill' : '')}${esc(label)}</button>`;
    return `<nav class="rail" aria-label="Main">
      <div class="rail-logo"><img src="assets/logo.svg" alt="Reminder"></div>
      <button class="btn btn-primary rail-add" data-a="add">${icon('add')}${esc(t('addReminder'))}</button>
      ${item('home', 'home', t('navHome'))}${item('reminders', 'calendar_month', t('calendarTab'))}${item('profile', 'person', t('navProfile'))}
      <div class="spacer"></div>
      <div class="rail-user">${avatarHtml(u, 'sm')}<div><b>${esc(u.name || t('noName'))}</b><small>${esc(u.email)}</small></div></div>
    </nav>`;
  }
  function renderBottomNav() {
    const item = (tab, ic, label) => `<button data-a="tab" data-tab="${tab}" ${ui.tab === tab ? 'aria-current="page"' : ''}><span class="pill">${icon(ic, ui.tab === tab ? 'fill' : '')}</span>${esc(label)}</button>`;
    return `<nav class="bottomnav" aria-label="Main">${item('home', 'home', t('navHome'))}${item('reminders', 'calendar_month', t('calendarTab'))}${item('profile', 'person', t('navProfile'))}</nav>`;
  }
  function avatarHtml(u, size = '') {
    if (u && u.photo) return `<div class="avatar ${size}"><img src="${esc(u.photo)}" alt=""></div>`;
    return `<div class="avatar ${size}" aria-hidden="true">${esc(initials(u && u.name))}</div>`;
  }

  /* ---------- Auth screens ---------- */
  function field({ id, label, type = 'text', ic, value = '', auto = '', pwToggle = false, extra = '' }) {
    const isPw = type === 'password';
    const shown = isPw && ui.showPw[id];
    return `<div class="field">${ic ? icon(ic) : ''}<label for="${id}">${esc(label)}</label>
      <input id="${id}" name="${id}" type="${shown ? 'text' : type}" value="${esc(value)}" ${auto ? `autocomplete="${auto}"` : ''} ${extra}>
      ${pwToggle ? `<button type="button" class="icon-btn" data-a="pw-toggle" data-id="${id}" aria-label="Show password" style="color:var(--primary-ink)">${icon(shown ? 'visibility_off' : 'visibility')}</button>` : ''}</div>`;
  }
  function renderAuth() {
    if (ui.auth === 'register') {
      return `<div class="auth"><form class="auth-card" id="register-form" novalidate>
        <img class="auth-logo" src="assets/logo.svg" alt="Reminder">
        <h1>${esc(t('createAccount'))}</h1>
        ${field({ id: 'reg-name', label: t('fullName'), ic: 'person', auto: 'name' })}
        ${field({ id: 'reg-email', label: t('email'), type: 'email', ic: 'mail', auto: 'email' })}
        ${field({ id: 'reg-pass', label: t('password'), type: 'password', ic: 'lock', auto: 'new-password', pwToggle: true })}
        ${field({ id: 'reg-pass2', label: t('confirmPassword'), type: 'password', ic: 'lock_reset', auto: 'new-password', pwToggle: true })}
        <label class="check"><input type="checkbox" id="reg-terms"><span>${esc(t('agreeTerms'))}</span></label>
        <button class="btn btn-primary btn-block" type="submit">${esc(t('register'))}</button>
        <div class="divider">${esc(t('or'))}</div>
        <button class="btn btn-plain btn-block" type="button" data-a="google">${icon('account_circle')}${esc(t('signInWithGoogle'))}</button>
        <p class="auth-foot"><button type="button" class="link" data-a="auth" data-v="login">${esc(t('haveAccount'))}</button></p>
      </form></div>`;
    }
    if (ui.auth === 'forgot') {
      return `<div class="auth"><form class="auth-card" id="forgot-form" novalidate>
        <img class="auth-logo" src="assets/logo.svg" alt="Reminder">
        <h1>${esc(t('resetPasswordTitle'))}</h1>
        <p class="lead">${esc(t('resetLocalNote'))}</p>
        ${field({ id: 'fp-email', label: t('email'), type: 'email', ic: 'mail', auto: 'email' })}
        ${field({ id: 'fp-pass', label: t('newPasswordLabel'), type: 'password', ic: 'lock', auto: 'new-password', pwToggle: true })}
        <button class="btn btn-primary btn-block" type="submit">${esc(t('changePasswordButton'))}</button>
        <p class="auth-foot"><button type="button" class="link" data-a="auth" data-v="login">${icon('arrow_back', 'xs')} ${esc(t('signIn'))}</button></p>
      </form></div>`;
    }
    return `<div class="auth"><form class="auth-card" id="login-form" novalidate>
      <img class="auth-logo" src="assets/logo.svg" alt="Reminder">
      <h1>${esc(t('welcomeBack'))}</h1>
      <p class="lead">${esc(t('welcomeSubtitleAuth'))}</p>
      ${field({ id: 'login-email', label: t('email'), type: 'email', ic: 'mail', auto: 'email' })}
      ${field({ id: 'login-pass', label: t('password'), type: 'password', ic: 'lock', auto: 'current-password', pwToggle: true })}
      <div class="row-end"><button type="button" class="link" data-a="auth" data-v="forgot">${esc(t('forgotPassword'))}</button></div>
      <button class="btn btn-primary btn-block" type="submit">${esc(t('signIn'))}</button>
      <div class="divider">${esc(t('or'))}</div>
      <button class="btn btn-plain btn-block" type="button" data-a="google">${icon('account_circle')}${esc(t('signInWithGoogle'))}</button>
      <button class="btn btn-tonal btn-block" type="button" data-a="demo">${icon('play_circle')}${esc(t('tryDemo'))}</button>
      <p class="auth-foot">${esc(t('noAccount'))} <button type="button" class="link" data-a="auth" data-v="register">${esc(t('registerNow'))}</button></p>
      <p class="demo-hint">${esc(t('demoHint'))}</p>
    </form></div>`;
  }

  /* ---------- Home ---------- */
  function todayCard(r) {
    const d = todayD(); const done = isDoneOn(r, d); const c = catOf(r.category);
    return `<div class="today-card ${done ? 'done' : ''}">
      <button class="icon-btn check-btn ${done ? 'on' : ''}" data-a="toggle-done" data-id="${r.uid}" aria-label="${esc(t('complete'))}">${icon(done ? 'check_circle' : 'radio_button_unchecked', done ? 'fill lg' : 'lg')}</button>
      <div class="body" data-a="edit" data-id="${r.uid}" style="cursor:pointer">
        <span class="title">${r.isImportant ? `<span class="star">${icon('star', 'fill xs')}</span> ` : ''}${esc(r.name)}</span>
        <span class="when tnum">${icon('schedule', 'xs')}${esc(fmtTime(r.notificationTime))}<span class="cat"><span class="dot" style="background:${c.color}"></span>${esc(catLabel(r.category))}</span></span>
      </div>
      <span class="chip">${esc(t(REPETITIONS.find((x) => x.key === r.repetitionTime)?.l10n || 'custom'))}</span>
    </div>`;
  }
  function screenHome() {
    const u = me(); const d = todayD();
    const today = remindersOn(d);
    const doneN = today.filter((r) => isDoneOn(r, d)).length;
    const pct = today.length ? Math.round((doneN / today.length) * 100) : 0;
    const first = (u.name || '').split(' ')[0];
    const counts = {}; reminders().forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    const hasSamples = reminders().some((r) => r.sample);
    const html = `
      <section class="welcome">
        <div class="txt"><h2>${esc(t('welcomeBack'))}${first ? ', ' + esc(first) : ''}!</h2><p>${esc(t('homeSubtitleLoggedIn'))}</p></div>
        <div class="ring" style="--p:${pct}" role="img" aria-label="${esc(t('ofDone', { a: doneN, b: today.length }))} ${esc(t('doneToday'))}"><div><span><b class="tnum">${doneN}/${today.length}</b><br><small>${esc(t('doneToday'))}</small></span></div></div>
      </section>
      ${hasSamples ? `<div class="banner">${icon('info')}<p>${esc(t('sampleData'))}</p><button class="btn btn-text btn-sm" data-a="clear-samples">${esc(t('clearSamples'))}</button></div>` : ''}
      <div class="stack">
        <section class="stack" aria-labelledby="today-h">
          <button class="btn btn-primary btn-block" data-a="add">${icon('add')}${esc(t('addReminder'))}</button>
          <div class="section-head"><h2 id="today-h">${esc(t('today'))}</h2><span class="meta">${esc(cap(fmtDate(d, { day: 'numeric', month: 'long', year: 'numeric' })))}</span></div>
          ${today.length ? today.map(todayCard).join('') : `<div class="empty">${icon('notifications', 'xl')}<span>${esc(t('noRemindersToday'))}</span><button class="btn btn-tonal btn-sm" data-a="add">${icon('add', 'sm')}${esc(t('addReminder'))}</button></div>`}
        </section>
      </div>`;
    const fabs = `
      <button class="fab secondary" data-a="test-notif" title="${esc(t('testNotificationTitle'))}">${icon('notification_add')}<span class="fab-label">${esc(t('testNotificationTitle'))}</span></button>
      <button class="fab secondary" data-a="import-ics" title="${esc(t('importCalendarDesc'))}">${icon('calendar_add_on')}<span class="fab-label">${esc(t('importCalendar'))}</span></button>`;
    return { title: t('homeTitle'), html, fabs, actions: avatarAction() };
  }
  const avatarAction = () => `<button class="icon-btn" data-a="tab" data-tab="profile" aria-label="${esc(t('profileTitle'))}">${avatarHtml(me(), 'sm')}</button>`;

  /* ---------- Reminders (calendar + list) ---------- */
  function filtered() {
    let list = reminders();
    if (ui.cat !== 'All') list = list.filter((r) => r.category === ui.cat);
    return list;
  }
  function screenReminders() {
    const chips = ['All', ...CATEGORIES.map((c) => c.key)].map((k) => `<button class="cat-chip" aria-pressed="${ui.cat === k}" data-a="set-cat" data-cat="${k}">${k !== 'All' ? `<span class="dot" style="background:${catOf(k).color}"></span>` : ''}${esc(k === 'All' ? t('all') : catLabel(k))}</button>`).join('');
    const tabs = `<div class="tabs" role="tablist">
      <button role="tab" aria-selected="${ui.remTab === 'calendar'}" data-a="rem-tab" data-v="calendar">${icon('calendar_today')}${esc(t('calendarTab'))}</button>
      <button role="tab" aria-selected="${ui.remTab === 'list'}" data-a="rem-tab" data-v="list">${icon('list')}${esc(t('listTab'))}</button></div>`;
    const body = ui.remTab === 'calendar' ? renderCalendar(filtered()) : renderList(filtered(), true);
    return {
      title: t('calendarTab'),
      html: `${tabs}${body}`,
      fabs: `<button class="fab" data-a="add" aria-label="${esc(t('addReminder'))}">${icon('add')}<span class="fab-label">${esc(t('addReminder'))}</span></button>`,
      actions: avatarAction(),
    };
  }
  function renderCalendar(list) {
    const m = ui.calMonth; const y = m.getFullYear(), mo = m.getMonth();
    const first = new Date(y, mo, 1); const days = new Date(y, mo + 1, 0).getDate();
    const startW = weekdayIdx(first); const total = Math.ceil((startW + days) / 7) * 7;
    const T = todayD(); let cells = '';
    for (let i = 0; i < total; i++) {
      const n = i - startW + 1;
      if (n < 1 || n > days) { cells += '<div class="cal-cell pad" aria-hidden="true"></div>'; continue; }
      const d = new Date(y, mo, n); const items = remindersOn(d, list); const isT = sameDay(d, T);
      const label = `${fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}, ${items.length}`;
      cells += `<button class="cal-cell ${isT ? 'today' : ''}" data-a="day" data-d="${dkey(d)}" aria-label="${esc(label)}">
        <span class="n tnum">${n}</span>
        <span class="items">${items.slice(0, 3).map((r) => `<span class="it ${isDoneOn(r, d) ? 'done' : ''}"><span class="dot" style="background:${catOf(r.category).color}"></span><span>${esc(r.name)}</span></span>`).join('')}</span>
        ${items.length > 3 ? `<span class="more">${esc(t('moreN', { n: items.length - 3 }))}</span>` : ''}
        <span class="dots">${items.slice(0, 4).map((r) => `<span class="dot" style="background:${catOf(r.category).color}"></span>`).join('')}</span>
      </button>`;
    }
    const monthTitle = new Intl.DateTimeFormat(loc(), { month: 'long', year: 'numeric' }).format(m);
    const used = [...new Set(list.map((r) => r.category))];
    return `<div class="stack">
      <div class="cal-head">
        <button class="icon-btn" data-a="cal-prev" aria-label="Previous month">${icon('chevron_left')}</button>
        <h3>${esc(monthTitle)}</h3>
        <button class="btn btn-text today-btn" data-a="cal-today">${esc(t('today'))}</button>
        <button class="icon-btn" data-a="cal-next" aria-label="Next month">${icon('chevron_right')}</button>
      </div>
      <div class="cal-dow">${DOW_KEYS.map((k) => `<span>${esc(t(k))}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
      ${used.length ? `<div class="legend">${used.map((k) => `<span><span class="dot" style="background:${catOf(k).color}"></span>${esc(catLabel(k))}</span>`).join('')}</div>` : ''}
    </div>`;
  }
  function renderList(list, withSearch) {
    const q = ui.q.trim().toLowerCase();
    let items = list;
    if (q) items = items.filter((r) => [r.name, r.description, r.location, catLabel(r.category)].join(' ').toLowerCase().includes(q));
    const T = todayD();
    items = items.slice().sort((a, b) => {
      const da = a.repetitionTime === 'onetime' && a.status === 'completed' ? 1 : 0; const db = b.repetitionTime === 'onetime' && b.status === 'completed' ? 1 : 0;
      if (da !== db) return da - db;
      const na = nextOccurrence(a, T), nb = nextOccurrence(b, T);
      return (na ? na.getTime() : 9e15) - (nb ? nb.getTime() : 9e15) || byTime(a, b);
    });
    const search = withSearch ? `<div class="toolbar"><div class="field">${icon('search')}<label for="search">${esc(t('search'))}</label><input id="search" type="search" value="${esc(ui.q)}" autocomplete="off"></div></div>` : '';
    if (!list.length) return `${search}<div class="empty">${icon('notifications_off', 'xl')}<span>${esc(t('addFirst'))}</span></div>`;
    if (!items.length) return `${search}<div class="empty">${icon('search_off', 'xl')}<span>${esc(t('noResults'))}</span></div>`;
    return `${search}<div class="stack" id="rlist">${items.map(reminderCard).join('')}</div>`;
  }
  function reminderCard(r) {
    const open = ui.expanded.has(r.uid);
    const T = todayD(); const next = nextOccurrence(r, T);
    const done = r.repetitionTime === 'onetime' ? r.status === 'completed' : isDoneOn(r, T) && occursOn(r, T);
    const c = catOf(r.category);
    const det = (ic, label, value) => `<div class="detail">${icon(ic)}<div><small>${esc(label)}</small>${esc(value)}</div></div>`;
    const nextTxt = next ? (sameDay(next, T) ? t('today') : cap(fmtDate(next, { weekday: 'short', day: 'numeric', month: 'short' }))) : '—';
    const details = [
      det('category', t('type'), cap(t(r.type === 'event' ? 'event' : 'task'))),
      det('priority_high', t('priority'), cap(t(r.priority))),
      det('repeat', t('repetition'), repetitionText(r)),
      det('event', t('next'), nextTxt),
      det('schedule', t('time'), fmtTime(r.notificationTime)),
      det(r.hasNotification ? 'notifications_active' : 'notifications_off', t('notification'), r.hasNotification ? '✓' : '—'),
      r.location ? det('location_on', t('location'), r.location) : '',
      r.createdAt ? det('history', t('created'), fmtDate(new Date(r.createdAt))) : '',
    ].join('');
    return `<article class="rcard ${done ? 'done' : ''}">
      <button class="rcard-head" data-a="expand" data-id="${r.uid}" aria-expanded="${open}">
        <span class="prio-bar" style="background:${PRIORITY_COLORS[r.priority] || '#9e9e9e'}"></span>
        <span class="main-col">
          <span class="line1">${r.isImportant ? `<span class="star">${icon('star', 'fill')}</span>` : ''}<span class="name">${esc(r.name)}</span><span class="time-chip tnum">${esc(fmtTime(r.notificationTime))}</span></span>
          <span class="line2"><span class="tag"><span class="dot" style="background:${c.color}"></span>${esc(catLabel(r.category))}</span><span class="tag">${icon('repeat')}${esc(repetitionText(r))}</span>${next ? `<span class="tag">${icon('calendar_today')}${esc(nextTxt)}</span>` : ''}</span>
        </span>
        ${icon(open ? 'expand_less' : 'expand_more')}
      </button>
      ${open ? `<div class="rcard-body">
        ${r.description ? `<div class="desc"><small>${esc(t('description'))}</small><p>${esc(r.description)}</p></div>` : ''}
        <div class="details">${details}</div>
        <div class="actions3">
          <button class="btn btn-tonal" data-a="complete" data-id="${r.uid}">${icon(done ? 'undo' : 'check', 'sm')}<span>${esc(done ? t('undo') : t('complete'))}</span></button>
          <button class="btn btn-outline" data-a="edit" data-id="${r.uid}">${icon('edit', 'sm')}<span>${esc(t('edit'))}</span></button>
          <button class="btn btn-outline danger" data-a="delete" data-id="${r.uid}">${icon('delete', 'sm')}<span>${esc(t('delete'))}</span></button>
        </div></div>` : ''}
    </article>`;
  }

  /* ---------- Category screen ---------- */
  function screenCategory({ cat }) {
    const c = catOf(cat); const list = reminders().filter((r) => r.category === cat);
    const html = `
      <section class="welcome" style="background:color-mix(in srgb, ${c.color} 14%, transparent)">
        <span class="cat-tile" style="--c:${c.color};min-height:0;padding:0;border:0;background:none"><span class="circle">${icon(c.icon, 'fill lg')}</span></span>
        <div class="txt"><h2>${esc(catLabel(cat))}</h2><p>${esc(t('countReminders', { n: list.length }))}</p></div>
      </section>
      ${list.length ? renderList(list, false) : `<div class="empty">${icon('category', 'xl')}<span>${esc(t('noRemindersForCategory'))}</span></div>`}`;
    return { title: `${catLabel(cat)} — ${t('remindersTitle')}`, html, fabs: `<button class="fab" data-a="add" data-cat="${cat}" aria-label="${esc(t('addReminder'))}">${icon('add')}<span class="fab-label">${esc(t('addReminder'))}</span></button>` };
  }

  /* ---------- Profile ---------- */
  function screenProfile() {
    const u = me();
    const opt = (a, ic, label) => `<button class="opt" data-a="go" data-v="${a}">${icon(ic)}<span class="grow">${esc(label)}</span>${icon('chevron_right')}</button>`;
    const html = `
      <div class="profile-head">${avatarHtml(u)}<h2>${esc(u.name || t('noName'))}</h2><span class="mail">${esc(u.email || t('noEmail'))}</span></div>
      <div class="stack" style="margin-top:12px">
        ${opt('accountCenter', 'account_balance', t('accountCenter'))}
        ${opt('notifications', 'notifications', t('notifications'))}
        ${opt('language', 'language', t('language'))}
        ${opt('appearance', 'palette', t('appearance'))}
        ${opt('credits', 'info', t('credits'))}
      </div>
      <button class="btn btn-primary btn-block" data-a="logout">${icon('logout')}${esc(t('logOut'))}</button>`;
    return { title: t('profileTitle'), html, narrow: true };
  }
  function tile(a, ic, title, sub, danger) {
    return `<button class="tile ${danger ? 'danger' : ''}" data-a="${a.startsWith('!') ? a.slice(1) : 'go'}" data-v="${a}">${icon(ic, 'lg')}<span class="grow"><b>${esc(title)}</b><small>${esc(sub)}</small></span>${icon('chevron_right')}</button>`;
  }
  function screenAccountCenter() {
    const html = `<div class="stack">
      ${tile('profileData', 'person', t('myProfileData'), t('myProfileDataDesc'))}
      ${tile('security', 'security', t('securitySettings'), t('securitySettingsDesc'))}
      ${tile('connected', 'link', t('connectedAccounts'), t('connectedAccountsDesc'))}
      ${tile('!feedback', 'feedback', t('feedback'), t('feedbackDesc'))}
      ${tile('!delete-account', 'delete_forever', t('deleteAccount'), t('deleteAccountDesc'), true)}
    </div>`;
    return { title: t('accountCenter'), html, narrow: true };
  }
  function screenProfileData() {
    const u = me(); const list = reminders();
    const counts = {}; list.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    const doneTotal = list.reduce((n, r) => n + (r.repetitionTime === 'onetime' ? (r.status === 'completed' ? 1 : 0) : (r.completedDates || []).length), 0);
    const important = list.filter((r) => r.isImportant).length;
    const stat = (c, ic, label, val, sub, big) => `<div class="stat" style="--c:${c}"><div class="top">${icon(ic)}${esc(label)}</div><div class="val ${big ? 'big tnum' : ''}">${val}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
    const html = `
      <section class="panel">
        <div style="display:flex;gap:16px;align-items:center">${avatarHtml(u, 'md')}<div style="min-width:0"><h2 style="font-size:20px">${esc(u.name || t('noName'))}</h2><div class="muted" style="overflow-wrap:anywhere">${esc(u.email)}</div></div></div>
        <div class="stat-grid">
          ${stat('#673AB7', 'fingerprint', t('id'), `<span class="mono">${esc(u.uid)}</span>`)}
          ${stat('#2196F3', 'calendar_today', t('creationDateLabel'), esc(fmtDate(new Date(u.createdAt), { day: 'numeric', month: 'long', year: 'numeric' })))}
          ${stat('#4CAF50', 'login', t('lastLoginLabel'), esc(new Intl.DateTimeFormat(loc(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(u.lastLogin))))}
        </div>
      </section>
      <section class="panel">
        <h3>${icon('notifications_active')}${esc(t('remindersStatTitle'))}</h3>
        <div class="stat-grid">
          ${stat('#2196F3', 'format_list_numbered', t('reminderCountLabel'), list.length, t('reminderCountDescription'), true)}
          ${stat('#673AB7', 'category', t('preferredCategoryLabel'), top ? esc(catLabel(top[0])) : '—', top ? `${t('used')} ${top[1]} ${t('times')}` : t('noPreferredCategory'))}
          ${stat('#4CAF50', 'task_alt', t('completedLabel'), doneTotal, '', true)}
          ${stat('#FFB300', 'star', t('importantLabel'), important, '', true)}
        </div>
      </section>
      <section class="panel">
        <h3>${icon('bar_chart')}${esc(t('categoryDistribution'))}</h3>
        ${entries.length ? `<div class="chart-wrap">${barChart(entries)}</div>` : `<p class="muted">${esc(t('noReminderData'))}</p>`}
      </section>
      <button class="btn btn-danger btn-block" data-a="logout">${icon('logout')}${esc(t('logOut'))}</button>`;
    return { title: t('myProfileData'), html, narrow: true };
  }
  function barChart(entries) {
    const W = 560, H = 240, padL = 34, padB = 46, padT = 16, padR = 8;
    const max = Math.max(...entries.map((e) => e[1]));
    const step = max <= 5 ? 1 : Math.ceil(max / 5);
    const top = Math.ceil(max / step) * step;
    const iw = W - padL - padR, ih = H - padT - padB;
    const bw = Math.min(46, (iw / entries.length) * 0.6);
    let g = '';
    for (let v = 0; v <= top; v += step) {
      const y = padT + ih - (v / top) * ih;
      g += `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="var(--divider)" stroke-width="1"/><text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}</text>`;
    }
    entries.forEach(([k, v], i) => {
      const cx = padL + (iw / entries.length) * (i + 0.5);
      const h = (v / top) * ih; const y = padT + ih - h; const c = catOf(k).color;
      const lbl = catLabel(k); const short = lbl.length > 9 ? lbl.slice(0, 8) + '…' : lbl;
      g += `<rect x="${cx - bw / 2}" y="${y}" width="${bw}" height="${h}" rx="6" fill="${c}"><title>${esc(lbl)}: ${v}</title></rect>`;
      g += `<text x="${cx}" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--fg)">${v}</text>`;
      g += `<text x="${cx}" y="${H - padB + 18}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(short)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('categoryDistribution'))}">${g}</svg>`;
  }
  function screenSecurity() {
    const html = `<div class="stack">
      ${tile('changePassword', 'lock', t('changePasswordTitle'), t('changePasswordSubtitle'))}
      ${tile('!twofa', 'phonelink_lock', t('twoFactorAuthTitle'), t('twoFactorAuthSubtitle'))}
    </div>`;
    return { title: t('securitySettingsTitle'), html, narrow: true };
  }
  function pwStrength(pw) {
    let s = 0; if (pw.length >= 6) s++; if (pw.length >= 10) s++; if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }
  function screenChangePassword() {
    const u = me();
    if (!u.passHash) {
      const html = `<div class="panel" style="align-items:center;text-align:center">${icon('lock_open', 'xxl')}
        <h3 style="justify-content:center">${esc(t('setPasswordTitle'))}</h3><p class="muted" style="margin:0">${esc(t('noPasswordSetMessage'))}</p></div>
        <form class="stack" id="setpw-form" novalidate style="gap:18px">
          ${field({ id: 'np', label: t('newPasswordLabel'), type: 'password', ic: 'lock', auto: 'new-password', pwToggle: true })}
          <div class="strength" aria-hidden="true"><i id="pw-meter" style="width:0"></i></div>
          ${field({ id: 'np2', label: t('confirmPasswordLabel'), type: 'password', ic: 'lock_reset', auto: 'new-password', pwToggle: true })}
          <p class="muted" style="margin:0;font-size:13px">${esc(t('passwordSecurityTips'))}</p>
          <button class="btn btn-primary btn-block" type="submit">${esc(t('setNewPassword'))}</button>
        </form>`;
      return { title: t('changePasswordTitle'), html, narrow: true };
    }
    const html = `<p class="muted" style="margin:0">${esc(t('changeExistingPassword'))}</p>
      <form class="stack" id="chpw-form" novalidate style="gap:18px">
        ${field({ id: 'cp', label: t('currentPasswordLabel'), type: 'password', ic: 'lock', auto: 'current-password', pwToggle: true })}
        ${field({ id: 'np', label: t('newPasswordLabel'), type: 'password', ic: 'lock_outline', auto: 'new-password', pwToggle: true })}
        <div class="strength" aria-hidden="true"><i id="pw-meter" style="width:0"></i></div>
        ${field({ id: 'np2', label: t('confirmPasswordLabel'), type: 'password', ic: 'lock_reset', auto: 'new-password', pwToggle: true })}
        <p class="muted" style="margin:0;font-size:13px">${esc(t('passwordSecurityTips'))}</p>
        <button class="btn btn-primary btn-block" type="submit">${esc(t('changePasswordButton'))}</button>
      </form>`;
    return { title: t('changePasswordTitle'), html, narrow: true };
  }
  function screenConnected() {
    const u = me();
    const html = u.googleLinked
      ? `<div class="tile" style="cursor:default">${icon('account_circle', 'lg')}<span class="grow"><b>${esc(t('googleProvider'))}</b><small>${esc(u.email || t('unknownEmail'))}</small></span>
          <button class="icon-btn" style="color:var(--error)" data-a="unlink" aria-label="Unlink">${icon('remove_circle', 'fill')}</button></div>
         <p class="muted">${esc(t('allAccountsLinked'))}</p>`
      : `<p class="muted" style="margin:0">${esc(t('noConnectedAccounts'))}</p>
         <h3 class="h-sub" style="font-size:17px">${esc(t('linkMoreAccounts'))}</h3>
         <button class="tile" data-a="link-google">${icon('account_circle', 'lg')}<span class="grow"><b>${esc(t('linkGoogle'))}</b></span>${icon('add')}</button>`;
    return { title: t('connectedAccountsTitle'), html, narrow: true };
  }
  function switchTile(id, title, sub, checked, a) {
    return `<label class="switch-tile" for="${id}"><span class="grow"><b>${esc(title)}</b><small>${esc(sub)}</small></span>
      <span class="switch"><input type="checkbox" role="switch" id="${id}" ${checked ? 'checked' : ''} data-a="${a}"><i></i></span></label>`;
  }
  function notifPermState() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // default | granted | denied
  }
  function screenNotifications() {
    const n = settings().notif; const st = notifPermState();
    const permBtn = st === 'granted' ? `<span class="chip">${icon('check', 'xs')}${esc(t('allowed'))}</span>`
      : st === 'denied' ? `<span class="chip neutral">${esc(t('blocked'))}</span>`
      : st === 'unsupported' ? `<span class="chip neutral">${esc(t('notSupported'))}</span>`
      : `<button class="btn btn-tonal btn-sm" data-a="perm">${esc(t('allow'))}</button>`;
    const html = `<div class="stack">
      ${switchTile('n-rem', t('reminders'), t('remindersDesc'), n.reminders, 'notif-set')}
      ${switchTile('n-snooze', t('snoozeOption'), t('snoozeOptionDesc'), n.snooze, 'notif-set')}
      ${switchTile('n-sound', t('sound'), t('soundDesc'), n.sound, 'notif-set')}
      <div class="switch-tile" style="cursor:default">${icon('desktop_windows')}<span class="grow"><b>${esc(t('browserNotifications'))}</b><small>${esc(t('browserNotificationsDesc'))}</small></span>${permBtn}</div>
    </div>
    <button class="btn btn-primary btn-block" data-a="notif-save">${esc(t('saveSettings'))}</button>
    <button class="btn btn-outline btn-block" data-a="test-notif">${icon('notification_add')}${esc(t('testNotificationTitle'))}</button>`;
    return { title: t('notifications'), html, narrow: true };
  }
  function screenLanguage() {
    const sel = ui.pendingLang || settings().lang;
    const html = `<h2 class="h-sub">${esc(t('selectLanguage'))}</h2><hr class="div">
      <div class="stack" role="radiogroup" aria-label="${esc(t('language'))}">
        ${LANGS.map((l) => `<button class="lang-opt" role="radio" aria-checked="${sel === l.code}" data-a="pick-lang" data-v="${l.code}">${icon(sel === l.code ? 'radio_button_checked' : 'radio_button_unchecked')}<span>${esc(l.label)}</span><small>${l.code}</small></button>`).join('')}
      </div>
      <button class="btn btn-primary btn-block" data-a="save-lang">${icon('save')}${esc(t('save'))}</button>`;
    return { title: t('chooseLanguage'), html, narrow: true };
  }
  function screenAppearance() {
    const s = settings(); const dark = isDark();
    const html = `
      ${switchTile('dark-switch', t('darkMode'), s.dark == null ? `${t('darkModeDesc')} · ${t('themeFollowsSystem')}` : t('darkModeDesc'), dark, 'dark-toggle')}
      ${switchTile('motion-switch', t('reduceMotion'), t('reduceMotionDesc'), !!s.reduceMotion, 'motion-toggle')}`;
    return { title: t('appearance'), html, narrow: true };
  }
  function todayCardPreview(r) { return todayCard(r).replace(/data-a="[^"]*"/g, ''); }
  function screenCredits() {
    const html = `
      <div class="credits-card"><img src="assets/scumpy.svg" alt="Scampy"><h2>Scampy Software Solutions</h2><span class="muted">${esc(t('crafted'))}</span><span class="chip">${esc(t('webVersion'))} 2.0</span></div>
      <section class="stack"><h3 style="font-size:18px;font-weight:600">${esc(t('librariesUsed'))}</h3>
        <ul class="bullets">${['libWeb1', 'libWeb2', 'libWeb3', 'libWeb4', 'libWeb5'].map((k) => `<li>${icon('check_circle')}${esc(t(k))}</li>`).join('')}</ul></section>
      <section class="stack"><h3 style="font-size:18px;font-weight:600">${esc(t('specialThanks'))}</h3>
        <ul class="bullets">${['thanks1', 'thanks2', 'thanks3'].map((k) => `<li>${icon('favorite')}${esc(t(k))}</li>`).join('')}</ul></section>`;
    return { title: t('credits'), html, narrow: true };
  }
  function screenDeletion() {
    const reasons = ['reasonNoLongerNeeded', 'reasonPrivacyConcerns', 'reasonFoundAlternative', 'reasonTechnicalIssues', 'reasonOther'];
    const html = `<form class="stack" id="del-form" novalidate style="gap:16px">
      <p style="font-size:18px;margin:0">${esc(t('helpUsImprove'))}</p>
      <p class="muted" style="margin:0">${esc(t('reasonForDeletion'))}</p>
      <div role="radiogroup">${reasons.map((k) => `<label class="radio-row"><input type="radio" name="reason" value="${k}">${esc(t(k))}</label>`).join('')}</div>
      <div class="field"><label for="del-more">${esc(t('additionalFeedback'))}</label><textarea id="del-more" rows="4"></textarea></div>
      <button class="btn btn-ink btn-block" type="submit">${esc(t('submitAndDeleteAccount'))}</button>
      <button class="btn btn-text btn-block" type="button" data-a="back" style="color:var(--fg)">${esc(t('cancelDeletion'))}</button>
    </form>`;
    return { title: t('accountDeletionFeedback'), html, narrow: true };
  }

  const TABS = { home: screenHome, reminders: screenReminders, profile: screenProfile };
  const SCREENS = {
    category: screenCategory, accountCenter: screenAccountCenter, profileData: screenProfileData, security: screenSecurity,
    changePassword: screenChangePassword, connected: screenConnected, notifications: screenNotifications, language: screenLanguage,
    appearance: screenAppearance, credits: screenCredits, deletion: screenDeletion,
  };

  /* ================= Modals ================= */
  let modalOnClose = null;
  function openModal(html, onClose) {
    const root = $('#modal');
    root.innerHTML = `<div class="modal-root" data-a="modal-bg">${html}</div>`;
    modalOnClose = onClose || null;
    const f = root.querySelector('[autofocus], input, select, textarea, button');
    if (f) setTimeout(() => f.focus(), 30);
  }
  function closeModal() { $('#modal').innerHTML = ''; if (modalOnClose) { const f = modalOnClose; modalOnClose = null; f(); } }
  const modalOpen = () => !!$('#modal .modal-root');

  function confirmDialog({ title, body, ok, danger, onOk }) {
    openModal(`<div class="dialog sm" role="alertdialog" aria-modal="true" aria-labelledby="cd-t">
      <div class="dialog-head plain"><h2 id="cd-t">${esc(title)}</h2></div>
      <div class="dialog-body" style="padding-top:8px"><p style="margin:0" class="muted">${esc(body)}</p></div>
      <div class="dialog-foot noline"><button class="btn btn-text" data-a="modal-close">${esc(t('cancel'))}</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cd-ok">${esc(ok)}</button></div></div>`);
    $('#cd-ok').addEventListener('click', () => { closeModal(); onOk(); });
  }

  function reminderDialog(existing, preset = {}) {
    const r = existing ? { ...existing } : {
      name: '', description: '', type: 'task', priority: 'medium', repetitionTime: 'daily', category: 'Personal',
      dayOfWeek: WEEKDAYS[weekdayIdx(todayD())], dayOfMonth: todayD().getDate(), oneTimeDate: dkey(todayD()),
      notificationTime: (() => { const n = new Date(Date.now() + 3600e3); return `${pad(n.getHours())}:00`; })(),
      location: '', hasNotification: true, isImportant: false, ...preset,
    };
    const opt = (v, label, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${esc(label)}</option>`;
    openModal(`<form class="dialog" id="rem-form" role="dialog" aria-modal="true" aria-labelledby="rd-t" novalidate>
      <div class="dialog-head">${icon('notifications_active')}<h2 id="rd-t">${esc(existing ? t('editReminder') : t('addReminder'))}</h2>
        <button type="button" class="icon-btn" data-a="modal-close" aria-label="${esc(t('cancel'))}">${icon('close')}</button></div>
      <div class="dialog-body">
        <div class="field">${icon('title')}<label for="rf-name">${esc(t('reminderName'))}</label><input id="rf-name" value="${esc(r.name)}" autocomplete="off" required></div>
        <div class="field" style="align-items:flex-start">${icon('description').replace('class="ms', 'style="margin-top:14px" class="ms')}<label for="rf-desc">${esc(t('description'))}</label><textarea id="rf-desc" rows="3">${esc(r.description)}</textarea></div>
        <div class="field-row">
          <div class="field select"><label for="rf-type">${esc(t('type'))}</label><select id="rf-type">${opt('task', cap(t('task')), r.type)}${opt('event', cap(t('event')), r.type)}</select></div>
          <div class="field select"><span class="dot" id="rf-prio-dot" style="margin-left:14px;background:${PRIORITY_COLORS[r.priority]}"></span><label for="rf-prio">${esc(t('priority'))}</label><select id="rf-prio">${['high', 'medium', 'low'].map((p) => opt(p, cap(t(p)), r.priority)).join('')}</select></div>
        </div>
        <div class="field-row">
          <div class="field select"><span class="dot" id="rf-cat-dot" style="margin-left:14px;background:${catOf(r.category).color}"></span><label for="rf-cat">${esc(t('category'))}</label><select id="rf-cat">${CATEGORIES.map((c) => opt(c.key, t(c.l10n), r.category)).join('')}</select></div>
          <div class="field select"><label for="rf-rep">${esc(t('repetition'))}</label><select id="rf-rep">${REPETITIONS.map((x) => opt(x.key, t(x.l10n), r.repetitionTime)).join('')}</select></div>
        </div>
        <div id="rf-dyn"></div>
        <div class="field">${icon('location_on')}<label for="rf-loc">${esc(t('location'))}</label><input id="rf-loc" value="${esc(r.location || '')}" autocomplete="off"></div>
        <div class="field-row" style="align-items:center">
          <div class="field">${icon('schedule')}<label for="rf-time">${esc(t('time'))}</label><input id="rf-time" type="time" value="${esc(r.notificationTime)}" required></div>
          <label class="inline-switch" for="rf-notif">${icon('notifications', '')}<span class="grow">${esc(t('notification'))}</span><span class="switch"><input type="checkbox" role="switch" id="rf-notif" ${r.hasNotification ? 'checked' : ''}><i></i></span></label>
        </div>
        <label class="inline-switch" for="rf-imp"><span class="star" id="rf-star" style="color:${r.isImportant ? 'var(--star)' : 'var(--primary-ink)'}">${icon('star', 'fill')}</span><span class="grow">${esc(t('important'))}<small>${esc(t('importantReminderDescription'))}</small></span><span class="switch"><input type="checkbox" role="switch" id="rf-imp" ${r.isImportant ? 'checked' : ''}><i></i></span></label>
        <p class="err-text" id="rf-err" hidden></p>
      </div>
      <div class="dialog-foot">
        ${existing ? `<button type="button" class="btn btn-text" style="color:var(--error)" data-a="delete" data-id="${existing.uid}">${icon('delete', 'sm')}${esc(t('delete'))}</button>` : ''}
        <button type="button" class="btn btn-text" style="margin-right:auto" data-a="modal-close">${esc(t('cancel'))}</button>
        <button type="submit" class="btn btn-primary">${esc(t('save'))}</button>
      </div></form>`);
    const dyn = () => {
      const rep = $('#rf-rep').value; let h = '';
      if (rep === 'weekly') h = `<div class="field select">${icon('calendar_view_week')}<label for="rf-dow">${esc(t('dayOfWeek'))}</label><select id="rf-dow">${WEEKDAYS.map((d, i) => opt(d, cap(weekdayName(i)), r.dayOfWeek)).join('')}</select></div>`;
      else if (rep === 'monthly') h = `<div class="field">${icon('calendar_today')}<label for="rf-dom">${esc(t('dayOfMonth'))}</label><input id="rf-dom" type="number" min="1" max="31" inputmode="numeric" value="${esc(r.dayOfMonth || '')}"></div>`;
      else if (rep === 'onetime') h = `<div class="field">${icon('event')}<label for="rf-date">${esc(t('date'))}</label><input id="rf-date" type="date" value="${esc((r.oneTimeDate || dkey(todayD())).slice(0, 10))}"></div>`;
      else if (rep === 'yearly') h = `<div class="field">${icon('event_repeat')}<label for="rf-date">${esc(t('annualDate'))}</label><input id="rf-date" type="date" value="${esc((r.oneTimeDate || dkey(todayD())).slice(0, 10))}"></div>`;
      $('#rf-dyn').innerHTML = h; $('#rf-dyn').hidden = !h;
    };
    dyn();
    $('#rf-rep').addEventListener('change', () => { captureDyn(); dyn(); });
    function captureDyn() { if ($('#rf-dow')) r.dayOfWeek = $('#rf-dow').value; if ($('#rf-dom')) r.dayOfMonth = $('#rf-dom').value; if ($('#rf-date')) r.oneTimeDate = $('#rf-date').value; }
    $('#rf-prio').addEventListener('change', (e) => { $('#rf-prio-dot').style.background = PRIORITY_COLORS[e.target.value]; });
    $('#rf-cat').addEventListener('change', (e) => { $('#rf-cat-dot').style.background = catOf(e.target.value).color; });
    $('#rf-imp').addEventListener('change', (e) => { $('#rf-star').style.color = e.target.checked ? 'var(--star)' : 'var(--primary-ink)'; });
    $('#rem-form').addEventListener('submit', (e) => {
      e.preventDefault(); captureDyn();
      const err = (m) => { const el = $('#rf-err'); el.textContent = m; el.hidden = false; };
      const name = $('#rf-name').value.trim();
      if (!name) { err(t('nameEmptyWarning')); $('#rf-name').focus(); return; }
      const rep = $('#rf-rep').value;
      if (rep === 'monthly') { const n = Number(r.dayOfMonth); if (!(n >= 1 && n <= 31)) return err(t('invalidDayOfMonth')); }
      if ((rep === 'onetime' || rep === 'yearly') && !r.oneTimeDate) return err(t('pickDateFirst'));
      const data = {
        ...(existing || {}), uid: existing ? existing.uid : uuid(), name, description: $('#rf-desc').value.trim(), type: $('#rf-type').value,
        priority: $('#rf-prio').value, category: $('#rf-cat').value, repetitionTime: rep,
        dayOfWeek: rep === 'weekly' ? r.dayOfWeek : null, dayOfMonth: rep === 'monthly' ? Number(r.dayOfMonth) : null,
        oneTimeDate: rep === 'onetime' || rep === 'yearly' ? r.oneTimeDate : null,
        location: $('#rf-loc').value.trim(), notificationTime: $('#rf-time').value || '09:00', hasNotification: $('#rf-notif').checked,
        isImportant: $('#rf-imp').checked, status: existing ? existing.status || 'active' : 'active', completedDates: existing ? existing.completedDates || [] : [],
        createdAt: existing ? existing.createdAt : new Date().toISOString(), startDate: existing ? existing.startDate : dkey(todayD()),
        lastUpdated: new Date().toISOString(),
      };
      if (existing && existing.repetitionTime !== rep) data.completedDates = [];
      delete data.snoozedUntil;
      const list = me().reminders; const i = list.findIndex((x) => x.uid === data.uid);
      if (i >= 0) list[i] = data; else list.push(data);
      save(); closeModal(); render(); toast(t('reminderSaved'));
    });
  }

  function dayDialog(dateK) {
    const d = fromKey(dateK); const items = remindersOn(d, filtered());
    const rows = items.map((r) => `<button class="day-row ${isDoneOn(r, d) ? 'done' : ''}" data-a="edit" data-id="${r.uid}">
      <span class="dot" style="background:${catOf(r.category).color};width:10px;height:10px"></span>
      <span class="grow"><b>${r.isImportant ? `<span class="star">${icon('star', 'fill xs')}</span> ` : ''}${esc(r.name || t('unnamedReminder'))}</b><small class="tnum">${icon('schedule', 'xs')}${esc(fmtTime(r.notificationTime))} · ${esc(catLabel(r.category))}</small></span>
      ${icon('chevron_right')}</button>`).join('');
    openModal(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dd-t">
      <div class="dialog-head">${icon('notifications_active')}<div style="flex:1;min-width:0"><h2 id="dd-t">${esc(t('dailyReminders'))}</h2><p>${esc(cap(fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })))}</p></div></div>
      <div style="overflow-y:auto">${items.length ? `<div class="day-list">${rows}</div>` : `<div class="dialog-body" style="align-items:center;text-align:center">${icon('notifications_off', 'xl').replace('class="ms', 'style="opacity:.35" class="ms')}<p class="muted" style="margin:0">${esc(t('noRemindersForThisDay'))}</p><button class="btn btn-text" data-a="add-on" data-d="${dateK}">${esc(t('createReminder'))}</button></div>`}</div>
      <div class="dialog-foot"><button class="btn btn-text" style="margin-right:auto" data-a="modal-close">${esc(t('close'))}</button>
        <button class="btn btn-primary" data-a="add-on" data-d="${dateK}">${icon('add', 'sm')}${esc(t('newReminder'))}</button></div></div>`);
  }

  function feedbackDialog() {
    let rating = 0;
    openModal(`<form class="dialog sm" id="fb-form" role="dialog" aria-modal="true" aria-labelledby="fb-t" novalidate>
      <div class="dialog-head plain"><h2 id="fb-t">${esc(t('feedback'))}</h2></div>
      <div class="dialog-body" style="padding-top:6px"><p style="margin:0" class="muted">${esc(t('feedbackPrompt'))}</p>
        <div class="stars" id="fb-stars">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="${n}">${icon('star', 'xl')}</button>`).join('')}</div>
        <div class="field"><label for="fb-text">${esc(t('feedbackHint'))}</label><textarea id="fb-text" rows="5"></textarea></div></div>
      <div class="dialog-foot noline"><button type="button" class="btn btn-text" data-a="modal-close">${esc(t('cancel'))}</button><button class="btn btn-primary" type="submit">${esc(t('submit'))}</button></div></form>`);
    const paint = () => $('#fb-stars').querySelectorAll('button').forEach((b) => { b.querySelector('.ms').classList.toggle('fill', Number(b.dataset.n) <= rating); });
    $('#fb-stars').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { rating = Number(b.dataset.n); paint(); } });
    $('#fb-form').addEventListener('submit', (e) => {
      e.preventDefault(); const msg = $('#fb-text').value.trim();
      if (!msg && !rating) return;
      DB.feedback.push({ userId: me().uid, rating: rating || null, message: msg, createdAt: new Date().toISOString() }); save();
      closeModal(); toast(t('feedbackSent'));
    });
  }

  /* ================= Actions ================= */
  function findR(id) { return reminders().find((r) => r.uid === id); }
  function toggleDone(r, d = todayD(), silent) {
    const k = dkey(d); let nowDone;
    if (r.repetitionTime === 'onetime') { r.status = r.status === 'completed' ? 'active' : 'completed'; nowDone = r.status === 'completed'; }
    else { r.completedDates = r.completedDates || []; const i = r.completedDates.indexOf(k); if (i >= 0) r.completedDates.splice(i, 1); else r.completedDates.push(k); nowDone = i < 0; }
    if (nowDone) delete r.snoozedUntil;
    save(); render();
    if (!silent) toast(nowDone ? t('markedDone') : t('markedUndone'), { icon: nowDone ? 'task_alt' : 'radio_button_unchecked', action: { label: t('undo'), run: () => toggleDone(r, d, true) } });
  }
  function deleteR(id) {
    const r = findR(id); if (!r) return;
    confirmDialog({ title: t('deleteReminderTitle'), body: `${t('deleteReminderConfirm')}\n„${r.name}"`, ok: t('delete'), danger: true, onOk: () => {
      const list = me().reminders; const i = list.findIndex((x) => x.uid === id); const [removed] = list.splice(i, 1);
      ui.expanded.delete(id); save(); render();
      toast(t('reminderDeleted'), { icon: 'delete', action: { label: t('undo'), run: () => { list.splice(i, 0, removed); save(); render(); } } });
    } });
  }
  async function login(email, pw) {
    const u = findUserByEmail(email);
    if (!u || !u.passHash || u.passHash !== (await hashPw(pw))) return false;
    startSession(u); return true;
  }
  function startSession(u) {
    u.lastLogin = new Date().toISOString(); DB.session = u.uid; ui.tab = 'home'; ui.stack = []; ui.cat = 'All'; ui.expanded.clear(); save(); render();
  }
  async function loginDemo() {
    let u = findUserByEmail('demo@reminder.app');
    if (!u) u = seedDemo();
    if (!u.passHash) u.passHash = await hashPw('demo123');
    startSession(u);
  }
  function logout() { DB.guest = { ...settings(), notif: { ...settings().notif } }; DB.session = null; ui.auth = 'login'; ui.stack = []; save(); render(); }

  /* ---------- ICS import ---------- */
  function parseICS(text) {
    const lines = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
    const events = []; let ev = null;
    const unesc = (s) => s.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') { ev = {}; continue; }
      if (line === 'END:VEVENT') { if (ev) events.push(ev); ev = null; continue; }
      if (!ev) continue;
      const idx = line.indexOf(':'); if (idx < 0) continue;
      const left = line.slice(0, idx); const val = line.slice(idx + 1); const [prop, ...params] = left.split(';');
      ev[prop.toUpperCase()] = { val: unesc(val), params };
    }
    const out = [];
    for (const e of events) {
      if (!e.SUMMARY || !e.DTSTART) continue;
      const raw = e.DTSTART.val; const m = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/); if (!m) continue;
      let dt;
      if (m[4] != null) dt = m[7] ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])) : new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
      else dt = new Date(+m[1], +m[2] - 1, +m[3], 9, 0);
      const rr = e.RRULE ? Object.fromEntries(e.RRULE.val.split(';').map((p) => p.split('='))) : {};
      let rep = 'onetime', dayOfWeek = null, dayOfMonth = null;
      if (rr.FREQ === 'DAILY') rep = 'daily';
      else if (rr.FREQ === 'WEEKLY') { rep = 'weekly'; const map = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 }; const bd = (rr.BYDAY || '').split(',')[0]; dayOfWeek = WEEKDAYS[bd in map ? map[bd] : weekdayIdx(dt)]; }
      else if (rr.FREQ === 'MONTHLY') { rep = 'monthly'; dayOfMonth = Number(rr.BYMONTHDAY) || dt.getDate(); }
      else if (rr.FREQ === 'YEARLY') rep = 'yearly';
      if (rep === 'onetime' && dt < addDays(todayD(), -60)) continue; // skip old one-off events
      out.push({
        uid: uuid(), name: e.SUMMARY.val.trim().slice(0, 140), description: (e.DESCRIPTION ? e.DESCRIPTION.val : '').trim().slice(0, 1000), type: 'event', priority: 'medium',
        repetitionTime: rep, category: 'Personal', dayOfWeek, dayOfMonth, oneTimeDate: rep === 'onetime' || rep === 'yearly' ? dkey(dt) : null,
        notificationTime: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`, location: e.LOCATION ? e.LOCATION.val.trim() : '', hasNotification: true, isImportant: false,
        status: 'active', completedDates: [], createdAt: new Date().toISOString(), startDate: dkey(dt < todayD() ? dt : todayD()), source: 'calendar', eventId: e.UID ? e.UID.val : null,
      });
    }
    return out;
  }

  /* ---------- Notifications engine ---------- */
  let audioCtx = null;
  function chime() {
    if (!settings().notif.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [[880, 0], [1318.5, 0.16], [1760, 0.32]].forEach(([f, d]) => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, now + d); g.gain.exponentialRampToValueAtTime(0.18, now + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + d + 0.5);
        o.connect(g).connect(audioCtx.destination); o.start(now + d); o.stop(now + d + 0.55);
      });
    } catch (e) { /* audio not available */ }
  }
  function headsUp({ title, body, r }) {
    chime();
    if (notifPermState() === 'granted') { try { new Notification(title, { body, icon: 'assets/icon.png', tag: r ? r.uid : 'test' }); } catch (e) { /* ignore */ } }
    const box = $('#heads'); const el = document.createElement('div'); el.className = 'head-note'; el.setAttribute('role', 'alert');
    const time = new Intl.DateTimeFormat(loc(), { hour: 'numeric', minute: '2-digit' }).format(new Date());
    el.innerHTML = `<div class="top"><img src="assets/icon.png" alt=""><div class="grow"><small>Reminder · ${esc(time)}</small><b><span class="ring-bell">${icon('notifications_active', 'xs')}</span> ${esc(title)}</b><p>${esc(body)}</p></div>
      <button class="icon-btn" data-x aria-label="${esc(t('close'))}">${icon('close', 'sm')}</button></div>
      ${r ? `<div class="acts">${settings().notif.snooze ? `<button class="btn btn-text btn-sm" data-snooze>${icon('snooze', 'sm')}${esc(t('snooze10'))}</button>` : ''}<button class="btn btn-primary btn-sm" data-done>${icon('check', 'sm')}${esc(t('done'))}</button></div>` : ''}`;
    const kill = () => el.remove();
    el.querySelector('[data-x]').addEventListener('click', kill);
    if (r) {
      const sn = el.querySelector('[data-snooze]');
      if (sn) sn.addEventListener('click', () => { const x = findR(r.uid); if (x) { x.snoozedUntil = new Date(Date.now() + 10 * 60e3).toISOString(); save(); toast(t('snoozedUntil', { time: new Intl.DateTimeFormat(loc(), { hour: 'numeric', minute: '2-digit' }).format(new Date(x.snoozedUntil)) }), { icon: 'snooze' }); } kill(); });
      el.querySelector('[data-done]').addEventListener('click', () => { const x = findR(r.uid); if (x && !isDoneOn(x, todayD())) toggleDone(x, todayD(), true); toast(t('markedDone'), { icon: 'task_alt' }); kill(); });
    }
    box.prepend(el);
    while (box.children.length > 3) box.lastChild.remove();
    setTimeout(kill, 60000);
  }
  function checkDue() {
    const u = me(); if (!u || !u.settings.notif.reminders) return;
    const now = new Date(); const T = todayD(); const nowMin = now.getHours() * 60 + now.getMinutes(); const k = dkey(T);
    let changed = false;
    for (const r of u.reminders) {
      if (r.snoozedUntil && new Date(r.snoozedUntil) <= now) {
        delete r.snoozedUntil; changed = true;
        headsUp({ title: r.name, body: t('dontForget', { name: r.name }), r }); continue;
      }
      if (!r.hasNotification || !occursOn(r, T) || isDoneOn(r, T)) continue;
      const due = timeToMin(r.notificationTime); const fk = `${r.uid}|${k}`;
      if (nowMin >= due && nowMin - due <= 2 && !DB.fired[fk]) {
        DB.fired[fk] = 1; changed = true;
        headsUp({ title: r.name, body: t('dontForget', { name: r.name }) + (r.location ? ` · ${r.location}` : ''), r });
      }
    }
    // prune fired keys older than today
    for (const fk in DB.fired) if (!fk.endsWith(k)) { delete DB.fired[fk]; changed = true; }
    if (changed) save();
  }

  /* ================= Event wiring ================= */
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-a]'); if (!el) return;
    const a = el.dataset.a;
    if (a === 'modal-bg') { if (e.target === el) closeModal(); return; }
    if (el.tagName === 'INPUT') return; // switches handled on change
    switch (a) {
      case 'back': back(); break;
      case 'tab': closeModal(); setTab(el.dataset.tab); break;
      case 'go': go(el.dataset.v); break;
      case 'auth': ui.auth = el.dataset.v; ui.showPw = {}; render(); break;
      case 'pw-toggle': {
        const id = el.dataset.id; ui.showPw[id] = !ui.showPw[id]; const inp = document.getElementById(id);
        if (inp) { inp.type = ui.showPw[id] ? 'text' : 'password'; el.querySelector('.ms').textContent = ui.showPw[id] ? 'visibility_off' : 'visibility'; }
        break;
      }
      case 'demo': await loginDemo(); break;
      case 'google':
        confirmDialog({ title: t('signInWithGoogle'), body: t('googleNeedsFirebase'), ok: t('continueDemo'), onOk: loginDemo }); break;
      case 'add': closeModal(); reminderDialog(null, el.dataset.cat ? { category: el.dataset.cat } : (ui.tab === 'reminders' && ui.cat !== 'All' && !ui.stack.length ? { category: ui.cat } : {})); break;
      case 'add-on': closeModal(); reminderDialog(null, { repetitionTime: 'onetime', oneTimeDate: el.dataset.d, ...(ui.cat !== 'All' ? { category: ui.cat } : {}) }); break;
      case 'edit': { const r = findR(el.dataset.id); if (r) { closeModal(); reminderDialog(r); } break; }
      case 'delete': closeModal(); deleteR(el.dataset.id); break;
      case 'toggle-done': case 'complete': { const r = findR(el.dataset.id); if (r) toggleDone(r); break; }
      case 'expand': { const id = el.dataset.id; ui.expanded.has(id) ? ui.expanded.delete(id) : ui.expanded.add(id); render(); break; }
      case 'open-cat': go('category', { cat: el.dataset.cat }); break;
      case 'set-cat': ui.cat = el.dataset.cat; render(); break;
      case 'rem-tab': ui.remTab = el.dataset.v; render(); break;
      case 'cal-prev': ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() - 1, 1); render(); break;
      case 'cal-next': ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + 1, 1); render(); break;
      case 'cal-today': ui.calMonth = todayD(); render(); break;
      case 'day': dayDialog(el.dataset.d); break;
      case 'modal-close': closeModal(); break;
      case 'clear-samples': {
        const u = me(); u.reminders = u.reminders.filter((r) => !r.sample); save(); render(); toast(t('samplesRemoved')); break;
      }
      case 'test-notif':
        toast(t('testNotificationIn'), { icon: 'notification_add' });
        try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch (err) { /* ignore */ }
        setTimeout(() => headsUp({ title: t('testNotificationTitle'), body: t('testNotificationBody') }), 5000); break;
      case 'import-ics': $('#ics-input').click(); break;
      case 'logout': logout(); break;
      case 'feedback': feedbackDialog(); break;
      case 'delete-account':
        confirmDialog({ title: t('confirmDeletion'), body: t('deletionWarning'), ok: t('continueText'), danger: true, onOk: () => go('deletion') }); break;
      case 'twofa': toast(`${t('twoFactorAuthTitle')} — ${t('comingSoon')}`, { icon: 'phonelink_lock' }); break;
      case 'link-google': me().googleLinked = true; save(); render(); toast(t('googleLinked')); break;
      case 'unlink': me().googleLinked = false; save(); render(); toast(t('accountUnlinkedMessage', { provider: t('googleProvider') })); break;
      case 'perm':
        try { const p = await Notification.requestPermission(); render(); if (p === 'granted') headsUp({ title: t('testNotificationTitle'), body: t('testNotificationBody') }); }
        catch (err) { toast(t('notSupported'), { error: true }); }
        break;
      case 'notif-save': save(); toast(t('notificationSettingsSaved')); break;
      case 'pick-lang': ui.pendingLang = el.dataset.v; render(); break;
      case 'save-lang': {
        const code = ui.pendingLang || settings().lang; settings().lang = code; ui.pendingLang = null; save(); render();
        toast(t('languageSetTo', { language: LANGS.find((l) => l.code === code).label })); break;
      }
      case 'pick-color': settings().primary = el.dataset.v; save(); render(); break;
      case 'restore-defaults': { const s = settings(); s.primary = BRAND; s.dark = null; s.reduceMotion = false; save(); render(); toast(t('defaultsRestored')); break; }
      default: break;
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target; const a = el.dataset && el.dataset.a;
    if (el.id === 'ics-input') {
      const f = el.files && el.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const items = parseICS(String(rd.result || ''));
        if (!items.length) { toast(t('importNone'), { error: true }); }
        else { me().reminders.push(...items); save(); render(); toast(t('importedN', { n: items.length }), { icon: 'event_available' }); }
        el.value = '';
      };
      rd.readAsText(f); return;
    }
    if (!a) return;
    const s = settings();
    if (a === 'dark-toggle') { s.dark = el.checked; save(); render(); }
    else if (a === 'motion-toggle') { s.reduceMotion = el.checked; save(); render(); }
    else if (a === 'notif-set') {
      const map = { 'n-rem': 'reminders', 'n-snooze': 'snooze', 'n-sound': 'sound' }; s.notif[map[el.id]] = el.checked; save();
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'search') {
      ui.q = e.target.value; const pos = e.target.selectionStart; render();
      const s = $('#search'); if (s) { s.focus(); try { s.setSelectionRange(pos, pos); } catch (err) { /* ignore */ } }
    }
    if (e.target.id === 'np' || e.target.id === 'reg-pass') {
      const m = $('#pw-meter'); if (!m) return; const s = pwStrength(e.target.value);
      m.style.width = (s / 5) * 100 + '%'; m.style.background = s <= 1 ? 'var(--error)' : s <= 3 ? '#FB8C00' : 'var(--success)';
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOpen()) closeModal(); });
  document.addEventListener('submit', async (e) => {
    const f = e.target; if (!f.id) return;
    if (['login-form', 'register-form', 'forgot-form', 'chpw-form', 'setpw-form', 'del-form'].includes(f.id)) e.preventDefault(); else return;
    const v = (id) => (document.getElementById(id) || {}).value || '';
    if (f.id === 'login-form') {
      const em = v('login-email').trim(), pw = v('login-pass');
      if (!em) return toast(t('emailRequired'), { error: true });
      if (!validEmail(em)) return toast(t('invalidEmail'), { error: true });
      if (!pw) return toast(t('passwordRequired'), { error: true });
      if (!(await login(em, pw))) toast(t('wrongCredentials'), { error: true });
    } else if (f.id === 'register-form') {
      const name = v('reg-name').trim(), em = v('reg-email').trim(), pw = v('reg-pass'), pw2 = v('reg-pass2');
      if (!name || !em || !pw) return toast(t('fillAllFields'), { error: true });
      if (!validEmail(em)) return toast(t('invalidEmail'), { error: true });
      if (pw.length < 6) return toast(t('passwordMinLength'), { error: true });
      if (pw !== pw2) return toast(t('passwordsDontMatch'), { error: true });
      if (!$('#reg-terms').checked) return toast(t('acceptTerms'), { error: true });
      if (findUserByEmail(em)) return toast(t('emailInUse'), { error: true });
      const u = newUser({ name, email: em, passHash: await hashPw(pw) }); startSession(u);
    } else if (f.id === 'forgot-form') {
      const em = v('fp-email').trim(), pw = v('fp-pass');
      if (!validEmail(em)) return toast(t('invalidEmail'), { error: true });
      const u = findUserByEmail(em); if (!u) return toast(t('noAccountForEmail'), { error: true });
      if (pw.length < 6) return toast(t('passwordMinLength'), { error: true });
      u.passHash = await hashPw(pw); save(); ui.auth = 'login'; render(); toast(t('passwordUpdateSuccess'));
    } else if (f.id === 'chpw-form' || f.id === 'setpw-form') {
      const u = me(); const np = v('np'), np2 = v('np2');
      if (f.id === 'chpw-form') { if (!v('cp')) return toast(t('currentPasswordRequired'), { error: true }); if ((await hashPw(v('cp'))) !== u.passHash) return toast(t('wrongPasswordError'), { error: true }); }
      if (!np) return toast(t('newPasswordRequired'), { error: true });
      if (np.length < 6) return toast(t('passwordMinLength'), { error: true });
      if (np !== np2) return toast(t('passwordsDontMatch'), { error: true });
      u.passHash = await hashPw(np); save(); back(); toast(t('passwordChangedSuccessfully'));
    } else if (f.id === 'del-form') {
      const reason = (f.querySelector('input[name="reason"]:checked') || {}).value;
      if (!reason) return toast(t('pleaseSelectReason'), { error: true });
      const u = me(); DB.feedback.push({ userId: u.uid, type: 'deletion', reason, message: v('del-more'), createdAt: new Date().toISOString() });
      DB.guest = { ...u.settings, notif: { ...u.settings.notif } }; delete DB.users[u.uid]; DB.session = null; ui.auth = 'login'; ui.stack = []; save(); render();
      toast(t('deletedAccount'));
    }
  });
  function bindAfterRender() { /* hook for future per-render bindings */ }

  /* ================= Boot ================= */
  function splash() {
    const root = app();
    root.innerHTML = `<div class="splash" id="splash"><div class="splash-inner">
      <img class="splash-logo" src="assets/logo.svg" alt="Reminder">
      <div class="progress" role="progressbar" aria-label="${esc(t('loading'))}"><i id="splash-bar"></i></div>
      <div class="splash-dev"><span>Developed by</span><img src="assets/scumpy.svg" alt="Scampy Software Solutions"></div>
    </div></div>`;
    const reduce = settings().reduceMotion || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    let p = 0; const bar = $('#splash-bar');
    const finish = () => { ui.splash = false; render(); };
    if (reduce) { bar.style.width = '100%'; setTimeout(finish, 300); return; }
    const tick = () => { p = Math.min(100, p + 7); bar.style.width = p + '%'; if (p < 100) setTimeout(tick, 70); else setTimeout(finish, 180); };
    setTimeout(tick, 120);
  }

  load();
  if (!DB.seeded) { // first visit: open in a realistic working state with the demo account
    DB.seeded = true; const u = seedDemo(); hashPw('demo123').then((h) => { u.passHash = h; save(); });
    DB.session = u.uid; u.lastLogin = new Date().toISOString(); save();
  }
  render();
  setInterval(checkDue, 15000);
  setTimeout(checkDue, 4000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkDue(); if (!ui.splash && !modalOpen()) render(); } });
  // re-render at midnight so "today" stays correct
  (function midnight() { const n = new Date(); const ms = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 5) - n; setTimeout(() => { if (!ui.splash) render(); midnight(); }, ms); })();
})();
