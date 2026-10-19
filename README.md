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
  - tip **Zadatak** (čekira se) ili **Događaj** (samo obaveštenje, ne čekira se, ne ulazi u krug napretka) — važi i za single i za listu; lista-događaj prikazuje stavke kao tačke
  - lista: stavke koje se čekiraju; svako ponavljanje kreće sa praznim čekovima
  - ponavljanje: ne ponavlja se / na svakih N dana, nedelja, meseci ili godina / određenim danima u nedelji / određenog dana u mesecu
- **Početna:** današnji taskovi i liste jedno ispod drugog (po vremenu, bez vremena na kraju); liste su skupljene, klik ih otvara
- **Kalendar:** prekidač Kalendar / Lista; kalendar preko celog ekrana sa uspravnim danima i nazivima, lista = sve narednih 30 dana po danima (+ „Prikaži još“) i „Bez datuma“; klik na dan otvara isti prikaz kao početna
- **Profil:** podaci i statistika, sigurnost, povezani nalozi, povratne informacije, brisanje naloga, obaveštenja, jezik (7), izgled (tamni režim)

## Model podataka (po korisniku, `tasks[]`)
```
{ uid, kind: 'task' | 'list', type: 'task' | 'event', name, description, date: 'YYYY-MM-DD' | '', anchor?, time: 'HH:MM' | '',
  important, repeat: { type: 'none' | 'interval' | 'weekdays' | 'monthday', every, unit: 'day'|'week'|'month'|'year', days: [0-6, pon=0], monthDay },
  items: [{ id, text }],            // samo za listu
  done:   { 'YYYY-MM-DD': true, any?: 'YYYY-MM-DD' }, // task urađen tog dana; 'any' = bez datuma (vrednost: dan završetka)
  checks: { 'YYYY-MM-DD' | 'any': [itemId] }, doneAt? // čekirane stavke liste
}
```

## Podaci i nalozi

- **Na pravom sajtu (Vercel, localhost):** prijava preko Google-a ili email/lozinke (Firebase Auth), a podaci su u Firestore-u i sinhronizuju se na svim uređajima.
- **U Claude pregledu i kad se `index.html` otvori kao fajl:** lokalni demo u pregledaču (localStorage), bez prijave.
- **Partner:** Profil → Partner → email partnera (partner mora bar jednom da se prijavi). Posle toga forma ima prekidač „Podeli sa …“; podeljene stavke vide i menjaju oboje (ikonica 👥 pored naziva).

Baza je **ista kao kod stare Android aplikacije** (Firebase projekat `reminder-c29a5`):
- `users/{uid}` – postojeći profil iz stare aplikacije (ime, email, slika, jezik, tamna tema); web dodaje `settings`, `emailLower`, `partnerUid`
- `reminders/{id}` – jedna stavka po dokumentu (zadatak / događaj / lista) + `owner` i `members` (ko je vidi)

Stari podsetnici iz niza `users/{uid}.reminders` se **ne prenose** u novu aplikaciju (ostaju netaknuti za staru).

### Jednokratno podešavanje (Firebase projekat `reminder-c29a5`)

1. **Authentication → Sign-in method:** uključi **Google** (i Email/Password ako želiš i to).
2. **Authentication → Settings → Authorized domains:** dodaj svoj Vercel domen, npr. `reminder-vingili.vercel.app`.
3. **Google prijava preko tvog domena** (bitno za iPhone): u [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=reminder-c29a5) → Credentials → *Web client (auto created by Google Service)* → **Authorized redirect URIs** dodaj  
   `https://<tvoj-domen>.vercel.app/__/auth/handler`  
   (`vercel.json` već prosleđuje `/__/auth/*` na Firebase.)
4. **Firestore Database → Rules:** zameni pravila celim sadržajem fajla `firestore.rules` (pokriva i staru i novu aplikaciju) i klikni **Publish**.
5. Oboje se prijavite preko Google-a, jedno od vas u Profil → Partner unese email drugog.

## Struktura
- `index.html` — gotova stranica (generiše se)
- `vercel.json` — prosleđivanje Firebase prijave preko tvog domena
- `firestore.rules` — pravila pristupa za Firestore
- `app.js`, `i18n.js`, `assets/` — kod, prevodi, logoi
- `src/head.html`, `src/app.js` — izvor; `python build.py` ponovo pravi `index.html` i `app.js`
