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
- Splash ekran, prijava, registracija, zaboravljena lozinka
- Početna: dobrodošlica, napredak za danas, današnji podsetnici, 9 kategorija
- Podsetnici: filter po kategoriji, kalendar (mesec) i lista sa pretragom, proširive kartice
- Dodavanje/izmena: tip, prioritet, kategorija, ponavljanje (dnevno/nedeljno/mesečno/godišnje/jednokratno), lokacija, vreme, obaveštenje, važno
- Profil: Nalog (podaci + statistika i grafikon, sigurnost i promena lozinke, povezani nalozi, povratne informacije, brisanje naloga), Obaveštenja, Jezik (7 jezika iz originalnih .arb fajlova), Izgled (tamni režim, 22 primarne boje, smanjene animacije), Zasluge
- Obaveštenja u aplikaciji + sistemska obaveštenja pregledača, zvuk, odlaganje 10 min
- Uvoz kalendara iz .ics fajla (Google Calendar, Outlook, Apple)

## Podaci
Za sada se sve čuva lokalno u pregledaču (localStorage). Sav pristup podacima je u objektu `Store` u `src/app.js`
(`load`, `save`, `newUser`, `login`…), pa je to jedino mesto koje treba zameniti Firebase Auth + Firestore pozivima
(config je u starom `lib/main.dart`).

## Struktura
- `index.html` — gotova stranica (generiše se)
- `app.js`, `i18n.js`, `assets/` — kod, prevodi, logoi
- `src/head.html`, `src/app.js` — izvor; `python build.py` ponovo pravi `index.html` i `app.js`
