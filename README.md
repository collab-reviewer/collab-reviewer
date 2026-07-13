# ReviewDeck

ReviewDeck is a desktop-first collaborative pull-request review workspace. It brings the review queue, a line-level GitHub diff, inline notes, and the team discussion into one focused interface.

## Features

- GitHub OAuth through Supabase
- Live pull-request queue updates through Supabase Realtime
- Server-resolved and validated GitHub diffs
- Authenticated inline code comments
- Review discussion with `/approve`, `/lgtm`, and `/close` commands
- Verified GitHub webhook ingestion and optional Discord notifications
- Reduced-motion-aware interface animation

## Stack

- React 19 and TypeScript
- TanStack Start, Router, and Query
- Tailwind CSS v4
- Motion
- Supabase Auth, Postgres, and Realtime
- Vite 8, Vitest, and Bun

## Local development

Install dependencies:

```bash
bun install
```

Create a local `.env` file:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
GITHUB_WEBHOOK_SECRET=
N8N_WEBHOOK_URL=
```

Start the development server at `http://localhost:3000`:

```bash
bun run dev
```

## Verification

```bash
bun run tsc --noEmit
bun run test
bun run build
```

## Project guidance

See [AGENTS.md](./AGENTS.md) for repository structure, coding conventions, UI direction, security boundaries, and the required handoff checks.

## Contributors

- Keong Nunn
- Sebastian Gonzalez
- Justin Hutchens
- Reese Bernard
