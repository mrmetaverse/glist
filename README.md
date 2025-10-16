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
- Tailwind CSS (basic config), Radix UI primitives, lucide-react icons
- LangChain (ChatOpenAI), AI SDK fallback
- Supabase client scaffolding

## Status and roadmap (incremental)

What’s DONE (this branch):
- Repo + Vercel set up and deployed
- UI scaffold: grocery list, conversation panel, text + voice input
- Tailwind + simple UI components (`Button`, `Card`, `Input`, `Checkbox`, `ScrollArea`)
- Whisper transcription route (`/api/transcribe`) with MediaRecorder fallback
- Chat route (`/api/chat`) using a LangChain agent with tool-calling:
  - Tools: addItem, removeItem, markCompleted, getList, comparePrices (mock pricing)
  - Fallback to AI SDK `generateText` if `OPENAI_API_KEY` is not set
- Supabase client/server scaffolding and `.env.local.example`

What’s NEXT (suggested order):
1) Supabase persistence
	- Create tables: `lists`, `items` (and `profiles` if using Auth)
	- Add RLS policies so users only access their own data
	- Migrate the agent tools to read/write via Supabase instead of in-memory arrays
2) Auth (optional now, useful for sync)
	- Supabase Auth (email magic link or OAuth)
	- Tie lists to user id; pass session to server routes
3) Voice UX
	- Press/hold to record; dynamic durations; show recording indicator
	- Consider streaming transcription (later)
4) UI polish
	- Keyboard shortcuts, reorder items, list templates
5) Pricing data
	- Real price source integration (or manual per-store price entries in DB)

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

Prereqs: Node 20 or 22 (recommended). Node 24 may cause a native crash (bus error) with Next.js/SWC on some Linux setups.

Run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000

Entry point: `src/app/page.tsx`

Key server routes:
- `POST /api/chat` → LangChain agent first; AI SDK fallback
- `POST /api/transcribe` → Whisper (OpenAI) transcription

Key libs:
- Agent: `src/lib/agent.ts`
- LLM factory (optional): `src/lib/llm.ts`
- Supabase: `src/lib/supabase/*`
- Audio helper: `src/lib/audio.ts`

## Project structure

- `src/app` – App Router pages
- `public` – static assets
- `eslint.config.mjs`, `tsconfig.json` – config
- `tailwind.config.ts`, `postcss.config.js` – Tailwind setup

## Deployment (Vercel)

This repo is designed to deploy out-of-the-box on Vercel. Once the GitHub repo is connected in Vercel:

1. Import project from GitHub, framework = Next.js
2. Default build: `next build` and `next start` (Vercel auto-detects)
3. Set env vars (OpenAI + Supabase) in Vercel before production use

### Environment variables

Create a `.env.local` for local dev and configure the same in Vercel Project Settings → Environment Variables:

Required (Supabase):
- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=

Optional (server):
- SUPABASE_SERVICE_ROLE_KEY=  # Only for server actions/admin tasks

Models:
- OPENAI_API_KEY=             # For chat + Whisper

Quick start (local):

```bash
cp .env.local.example .env.local
# fill values for SUPABASE + OPENAI
npm install
nvm use 22 # recommended
npm run dev
```


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
