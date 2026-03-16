# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

CedarJS 2.8.0 (built on RedwoodJS principles) full-stack monorepo with:
- **Web:** React 18, TypeScript, Vite, Apollo Client
- **API:** Node 24, GraphQL (@cedarjs/graphql-server), Prisma ORM, SQLite
- **Package Manager:** Yarn 4 with workspaces (`web/` and `api/`)

## Common Commands

```bash
yarn cedar dev              # Start dev server (web :8910, api :8911)
yarn cedar build            # Production build
yarn cedar test             # Run all tests (Jest)
yarn cedar test web         # Test web workspace only
yarn cedar test api         # Test api workspace only
yarn cedar prisma migrate dev   # Create/apply database migrations
yarn cedar prisma db seed       # Seed the database
yarn cedar generate page <Name> <path>   # Generate a new page
yarn cedar generate sdl <Model>          # Generate GraphQL SDL + service from Prisma model
```

## Architecture

**Monorepo with two workspaces:**
- `api/` — Backend: GraphQL API with Prisma database layer
- `web/` — Frontend: React SPA with CedarJS router

**API auto-loading convention:** The GraphQL handler (`api/src/functions/graphql.ts`) automatically discovers:
- SDL files from `api/src/graphql/**/*.sdl.ts`
- Service resolvers from `api/src/services/**/*.ts`
- Directives from `api/src/directives/**/*.ts`

**Auth:** Directive-based (`@requireAuth`, `@skipAuth`) applied to GraphQL SDL fields. Auth logic lives in `api/src/lib/auth.ts` (currently placeholder).

**Routing:** `web/src/Routes.tsx` defines all routes. Pages live in `web/src/pages/` and are auto-imported by name convention (`*Page`).

**Database:** Prisma schema at `api/db/schema.prisma`, SQLite by default (`DATABASE_URL=file:./dev.db` in `.env.defaults`).

## Code Style

- Prettier: single quotes, no semicolons, trailing commas (es5), 2-space indent
- ESLint: `@cedarjs/eslint-config`
- TypeScript throughout with path aliases (`src/*`, `$api/*`, `types/*`)
