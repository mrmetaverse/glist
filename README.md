## glist

A minimal, fast grocery and to‑do list app. Start simple: create lists, add items quickly, check them off. Expand later with sharing, presets, and offline support.

## Why

- Frictionless add: one‑line input with smart parsing (qty, notes)
- Fast on mobile: works well as a home‑screen app
- Clean defaults: keyboard-first, no clutter

## Tech

- Next.js 15 (App Router), React 19
- TypeScript, ESLint
- Deployed on Vercel

## Roadmap (incremental)

MVP
- [ ] Lists CRUD (single local list to start)
- [ ] Items: add, toggle complete, delete
- [ ] Quick add input: "2x milk (oat)" → { qty: 2, name: milk, note: oat }
- [ ] Basic grouping (e.g., produce, dairy) – manual per item
- [ ] Local persistence (localStorage)

Polish
- [ ] Keyboard shortcuts (enter to add, cmd/ctrl+k focus)
- [ ] Reorder items (drag or bump completed to bottom)
- [ ] List templates (e.g., weekly staples)

Future
- [ ] Auth + sync
- [ ] Share list (read-only link and collaborators)
- [ ] Offline-first with IndexedDB/Service Worker

## Local development

Prereqs: Node 18+ (or 20+ recommended)

Run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000

Entry point: `src/app/page.tsx`

## Project structure

- `src/app` – App Router pages
- `public` – static assets
- `eslint.config.mjs`, `tsconfig.json` – config

## Deployment (Vercel)

This repo is designed to deploy out-of-the-box on Vercel. Once the GitHub repo is connected in Vercel:

1. Import project from GitHub, framework = Next.js
2. Default build: `next build` and `next start` (Vercel auto-detects)
3. Set env vars if needed (none yet)

CLI (optional):

```bash
npx vercel link
npx vercel --prod
```

## Contributing

- Branch: `feat/*`, `fix/*`
- Conventional commits preferred (e.g., `feat: add quick add input`)
- PR checks: typecheck, lint

## License

MIT
