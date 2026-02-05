# Homeown Calculator

Static, single-page calculator for **calc.homeown.ie**. The goal is to give users a clear, non-judgemental view of whether their savings can catch a moving deposit target under current assumptions.

This repo follows the product brief as the single source of truth.

## Key Docs
- `.docs/brief.md` — Full product intent, UX rules, and calculation model
- `.docs/threshold.md` — Deterministic affordability threshold for verdict bucket 1

## Scope (v1)
- Single-route React app (`/` only)
- No backend
- No tracking
- UK English tone with strict language guardrails
- EUR with Irish number formatting

## Planned Stack
- Vite + React + TypeScript
- Tailwind + shadcn/ui
- GitHub Pages deployment to `https://calc.homeown.ie`

## Development
Project scaffold and scripts will be added in the build sequence. Once the scaffold lands, this section will include install/run/build commands.

## Build Sequence
See `.docs/brief.md` for the step-by-step build plan and definition of done.
