# Univé Vragenlijst Melkveehouders

Anonieme vragenlijst voor melkveehouders over toekomstbeeld, risico's en ondersteuning. Gebouwd met Next.js (App Router), TypeScript en Tailwind CSS v4.

## Ontwikkelen

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script   | Beschrijving              |
| -------- | ------------------------- |
| `npm run dev`   | Development server        |
| `npm run build` | Production build           |
| `npm run start` | Production server          |
| `npm run lint`  | ESLint                     |

## Omgeving

Kopieer `.env.example` naar `.env.local` en vul `OPENAI_API_KEY` (en optioneel `NEXT_PUBLIC_APP_URL`) in. Zie `.env.example` voor alle variabelen.

## Techniek

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS v4** – thema en varianten in `app/globals.css` (`@theme inline`)
- **PWA** – `@ducanh2912/next-pwa` (service worker alleen in production)
- **Samenvatting** – OpenAI API via `/api/summarize` (nodejs runtime)

## Build-artefacten

- `tsconfig.tsbuildinfo` en `.next/` zijn gegenereerd; staan in `.gitignore`.
- Na wijzigingen in `package.json`: `npm install` uitvoeren om `package-lock.json` bij te werken.
