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
      whatToAdd: 'What do you want to add?', kindList: 'List', kindListDesc: 'Several items to check off on one day',
      kindTask: 'Single', kindTaskDesc: 'A single thing to do', newList: 'New list', newTask: 'New task', editList: 'Edit list', editTask: 'Edit task',
      titleLabel: 'Name', descOptional: 'Note (optional)', itemsLabel: 'Items', addItem: 'Add item', newItemPh: 'New item…', needItem: 'Add at least one item',
      timeOptional: 'Time (optional)', noTime: 'No time', clearTime: 'Clear time',
      repNone: 'Does not repeat', repInterval: 'Every few days, weeks, months or years', repWeekdays: 'On days of the week', repMonthday: 'On a day of the month',
      everyLabel: 'Every', unitDay: 'days', unitWeek: 'weeks', unitMonth: 'months', unitYear: 'years', everyYear: 'Every year', everyNyear: 'Every {n} years',
      everyDay: 'Every day', everyWeek: 'Every week', everyMonth: 'Every month', everyNday: 'Every {n} days', everyNweek: 'Every {n} weeks', everyNmonth: 'Every {n} months',
      monthDayEvery: 'Monthly on day {n}', pickDays: 'Pick at least one day', statTasks: 'Tasks', statLists: 'Lists', saved: 'Saved', listDone: 'List completed',
      homeSub: "Here is what's on for today.", addDate: 'Add date', tomorrow: 'Tomorrow', showMore: 'Show more', changeDate: 'Change date', removeDate: 'Remove date', noDateSection: 'General', doneSection: 'Done', unauthorizedDomain: 'This website is not yet allowed in Firebase (Authentication → Settings → Authorized domains).', networkError: 'No internet connection', permissionDenied: 'Firebase rules do not allow this yet (see README).',
      importedLocal: 'Moved {n} items from this device to your account', migratedOld: 'Brought over {n} reminders from the old app', partnerTitle: 'Partner', partnerDesc: 'Share items with one person', partnerEmail: "Partner's email",
      partnerHelp: 'Your partner needs to sign in with Google once. Then enter their email here.', linkBtn: 'Link', unlinkBtn: 'Remove', partnerSelf: "That's your own email",
      partnerNotFound: "No account with that email yet. Ask them to sign in with Google first.", partnerLinked: 'Linked with {name}', shareWith: 'Share with {name}',
      sharedBy: 'Shared by {name}', sharedWith: 'Shared with {name}', partnerLinkFirst: 'Link a partner in Profile to share items', signInGoogleHint: 'Sign in to sync across devices and share with your partner',
      repUnits: 'day|days|days;week|weeks|weeks;month|months|months;year|years|years', filterDated: 'With date', remindLabel: 'Reminder', remindAtShort: 'At the time', beforeShort: '{n} before', remindHint: 'tap one or more · none = no reminder', remindAt: 'At the time', remindBefore: '{n} before', remindOff: 'No reminder', min5: '5 min', min15: '15 min', min30: '30 min', hour1: '1 hour', day1: '1 day', watchTab: 'Watch', watchAddPh: 'Paste an IKEA product link', watchAdd: 'Watch', watchOnlyIkea: 'For now this works only for IKEA product links (ikea.com/…/p/…)', watchOnline: 'Delivery', watchStore: 'IKEA store', wIn: 'in stock', wOut: 'out of stock', wUnknown: '?', watchChecked: 'Checked {d}', watchNever: 'Not checked yet', watchCheckNow: 'Check now', watchOpen: 'Open', watchEmpty: 'Add products you are waiting for. You get a notification when they are back in stock (checked every 2–3 hours).', watchCloudOnly: 'Watching products works when you are signed in.', watchRestock: 'Expected {d}', watchCantCheck: 'Could not check', watchShareWith: 'Share with {name}', watchWhat: 'Notify me when', watchOptStock: 'Back in stock', watchOptPrice: 'Price drops', watchOptStockShort: 'In stock', watchOptPriceShort: 'Price drop', watchPickOne: 'Pick at least one: back in stock or price drop', watchPriceWas: 'was {p}', watchSharedWith: 'Shared with {name}', watchFrom: 'From {name}', watchAdded: 'Watching — first check is running', watchDeleteConfirm: 'Stop watching “{name}”?', watchDup: 'You already watch this product', watchChecking: 'Checking…', usersTitle: 'Users', usersSearch: 'Search by name or email', usersWeb: 'New app', usersOldOnly: 'Old app only', usersItems: '{n} items', usersDevices: '{n} devices', usersLast: 'Last seen {d}', usersNever: 'never', usersCount: '{n} accounts · {w} use the new app', weather: 'Weather forecast', weatherDesc: 'Weather icon next to the day in the calendar (next 16 days)', weatherFallback: 'Location not allowed — showing Belgrade', weatherRefresh: 'Tap to update the location', wx_sunny: 'Sunny', wx_partly_cloudy_day: 'Partly cloudy', wx_cloud: 'Cloudy', wx_foggy: 'Fog', wx_rainy: 'Rain', wx_weather_snowy: 'Snow', wx_thunderstorm: 'Thunderstorm', wxHighLow: 'High {max}°, low {min}°',
      pushDevice: 'Notifications on this device', pushDeviceDesc: 'Arrive even when the app is closed', pushOn: 'On', pushTurnOn: 'Turn on', pushTurnOff: 'Turn off', pushIosHint: 'On iPhone: first add Reminder to the Home Screen (Share → Add to Home Screen), open it from there and turn notifications on.',
      pushEnabled: 'Notifications are on for this device', pushDisabled: 'Notifications are off for this device', pushFailed: 'Could not turn on notifications', pushTestSent: 'Test notification sent', pushNeedsOn: 'Turn on notifications on this device first',
      remindersPushDesc: 'At the item time, or earlier too — you choose in each item', partnerNotifyFailed: 'Could not notify your partner', sharedChanges: 'Shared items', sharedChangesDesc: 'When your partner adds or edits an item shared with you', morningSummary: 'Morning summary', morningSummaryDesc: 'Today\'s items without a time, overdue and General', morningTime: 'Time', sendTest: 'Send a test notification', filterAll: 'All', filterTasks: 'Tasks', filterEvents: 'Events', lateDay: '{n} day late', lateDays: '{n} days late', allDoneToday: 'All done for today', nothingToday: 'Nothing planned for today', deleteEntry: 'Delete', deleteEntryConfirm: 'Delete “{name}”?',
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
      whatToAdd: 'Šta dodajete?', kindList: 'Lista', kindListDesc: 'Više stavki za čekiranje za jedan dan',
      kindTask: 'Pojedinačno', kindTaskDesc: 'Jedna stvar koju treba uraditi', newList: 'Nova lista', newTask: 'Novi task', editList: 'Izmeni listu', editTask: 'Izmeni task',
      titleLabel: 'Naziv', descOptional: 'Beleška (opciono)', itemsLabel: 'Stavke', addItem: 'Dodaj stavku', newItemPh: 'Nova stavka…', needItem: 'Dodajte bar jednu stavku',
      timeOptional: 'Vreme (opciono)', noTime: 'Bez vremena', clearTime: 'Ukloni vreme',
      repNone: 'Ne ponavlja se', repInterval: 'Na nekoliko dana, nedelja, meseci ili godina', repWeekdays: 'Određenim danima u nedelji', repMonthday: 'Određenog dana u mesecu',
      everyLabel: 'Na svakih', unitDay: 'dana', unitWeek: 'nedelja', unitMonth: 'meseci', unitYear: 'godina', everyYear: 'Svake godine', everyNyear: 'Na svakih {n} godina',
      everyDay: 'Svaki dan', everyWeek: 'Svake nedelje', everyMonth: 'Svakog meseca', everyNday: 'Na svakih {n} dana', everyNweek: 'Na svakih {n} nedelja', everyNmonth: 'Na svakih {n} meseci',
      monthDayEvery: 'Svakog {n}. u mesecu', pickDays: 'Izaberite bar jedan dan', statTasks: 'Taskovi', statLists: 'Liste', saved: 'Sačuvano', listDone: 'Lista završena',
      homeSub: 'Evo šta vas čeka danas.', addDate: 'Dodaj datum', tomorrow: 'Sutra', showMore: 'Prikaži još', changeDate: 'Promeni datum', removeDate: 'Ukloni datum', noDateSection: 'Opšte', doneSection: 'Urađeno', unauthorizedDomain: 'Ovaj sajt još nije dozvoljen u Firebase-u (Authentication → Settings → Authorized domains).', networkError: 'Nema internet konekcije', permissionDenied: 'Firebase pravila ovo još ne dozvoljavaju (pogledajte README).',
      importedLocal: 'Prebačeno {n} stavki sa ovog uređaja na vaš nalog', migratedOld: 'Preneto {n} podsetnika iz stare aplikacije', partnerTitle: 'Partner', partnerDesc: 'Delite stavke sa jednom osobom', partnerEmail: 'Email partnera',
      partnerHelp: 'Partner treba jednom da se prijavi preko Google-a. Zatim ovde unesite njegov email.', linkBtn: 'Poveži', unlinkBtn: 'Ukloni', partnerSelf: 'To je vaš email',
      partnerNotFound: 'Nema naloga sa tim emailom. Neka se partner prvo prijavi preko Google-a.', partnerLinked: 'Povezani ste sa: {name}', shareWith: 'Podeli sa: {name}',
      sharedBy: 'Podelio/la: {name}', sharedWith: 'Podeljeno sa: {name}', partnerLinkFirst: 'Povežite partnera u Profilu da biste delili stavke', signInGoogleHint: 'Prijavite se da biste imali iste podatke na svim uređajima i delili sa partnerom',
      repUnits: 'dan|dana|dana;nedelja|nedelje|nedelja;mesec|meseca|meseci;godina|godine|godina', filterDated: 'Sa datumom', remindLabel: 'Podsetnik', remindAtShort: 'U vreme', beforeShort: '{n} pre', remindHint: 'možeš više · nijedan = bez podsetnika', remindAt: 'U vreme stavke', remindBefore: '{n} ranije', remindOff: 'Bez podsetnika', min5: '5 min', min15: '15 min', min30: '30 min', hour1: '1 sat', day1: '1 dan', watchTab: 'Praćenje', watchAddPh: 'Nalepi IKEA link proizvoda', watchAdd: 'Prati', watchOnlyIkea: 'Za sada radi samo za IKEA linkove proizvoda (ikea.com/…/p/…)', watchOnline: 'Dostava', watchStore: 'IKEA robna kuća', wIn: 'ima', wOut: 'nema', wUnknown: '?', watchChecked: 'Provereno {d}', watchNever: 'Još nije provereno', watchCheckNow: 'Proveri sad', watchOpen: 'Otvori', watchEmpty: 'Dodaj proizvode koje čekaš. Stiže obaveštenje kad ponovo budu na stanju (provera na 2–3 sata).', watchCloudOnly: 'Praćenje radi kad si prijavljena.', watchRestock: 'Očekuje se {d}', watchCantCheck: 'Ne može da se proveri', watchShareWith: 'Podeli sa: {name}', watchWhat: 'Javi mi kad', watchOptStock: 'Bude na stanju', watchOptPrice: 'Padne cena', watchOptStockShort: 'Na stanju', watchOptPriceShort: 'Pad cene', watchPickOne: 'Izaberi bar jedno: na stanju ili pad cene', watchPriceWas: 'bilo {p}', watchSharedWith: 'Podeljeno sa: {name}', watchFrom: 'Prati: {name}', watchAdded: 'Pratim — prva provera je u toku', watchDeleteConfirm: 'Prestati da pratiš „{name}“?', watchDup: 'Ovaj proizvod već pratiš', watchChecking: 'Proveravam…', usersTitle: 'Korisnici', usersSearch: 'Traži po imenu ili emailu', usersWeb: 'Nova app', usersOldOnly: 'Samo stara app', usersItems: 'stavki: {n}', usersDevices: 'uređaja: {n}', usersLast: 'Poslednji put {d}', usersNever: 'nikad', usersCount: 'naloga: {n} · novu app koristi: {w}', weather: 'Vremenska prognoza', weatherDesc: 'Ikonica vremena pored dana u kalendaru (narednih 16 dana)', weatherFallback: 'Lokacija nije dozvoljena — prikazujem Beograd', weatherRefresh: 'Dodirni da osvežiš lokaciju', wx_sunny: 'Sunčano', wx_partly_cloudy_day: 'Delimično oblačno', wx_cloud: 'Oblačno', wx_foggy: 'Magla', wx_rainy: 'Kiša', wx_weather_snowy: 'Sneg', wx_thunderstorm: 'Grmljavina', wxHighLow: 'Najviša {max}°, najniža {min}°',
      pushDevice: 'Obaveštenja na ovom uređaju', pushDeviceDesc: 'Stižu i kad je aplikacija zatvorena', pushOn: 'Uključeno', pushTurnOn: 'Uključi', pushTurnOff: 'Isključi', pushIosHint: 'Na iPhone-u: prvo dodaj Reminder na početni ekran (Share → Add to Home Screen), otvori ga odatle i uključi obaveštenja.',
      pushEnabled: 'Obaveštenja su uključena na ovom uređaju', pushDisabled: 'Obaveštenja su isključena na ovom uređaju', pushFailed: 'Nije uspelo uključivanje obaveštenja', pushTestSent: 'Probno obaveštenje je poslato', pushNeedsOn: 'Prvo uključi obaveštenja na ovom uređaju',
      remindersPushDesc: 'U vreme stavke, i ranije ako izabereš — biraš u svakoj stavci', partnerNotifyFailed: 'Partner nije obavešten', sharedChanges: 'Podeljene stavke', sharedChangesDesc: 'Kad partner doda ili izmeni stavku koju deli sa tobom', morningSummary: 'Jutarnji pregled', morningSummaryDesc: 'Današnje stavke bez vremena, one koje kasne i Opšte', morningTime: 'Vreme', sendTest: 'Pošalji probno obaveštenje', filterAll: 'Sve', filterTasks: 'Zadaci', filterEvents: 'Događaji', lateDay: 'kasni {n} dan', lateDays: 'kasni {n} dana', allDoneToday: 'Sve za danas je urađeno', nothingToday: 'Za danas nema ništa', deleteEntry: 'Obriši', deleteEntryConfirm: 'Obrisati „{name}“?',
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

  /* ================= Constants ================= */
  const DOW_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const BRAND = '#1E9E6A';
  const LIST_COLOR = '#4C7BD9';
  const EVENT_COLOR = '#9B6BD6';
  const isEvent = (it) => it.type === 'event';
  const REPEAT_TYPES = [['none', 'repNone'], ['interval', 'repInterval'], ['weekdays', 'repWeekdays'], ['monthday', 'repMonthday']];
  const UNITS = [['day', 'unitDay'], ['week', 'unitWeek'], ['month', 'unitMonth'], ['year', 'unitYear']];

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
  const KEY = 'todays-v3';
  const defaultSettings = () => ({
    lang: 'sr',
    dark: null, primary: BRAND,
    notif: { reminders: true, snooze: true, sound: true, morning: true, morningTime: '08:00' },
  });
  let DB = null;
  function load() {
    try { DB = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { DB = null; }
    if (!DB || typeof DB !== 'object' || !DB.users) DB = { users: {}, session: null, guest: defaultSettings(), fired: {}, feedback: [], seeded: false };
    DB.fired = DB.fired || {}; DB.feedback = DB.feedback || [];
    // Serbian is the default; switch everyone who never picked a language themselves
    const fix = (st) => { if (st && !st.langChosen && st.lang !== 'sr') { st.lang = 'sr'; return true; } return false; };
    fix(DB.guest);
    Object.values(DB.users).forEach((u) => { if (fix(u.settings)) refreshSamples(u); });
  }
  function refreshSamples(u) {
    if (!u.tasks || !u.tasks.some((x) => x.sample)) return;
    u.tasks = u.tasks.filter((x) => !x.sample).concat(sampleEntries(u.settings.lang));
  }
  function save(sync = true) { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* storage unavailable: keep in memory */ } if (sync && typeof syncCloud === 'function') syncCloud(); }
  const me = () => (DB.session && DB.users[DB.session]) || null;
  const settings = () => (me() ? me().settings : DB.guest);
  const entries = () => (me() ? (me().tasks = me().tasks || []) : []);
  const findUserByEmail = (email) => Object.values(DB.users).find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());

  function newUser({ name, email, passHash, provider = 'password' }) {
    const uid = uuid().replace(/-/g, '').slice(0, 28);
    const now = new Date().toISOString();
    const s = { ...defaultSettings(), ...DB.guest, notif: { ...DB.guest.notif } };
    const u = { uid, name, email, passHash, provider, googleLinked: provider === 'google', createdAt: now, lastLogin: now, settings: s, tasks: [] };
    DB.users[uid] = u; return u;
  }

  function seedDemo() {
    let u = findUserByEmail('demo@reminder.app');
    if (u) return u;
    u = newUser({ name: 'Demo', email: 'demo@reminder.app', passHash: null });
    u.demo = true;
    u.createdAt = addDays(new Date(), -42).toISOString();
    u.tasks = sampleEntries(u.settings.lang);
    return u;
  }
  function sampleEntries(l) {
    const sr = l === 'sr';
    const T = todayD(); const k = dkey(T); const wd = weekdayIdx(T);
    const mk = (o) => ({
      uid: uuid(), kind: 'task', name: '', description: '', date: k, time: '', important: false,
      repeat: { type: 'none' }, items: [], done: {}, checks: {}, createdAt: new Date().toISOString(), sample: true, ...o,
    });
    const items = (arr) => arr.map((text) => ({ id: uuid().slice(0, 8), text }));
    const shop = items(sr ? ['Mleko', 'Hleb', 'Jaja', 'Paradajz', 'Kafa'] : ['Milk', 'Bread', 'Eggs', 'Tomatoes', 'Coffee']);
    const morning = items(sr ? ['Čaša vode', 'Vitamini', 'Plan dana'] : ['Glass of water', 'Vitamins', 'Plan the day']);
    const pack = items(sr ? ['Pasoš', 'Punjač', 'Kupaći', 'Sunčane naočare'] : ['Passport', 'Charger', 'Swimsuit', 'Sunglasses']);
    return [
      mk({ name: sr ? 'Jutarnji trening' : 'Morning workout', description: sr ? '20 min istezanje + 5 km trčanja' : '20 min stretching + 5 km run', date: dkey(addDays(T, -20)), time: '07:30', repeat: { type: 'interval', every: 1, unit: 'day' }, done: { [k]: true } }),
      mk({ kind: 'list', name: sr ? 'Jutarnja rutina' : 'Morning routine', date: dkey(addDays(T, -14)), repeat: { type: 'weekdays', days: [...new Set([0, 1, 2, 3, 4, wd])].sort() }, items: morning, checks: { [k]: [morning[0].id] } }),
      mk({ type: 'event', name: sr ? 'Sastanak tima' : 'Team stand-up', date: dkey(addDays(T, -21)), time: '10:00', repeat: { type: 'weekdays', days: [...new Set([0, 3, wd])].sort() } }),
      mk({ kind: 'list', name: sr ? 'Kupovina' : 'Groceries', date: '', items: shop, checks: { any: [shop[0].id, shop[1].id] } }),
      mk({ name: sr ? 'Pozovi majstora za bojler' : 'Call the plumber', date: '' }),
      mk({ name: sr ? 'Vrati knjigu u biblioteku' : 'Return the library book', date: dkey(addDays(T, -2)), time: '17:00' }),
      mk({ name: sr ? 'Zalij biljke' : 'Water the plants', time: '19:00', repeat: { type: 'interval', every: 3, unit: 'day' } }),
      mk({ name: sr ? 'Pročitaj 20 strana' : 'Read 20 pages', date: dkey(addDays(T, -10)), repeat: { type: 'interval', every: 1, unit: 'day' } }),
      mk({ name: sr ? 'Plati kiriju' : 'Pay the rent', important: true, date: dkey(addDays(T, -30)), time: '12:00', repeat: { type: 'monthday', monthDay: addDays(T, 2).getDate() } }),
      mk({ type: 'event', name: sr ? 'Zubar' : 'Dentist', date: dkey(addDays(T, 3)), time: '14:30', description: sr ? 'Bulevar oslobođenja 12' : 'Main Street 12' }),
      mk({ kind: 'list', name: sr ? 'Pakovanje za Rim' : 'Packing for Rome', important: true, date: dkey(addDays(T, 11)), time: '20:00', items: pack }),
    ];
  }

  /* ================= Recurrence ================= */
  const lastDay = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const isFloating = (it) => !it.date && (!it.repeat || it.repeat.type === 'none');
  // minutes before the item time: [0, 15] = at the time and 15 min before; [] = no reminder. Any earlier one brings 'at the time' with it (old items: one number, -1 = none)
  const remindList = (it) => { const l = (Array.isArray(it.remind) ? it.remind : [it.remind == null ? 0 : it.remind]).map(Number).filter((n) => n >= 0); return l.length ? [...new Set([0, ...l])].sort((a, b) => a - b) : []; };
  const okey = (it, d) => (isFloating(it) ? 'any' : dkey(d));
  function occursOn(it, d) {
    if (isFloating(it)) return false;
    const start = fromKey(it.date || it.anchor || dkey(new Date(it.createdAt || Date.now())));
    if (d < start) return false;
    const r = it.repeat || { type: 'none' };
    switch (r.type) {
      case 'interval': {
        const n = Math.max(1, Number(r.every) || 1);
        if (r.unit === 'year') {
          const yd = d.getFullYear() - start.getFullYear();
          return yd % n === 0 && d.getMonth() === start.getMonth() && d.getDate() === Math.min(start.getDate(), lastDay(d));
        }
        if (r.unit === 'month') {
          const md = (d.getFullYear() - start.getFullYear()) * 12 + d.getMonth() - start.getMonth();
          return md % n === 0 && d.getDate() === Math.min(start.getDate(), lastDay(d));
        }
        const diff = Math.round((d - start) / 864e5);
        return diff % (r.unit === 'week' ? 7 * n : n) === 0;
      }
      case 'weekdays': return (r.days || []).includes(weekdayIdx(d));
      case 'monthday': return d.getDate() === Math.min(Number(r.monthDay) || 1, lastDay(d));
      default: return sameDay(d, start);
    }
  }
  const checkedOn = (it, d) => { const ids = new Set((it.items || []).map((x) => x.id)); return ((it.checks || {})[okey(it, d)] || []).filter((id) => ids.has(id)); };
  function isDoneOn(it, d) {
    if (it.kind === 'list') return (it.items || []).length > 0 && checkedOn(it, d).length === it.items.length;
    return !!(it.done || {})[okey(it, d)];
  }
  // undated one-offs stay on Home until done; done ones remain visible (struck through) for the rest of that day
  function floatingVisible(it) {
    const T = dkey(todayD());
    if (!isDoneOn(it, todayD())) return true;
    return it.kind === 'list' ? it.doneAt === T : (it.done || {}).any === T;
  }
  function nextOccurrence(it, from = todayD()) {
    for (let i = 0; i < 400; i++) { const d = addDays(from, i); if (occursOn(it, d)) return d; }
    return null;
  }
  const byTime = (a, b) => (a.time ? timeToMin(a.time) : 1e4) - (b.time ? timeToMin(b.time) : 1e4) || a.name.localeCompare(b.name);
  function entriesOn(d, list = entries()) { return list.filter((it) => occursOn(it, d)).sort(byTime); }
  // same, but finished items sink to the bottom of the day
  const doneLast = (d) => (a, b) => (!isEvent(a) && isDoneOn(a, d)) - (!isEvent(b) && isDoneOn(b, d));
  function repeatText(it) {
    const r = it.repeat || { type: 'none' };
    if (r.type === 'interval') {
      const n = Math.max(1, Number(r.every) || 1); const u = r.unit || 'day';
      return n === 1 ? t({ day: 'everyDay', week: 'everyWeek', month: 'everyMonth', year: 'everyYear' }[u]) : t('everyN' + u, { n });
    }
    if (r.type === 'weekdays') return (r.days || []).slice().sort().map((i) => cap(weekdayName(i, 'short'))).join(', ');
    if (r.type === 'monthday') return t('monthDayEvery', { n: r.monthDay });
    return t('oneTime');
  }
  // short label shown on the right of a row for "every N days/weeks/…" repeats, e.g. "2 nedelje"
  function repeatShort(it) {
    const r = it.repeat || {};
    if (r.type !== 'interval') return '';
    const n = Math.max(1, Number(r.every) || 1); const u = r.unit || 'day';
    if (n === 1) return t({ day: 'everyDay', week: 'everyWeek', month: 'everyMonth', year: 'everyYear' }[u]);
    const forms = t('repUnits').split(';')[['day', 'week', 'month', 'year'].indexOf(u)].split('|');
    const few = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14);
    return `${n} ${n % 10 === 1 && n % 100 !== 11 ? forms[0] : few ? forms[1] : forms[2]}`;
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
  // remember where the user was, so a reload (or a new version) reopens the same screen
  // screen and scroll survive a reload, but not closing the app: a fresh start always opens on Home
  const UI_KEY = 'todays-ui';
  try { localStorage.removeItem(UI_KEY); } catch (e) { /* old copy from when this lived in localStorage */ }
  function saveUi() {
    try {
      sessionStorage.setItem(UI_KEY, JSON.stringify({ tab: ui.tab, stack: ui.stack, remTab: ui.remTab, calMonth: dkey(ui.calMonth), homeFilter: ui.homeFilter, agendaFilter: ui.agendaFilter, agendaDays: ui.agendaDays, expanded: [...ui.expanded], scroll: ($('.scroller') || {}).scrollTop || 0 }));
    } catch (e) { /* storage unavailable */ }
  }
  function restoreUi() {
    let v = null;
    try { v = (window.claude && window.claude.hot && window.claude.hot.data && window.claude.hot.data.ui) || JSON.parse(sessionStorage.getItem(UI_KEY) || 'null'); } catch (e) { v = null; }
    if (!v) return 0;
    if (['home', 'reminders', 'watch', 'profile'].includes(v.tab)) ui.tab = v.tab;
    if (Array.isArray(v.stack)) ui.stack = v.stack.filter((x) => x && SCREENS[x.name]);
    if (v.remTab) ui.remTab = v.remTab;
    if (v.calMonth) ui.calMonth = fromKey(v.calMonth);
    if (v.homeFilter) ui.homeFilter = v.homeFilter;
    if (v.agendaFilter) ui.agendaFilter = v.agendaFilter;
    if (v.agendaDays) ui.agendaDays = v.agendaDays;
    if (Array.isArray(v.expanded)) ui.expanded = new Set(v.expanded);
    return v.scroll || 0;
  }
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
          <div class="scroller ${view.calMode ? 'cal-mode' : ''}"><main class="content ${view.narrow ? 'narrow' : ''} ${view.wide ? 'wide' : ''}">${view.html}</main></div>
          ${renderBottomNav()}
        </div>
        ${view.fabs ? `<div class="fabs">${view.fabs}</div>` : ''}
      </div>`;
    bindAfterRender();
    saveUi();
  }
  function renderRail() {
    const u = me();
    const item = (tab, ic, label) => `<button class="nav" data-a="tab" data-tab="${tab}" ${ui.tab === tab && !ui.stack.length ? 'aria-current="page"' : ''}>${icon(ic, ui.tab === tab ? 'fill' : '')}${esc(label)}</button>`;
    return `<nav class="rail" aria-label="Main">
      <div class="rail-logo"><img src="assets/logo.svg" alt="Reminder"></div>
      <button class="btn btn-primary rail-add" data-a="add">${icon('add')}${esc(t('addReminder'))}</button>
      ${item('home', 'home', t('navHome'))}${item('reminders', 'calendar_month', t('calendarTab'))}${item('watch', 'shopping_bag', t('watchTab'))}${item('profile', 'person', t('navProfile'))}
      <div class="spacer"></div>
      <div class="rail-user">${avatarHtml(u, 'sm')}<div><b>${esc(u.name || t('noName'))}</b><small>${esc(u.email)}</small></div></div>
    </nav>`;
  }
  function renderBottomNav() {
    const item = (tab, ic, label) => `<button data-a="tab" data-tab="${tab}" aria-label="${esc(label)}" ${ui.tab === tab ? 'aria-current="page"' : ''}><span class="pill">${icon(ic, ui.tab === tab ? 'fill' : '')}</span></button>`;
    return `<nav class="bottomnav" aria-label="Main">${item('home', 'home', t('navHome'))}${item('reminders', 'calendar_month', t('calendarTab'))}${item('watch', 'shopping_bag', t('watchTab'))}${item('profile', 'person', t('navProfile'))}</nav>`;
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
      ${Cloud.on ? `<p class="demo-hint">${esc(t('signInGoogleHint'))}</p>` : `<button class="btn btn-tonal btn-block" type="button" data-a="demo">${icon('play_circle')}${esc(t('tryDemo'))}</button>`}
      <p class="auth-foot">${esc(t('noAccount'))} <button type="button" class="link" data-a="auth" data-v="register">${esc(t('registerNow'))}</button></p>
      ${Cloud.on ? '' : `<p class="demo-hint">${esc(t('demoHint'))}</p>`}
    </form></div>`;
  }

  /* ---------- Home ---------- */
  function entryCard(it, d = todayD(), opts = {}) {
    const k = dkey(d); const done = isDoneOn(it, d); const isList = it.kind === 'list';
    const subParts = [];
    let late = '';
    if (opts.overdue) {
      const n = Math.round((todayD() - d) / 864e5);
      late = `<span class="time late-tag">(${esc(t(n % 10 === 1 && n % 100 !== 11 ? 'lateDay' : 'lateDays', { n }))})</span>`;
    }
    const rep = repeatShort(it);
    if (it.repeat && it.repeat.type !== 'none' && !rep) subParts.push(repeatText(it));
    if (it.description && !isList) subParts.push(it.description.split('\n')[0]);
    const sub = subParts.length ? `<span class="sub">${esc(subParts.join(' · '))}</span>` : '';
    const star = it.important ? `<span class="star" aria-label="${esc(t('important'))}">${icon('star', 'fill xs')}</span>` : '';
    const repTag = rep ? `<span class="rep-tag">${icon('repeat', 'xs')}${esc(rep)}</span>` : '';
    const time = late || (repTag || it.time && !isFloating(it) ? `<span class="time tnum">${repTag}${it.time && !isFloating(it) ? esc(fmtTime(it.time)) : ''}</span>` : '');
    if (isEvent(it) && !isList) {
      const past = it.time && sameDay(d, todayD()) && timeToMin(it.time) < new Date().getHours() * 60 + new Date().getMinutes();
      return `<div class="entry event ${past || d < todayD() ? 'past' : ''}">
        <span class="ev-ic" aria-hidden="true">${icon('event', 'sm')}</span>
        <button class="body" data-a="edit" data-id="${it.uid}"><span class="title">${esc(it.name)}${star}${shareBadge(it)}</span>${sub}</button>
        ${time}
      </div>`;
    }
    if (!isList) {
      return `<div class="entry ${done ? 'done' : ''}">
        <button class="tick ${done ? 'on' : ''}" data-a="toggle-done" data-id="${it.uid}" data-d="${k}" aria-pressed="${done}" aria-label="${esc(t('done'))}: ${esc(it.name)}">${done ? icon('check', 'xs') : ''}</button>
        <button class="body" data-a="edit" data-id="${it.uid}"><span class="title">${esc(it.name)}${star}${shareBadge(it)}</span>${sub}</button>
        ${time}
      </div>`;
    }
    const open = ui.expanded.has(it.uid + '|' + k);
    const checked = new Set(checkedOn(it, d)); const n = it.items.length; const c = checked.size; const ev = isEvent(it);
    return `<div class="entry list ${done && !ev ? 'done' : ''} ${ev ? 'event' : ''} ${open ? 'open' : ''}">
      <button class="entry-row" data-a="expand" data-id="${it.uid}" data-d="${k}" aria-expanded="${open}">
        ${ev ? `<span class="ev-ic" aria-hidden="true">${icon('event', 'sm')}</span>` : `<span class="tick pie ${done ? 'on' : ''}" style="--n:${Math.max(n, 1)};--p:${n ? (c / n) * 100 : 0}" aria-hidden="true">${done ? icon('check', 'xs') : ''}</span>`}
        <span class="body"><span class="title">${esc(it.name)}${star}${shareBadge(it)}</span><span class="sub tnum">${esc(ev ? String(n) : c + '/' + n)}${subParts.length ? ' · ' + esc(subParts.join(' · ')) : ''}</span></span>
        ${time}
        <span class="chev">${icon(open ? 'expand_less' : 'expand_more', 'sm')}</span>
      </button>
      ${open ? `<div class="entry-items">
        ${it.description ? `<p class="entry-desc">${esc(it.description)}</p>` : ''}
        ${ev ? it.items.map((x) => `<div class="item-row bullet"><span>${esc(x.text)}</span></div>`).join('') : it.items.map((x) => `<label class="item-row ${checked.has(x.id) ? 'on' : ''}"><input type="checkbox" data-a="toggle-check" data-id="${it.uid}" data-item="${x.id}" data-d="${k}" ${checked.has(x.id) ? 'checked' : ''}><span>${esc(x.text)}</span></label>`).join('')}
        <button class="link-btn" data-a="edit" data-id="${it.uid}">${esc(t('edit'))}</button>
      </div>` : ''}
    </div>`;
  }
  function screenHome() {
    const d = todayD();
    if (weatherWanted()) setTimeout(ensureWeather);
    const today = entriesOn(d);
    const floating = entries().filter((it) => isFloating(it) && floatingVisible(it))
      .sort((a, b) => isDoneOn(a, d) - isDoneOn(b, d) || (b.important ? 1 : 0) - (a.important ? 1 : 0) || a.name.localeCompare(b.name));
    const pastOneOff = (it) => it.date && (!it.repeat || it.repeat.type === 'none') && !isEvent(it) && fromKey(it.date) < d;
    const overdue = entries().filter((it) => pastOneOff(it) && !isDoneOn(it, fromKey(it.date))).sort((a, b) => a.date.localeCompare(b.date) || byTime(a, b));
    const lateDone = entries().filter((it) => pastOneOff(it) && isDoneOn(it, fromKey(it.date)) && it.lateDoneOn === dkey(d));
    const doable = today.filter((it) => !isEvent(it));
    const doneN = doable.filter((it) => isDoneOn(it, d)).length + lateDone.length;
    const totalN = doable.length + overdue.length + lateDone.length;
    const pct = totalN ? Math.round((doneN / totalN) * 100) : 0;
    const hasSamples = entries().some((it) => it.sample);
    const first = (me().name || '').split(' ')[0];
    // finished items move to the "Done" section at the bottom
    const isDone = (it) => !isEvent(it) && isDoneOn(it, d);
    const f = ui.homeFilter || 'all';
    const pass = (it) => f === 'all' || (f === 'event' ? isEvent(it) : !isEvent(it));
    const todayOpen = today.filter((it) => !isDone(it) && pass(it));
    const floatOpen = floating.filter((it) => !isDone(it) && pass(it));
    const doneList = today.filter(isDone).concat(floating.filter(isDone)).filter(pass);
    const overdueF = overdue.filter(pass); const lateDoneF = lateDone.filter(pass);
    const filterBar = `<div class="filter-pills home-filter" role="radiogroup" aria-label="Filter">${[['all', 'filterAll'], ['task', 'filterTasks'], ['event', 'filterEvents']].map(([v, k]) => `<button type="button" role="radio" class="fpill" data-a="home-filter" data-v="${v}" aria-checked="${f === v}">${esc(t(k))}</button>`).join('')}</div>`;
    const html = `
      <header class="day-hero green-band">
        <div class="day-head-txt">
          <span class="greet">${esc(t('welcomeBack'))}${first ? ', ' + esc(first) : ''}!</span>
          <h2 id="today-h">${esc(t('today'))}</h2>
          ${wxLine(d, true)}
        </div>
        ${totalN ? `<div class="ring ring-min" style="--p:${pct}" role="img" aria-label="${esc(t('ofDone', { a: doneN, b: totalN }))} ${esc(t('doneToday'))}"><div><b class="tnum">${doneN}/${totalN}</b><small>${esc(t('doneToday'))}</small></div></div>` : ''}
      </header>
      ${filterBar}
      <section class="rows home-rows" aria-labelledby="today-h">
        <h3 class="rows-label">${esc(fmtDate(d, { day: 'numeric', month: 'long' }))} <span class="muted-date">${esc(cap(fmtDate(d, { weekday: 'long' })))}</span></h3>
        ${overdueF.map((it) => entryCard(it, fromKey(it.date), { overdue: true })).join('')}
        ${todayOpen.length ? todayOpen.map((it) => entryCard(it, d)).join('') : overdueF.length ? '' : `<p class="quiet">${esc(today.length ? t('allDoneToday') : t('nothingToday'))}</p>`}
      </section>
      ${floatOpen.length ? `<section class="rows home-rows" aria-labelledby="nodate-h">
        <h3 class="rows-label" id="nodate-h">${esc(t('noDateSection'))}</h3>
        ${floatOpen.map((it) => entryCard(it, d)).join('')}
      </section>` : ''}
      ${doneList.length + lateDoneF.length ? `<section class="rows home-rows done-sec" aria-labelledby="done-h">
        <h3 class="rows-label" id="done-h">${esc(t('doneSection'))} <span class="muted-date tnum">${doneList.length + lateDoneF.length}</span></h3>
        ${lateDoneF.map((it) => entryCard(it, fromKey(it.date))).join('')}${doneList.map((it) => entryCard(it, d)).join('')}
      </section>` : ''}
      ${hasSamples ? `<p class="quiet small">${esc(t('sampleData'))} <button class="link-btn" data-a="clear-samples">${esc(t('clearSamples'))}</button></p>` : ''}`;
    const fabs = `<button class="fab" data-a="add" aria-label="${esc(t('addReminder'))}">${icon('add')}<span class="fab-label">${esc(t('addReminder'))}</span></button>`;
    return { title: t('homeTitle'), html, fabs, actions: avatarAction(), narrow: true };
  }
  const avatarAction = () => `<button class="icon-btn theme-btn" data-a="theme-toggle" aria-label="${esc(t('darkMode'))}" aria-pressed="${isDark()}" title="${esc(t('darkMode'))}">${icon(isDark() ? 'light_mode' : 'dark_mode')}</button>
    <button class="icon-btn" data-a="tab" data-tab="profile" aria-label="${esc(t('profileTitle'))}">${avatarHtml(me(), 'sm')}</button>`;

  /* ---------- Calendar ---------- */
  const entryColor = (it) => (isEvent(it) ? EVENT_COLOR : it.kind === 'list' ? LIST_COLOR : BRAND);
  function screenReminders() {
    return {
      title: t('calendarTab'),
      html: `<header class="green-band cal-band"><div class="seg view-seg" role="tablist">
          <button type="button" role="tab" class="seg-btn" data-a="rem-tab" data-v="calendar" aria-selected="${ui.remTab !== 'list'}">${icon('calendar_month', 'sm')}${esc(t('calendarTab'))}</button>
          <button type="button" role="tab" class="seg-btn" data-a="rem-tab" data-v="list" aria-selected="${ui.remTab === 'list'}">${icon('view_agenda', 'sm')}${esc(t('listTab'))}</button>
        </div></header>${ui.remTab === 'list' ? renderAgenda() : renderCalendar(entries())}`,
      wide: true, calMode: ui.remTab !== 'list',
      // calendar grid: no + button (tap a day to add); list keeps it
      fabs: ui.remTab !== 'list' ? '' : `<button class="fab" data-a="add" aria-label="${esc(t('addReminder'))}">${icon('add')}<span class="fab-label">${esc(t('addReminder'))}</span></button>`,
      actions: avatarAction(),
    };
  }
  function renderAgenda() {
    const T = todayD(); const span = ui.agendaDays || 30; let html = '';
    const seen = new Set(); // repeating entries appear only at their next upcoming occurrence
    const isRepeating = (it) => it.repeat && it.repeat.type !== 'none';
    for (let i = 0; i <= span; i++) { // starts today
      const d = addDays(T, i);
      const items = entriesOn(d).filter((it) => {
        if (!isRepeating(it)) return true;
        if (seen.has(it.uid)) return false;
        seen.add(it.uid); return true;
      });
      if (!items.length) continue;
      items.sort(doneLast(d));
      // date first (bold), then the day in plain text: "19. OKTOBAR  Danas" / "21. OKTOBAR  Sreda"
      const day = i === 0 ? t('today') : i === 1 ? t('tomorrow') : cap(fmtDate(d, { weekday: 'long' }));
      html += `<section class="rows agenda-day"><h3 class="rows-label ${i === 0 ? 'is-today' : ''}">${esc(fmtDate(d, { day: 'numeric', month: 'long' }))} <span class="muted-date">${esc(day)}</span></h3>${items.map((it) => entryCard(it, d)).join('')}</section>`;
    }
    // is there anything after the shown days? (repeating items already listed don't count)
    let hasMore = false;
    for (let i = span + 1; i <= span + 366 && !hasMore; i++) hasMore = entriesOn(addDays(T, i)).some((it) => !isRepeating(it) || !seen.has(it.uid));
    const floating = entries().filter((it) => isFloating(it) && floatingVisible(it));
    const undated = floating.filter((it) => !isDoneOn(it, T)).concat(floating.filter((it) => isDoneOn(it, T)));
    const af = ui.agendaFilter || 'all';
    const bar = `<div class="filter-pills home-filter agenda-filter" role="radiogroup" aria-label="Filter">${[['all', 'filterAll'], ['dated', 'filterDated'], ['general', 'noDateSection']].map(([v, k]) => `<button type="button" role="radio" class="fpill" data-a="agenda-filter" data-v="${v}" aria-checked="${af === v}">${esc(t(k))}</button>`).join('')}</div>`;
    const showGeneral = af !== 'dated', showDated = af !== 'general';
    return `${bar}<div class="agenda">
      ${showGeneral && undated.length ? `<section class="rows agenda-day"><h3 class="rows-label">${esc(t('noDateSection'))}</h3>${undated.map((it) => entryCard(it, T)).join('')}</section>` : ''}
      ${showDated ? `${html || `<p class="quiet">${esc(t('nothingToday'))}</p>`}
      ${hasMore ? `<button class="btn btn-outline btn-sm more-btn" data-a="agenda-more">${icon('expand_more', 'sm')}${esc(t('showMore'))}</button>` : ''}` : undated.length ? '' : `<p class="quiet">${esc(t('nothingToday'))}</p>`}
    </div>`;
  }
  /* Weather (Open-Meteo, free, no key): an icon next to each day in the calendar, when turned on in Appearance.
     The location stays on this device only (localStorage), never in the shared profile. */
  const WX_KEY = 'todays-weather';
  let WX = null; try { WX = JSON.parse(localStorage.getItem(WX_KEY) || 'null'); } catch (e) { WX = null; }
  const weatherWanted = () => !!settings().weather;
  const weatherOn = (d) => (weatherWanted() && WX && WX.days && WX.days[dkey(d)]) || null;
  // WMO weather code → Material Symbols icon
  const wxName = (c) => (c <= 0 ? 'sunny' : c <= 2 ? 'partly_cloudy_day' : c === 3 ? 'cloud' : c <= 48 ? 'foggy' : c >= 95 ? 'thunderstorm' : (c >= 71 && c <= 77) || c === 85 || c === 86 ? 'weather_snowy' : 'rainy');
  function wxIcon(d) {
    const w = weatherOn(d); if (!w) return '';
    return `<span class="wx" title="${w.max}° / ${w.min}°">${icon(wxName(w.code), 'xs')}</span>`;
  }
  // one line for a single day: icon, description, ↑ high ↓ low (home header and the day dialog)
  function wxLine(d, tap) {
    const w = weatherOn(d); if (!w) return '';
    const n = wxName(w.code); const label = `${t('wx_' + n)}, ${t('wxHighLow', { max: w.max, min: w.min })}`;
    const inner = `${icon(n)}<span>${esc(t('wx_' + n))}</span><span class="wx-t tnum" aria-hidden="true">↑${w.max}° <i>↓${w.min}°</i></span>`;
    // on Home a tap refreshes the location (the only place the browser may ask for it again)
    return tap ? `<button type="button" class="wx-line" data-a="wx-locate" aria-label="${esc(label)} · ${esc(t('weatherRefresh'))}" title="${esc(t('weatherRefresh'))}">${inner}</button>`
      : `<div class="wx-line" role="img" aria-label="${esc(label)}">${inner}</div>`;
  }
  let wxBusy = false;
  function refreshWeather(force) {
    if (!weatherWanted() || wxBusy || !WX || WX.lat == null) return;
    if (!force && WX.at && Date.now() - WX.at < 3 * 3600e3) return;
    wxBusy = true;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${WX.lat}&longitude=${WX.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`)
      .then((r) => r.json()).then((j) => {
        const dl = j.daily || {}; const days = {};
        (dl.time || []).forEach((k, i) => { days[k] = { code: dl.weather_code[i], max: Math.round(dl.temperature_2m_max[i]), min: Math.round(dl.temperature_2m_min[i]) }; });
        WX = { ...WX, at: Date.now(), days }; try { localStorage.setItem(WX_KEY, JSON.stringify(WX)); } catch (e) { /* ignore */ }
        render();
      }).catch(() => {}).finally(() => { wxBusy = false; });
  }
  // follows the device's location without nagging: the browser is asked only when the person acts (turns the forecast on,
  // or taps the weather line on Home) or when the permission is already granted. iPhone home-screen apps forget the
  // permission between launches, so there the last known place is used until the next tap.
  let wxLocating = false;
  const saveWx = () => { try { localStorage.setItem(WX_KEY, JSON.stringify(WX)); } catch (e) { /* ignore */ } };
  const geoGranted = () => (navigator.permissions && navigator.permissions.query ? navigator.permissions.query({ name: 'geolocation' }).then((r) => r.state === 'granted', () => false) : Promise.resolve(false));
  async function ensureWeather(ask = false) {
    if (wxLocating) return;
    const have = WX && WX.lat != null;
    if (!ask && have && WX.locAt && Date.now() - WX.locAt < 3 * 3600e3) return refreshWeather();
    if (!ask && have && !(await geoGranted())) return refreshWeather(); // keep the last place rather than prompt
    if (!ask && !have && WX && WX.asked && !(await geoGranted())) return; // asked once already on this device
    wxLocating = true;
    const use = (lat, lon, fromDevice) => {
      wxLocating = false; lat = +lat.toFixed(2); lon = +lon.toFixed(2);
      const moved = !WX || WX.lat == null || Math.abs(WX.lat - lat) > 0.05 || Math.abs(WX.lon - lon) > 0.05;
      WX = { ...(WX || {}), lat, lon, locAt: Date.now(), fromDevice, asked: true }; saveWx();
      refreshWeather(moved || ask);
    };
    const failed = () => {
      if (have) return use(WX.lat, WX.lon, WX.fromDevice);
      toast(t('weatherFallback'), { icon: 'location_off' }); use(44.82, 20.46, false);
    };
    if (!navigator.geolocation) return failed();
    navigator.geolocation.getCurrentPosition((p) => use(p.coords.latitude, p.coords.longitude, true), failed, { timeout: 10000, maximumAge: 30 * 60e3 });
  }
  function renderCalendar(list) {
    if (weatherWanted()) setTimeout(ensureWeather);
    const m = ui.calMonth; const y = m.getFullYear(), mo = m.getMonth();
    const first = new Date(y, mo, 1); const days = new Date(y, mo + 1, 0).getDate();
    const startW = weekdayIdx(first); const total = Math.ceil((startW + days) / 7) * 7;
    const T = todayD(); let cells = '';
    for (let i = 0; i < total; i++) {
      const n = i - startW + 1;
      if (n < 1 || n > days) { cells += '<div class="cal-cell pad" aria-hidden="true"></div>'; continue; }
      const d = new Date(y, mo, n); const items = entriesOn(d, list); const isT = sameDay(d, T);
      const wx = weatherOn(d); const label = `${fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}, ${items.length}${wx ? `, ${wx.max}° / ${wx.min}°` : ''}`;
      cells += `<button class="cal-cell ${isT ? 'today' : ''} ${d < T ? 'past' : ''}" data-a="day" data-d="${dkey(d)}" aria-label="${esc(label)}">
        <span class="cal-top"><span class="n tnum">${n}</span>${wxIcon(d)}</span>
        <span class="items">${items.slice(0, 4).map((it) => `<span class="it ${isDoneOn(it, d) ? 'done' : ''}" style="--c:${entryColor(it)}">${esc(it.name)}</span>`).join('')}</span>
        ${items.length > 4 ? `<span class="more">${esc(t('moreN', { n: items.length - 4 }))}</span>` : ''}
      </button>`;
    }
    const monthTitle = new Intl.DateTimeFormat(loc(), { month: 'long', year: 'numeric' }).format(m);
    return `<div class="stack">
      <div class="cal-head">
        <button class="icon-btn" data-a="cal-prev" aria-label="Previous month">${icon('chevron_left')}</button>
        <h3>${esc(monthTitle)}</h3>
        <button class="btn btn-text today-btn" data-a="cal-today">${esc(t('today'))}</button>
        <button class="icon-btn" data-a="cal-next" aria-label="Next month">${icon('chevron_right')}</button>
      </div>
      <div class="cal-dow">${DOW_KEYS.map((k) => `<span>${esc(t(k))}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
    </div>`;
  }

  /* ---------- Watch ("Praćenje"): IKEA products waited for; the server checks them and sends a push when back in stock ---------- */
  const firstName = (p) => String((p && (p.name || p.email)) || '').trim().split(/[\s@]+/)[0];
  const IKEA_RE = /^https?:\/\/(www\.)?ikea\.com\/[a-z]{2}\/[a-z]{2}\/p\/.*?-(s?\d{8})\/?(\?.*)?$/i;
  const watchChecking = new Set();
  function screenWatch() {
    if (!isCloud()) return { title: t('watchTab'), html: `<p class="quiet">${esc(t('watchCloudOnly'))}</p>`, narrow: true };
    const wo = watchOpts();
    const list = (Cloud.watches || []).slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const chip = (label, ic, s, extra) => `<span class="chip ${s === 'out' ? 'out' : s === 'in' ? '' : 'neutral'}">${icon(ic, 'xs')}${esc(label)}: ${esc(t(s === 'in' ? 'wIn' : s === 'out' ? 'wOut' : 'wUnknown'))}${extra ? ' ' + esc(extra) : ''}</span>`;
    const when = (v) => fmtDate(new Date(v), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const card = (w) => {
      const busy = watchChecking.has(w.id);
      const meta = busy ? t('watchChecking') : w.error && w.online === 'unknown' && w.store === 'unknown' ? t('watchCantCheck') : w.checkedAt ? t('watchChecked', { d: when(w.checkedAt) }) : t('watchNever');
      const shared = Array.isArray(w.members) && w.members.length > 1;
      const mine = w.owner === me().uid; const pName = Cloud.partner ? firstName(Cloud.partner) : '';
      // owner: one tap shares with the partner or takes it back; partner sees whose it is
      const share = mine ? (Cloud.partner ? `<button class="btn btn-sm w-share ${shared ? 'on' : ''}" data-a="watch-share" data-id="${esc(w.id)}" aria-pressed="${shared}">${icon(shared ? 'group' : 'person', 'xs')}${esc(shared ? t('watchSharedWith', { name: pName }) : t('watchShareWith', { name: pName }))}</button>` : '')
        : `<span class="chip neutral">${icon('group', 'xs')}${esc(t('watchFrom', { name: pName || t('partnerTitle') }))}</span>`;
      return `<div class="watch-card">
        ${w.image ? `<img src="${esc(w.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="ph">${icon('shopping_bag')}</span>`}
        <div class="grow">
          <span class="w-title">${esc(w.title || w.url)}</span>
          ${w.price ? `<span class="w-meta w-price">${esc(w.price)}${w.priceWas ? ` <s>${esc(t('watchPriceWas', { p: w.priceWas }))}</s>` : ''}</span>` : ''}
          <span class="w-chips">${chip(t('watchOnline'), 'local_shipping', w.online)}${chip(t('watchStore'), 'storefront', w.store, w.store === 'in' && w.storeQty ? `(${w.storeQty})` : '')}</span>
          ${w.store === 'out' && w.restock ? `<span class="w-meta">${esc(t('watchRestock', { d: fmtDate(new Date(w.restock), { day: 'numeric', month: 'short' }) }))}</span>` : ''}
          <span class="w-meta">${esc(meta)}</span>
          <span class="watch-opts sm">${watchOpt('stock', 'inventory_2', t('watchOptStockShort'), w.notifyStock !== false, w.id)}${watchOpt('price', 'trending_down', t('watchOptPriceShort'), !!w.notifyPrice, w.id)}</span>
          <span class="w-actions">
            <a class="icon-btn" href="${esc(w.url)}" target="_blank" rel="noopener" aria-label="${esc(t('watchOpen'))}" title="${esc(t('watchOpen'))}">${icon('open_in_new', 'sm')}</a>
            <button class="icon-btn" data-a="watch-check" data-id="${esc(w.id)}" aria-label="${esc(t('watchCheckNow'))}" title="${esc(t('watchCheckNow'))}" ${busy ? 'disabled' : ''}>${icon('refresh', 'sm')}</button>
            <button class="icon-btn" data-a="watch-del" data-id="${esc(w.id)}" aria-label="${esc(t('deleteEntry'))}" title="${esc(t('deleteEntry'))}">${icon('delete', 'sm')}</button>
          </span>
          ${share}
        </div></div>`;
    };
    const html = `<div class="stack">
      <form class="watch-add" id="watch-form" novalidate>
        <div class="field">${icon('link')}<input id="watch-url" type="url" inputmode="url" placeholder="${esc(t('watchAddPh'))}" value="${esc(ui.watchDraft || '')}" autocomplete="off"></div>
        <button class="btn btn-primary" type="submit">${esc(t('watchAdd'))}</button>
      </form>
      <div class="watch-opts"><span class="muted">${esc(t('watchWhat'))}:</span>${watchOpt('stock', 'inventory_2', t('watchOptStock'), wo.stock)}${watchOpt('price', 'trending_down', t('watchOptPrice'), wo.price)}</div>
      ${list.length ? list.map(card).join('') : `<p class="quiet">${esc(t('watchEmpty'))}</p>`}
    </div>`;
    return { title: t('watchTab'), html, narrow: true };
  }
  // what to be told about: chosen in the add form (remembered for next time) and changeable on each card
  function watchOpts() { const o = ui.watchOpts || { stock: true, price: false }; return { stock: o.stock !== false, price: !!o.price }; }
  function watchOpt(k, ic, label, on, id) {
    return `<button type="button" class="w-opt ${on ? 'on' : ''}" data-a="watch-opt" data-k="${k}" ${id ? `data-id="${esc(id)}"` : ''} aria-pressed="${on}">${icon(on ? 'notifications_active' : ic, 'xs')}${esc(label)}</button>`;
  }
  function watchToggleOpt(k, id) {
    if (!id) { const o = watchOpts(); o[k] = !o[k]; ui.watchOpts = o; watchRender(); return; }
    const w = (Cloud.watches || []).find((x) => x.id === id); if (!w) return;
    const field = k === 'stock' ? 'notifyStock' : 'notifyPrice';
    const now = k === 'stock' ? w.notifyStock !== false : !!w.notifyPrice;
    const other = k === 'stock' ? !!w.notifyPrice : w.notifyStock !== false;
    if (now && !other) { toast(t('watchPickOne'), { error: true }); return; }
    Cloud.db.collection('watches').doc(id).update({ [field]: !now }).catch(cloudError);
  }
  async function watchCheck(id) {
    watchChecking.add(id); watchRender();
    try {
      const token = await window.firebase.auth().currentUser.getIdToken();
      const r = await fetch('/api/watch', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) toast(`${t('watchCantCheck')}: ${j.error || r.status}`, { error: true, ms: 9000 });
    } catch (e) { toast(`${t('watchCantCheck')}: ${(e && e.message) || e}`, { error: true, ms: 9000 }); }
    watchChecking.delete(id); watchRender();
  }
  function watchAdd() {
    const inp = $('#watch-url'); const url = (inp.value || '').trim();
    const m = url.match(IKEA_RE); if (!m) { toast(t('watchOnlyIkea'), { error: true, ms: 6000 }); inp.focus(); return; }
    const itemNo = m[2].toLowerCase();
    if ((Cloud.watches || []).some((w) => w.itemNo === itemNo)) { toast(t('watchDup'), { error: true }); return; }
    const o = watchOpts(); if (!o.stock && !o.price) { toast(t('watchPickOne'), { error: true }); return; }
    const u = me(); const members = [u.uid];
    const ref = Cloud.db.collection('watches').doc();
    ref.set({ owner: u.uid, members, url: url.split('?')[0], itemNo, title: '', notifyStock: o.stock, notifyPrice: o.price, createdAt: new Date().toISOString() })
      .then(() => watchCheck(ref.id)).catch(cloudError);
    inp.value = ''; ui.watchDraft = ''; toast(t('watchAdded'), { icon: 'shopping_bag' });
  }
  // re-render the tab without losing what is being typed in the link field
  function watchRender() {
    const typing = document.activeElement && document.activeElement.id === 'watch-url';
    render();
    if (typing) { const i = $('#watch-url'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
  }
  function watchShare(id) {
    const w = (Cloud.watches || []).find((x) => x.id === id); if (!w || !Cloud.partner || w.owner !== me().uid) return;
    const shared = (w.members || []).includes(Cloud.partner.uid);
    Cloud.db.collection('watches').doc(id).update({ members: shared ? [me().uid] : [me().uid, Cloud.partner.uid] }).catch(cloudError);
  }
  function watchDel(id) {
    const w = (Cloud.watches || []).find((x) => x.id === id); if (!w) return;
    if (!confirm(t('watchDeleteConfirm', { name: w.title || w.url }))) return;
    const ref = Cloud.db.collection('watches').doc(id);
    (w.owner === me().uid ? ref.delete() : ref.update({ members: window.firebase.firestore.FieldValue.arrayRemove(me().uid) })).catch(cloudError);
  }

  /* ---------- Profile ---------- */
  function screenProfile() {
    const u = me();
    const opt = (a, ic, label) => `<button class="opt" data-a="go" data-v="${a}">${icon(ic)}<span class="grow">${esc(label)}</span>${icon('chevron_right')}</button>`;
    const html = `
      <div class="profile-head">${avatarHtml(u)}<h2>${esc(u.name || t('noName'))}</h2><span class="mail">${esc(u.email || t('noEmail'))}</span></div>
      <div class="stack" style="margin-top:12px">
        ${isCloud() ? opt('partner', 'group', t('partnerTitle') + (Cloud.partner ? ' · ' + (Cloud.partner.name || Cloud.partner.email) : '')) : ''}
        ${opt('accountCenter', 'account_balance', t('accountCenter'))}
        ${opt('notifications', 'notifications', t('notifications'))}
        ${opt('language', 'language', t('language'))}
        ${opt('appearance', 'palette', t('appearance'))}
        ${opt('credits', 'info', t('credits'))}
        ${isAdmin() ? opt('users', 'group', t('usersTitle')) : ''}
      </div>
      <button class="btn btn-primary btn-block" data-a="logout">${icon('logout')}${esc(t('logOut'))}</button>`;
    return { title: t('profileTitle'), html, narrow: true };
  }
  // owner-only list of who uses the app (api/admin-users checks the signed-in email again)
  const ADMIN_EMAILS = ['kristinatodorovic2403@gmail.com'];
  const isAdmin = () => isCloud() && ADMIN_EMAILS.includes(String((me() || {}).email || '').toLowerCase());
  let adminUsers = null;
  function screenUsers() {
    if (!adminUsers || adminUsers.error) {
      adminUsers = { loading: true };
      window.firebase.auth().currentUser.getIdToken()
        .then((tok) => fetch('/api/admin-users', { headers: { authorization: `Bearer ${tok}` } }))
        .then(async (r) => { const j = await r.json().catch(() => ({})); adminUsers = r.ok ? j : { error: j.error || r.status }; })
        .catch((e) => { adminUsers = { error: (e && e.message) || e }; })
        .then(() => render());
    }
    const day = (v) => (v ? fmtDate(new Date(v), { day: 'numeric', month: 'short', year: 'numeric' }) : t('usersNever'));
    let body;
    if (adminUsers.loading) body = `<p class="quiet">…</p>`;
    else if (adminUsers.error) body = `<p class="quiet">${esc(String(adminUsers.error))}</p>`;
    else {
      const list = adminUsers.users || [];
      body = `<p class="muted" style="margin:0;font-size:13.5px">${esc(t('usersCount', { n: list.length, w: list.filter((u) => u.web).length }))}</p>
        <div class="field">${icon('search')}<input id="users-q" type="search" placeholder="${esc(t('usersSearch'))}" autocomplete="off"></div>
        <div class="stack" id="users-list" style="gap:8px">${list.map((u) => `<div class="tile user-row" style="cursor:default" data-q="${esc((u.name + ' ' + u.email).toLowerCase())}">
          <span class="grow"><b>${esc(u.name || '—')}</b><small>${esc(u.email)}</small>
          <small>${esc(t('usersLast', { d: day(u.lastLogin) }))}</small>
          <span style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${u.web ? `<span class="chip">${esc(t('usersWeb'))}</span>` : `<span class="chip neutral">${esc(t('usersOldOnly'))}</span>`}
            ${u.items ? `<span class="chip neutral">${esc(t('usersItems', { n: u.items }))}</span>` : ''}${u.devices ? `<span class="chip neutral">${esc(t('usersDevices', { n: u.devices }))}</span>` : ''}${u.partner ? `<span class="chip neutral">${icon('group', 'xs')}</span>` : ''}</span></span></div>`).join('')}</div>`;
    }
    return { title: t('usersTitle'), html: `<div class="stack">${body}</div>`, narrow: true };
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
    const u = me(); const list = entries();
    const doneTotal = list.reduce((n, it) => n + (it.kind === 'list' ? Object.values(it.checks || {}).reduce((a, ids) => a + ids.length, 0) : Object.keys(it.done || {}).length), 0);
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
          ${stat(BRAND, 'task_alt', t('statTasks'), list.filter((it) => it.kind !== 'list').length, '', true)}
          ${stat(LIST_COLOR, 'checklist', t('statLists'), list.filter((it) => it.kind === 'list').length, '', true)}
          ${stat('#4CAF50', 'done_all', t('completedLabel'), doneTotal, '', true)}
          ${stat('#FFB300', 'star', t('importantLabel'), list.filter((it) => it.important).length, '', true)}
        </div>
      </section>
      <button class="btn btn-danger btn-block" data-a="logout">${icon('logout')}${esc(t('logOut'))}</button>`;
    return { title: t('myProfileData'), html, narrow: true };
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
  function screenPartner() {
    const p = Cloud.partner;
    const html = p
      ? `<div class="tile" style="cursor:default">${avatarHtml({ name: p.name, photo: p.photo }, 'sm')}<span class="grow"><b>${esc(p.name || p.email)}</b><small>${esc(p.email)}</small></span>
          <button class="btn btn-outline danger btn-sm" data-a="partner-unlink">${esc(t('unlinkBtn'))}</button></div>
         <p class="muted" style="margin:0">${esc(t('partnerDesc'))}</p>`
      : `<p class="muted" style="margin:0">${esc(t('partnerHelp'))}</p>
         <form class="stack" id="partner-form" novalidate style="gap:14px">
           ${field({ id: 'partner-email', label: t('partnerEmail'), type: 'email', ic: 'mail', auto: 'off' })}
           <button class="btn btn-primary btn-block" type="submit">${icon('group_add')}${esc(t('linkBtn'))}</button>
         </form>`;
    return { title: t('partnerTitle'), html, narrow: true };
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
    if (isCloud()) return screenPushNotifications();
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
  function screenPushNotifications() {
    const n = settings().notif; const on = pushOnHere();
    const supported = pushSupported();
    const right = on ? `<span class="chip">${icon('check', 'xs')}${esc(t('pushOn'))}</span>`
      : supported ? `<button class="btn btn-primary btn-sm" data-a="push-on">${esc(t('pushTurnOn'))}</button>`
      : `<span class="chip neutral">${esc(t('notSupported'))}</span>`;
    const html = `<div class="stack">
      <div class="switch-tile" style="cursor:default">${icon('notifications_active')}<span class="grow"><b>${esc(t('pushDevice'))}</b><small>${esc(t('pushDeviceDesc'))}</small></span>${right}</div>
      ${!supported && isIos() ? `<p class="muted" style="margin:0;font-size:13.5px">${esc(t('pushIosHint'))}</p>` : ''}
      ${switchTile('n-rem', t('reminders'), t('remindersPushDesc'), n.reminders !== false, 'notif-set')}
      ${switchTile('n-shared', t('sharedChanges'), t('sharedChangesDesc'), n.shared !== false, 'notif-set')}
      ${switchTile('n-morning', t('morningSummary'), t('morningSummaryDesc'), n.morning !== false, 'notif-set')}
      ${n.morning !== false ? `<div class="field picker-field"><span class="pick-ic" aria-hidden="true">${icon('schedule')}</span><label for="n-morning-time">${esc(t('morningTime'))}</label><input id="n-morning-time" type="time" value="${esc(n.morningTime || '08:00')}"></div>` : ''}
    </div>
    ${on ? `<button class="btn btn-outline btn-block" data-a="push-test">${icon('notification_add')}${esc(t('sendTest'))}</button>
    <button class="btn btn-text btn-block" data-a="push-off">${esc(t('pushTurnOff'))}</button>` : ''}`;
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
      ${switchTile('weather-switch', t('weather'), t('weatherDesc'), !!s.weather, 'weather-toggle')}`;
    return { title: t('appearance'), html, narrow: true };
  }
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

  const TABS = { home: screenHome, reminders: screenReminders, watch: screenWatch, profile: screenProfile };
  const SCREENS = {
    partner: screenPartner, accountCenter: screenAccountCenter, profileData: screenProfileData, security: screenSecurity,
    changePassword: screenChangePassword, connected: screenConnected, notifications: screenNotifications, language: screenLanguage,
    appearance: screenAppearance, credits: screenCredits, deletion: screenDeletion, users: screenUsers,
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

  function entryDialog(kind, existing, dateK) {
    const T = todayD();
    const base = existing ? JSON.parse(JSON.stringify(existing)) : {
      kind, name: '', description: '', date: dateK || '', time: '', important: false, repeat: { type: 'none' }, items: [],
    };
    const st = {
      items: (base.items || []).map((x) => ({ ...x })),
      date: base.date || '', time: base.time || '', hasDate: !!base.date, remind: remindList(base),
    };
    const ref = fromKey(base.date || dkey(T));
    st.rep = { type: 'none', every: 1, unit: 'day', days: [weekdayIdx(ref)], monthDay: ref.getDate(), ...(base.repeat || {}) };
    if (!st.rep.days || !st.rep.days.length) st.rep.days = [weekdayIdx(ref)];
    const opt = (v, label, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(label)}</option>`;
    openModal(`<form class="dialog" id="entry-form" role="dialog" aria-modal="true" aria-labelledby="ed-t" novalidate>
      <div class="dialog-head" id="ef-head"><span class="ms" id="ef-head-ic" aria-hidden="true">task_alt</span><h2 id="ed-t"></h2>
        <button type="button" class="icon-btn" data-a="modal-close" aria-label="${esc(t('cancel'))}">${icon('close')}</button></div>
      <div class="dialog-body">
        <div class="seg" role="radiogroup" aria-label="${esc(t('whatToAdd'))}">
          <button type="button" role="radio" class="seg-btn" data-kind="task">${icon('task_alt', 'sm')}${esc(t('kindTask'))}</button>
          <button type="button" role="radio" class="seg-btn" data-kind="list">${icon('checklist', 'sm')}${esc(t('kindList'))}</button>
        </div>
        <div class="name-row">
          <div class="field">${icon('title')}<label for="ef-name">${esc(t('titleLabel'))}</label><input id="ef-name" value="${esc(base.name)}" autocomplete="off" required></div>
          <div class="field select" id="ef-type-wrap"><label for="ef-type">${esc(t('type'))}</label><span class="type-ic" id="ef-type-ic">${icon((base.type || 'task') === 'event' ? 'event' : 'check_circle')}</span><select id="ef-type">${opt('task', cap(t('task')), base.type || 'task')}${opt('event', cap(t('event')), base.type || 'task')}</select></div>
        </div>
        <div class="items-edit" id="ef-items-wrap"><span class="lbl">${esc(t('itemsLabel'))}</span><div id="ef-items" class="stack" style="gap:8px"></div>
          <div class="add-item"><input id="ef-new-item" placeholder="${esc(t('newItemPh'))}" autocomplete="off" aria-label="${esc(t('addItem'))}"><button type="button" class="btn btn-tonal btn-sm" id="ef-add-item">${icon('add', 'sm')}${esc(t('addItem'))}</button></div></div>
        <div id="ef-when"></div>
        <div class="field select"><span style="margin-left:14px;color:var(--primary-ink)">${icon('repeat')}</span><label for="ef-rep">${esc(t('repetition'))}</label><select id="ef-rep">${REPEAT_TYPES.map(([v, k]) => opt(v, t(k), st.rep.type)).join('')}</select></div>
        <div id="ef-rep-dyn"></div>
        <div class="field" style="align-items:flex-start"><label for="ef-desc">${esc(t('descOptional'))}</label><textarea id="ef-desc" rows="2">${esc(base.description || '')}</textarea></div>
        ${isCloud() ? (existing && ownerIsPartner(existing)
          ? `<p class="muted" style="margin:0;display:flex;gap:8px;align-items:center">${icon('group', 'sm')}${esc(t('sharedBy', { name: (Cloud.partner && Cloud.partner.name) || '' }))}</p>`
          : Cloud.partner
            ? `<label class="inline-switch" for="ef-share"><span style="color:var(--primary-ink);display:grid">${icon('group')}</span><span class="grow">${esc(t('shareWith', { name: Cloud.partner.name || Cloud.partner.email }))}</span><span class="switch"><input type="checkbox" role="switch" id="ef-share" ${existing && sharedWithPartner(existing) ? 'checked' : ''}><i></i></span></label>`
            : `<p class="muted" style="margin:0;font-size:13px">${esc(t('partnerLinkFirst'))}</p>`) : ''}
        <label class="inline-switch" for="ef-imp"><span class="star" id="ef-star" style="color:${base.important ? 'var(--star)' : 'var(--muted)'}">${icon('star', 'fill')}</span><span class="grow">${esc(t('important'))}</span><span class="switch"><input type="checkbox" role="switch" id="ef-imp" ${base.important ? 'checked' : ''}><i></i></span></label>
        <p class="err-text" id="ef-err" hidden></p>
      </div>
      <div class="dialog-foot">
        ${existing ? `<button type="button" class="btn btn-text" style="color:var(--error)" data-a="delete" data-id="${existing.uid}">${icon('delete', 'sm')}${esc(t('delete'))}</button>` : ''}
        <button type="button" class="btn btn-text" style="margin-right:auto" data-a="modal-close">${esc(t('cancel'))}</button>
        <button type="submit" class="btn btn-primary">${esc(t('save'))}</button>
      </div></form>`);

    const err = (m) => { const el = $('#ef-err'); el.textContent = m; el.hidden = !m; };
    function drawItems() {
      const box = $('#ef-items'); if (!box) return;
      box.innerHTML = st.items.map((x, i) => `<div class="item-edit"><span class="ms sm" aria-hidden="true">check_box_outline_blank</span>
        <input data-i="${i}" value="${esc(x.text)}" aria-label="${esc(t('itemsLabel'))} ${i + 1}">
        <button type="button" class="icon-btn" data-rm="${i}" aria-label="${esc(t('delete'))}">${icon('close', 'sm')}</button></div>`).join('');
    }
    function addItem() {
      const inp = $('#ef-new-item'); const v = inp.value.trim(); if (!v) return;
      st.items.push({ id: uuid().slice(0, 8), text: v }); inp.value = ''; drawItems(); inp.focus(); err('');
    }
    function drawRep() {
      const r = st.rep; let h = '';
      if (r.type === 'interval') {
        h = `<div class="field-row"><div class="field"><label for="ef-every">${esc(t('everyLabel'))}</label><input id="ef-every" type="number" min="1" max="99" inputmode="numeric" value="${esc(r.every || 1)}"></div>
          <div class="field select"><label for="ef-unit">&nbsp;</label><select id="ef-unit" aria-label="${esc(t('everyLabel'))}">${UNITS.map(([v, k]) => opt(v, t(k), r.unit)).join('')}</select></div></div>`;
      } else if (r.type === 'weekdays') {
        h = `<div class="day-pills" role="group" aria-label="${esc(t('repWeekdays'))}">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<button type="button" class="day-pill" data-day="${i}" aria-pressed="${r.days.includes(i)}">${esc(t(DOW_KEYS[i]))}</button>`).join('')}</div>`;
      } else if (r.type === 'monthday') {
        h = `<div class="field">${icon('calendar_today')}<label for="ef-mday">${esc(t('dayOfMonth'))}</label><input id="ef-mday" type="number" min="1" max="31" inputmode="numeric" value="${esc(r.monthDay)}"></div>`;
      }
      const box = $('#ef-rep-dyn'); box.innerHTML = h; box.hidden = !h;
    }
    function drawWhen() {
      const showTime = st.hasDate || st.rep.type !== 'none';
      const dateHtml = st.hasDate
        ? `<div class="field picker-field date-pretty"><span class="pick-ic" aria-hidden="true">${icon('event')}</span><label for="ef-date">${esc(t('date'))}</label>
            <span class="date-text" id="ef-date-text" aria-hidden="true">${esc(prettyDate(st.date))}</span>
            <input id="ef-date" type="date" value="${esc(st.date)}">
            <button type="button" class="icon-btn" id="ef-date-clear" aria-label="${esc(t('removeDate'))}">${icon('close', 'sm')}</button></div>`
        : `<button type="button" class="btn btn-outline add-date" id="ef-add-date">${icon('event')}${esc(t('addDate'))}</button>`;
      const timeHtml = showTime ? `<div class="field picker-field"><span class="pick-ic" aria-hidden="true">${icon('schedule')}</span><label for="ef-time">${esc(t('timeOptional'))}</label><input id="ef-time" type="time" value="${esc(st.time)}">
            <button type="button" class="icon-btn" id="ef-time-clear" aria-label="${esc(t('clearTime'))}" ${st.time ? '' : 'hidden'}>${icon('close', 'sm')}</button></div>` : '';
      $('#ef-when').innerHTML = `<div class="field-row dt-row ${showTime ? '' : 'one'}" id="ef-dt">${dateHtml}${timeHtml}<div id="ef-remind-wrap"></div></div>`;
      drawRemind();
    }
    function drawRemind() {
      const box = $('#ef-remind-wrap'); if (!box) return;
      const show = (st.hasDate || st.rep.type !== 'none') && st.time;
      const pre = (k) => t('beforeShort', { n: t(k) });
      const opts = [[0, t('remindAtShort')], [5, pre('min5')], [15, pre('min15')], [30, pre('min30')], [60, pre('hour1')], [1440, pre('day1')]];
      const summary = () => (st.remind.length ? opts.filter(([v]) => st.remind.includes(v)).map(([, l]) => l).join(', ') : t('remindOff'));
      // looks like a dropdown; the list inside has checkboxes, so several can be on
      $('#ef-dt').classList.toggle('with-remind', !!show); box.hidden = !show;
      box.innerHTML = show ? `<div class="field select multi-select"><span style="margin-left:14px;color:var(--primary-ink)">${icon('notifications')}</span><label>${esc(t('remindLabel'))}</label>
          <button type="button" class="ms-btn" id="ef-remind-btn" aria-haspopup="listbox" aria-expanded="false">${esc(summary())}</button>
          <div class="ms-menu" id="ef-remind-menu" role="listbox" aria-multiselectable="true" hidden>${opts.map(([v, l]) => `<label class="ms-opt"><input type="checkbox" data-remind="${v}" ${st.remind.includes(v) ? 'checked' : ''} ${v === 0 && st.remind.some((m) => m > 0) ? 'disabled' : ''}><span>${esc(l)}</span></label>`).join('')}</div></div>` : '';
      box.__summary = summary;
    }
    function prettyDate(k) { return k ? fmtDate(fromKey(k), { day: 'numeric', month: 'short', year: 'numeric' }) : ''; }
    function openPicker(id) {
      const el = document.getElementById(id); if (!el) return;
      el.focus(); try { if (el.showPicker) el.showPicker(); } catch (er) { /* some browsers only allow the picker from a direct tap on the field */ }
    }
    function drawKind() {
      const list = st.kind === 'list';
      $('#ef-items-wrap').hidden = !list;
      $('#ef-head-ic').textContent = list ? 'checklist' : 'task_alt';
      $('#ed-t').textContent = t(existing ? (list ? 'editList' : 'editTask') : (list ? 'newList' : 'newTask'));
      document.querySelectorAll('#entry-form .seg-btn').forEach((b) => b.setAttribute('aria-checked', b.dataset.kind === st.kind));
    }
    st.kind = base.kind === 'list' ? 'list' : 'task';
    drawItems(); drawRep(); drawWhen(); drawKind();
    const form = $('#entry-form');
    form.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm]'); if (rm) { st.items.splice(Number(rm.dataset.rm), 1); drawItems(); return; }
      const rb = e.target.closest('#ef-remind-btn');
      if (rb) { const m = $('#ef-remind-menu'); m.hidden = !m.hidden; rb.setAttribute('aria-expanded', !m.hidden); if (!m.hidden) m.scrollIntoView({ block: 'nearest', inline: 'nearest' }); return; }
      if (!e.target.closest('#ef-remind-menu')) { const m = $('#ef-remind-menu'); if (m && !m.hidden) { m.hidden = true; $('#ef-remind-btn').setAttribute('aria-expanded', 'false'); } }
      const dp = e.target.closest('.day-pill');
      if (dp) { const i = Number(dp.dataset.day); const s = new Set(st.rep.days); s.has(i) ? s.delete(i) : s.add(i); st.rep.days = [...s].sort(); dp.setAttribute('aria-pressed', s.has(i)); return; }
      if (e.target.closest('#ef-add-item')) addItem();
      const sk = e.target.closest('.seg-btn'); if (sk) { st.kind = sk.dataset.kind; drawKind(); err(''); return; }
      if (e.target.closest('#ef-time-clear')) { st.time = ''; $('#ef-time').value = ''; $('#ef-time-clear').hidden = true; drawRemind(); }
      if (e.target.closest('#ef-add-date')) { st.hasDate = true; if (!st.date) st.date = dkey(T); drawWhen(); openPicker('ef-date'); return; }
      if (e.target.closest('#ef-date-clear')) { st.hasDate = false; st.date = ''; drawWhen(); return; }
    });
    form.addEventListener('input', (e) => {
      if (e.target.dataset.i != null) st.items[Number(e.target.dataset.i)].text = e.target.value;
      if (e.target.id === 'ef-every') st.rep.every = Number(e.target.value);
      if (e.target.id === 'ef-mday') st.rep.monthDay = Number(e.target.value);
      if (e.target.id === 'ef-time') { const had = !!st.time; st.time = e.target.value; $('#ef-time-clear').hidden = !e.target.value; if (had !== !!st.time) drawRemind(); }
      if (e.target.id === 'ef-date' && e.target.value) {
        st.date = e.target.value; $('#ef-date-text').textContent = prettyDate(st.date);
        if (!existing) { const d = fromKey(st.date); st.rep.monthDay = d.getDate(); if (st.rep.days.length <= 1) st.rep.days = [weekdayIdx(d)]; if (st.rep.type === 'monthday' || st.rep.type === 'weekdays') drawRep(); }
      }
    });
    form.addEventListener('change', (e) => {
      if (e.target.id === 'ef-type') $('#ef-type-ic').innerHTML = icon(e.target.value === 'event' ? 'event' : 'check_circle');
      if (e.target.id === 'ef-rep') { st.rep.type = e.target.value; drawRep(); drawWhen(); }
      if (e.target.id === 'ef-unit') st.rep.unit = e.target.value;
      if (e.target.dataset.remind != null) {
        const v = Number(e.target.dataset.remind); const set = new Set(st.remind); e.target.checked ? set.add(v) : set.delete(v);
        if (v && e.target.checked) set.add(0); // an earlier reminder always comes with one at the time
        st.remind = [...set].sort((a, b) => a - b);
        const at = $('#ef-remind-menu input[data-remind="0"]'); at.checked = st.remind.includes(0); at.disabled = st.remind.some((m) => m > 0); $('#ef-remind-btn').textContent = $('#ef-remind-wrap').__summary();
      }
      if (e.target.id === 'ef-imp') $('#ef-star').style.color = e.target.checked ? 'var(--star)' : 'var(--muted)';
    });
    const ni = $('#ef-new-item'); if (ni) ni.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isList = st.kind === 'list';
      if (isList && ni && ni.value.trim()) addItem();
      const name = $('#ef-name').value.trim();
      if (!name) { err(t('nameEmptyWarning')); $('#ef-name').focus(); return; }
      const date = st.hasDate ? st.date : ''; if (st.hasDate && !date) return err(t('pickDateFirst'));
      const items = st.items.map((x) => ({ ...x, text: x.text.trim() })).filter((x) => x.text);
      if (isList && !items.length) return err(t('needItem'));
      const r = st.rep; let repeat = { type: 'none' };
      if (r.type === 'interval') { const n = Math.round(Number(r.every)); if (!(n >= 1 && n <= 99)) return err(t('everyLabel') + ' 1–99'); repeat = { type: 'interval', every: n, unit: r.unit || 'day' }; }
      if (r.type === 'weekdays') { if (!r.days.length) return err(t('pickDays')); repeat = { type: 'weekdays', days: r.days.slice() }; }
      if (r.type === 'monthday') { const n = Math.round(Number(r.monthDay)); if (!(n >= 1 && n <= 31)) return err(t('invalidDayOfMonth')); repeat = { type: 'monthday', monthDay: n }; }
      const data = {
        ...(existing || {}), uid: existing ? existing.uid : uuid(), kind: st.kind, type: $('#ef-type').value, name, description: $('#ef-desc').value.trim(),
        date, time: date || repeat.type !== 'none' ? st.time || '' : '', important: $('#ef-imp').checked, repeat, items: isList ? items : [], remind: st.remind,
        done: existing ? existing.done || {} : {}, checks: existing ? existing.checks || {} : {},
        createdAt: existing ? existing.createdAt : new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      delete data.snoozedUntil; delete data.sample;
      if (isCloud()) {
        const meUid = me().uid; data.owner = data.owner || meUid;
        if (data.owner === meUid) {
          const sh = $('#ef-share'); const share = !!(sh && sh.checked && Cloud.partner);
          data.members = share ? [meUid, Cloud.partner.uid] : [meUid];
        } else data.members = (existing && existing.members) || [data.owner, meUid];
      }
      if (!date && repeat.type !== 'none') data.anchor = (existing && existing.anchor) || dkey(T); else delete data.anchor;
      const list = me().tasks; const i = list.findIndex((x) => x.uid === data.uid);
      if (i >= 0) list[i] = data; else list.push(data);
      save(); closeModal(); render(); toast(t('saved'));
      // shared item added or changed → the partner gets a notification
      if (isCloud() && (data.members || []).length > 1) {
        const pick = (x) => JSON.stringify(['name', 'type', 'kind', 'date', 'time', 'repeat', 'items', 'description', 'important'].map((f) => x && x[f]));
        const wasShared = existing && (existing.members || []).length > 1;
        if (!wasShared) notifyShare(data.uid, 'added'); else if (pick(existing) !== pick(data)) notifyShare(data.uid, 'edited');
      }
    });
  }

  function dayDialog(dateK) {
    ui.dayOpen = dateK;
    const d = fromKey(dateK);
    openModal(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dd-t">
      <div class="dialog-head">${icon('event_note')}<div style="flex:1;min-width:0"><h2 id="dd-t">${esc(cap(fmtDate(d, { weekday: 'long' })))}</h2><p>${esc(fmtDate(d, { day: 'numeric', month: 'long', year: 'numeric' }))}</p>${wxLine(d)}</div></div>
      <div class="dialog-body" id="day-body" style="gap:10px"></div>
      <div class="dialog-foot"><button class="btn btn-text" style="margin-right:auto" data-a="modal-close">${esc(t('close'))}</button>
        <button class="btn btn-primary" data-a="add-on" data-d="${dateK}">${icon('add', 'sm')}${esc(t('addReminder'))}</button></div></div>`, () => { ui.dayOpen = null; });
    drawDay();
  }
  function drawDay() {
    const box = $('#day-body'); if (!box || !ui.dayOpen) return;
    const d = fromKey(ui.dayOpen); const items = entriesOn(d).sort(doneLast(d));
    box.innerHTML = items.length ? items.map((it) => entryCard(it, d)).join('')
      : `<div style="text-align:center;padding:12px 0" class="muted">${icon('event_busy', 'xl')}<p style="margin:6px 0 0">${esc(t('nothingToday'))}</p></div>`;
  }
  function refresh() { render(); drawDay(); }

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
  function findR(id) { return entries().find((r) => r.uid === id); }
  function toggleDone(it, d = todayD()) {
    const k = okey(it, d); it.done = it.done || {};
    if (it.done[k]) { delete it.done[k]; delete it.lateDoneOn; } else { it.done[k] = k === 'any' ? dkey(todayD()) : true; delete it.snoozedUntil; if (d < todayD()) it.lateDoneOn = dkey(todayD()); }
    save(); refresh();
  }
  function toggleCheck(it, itemId, d = todayD()) {
    const k = okey(it, d); it.checks = it.checks || {};
    const s = new Set(it.checks[k] || []); s.has(itemId) ? s.delete(itemId) : s.add(itemId);
    it.checks[k] = [...s]; if (!it.checks[k].length) delete it.checks[k];
    if (k === 'any') { if (isDoneOn(it, d)) it.doneAt = dkey(todayD()); else delete it.doneAt; }
    if (d < todayD()) { if (isDoneOn(it, d)) it.lateDoneOn = dkey(todayD()); else delete it.lateDoneOn; }
    save(); refresh();
    if (isDoneOn(it, d)) toast(t('listDone'), { icon: 'task_alt' });
  }
  function deleteR(id) {
    const r = findR(id); if (!r) return;
    confirmDialog({ title: t('deleteEntry'), body: t('deleteEntryConfirm', { name: r.name }), ok: t('delete'), danger: true, onOk: () => {
      const list = me().tasks; const i = list.findIndex((x) => x.uid === id); const [removed] = list.splice(i, 1);
      save(); render();
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
  function logout() { if (isCloud() && Cloud.on) { DB.guest = { ...settings(), notif: { ...settings().notif } }; window.firebase.auth().signOut(); return; } DB.guest = { ...settings(), notif: { ...settings().notif } }; DB.session = null; ui.auth = 'login'; ui.stack = []; save(); render(); }

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
      el.querySelector('[data-done]').addEventListener('click', () => { const x = findR(r.uid); const T = todayD(); if (x && !isDoneOn(x, T)) { if (x.kind === 'list') { x.checks = x.checks || {}; x.checks[okey(x, T)] = x.items.map((i) => i.id); save(); refresh(); } else toggleDone(x, T); } toast(t('markedDone'), { icon: 'task_alt' }); kill(); });
    }
    box.prepend(el);
    while (box.children.length > 3) box.lastChild.remove();
    setTimeout(kill, 60000);
  }
  function checkDue() {
    const u = me(); if (!u || !u.settings.notif.reminders) return;
    if (isCloud() && pushOnHere()) return; // the server sends these as push notifications
    const now = new Date(); const T = todayD(); const nowMin = now.getHours() * 60 + now.getMinutes(); const k = dkey(T);
    let changed = false;
    for (const it of entries()) {
      const body = () => (it.kind === 'list' ? `${checkedOn(it, T).length}/${it.items.length} · ` : '') + t('dontForget', { name: it.name });
      if (it.snoozedUntil && new Date(it.snoozedUntil) <= now) { delete it.snoozedUntil; changed = true; headsUp({ title: it.name, body: body(), r: it }); continue; }
      if (!it.time || !occursOn(it, T) || isDoneOn(it, T)) continue;
      for (const m of remindList(it)) {
        const due = timeToMin(it.time) - m; const fk = `${it.uid}|${m}|${k}`;
        if (nowMin >= due && nowMin - due <= 2 && !DB.fired[fk]) { DB.fired[fk] = 1; changed = true; headsUp({ title: it.name, body: body(), r: it }); }
      }
    }
    for (const fk in DB.fired) if (!fk.endsWith(k)) { delete DB.fired[fk]; changed = true; }
    if (changed) save();
  }

  /* ================= Cloud (Firebase): Google sign-in, sync, sharing with a partner ================= */
  // Runs only on a real host (Vercel / localhost). Inside the Claude preview the app stays in local demo mode.
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDh5rwxZ93C5LkCDLFfv4T4fTrpOw-AxeY',
    authDomain: 'reminder-c29a5.firebaseapp.com',
    projectId: 'reminder-c29a5',
    storageBucket: 'reminder-c29a5.appspot.com',
    messagingSenderId: '81351094737',
    appId: '1:81351094737:web:8831b721352a691b20f0f0',
  };
  const FB_VER = '10.12.2';
  // same Firestore as the old Android app: profiles live in `users`, items in `reminders` (one doc per task/list)
  const ITEMS = 'reminders', PEOPLE = 'users';
  const Cloud = { on: false, ready: false, fb: null, db: null, user: null, unsub: null, last: {}, partner: null, firstSnap: true, prevLocal: null };
  const cloudHost = () => {
    const h = location.hostname;
    if (location.protocol === 'file:') return false;
    if (/claude|anthropic|claudeusercontent/.test(h)) return false;
    try { if (window.self !== window.top) return false; } catch (e) { return false; }
    return true;
  };
  const isCloud = () => !!(me() && me().cloud);
  const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const clean = (o) => JSON.parse(JSON.stringify(o));
  const taskJson = (it) => { const c = clean(it); delete c.sample; return JSON.stringify(c); };

  async function initCloud() {
    if (!cloudHost()) return;
    try {
      const base = `https://cdn.jsdelivr.net/npm/firebase@${FB_VER}/`;
      await loadScript(base + 'firebase-app-compat.js');
      await Promise.all([loadScript(base + 'firebase-auth-compat.js'), loadScript(base + 'firebase-firestore-compat.js')]);
      const cfg = { ...FIREBASE_CONFIG };
      // In a normal browser the default Firebase domain is used (popup sign-in, nothing extra to configure).
      // In the iPhone home-screen app a redirect is needed, so there we use our own domain: /__/auth/* is proxied
      // to Firebase by vercel.json (requires https://<domain>/__/auth/handler as an OAuth redirect URI).
      const standaloneApp = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
      if (standaloneApp && !/^(localhost|127\.)/.test(location.hostname)) cfg.authDomain = location.host;
      Cloud.fb = window.firebase.initializeApp(cfg);
      Cloud.db = window.firebase.firestore();
      Cloud.on = true;
      try { await window.firebase.auth().getRedirectResult(); } catch (e) { cloudError(e); }
      window.firebase.auth().onAuthStateChanged((fu) => { Cloud.ready = true; if (fu) cloudSession(fu); else if (isCloud()) { cloudSignedOut(); } else render(); });
      render();
    } catch (e) {
      console.warn('Firebase not available, staying local', e);
    }
  }
  /* ---------- Web Push (server sends; see api/cron.js) ---------- */
  const VAPID_PUBLIC = 'BM92mCsLUOMAMnxqP2lZqy7ys02Hcm2LzPYLSLEo9KUfAqsJfyuqIG1m5-pdWa6_H_S77LfdiCa7xDUb3zunr_4';
  const PUSH_KEY = 'reminder-push-id';
  const localTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Belgrade'; } catch (e) { return 'Europe/Belgrade'; } };
  const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const pushId = () => { try { return localStorage.getItem(PUSH_KEY); } catch (e) { return null; } };
  const pushOnHere = () => !!pushId() && pushSupported() && Notification.permission === 'granted';
  async function sha1hex(s) { const b = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
  function b64uToBytes(s) { const p = '='.repeat((4 - (s.length % 4)) % 4); const raw = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(raw, (c) => c.charCodeAt(0)); }
  async function pushSave(sub) {
    const id = await sha1hex(sub.endpoint);
    await Cloud.db.collection('pushSubs').doc(id).set({ uid: me().uid, sub: JSON.parse(JSON.stringify(sub)), tz: localTz(), ua: navigator.userAgent.slice(0, 160), updatedAt: new Date().toISOString() });
    try { localStorage.setItem(PUSH_KEY, id); } catch (e) { /* ignore */ }
    return id;
  }
  async function pushEnable() {
    if (!pushSupported()) { toast(isIos() ? t('pushIosHint') : t('notSupported'), { error: true, ms: 8000 }); return; }
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { toast(t('blocked'), { error: true }); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uToBytes(VAPID_PUBLIC) }));
      await pushSave(sub);
      toast(t('pushEnabled'), { icon: 'notifications_active' });
    } catch (e) { console.warn(e); toast(`${t('pushFailed')}: ${(e && e.message) || e}`, { error: true, ms: 7000 }); }
  }
  async function pushDisable() {
    const id = pushId();
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch (e) { /* ignore */ }
    try { if (id) await Cloud.db.collection('pushSubs').doc(id).delete(); } catch (e) { /* ignore */ }
    try { localStorage.removeItem(PUSH_KEY); } catch (e) { /* ignore */ }
    toast(t('pushDisabled'));
  }
  // after sign-in: this device's subscription belongs to whoever is signed in now
  async function pushRefresh() {
    if (!pushId() || !pushSupported() || Notification.permission !== 'granted') return;
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await pushSave(sub); else localStorage.removeItem(PUSH_KEY); } catch (e) { /* ignore */ }
  }
  function notifyShare(id, action) {
    setTimeout(async () => {
      try {
        const token = await window.firebase.auth().currentUser.getIdToken();
        const r = await fetch('/api/notify-share', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ id, action }) });
        if (!r.ok) { const j = await r.json().catch(() => ({})); toast(`${t('partnerNotifyFailed')}: ${j.error || r.status}`, { error: true, ms: 7000 }); }
      } catch (e) { toast(`${t('partnerNotifyFailed')}: ${(e && e.message) || e}`, { error: true, ms: 7000 }); }
    }, 1200);
  }
  async function pushTest() {
    const id = pushId(); if (!id) return toast(t('pushNeedsOn'), { error: true });
    try {
      const r = await fetch('/api/push-test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, lang: settings().lang }) });
      if (r.ok) toast(t('pushTestSent'), { icon: 'notification_add' });
      else { const j = await r.json().catch(() => ({})); toast(`${t('pushFailed')}: ${j.error || j.status || r.status}`, { error: true, ms: 7000 }); }
    } catch (e) { toast(t('networkError'), { error: true }); }
  }
  function cloudError(e) {
    const code = (e && e.code) || '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
    const map = {
      'auth/unauthorized-domain': 'unauthorizedDomain', 'auth/wrong-password': 'wrongCredentials', 'auth/invalid-credential': 'wrongCredentials',
      'auth/user-not-found': 'wrongCredentials', 'auth/email-already-in-use': 'emailInUse', 'auth/weak-password': 'passwordMinLength',
      'auth/network-request-failed': 'networkError', 'permission-denied': 'permissionDenied',
    };
    toast(map[code] ? t(map[code]) : `${t('unknownError')}: ${code || (e && e.message) || e}`, { error: true, ms: 6000 });
  }
  async function cloudGoogle() {
    const auth = window.firebase.auth(); const prov = new window.firebase.auth.GoogleAuthProvider();
    prov.setCustomParameters({ prompt: 'select_account' });
    const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    try { if (standalone) await auth.signInWithRedirect(prov); else await auth.signInWithPopup(prov); }
    catch (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) { try { await auth.signInWithRedirect(prov); } catch (e2) { cloudError(e2); } }
      else cloudError(e);
    }
  }
  async function cloudSession(fu) {
    const prev = me(); Cloud.prevLocal = prev && !prev.cloud ? prev : Cloud.prevLocal;
    let u = DB.users[fu.uid];
    if (!u) { u = newUser({ name: fu.displayName || (fu.email || '').split('@')[0], email: fu.email || '', passHash: null, provider: 'google' }); delete DB.users[u.uid]; u.uid = fu.uid; DB.users[fu.uid] = u; }
    u.cloud = true; u.name = fu.displayName || u.name; u.email = fu.email || u.email; u.photo = fu.photoURL || u.photo; u.googleLinked = true;
    if (fu.metadata && fu.metadata.creationTime) u.createdAt = new Date(fu.metadata.creationTime).toISOString();
    u.lastLogin = new Date().toISOString();
    if (!prev || prev.uid !== fu.uid) { ui.tab = 'home'; ui.stack = []; ui.expanded.clear(); }
    Cloud.user = fu; DB.session = fu.uid; save(false);
    render(); // into the app right away; profile and items fill in as they arrive
    // profile doc: lets the partner find you by email; settings follow you across devices
    const ref = Cloud.db.collection(PEOPLE).doc(fu.uid);
    try {
      const snap = await ref.get(); const data = snap.exists ? snap.data() : {};
      if (data.settings) u.settings = { ...u.settings, ...data.settings, notif: { ...u.settings.notif, ...(data.settings.notif || {}) } };
      else { // first time in the new app: take language / dark mode chosen in the old app
        if (data.language && LANGS.some((l) => l.code === data.language)) u.settings.lang = data.language;
        if (typeof data.isDarkMode === 'boolean') u.settings.dark = data.isDarkMode;
      }
      u.partnerUid = data.partnerUid || null;
      if (data.creationDate && data.creationDate.toDate) u.createdAt = data.creationDate.toDate().toISOString();
      const ts = window.firebase.firestore.FieldValue.serverTimestamp();
      ref.set({
        uid: fu.uid, name: u.name, email: u.email || '', emailLower: (u.email || '').toLowerCase(), photoUrl: u.photo || data.photoUrl || null,
        language: u.settings.lang, isDarkMode: isDark(), settings: clean(u.settings), lastLogIn: ts, tz: localTz(), ...(snap.exists ? {} : { creationDate: ts }),
      }, { merge: true }).catch(cloudError);
      await loadPartner();
      pushRefresh();
    } catch (e) { cloudError(e); }
    if (Cloud.unsub) Cloud.unsub();
    Cloud.firstSnap = true;
    Cloud.unsub = Cloud.db.collection(ITEMS).where('members', 'array-contains', fu.uid).onSnapshot((qs) => {
      const tasks = []; const last = {};
      qs.forEach((doc) => { const it = { ...doc.data(), uid: doc.id }; tasks.push(it); last[it.uid] = taskJson(it); });
      const mine = DB.users[fu.uid]; if (!mine) return;
      mine.tasks = tasks; Cloud.last = last;
      if (Cloud.firstSnap) { Cloud.firstSnap = false; importLocal(mine); }
      save(false); refresh();
    }, (e) => cloudError(e));
    if (Cloud.unsubW) Cloud.unsubW();
    Cloud.unsubW = Cloud.db.collection('watches').where('members', 'array-contains', fu.uid).onSnapshot((qs) => {
      Cloud.watches = []; qs.forEach((doc) => Cloud.watches.push({ ...doc.data(), id: doc.id }));
      if (ui.tab === 'watch' && !ui.stack.length) watchRender();
    }, (e) => cloudError(e));
    render();
  }
  async function importLocal(u) {
    // first Google sign-in: bring over what was made on this device before (examples excluded)
    if ((u.tasks || []).length || !Cloud.prevLocal) return;
    const own = (Cloud.prevLocal.tasks || []).filter((x) => !x.sample);
    if (!own.length) return;
    u.tasks = own.map((x) => ({ ...x, owner: u.uid, members: [u.uid] }));
    Cloud.prevLocal = null; save(); toast(t('importedLocal', { n: own.length }), { icon: 'cloud_upload' });
  }
  async function loadPartner() {
    const u = me(); Cloud.partner = null;
    if (!u || !u.partnerUid) return;
    try { const s = await Cloud.db.collection(PEOPLE).doc(u.partnerUid).get(); if (s.exists) Cloud.partner = personOf(s); } catch (e) { cloudError(e); }
  }
  const personOf = (doc) => { const d = doc.data() || {}; return { uid: d.uid || doc.id, name: d.name || '', email: d.email || '', photo: d.photoUrl || d.photo || null }; };
  async function linkPartner(email) {
    const u = me(); const em = String(email || '').trim().toLowerCase();
    if (!validEmail(em)) return toast(t('invalidEmail'), { error: true });
    if (em === (u.email || '').toLowerCase()) return toast(t('partnerSelf'), { error: true });
    try {
      let qs = await Cloud.db.collection(PEOPLE).where('emailLower', '==', em).limit(1).get();
      if (qs.empty) qs = await Cloud.db.collection(PEOPLE).where('email', '==', String(email).trim()).limit(1).get();
      if (qs.empty) return toast(t('partnerNotFound'), { error: true, ms: 6000 });
      const p = personOf(qs.docs[0]);
      u.partnerUid = p.uid; Cloud.partner = p;
      await Cloud.db.collection(PEOPLE).doc(u.uid).set({ partnerUid: p.uid }, { merge: true });
      save(false); render(); toast(t('partnerLinked', { name: p.name || p.email }), { icon: 'group' });
    } catch (e) { cloudError(e); }
  }
  async function unlinkPartner() {
    const u = me(); u.partnerUid = null; Cloud.partner = null;
    try { await Cloud.db.collection(PEOPLE).doc(u.uid).set({ partnerUid: null }, { merge: true }); } catch (e) { cloudError(e); }
    save(false); render();
  }
  // push local changes (add / edit / check / delete) to Firestore
  function syncCloud() {
    const u = me(); if (!u || !u.cloud || !Cloud.db) return;
    const col = Cloud.db.collection(ITEMS); const seen = new Set();
    for (const it of u.tasks || []) {
      seen.add(it.uid);
      if (!it.owner) it.owner = u.uid;
      if (!Array.isArray(it.members) || !it.members.length) it.members = [it.owner];
      const j = taskJson(it);
      if (Cloud.last[it.uid] === j) continue;
      Cloud.last[it.uid] = j;
      const data = clean(it); delete data.uid; delete data.sample;
      col.doc(it.uid).set(data).catch(cloudError);
    }
    for (const id of Object.keys(Cloud.last)) {
      if (seen.has(id)) continue;
      const was = JSON.parse(Cloud.last[id]); delete Cloud.last[id];
      if (was.owner === u.uid) col.doc(id).delete().catch(cloudError);
      else col.doc(id).update({ members: window.firebase.firestore.FieldValue.arrayRemove(u.uid) }).catch(cloudError);
    }
    const sj = JSON.stringify(u.settings);
    if (Cloud.lastSettings !== sj) { Cloud.lastSettings = sj; Cloud.db.collection(PEOPLE).doc(u.uid).set({ settings: clean(u.settings), language: u.settings.lang, isDarkMode: isDark() }, { merge: true }).catch(() => {}); }
  }
  function cloudSignedOut() {
    if (Cloud.unsub) { Cloud.unsub(); Cloud.unsub = null; }
    if (Cloud.unsubW) { Cloud.unsubW(); Cloud.unsubW = null; }
    Cloud.user = null; Cloud.partner = null; Cloud.last = {}; Cloud.watches = [];
    if (isCloud()) { DB.session = null; }
    ui.auth = 'login'; ui.stack = []; save(false); render();
  }
  const sharedWithPartner = (it) => !!(Cloud.partner && Array.isArray(it.members) && it.members.includes(Cloud.partner.uid));
  const ownerIsPartner = (it) => !!(me() && it.owner && it.owner !== me().uid);
  function shareBadge(it) {
    if (!isCloud() || !Array.isArray(it.members) || it.members.length < 2) return '';
    const who = ownerIsPartner(it) ? (Cloud.partner && Cloud.partner.name) || '' : (Cloud.partner && Cloud.partner.name) || '';
    return `<span class="share-badge" title="${esc(t('sharedWith', { name: who }))}" aria-label="${esc(t('sharedWith', { name: who }))}">${icon('group', 'xs')}</span>`;
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
      case 'wx-locate': ensureWeather(true); break;
      case 'watch-check': watchCheck(el.dataset.id); break;
      case 'watch-del': watchDel(el.dataset.id); break;
      case 'watch-share': watchShare(el.dataset.id); break;
      case 'watch-opt': watchToggleOpt(el.dataset.k, el.dataset.id); break;
      case 'auth': ui.auth = el.dataset.v; ui.showPw = {}; render(); break;
      case 'pw-toggle': {
        const id = el.dataset.id; ui.showPw[id] = !ui.showPw[id]; const inp = document.getElementById(id);
        if (inp) { inp.type = ui.showPw[id] ? 'text' : 'password'; el.querySelector('.ms').textContent = ui.showPw[id] ? 'visibility_off' : 'visibility'; }
        break;
      }
      case 'demo': await loginDemo(); break;
      case 'google':
        if (Cloud.on) { cloudGoogle(); break; }
        confirmDialog({ title: t('signInWithGoogle'), body: t('googleNeedsFirebase'), ok: t('continueDemo'), onOk: loginDemo }); break;
      case 'add': closeModal(); entryDialog('task'); break;
      case 'add-on': { const d = el.dataset.d; closeModal(); entryDialog('task', null, d); break; }
      case 'edit': { const r = findR(el.dataset.id); if (r) { closeModal(); entryDialog(r.kind, r); } break; }
      case 'delete': closeModal(); deleteR(el.dataset.id); break;
      case 'toggle-done': { const r = findR(el.dataset.id); if (r) toggleDone(r, el.dataset.d ? fromKey(el.dataset.d) : todayD()); break; }
      case 'expand': { const key = el.dataset.id + '|' + (el.dataset.d || dkey(todayD())); ui.expanded.has(key) ? ui.expanded.delete(key) : ui.expanded.add(key); refresh(); break; }
      case 'cal-prev': ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() - 1, 1); render(); break;
      case 'cal-next': ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + 1, 1); render(); break;
      case 'cal-today': ui.calMonth = todayD(); render(); break;
      case 'rem-tab': ui.remTab = el.dataset.v; render(); scrollTop(); break;
      case 'home-filter': ui.homeFilter = el.dataset.v; render(); break;
      case 'agenda-filter': ui.agendaFilter = el.dataset.v; render(); break;
      case 'partner-unlink': unlinkPartner(); break;
      case 'agenda-more': ui.agendaDays = (ui.agendaDays || 30) + 30; render(); break;
      case 'day': dayDialog(el.dataset.d); break;
      case 'modal-close': closeModal(); break;
      case 'theme-toggle': settings().dark = !isDark(); save(); render(); break;
      case 'clear-samples': {
        const u = me(); u.tasks = u.tasks.filter((r) => !r.sample); save(); render(); toast(t('samplesRemoved')); break;
      }
      case 'test-notif':
        toast(t('testNotificationIn'), { icon: 'notification_add' });
        try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch (err) { /* ignore */ }
        setTimeout(() => headsUp({ title: t('testNotificationTitle'), body: t('testNotificationBody') }), 5000); break;
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
      case 'push-on': await pushEnable(); render(); break;
      case 'push-off': await pushDisable(); render(); break;
      case 'push-test': pushTest(); break;
      case 'pick-lang': ui.pendingLang = el.dataset.v; render(); break;
      case 'save-lang': {
        const code = ui.pendingLang || settings().lang; const changed = settings().lang !== code;
        settings().lang = code; settings().langChosen = true; ui.pendingLang = null; if (changed && me()) refreshSamples(me()); save(); render();
        toast(t('languageSetTo', { language: LANGS.find((l) => l.code === code).label })); break;
      }
      default: break;
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target; const a = el.dataset && el.dataset.a;
    if (el.id === 'n-morning-time' && el.value) { settings().notif.morningTime = el.value; save(); return; }
    if (a === 'toggle-check') { const r = findR(el.dataset.id); if (r) toggleCheck(r, el.dataset.item, fromKey(el.dataset.d)); return; }
    if (!a) return;
    const s = settings();
    if (a === 'dark-toggle') { s.dark = el.checked; save(); render(); }
    else if (a === 'weather-toggle') { s.weather = el.checked; save(); if (el.checked) ensureWeather(true); }
    else if (a === 'notif-set') {
      const map = { 'n-rem': 'reminders', 'n-snooze': 'snooze', 'n-sound': 'sound', 'n-morning': 'morning', 'n-shared': 'shared' }; s.notif[map[el.id]] = el.checked; save();
      if (el.id === 'n-morning') render();
    }
  });
  // calendar: swipe left / right to change month
  let swipe = null;
  document.addEventListener('touchstart', (e) => {
    const g = e.target.closest && e.target.closest('.cal-grid, .cal-head, .cal-dow');
    swipe = g && e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!swipe) return; const s0 = swipe; swipe = null;
    const dx = e.changedTouches[0].clientX - s0.x, dy = e.changedTouches[0].clientY - s0.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5 || Date.now() - s0.t > 800) return;
    const step = dx < 0 ? 1 : -1;
    ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + step, 1); render();
    const g = $('.cal-grid'); if (g) g.classList.add(step > 0 ? 'slide-l' : 'slide-r');
  }, { passive: true });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'watch-url') { ui.watchDraft = e.target.value; return; }
    if (e.target.id === 'users-q') { const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('#users-list .user-row').forEach((r) => { r.hidden = !!q && !r.dataset.q.includes(q); }); return; }
    if (e.target.id === 'np' || e.target.id === 'reg-pass') {
      const m = $('#pw-meter'); if (!m) return; const s = pwStrength(e.target.value);
      m.style.width = (s / 5) * 100 + '%'; m.style.background = s <= 1 ? 'var(--error)' : s <= 3 ? '#FB8C00' : 'var(--success)';
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOpen()) closeModal(); });
  document.addEventListener('submit', async (e) => {
    const f = e.target; if (!f.id) return;
    if (['login-form', 'register-form', 'forgot-form', 'chpw-form', 'setpw-form', 'del-form', 'partner-form', 'watch-form'].includes(f.id)) e.preventDefault(); else return;
    if (f.id === 'watch-form') { watchAdd(); return; }
    if (f.id === 'partner-form') { linkPartner((document.getElementById('partner-email') || {}).value); return; }
    const v = (id) => (document.getElementById(id) || {}).value || '';
    if (f.id === 'login-form') {
      const em = v('login-email').trim(), pw = v('login-pass');
      if (!em) return toast(t('emailRequired'), { error: true });
      if (!validEmail(em)) return toast(t('invalidEmail'), { error: true });
      if (!pw) return toast(t('passwordRequired'), { error: true });
      if (Cloud.on) { try { await window.firebase.auth().signInWithEmailAndPassword(em, pw); } catch (er) { cloudError(er); } return; }
      if (!(await login(em, pw))) toast(t('wrongCredentials'), { error: true });
    } else if (f.id === 'register-form') {
      const name = v('reg-name').trim(), em = v('reg-email').trim(), pw = v('reg-pass'), pw2 = v('reg-pass2');
      if (!name || !em || !pw) return toast(t('fillAllFields'), { error: true });
      if (!validEmail(em)) return toast(t('invalidEmail'), { error: true });
      if (pw.length < 6) return toast(t('passwordMinLength'), { error: true });
      if (pw !== pw2) return toast(t('passwordsDontMatch'), { error: true });
      if (!$('#reg-terms').checked) return toast(t('acceptTerms'), { error: true });
      if (Cloud.on) { try { const cr = await window.firebase.auth().createUserWithEmailAndPassword(em, pw); await cr.user.updateProfile({ displayName: name }); cloudSession(window.firebase.auth().currentUser); } catch (er) { cloudError(er); } return; }
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

  load();
  if (!DB.seeded && cloudHost()) { DB.seeded = true; save(false); }
  // on the real site a local (demo) session is replaced by the sign-in screen; its own items are offered to the first Google account
  if (cloudHost() && me() && !me().cloud) { Cloud.prevLocal = me(); DB.session = null; save(false); }
  if (!DB.seeded) { // first visit: open in a realistic working state with the demo account
    DB.seeded = true; const u = seedDemo(); hashPw('demo123').then((h) => { u.passHash = h; save(); });
    DB.session = u.uid; u.lastLogin = new Date().toISOString(); save();
  }
  const startScroll = restoreUi();
  render();
  if (startScroll) { const sc = $('.scroller'); if (sc) sc.scrollTop = startScroll; }
  let scrollT = null;
  document.addEventListener('scroll', () => { clearTimeout(scrollT); scrollT = setTimeout(saveUi, 200); }, true);
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => { saveUi(); return { ui: JSON.parse(sessionStorage.getItem(UI_KEY) || 'null') }; }); } catch (e) { /* not in a viewer */ }
  initCloud();
  setInterval(checkDue, 15000);
  setTimeout(checkDue, 4000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkDue(); if (!ui.splash && !modalOpen()) render(); } });
  // re-render at midnight so "today" stays correct
  (function midnight() { const n = new Date(); const ms = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 5) - n; setTimeout(() => { if (!ui.splash) render(); midnight(); }, ms); })();
})();
