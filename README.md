# Reminder — web verzija

Web port Flutter aplikacije „Reminder" (Scampy Software Solutions). Isti dizajn i funkcije, bez build koraka.

## Pokretanje
Iz ovog foldera:
```
python -m http.server 8080
```
pa otvori http://localhost:8080 (ili dupli klik na `index.html`).

Demo nalog: `demo@reminder.app` / `demo123`

## Šta je unutra
- Prijava, registracija, zaboravljena lozinka (podaci lokalno u pregledaču za sada)
- **Dodavanje (+):** otvara formu; na vrhu prekidač **Task / Lista**
  - zajedničko: naziv, opcioni opis, **opcioni datum** (dugme „Dodaj datum“), opciono vreme (ako postoji, stiže obaveštenje), važno
  - bez datuma i bez ponavljanja → sekcija „Bez datuma“ na početnoj dok se ne završi (završeno ostaje precrtano do kraja dana)
  - bez datuma, sa ponavljanjem → ponavljanje se računa od dana kreiranja (`anchor`)
  - single: tip **Zadatak** (čekira se kao urađen) ili **Događaj** (samo obaveštenje, ne čekira se, ne ulazi u krug napretka)
  - lista: stavke koje se čekiraju; svako ponavljanje kreće sa praznim čekovima
  - ponavljanje: ne ponavlja se / na svakih N dana, nedelja ili meseci / određenim danima u nedelji / određenog dana u mesecu
- **Početna:** današnji taskovi i liste jedno ispod drugog (po vremenu, bez vremena na kraju); liste su skupljene, klik ih otvara
- **Kalendar:** prekidač Kalendar / Lista; kalendar preko celog ekrana sa uspravnim danima i nazivima, lista = sve narednih 30 dana po danima (+ „Prikaži još“) i „Bez datuma“; klik na dan otvara isti prikaz kao početna
- **Profil:** podaci i statistika, sigurnost, povezani nalozi, povratne informacije, brisanje naloga, obaveštenja, jezik (7), izgled (tamni režim)

## Model podataka (po korisniku, `tasks[]`)
```
{ uid, kind: 'task' | 'list', type: 'task' | 'event', name, description, date: 'YYYY-MM-DD' | '', anchor?, time: 'HH:MM' | '',
  important, repeat: { type: 'none' | 'interval' | 'weekdays' | 'monthday', every, unit: 'day'|'week'|'month', days: [0-6, pon=0], monthDay },
  items: [{ id, text }],            // samo za listu
  done:   { 'YYYY-MM-DD': true, any?: 'YYYY-MM-DD' }, // task urađen tog dana; 'any' = bez datuma (vrednost: dan završetka)
  checks: { 'YYYY-MM-DD' | 'any': [itemId] }, doneAt? // čekirane stavke liste
}
```

## Podaci
Za sada se sve čuva lokalno u pregledaču (localStorage). Sav pristup podacima je u objektu `Store` u `src/app.js`
(`load`, `save`, `newUser`, `login`…), pa je to jedino mesto koje treba zameniti Firebase Auth + Firestore pozivima
(config je u starom `lib/main.dart`).

## Struktura
- `index.html` — gotova stranica (generiše se)
- `app.js`, `i18n.js`, `assets/` — kod, prevodi, logoi
- `src/head.html`, `src/app.js` — izvor; `python build.py` ponovo pravi `index.html` i `app.js`
