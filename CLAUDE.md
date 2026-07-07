# CLAUDE.md — Tilstra LMS

Dit bestand geeft Claude Code context over dit project. Lees dit voordat je wijzigingen voorstelt.

## Taal

- **Alle communicatie, code-commentaar, UI-teksten en commit-berichten in het Nederlands.**
- Domeinterminologie is Nederlands en bewust gekozen — vertaal die niet (zie "Terminologie").

## Wat dit is

Een custom Learning Management System voor het traineeship van Tilstra Services (administratief dienstverleningsbureau: Payroll, Finance, HR). Modules worden ook commercieel aangeboden aan externe klanten. Eerste commerciële product: \*_BKL® Arbeidsrecht Sociale Zekerheid_ (niveau 3).

## Tech stack

- **Frontend:** React + Vite, `react-router-dom`, Phosphor Icons (SVG)
- **Backend:** Supabase (PostgreSQL) — project "Het_LMS_Tilstra_Services"
- **Hosting:** GitHub Pages → `https://tilstraservices.github.io/lms-tilstra/` tijdens testing nog niet actief. In plaats daarvan gebruiken we liveserver `http://localhost:5173//lms-tilstra/`
- **Content platform:** Huddle (tekst, webinars, samenvattingsvideo's), geopend via footer-links in nieuw tabblad (dual-screen workflow)
- **Versiebeheer:** GitHub (`TilstraServices/lms-tilstra`), commits via GitHub Desktop

## Belangrijke architectuurkeuzes

- **Auth/RLS zijn bewust uitgesteld** tot de features stabiel zijn. Sessiebeheer loopt voorlopig via `localStorage`. Stel geen Auth/RLS voor tenzij daar expliciet om wordt gevraagd.
- **Container/module-links** gebruiken de GitHub Pages base-URL, niet localhost. Op localhost werken links tijdens ontwikkeling; bij deploy moeten ze naar de productie-URL.
- De app draait op GitHub Pages; migratie naar Vercel is een overweging voor later, niet nu.

## Terminologie (canoniek)

Hiërarchie: **Product → Module → Hoofdstuk → Paragraaf**

- Wat vroeger "module" heette, is nu **Product**.
- Voorbeeld BKL: Product = _BKL Loonheffingen_, Module = _H1–H5_, Hoofdstuk = _Toetsterm_ (bijv. 1.1), Paragraaf = _Component_ (webinar/video/opgave/evaluatie).

Wees precies met termen. "Trainee pagina" en "Mijn Trainees pagina" zijn verschillende dingen.

## Gebruikersrollen

Vier rollen: `trainee`, `leidinggevende`, `beheerder`, `klant` (externe commerciële gebruikers).

- Klant-scores gaan naar **aparte tabellen**: `klant_scores`, `klant_quiz_scores`, `klant_voortgang`.

## Data-conventies

- **Scores gebruiken de laatste poging per opgave** (`order poging_nummer desc`, deduplicatie via `laasteScoresMap`).
- `gem_score` reflecteert **alleen opgave-scores**, niet quiz-scores. Quiz-scores staan apart in `klant_quiz_scores` / `quiz_scores` (voor toekomstige PDF-rapporten).
- **Module-zichtbaarheid** wordt op prop-niveau berekend (`activeModuleIds.includes` óf score/voortgang-maps). Modules met opgeslagen scores/voortgang tonen als actief, ongeacht leerpad-lidmaatschap. Houd child-componenten simpel.
- **Open vragen** zijn uitgezonderd van score-blocking (geef altijd `heeftAntwoordGezien={true}` mee).

## Design system (canoniek)

**Kleuren**

- Primair groen `#2E7D32`, donker `#1B5E20`, licht `#E8F5E9`, achtergrond `#F5F5F5`

**Modulekleuren**
| Module | Donker | Licht |
|---|---|---|
| Payroll Basis | `#1565C0` | `#E3F2FD` |
| Arbeidsrecht | `#6A1B9A` | `#F3E5F5` |
| CAO | `#00695C` | `#E0F2F1` |
| Verloning | `#E65100` | `#FFF3E0` |

**Cards:** witte achtergrond, `border: 1px solid #EEEEEE`, `border-radius: 10px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.08)`, accent `border-left: 5px solid #2E7D32`

**Buttons:** `border-radius: 50px`

**Icons:** Phosphor Icons SVG, 18px, `fill=currentColor`

**Sidebar:** achtergrond `#2E7D32`, witte tekst, inklapbaar 220px → 56px via zwevende groene toggle-knop op twee derde paginahoogte (half buiten de balk); actief item `rgba(255,255,255,0.18)`; uitlogknop: achtergrond `#E8F5E9`, kleur `#1B5E20`, Phosphor sign-out icon

**Fonts:** Inter (UI); Lora + Source Sans 3 Light (BKL-content/slides)

**Tabelrijen (overzichten):** gekleurde `border-left: 4px` + pill + avatar per module; legenda boven de tabel.

## Werkwijze & principes

- **"De beste functie is geen functie"** — voorkeur voor eenvoud; voeg geen onnodige features toe.
- **Incrementeel:** test elke feature voordat je verdergaat; parkeer expliciet features die te groot worden.
- **Architectuur eerst:** denk datamodel en componentontwerp goed door vóór het bouwen.
- **Volledige bestandsherschrijvingen** hebben de voorkeur boven losse stukjes edits als er meerdere wijzigingen nodig zijn.
- **ESLint:** severity 8 (errors) altijd oplossen; severity 4 (warnings) onderdrukken met `// eslint-disable-next-line`.

## Content-richtlijnen (BKL)

- Bronmateriaal uitsluitend uit rechtenvrije officiële overheidsbronnen: `wetten.overheid.nl`, `UWV.nl`, `SVB.nl`, `Rijksoverheid.nl`, `Belastingdienst.nl`.
- Tussenexamens draaien op een externe formuliertool (bijv. Microsoft Forms), niet in Supabase.
- Alle PowerPoint/slide-elementen blijven bewerkbaar (geen platgeslagen assets).

## Omgeving

- Lokaal pad: `C:\Projects\lms-tilstra`
- Primaire dev-browser: Firefox; Edge voor het testen van klant-flows.
