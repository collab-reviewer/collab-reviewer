# ReviewDeck contributor guide

## Project overview

ReviewDeck is a desktop-first collaborative pull-request review workspace. It uses TanStack Start, React 19, TypeScript, TanStack Query, Supabase, Tailwind CSS v4, and Motion. The primary experience is a three-panel desktop layout: review navigation, code diff, and discussion.

## Tooling

- Use Bun for dependency management and package scripts. Keep `bun.lock` in sync with `package.json`.
- Use `bun run dev` for local development on port 3000.
- Before handing off changes, run `bun run tsc --noEmit`, `bun run test`, and `bun run build`.
- Do not edit `src/routeTree.gen.ts` manually; TanStack Router generates it.

## Repository map

- `src/routes/`: file-based pages, API handlers, and auth callbacks.
- `src/components/`: domain-oriented React components and shared UI pieces.
- `src/actions/`: TanStack server functions. Treat every exported action as a public server boundary: validate input and authenticate/authorize where appropriate.
- `src/queries/`: query keys and reusable TanStack Query hooks.
- `src/hooks/`: browser lifecycle and realtime subscriptions.
- `src/lib/`: pure helpers that can be unit tested without framework setup.
- `src/supabase/`: browser and server client factories.
- `src/styles.css`: Tailwind import, design tokens, and truly global styles only.

## Code conventions

- Keep TypeScript strict. Avoid `any`; model external payloads narrowly and validate untrusted values at runtime.
- Prefer named domain types and pure helpers over duplicating interfaces or transformation logic inside components.
- Use the `#/` path alias for application imports and direct package imports for dependencies.
- Keep query keys stable and colocated with the query they represent. Invalidate the narrowest useful key after mutations.
- Derive state during render when possible. Do not mirror props or query data in effects.
- Create browser-only clients inside effects or event handlers. Never keep request-specific server state in module-level mutable variables.
- Start independent asynchronous work together and await it together.
- Keep server-only secrets out of client bundles and source control. User-facing errors should be useful without exposing internal details.

## UI and UX direction

- The product is intentionally desktop-first and optimized for viewports at least 1200px wide.
- Preserve the visual hierarchy: warm navigation rail, dark code canvas, light discussion rail, and teal as the primary interaction accent.
- Use Instrument Sans for interface copy, Newsreader for restrained editorial moments, and IBM Plex Mono for code.
- Reuse design tokens from `src/styles.css`; avoid one-off colors when a token exists.
- Motion should communicate hierarchy or state change. Use Motion for entrances and presence transitions, CSS for simple hover/focus feedback, and always respect reduced-motion preferences.
- Every interactive control needs a visible focus state, an accessible name, and an honest disabled/pending state.
- Maintain comfortable desktop density: compact toolbars, readable 13–15px interface text, and generous empty states. Do not add mobile navigation unless the product scope changes.

## Data and security

- Never fetch an arbitrary URL supplied by the browser. Resolve pull-request resources from trusted database records on the server.
- GitHub webhook requests must be verified with `GITHUB_WEBHOOK_SECRET` before processing.
- Configure `N8N_WEBHOOK_URL` in the server environment; never hard-code webhook URLs.
- Required public Supabase variables are `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`.
- Supabase Row Level Security remains the final authorization boundary. New tables and mutations must include appropriate policies.

## Environment variables

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
GITHUB_WEBHOOK_SECRET=
N8N_WEBHOOK_URL=
```

Do not commit `.env` files or secret values.
