# Homeown Calculator

Static, single-page calculator for **calc.homeown.ie**. The goal is to give users a clear, non-judgemental view of whether their savings can catch a moving deposit target under current assumptions.

This repo follows the product brief as the single source of truth.

## Key Docs
- `.docs/brief.md` — Full product intent, UX rules, and calculation model (local-only; ignored by git)
- `.docs/threshold.md` — Deterministic affordability threshold for verdict bucket 1 (local-only; ignored by git)

## Scope (v1)
- Single-route React app (`/` only)
- No backend
- No tracking
- UK English tone with strict language guardrails
- EUR with Irish number formatting

## Stack
- Vite + React + TypeScript
- Tailwind + shadcn/ui (to be added)
- GitHub Pages deployment to `https://calc.homeown.ie`

## Dev
```bash
npm install
npm run dev
```

Default dev server: `http://localhost:5173`

## Build
```bash
npm run build
npm run preview
```

## Status
- Step 1 (scaffold) complete
- Step 1 (shadcn layout) pending

## Build Sequence
See `.docs/brief.md` for the step-by-step build plan and definition of done.

## Maintenance
Keep this `README.md` updated as the project evolves and milestones land in GitHub.
