# Háziállat nyilvántartó

Egyszerű, magyar nyelvű CRUD webalkalmazás háziállatok adatainak kezelésére.

## Technológiai stack

- Vite
- React
- React Router
- Supabase Database
- Supabase Storage
- Netlify
- sima JavaScript
- sima CSS

## Funkciók

- Főoldal, ahol az állatok táblázata látható
- A főoldali táblázatban csak az állat neve jelenik meg
- Kattintásra megnyílik az állat részletező oldala
- Állat részletező oldal képpel és adatokkal
- Kezelések külön táblázatban az állat adatlapján
- Admin oldal új állat létrehozásához
- Meglévő állat szerkesztése
- Állat törlése
- Kép feltöltése Supabase Storage-ba
- Kezelések hozzáadása, szerkesztése és törlése

## Adatmodell

### Animals tábla

- `id`
- `name`
- `birth_date`
- `weight`
- `color`
- `sex`
- `image_url`
- `created_at`

### Treatments tábla

- `id`
- `animal_id`
- `treatment_name`
- `treatment_date`
- `notes`
- `created_at`

## Fontos működési szabályok

- Az `age` mező nincs eltárolva az adatbázisban
- Az életkor mindig a `birth_date` alapján kerül kiszámításra
- A kezelések az `animal_id` mezőn keresztül kapcsolódnak az állatokhoz
- A képek Supabase Storage-ban vannak tárolva
- Az `animals.image_url` mező a feltöltött kép nyilvános URL-jét tartalmazza

## Projektstruktúra

```text
pet-tracker/
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── netlify.toml
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── components/
    │   ├── AnimalForm.jsx
    │   ├── AnimalTable.jsx
    │   ├── Layout.jsx
    │   ├── TreatmentForm.jsx
    │   └── TreatmentTable.jsx
    ├── lib/
    │   └── supabase.js
    ├── pages/
    │   ├── AdminPage.jsx
    │   ├── AnimalCreatePage.jsx
    │   ├── AnimalDetailPage.jsx
    │   ├── AnimalEditPage.jsx
    │   ├── HomePage.jsx
    │   └── NotFoundPage.jsx
    ├── services/
    │   ├── animalsService.js
    │   ├── imageService.js
    │   └── treatmentsService.js
    └── utils/
        └── dateUtils.js