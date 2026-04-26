# Drift Codebase Summary

## Overview
Drift is a pnpm workspace monorepo. The primary app is a Next.js 15 App Router webapp built around authentication, an intake/notepad workspace, and a todo list. The backend uses Prisma + PostgreSQL via `@db/prisma`, and Better Auth handles sessions plus account flows.

## Repository Layout
`webapp/`: Next.js application (UI, API routes, server actions).
`packages/prisma/`: Prisma schema, migrations, generated client, and adapter setup.
`packages/types/`: Shared Zod schemas and types.
`packages/llm/`: Present but currently unused / effectively empty.

## Core App Flow
Auth:
- Better Auth routes are mounted at `/api/auth/[...all]`.
- Credentials auth is implemented through a custom Better Auth plugin (`credentialsAuth`) with custom sign-in and sign-up endpoints.
- Google social sign-in is enabled.
- Social provider accounts are persisted to Prisma through the `persistSocialAccount` plugin hook, not through a Better Auth Prisma adapter.
- Client auth uses `better-auth/react` with a hardcoded base URL (`http://localhost:3000`).

Intake:
- `/intake` is the active protected workspace route.
- The page is split between a client-side Slate editor (`Notepad`) and a right-hand aggregation pane.
- The current intake UI is local/client-side and the aggregation cards are static placeholder UI; there is no saved notepad flow wired end-to-end yet.

Todos:
- `/todos` is an active protected route.
- The page uses React Query with server actions (`getTodos`, `setTodoStatus`) for loading and optimistic status updates.
- Todo persistence is handled by `todoRepository` against Prisma/Postgres.

Deprecated but still present in code:
- `write`, `notes`, `digest`, `/api/notes`, and `/api/summarize` still exist in the tree and still influence some schema/types, but they should be treated as deprecated architecture when reasoning about current work unless the task explicitly targets them.

## Data Model (Prisma)
Key models:
- Active/currently relevant:
  - `User`, `Account`, `Session`, `Verification`
  - `Todo`
  - `Notepad`, `Block` for the intake/editor direction
- Auth/account specifics:
  - `Account` enforces uniqueness on `(providerId, accountId)`
  - credential passwords live on `Account.password`
- Legacy / deprecation-path models still in schema:
  - `Note`
  - `Digest`, `DigestItem`, `DigestTheme`, `DigestCorrection`, `DigestFollowUpQuestion`
  - `AICredit`
  - `AdminUser`, `InviteCode`

## Shared Types
`@common/types` currently exports `user`, `todo`, plus legacy `notes` and `summary` schemas that are still referenced by deprecated flows.

## LLM + Embeddings
- LLM, embeddings, Pinecone, and summarization code are still present in the repo, but they mainly support deprecated note/digest paths and should not be treated as the primary current product flow.

## Environment Variables (observed usage)
`DATABASE_URL`: Prisma/Postgres connection string.
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google social auth configuration.
`PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `PINECONE_INDEX_HOST`: Legacy / optional vector integration.
`GCP_PROJECT_ID`, `GCP_LOCATION`: Legacy / optional Google Cloud / Vertex helper configuration.

## Dev Commands
From `webapp/`:
- `pnpm dev` (Next.js dev server with Turbopack)
- `pnpm build`
- `pnpm start`
- `pnpm test`
- `pnpm test:coverage`
From project root:
- `pnpm test`
- `pnpm test:coverage`

## Conventions
- Pure CSS is absolutely not allowed. Use Tailwind 99.99% of the time.
- No tabs, uses spaces. Indents should be 4 spaces.

## Guidelines
- IMPORTANT: Always ask for approval before making any code changes!
