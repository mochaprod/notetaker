# Drift Codebase Summary

## Overview
Drift is a pnpm workspace monorepo. The primary app is a Next.js 15 App Router webapp that supports user auth, note capture, AI-generated digests, and a todo list. The backend uses Prisma + PostgreSQL via `@db/prisma` and Better Auth for sessions. AI summarization uses Google Gemini with prompt templates and a small function-calling toolset for date handling. Notes are additionally pushed into Pinecone for vector search (Chroma client scaffolding also exists).

## Repository Layout
`webapp/`: Next.js application (UI, API routes, server actions).
`packages/prisma/`: Prisma schema, migrations, generated client, and adapter setup.
`packages/types/`: Shared Zod schemas and types.
`packages/llm/`: Empty directory at the moment.

## Core App Flow
Notes:
- `webapp/src/app/(pages)/write` posts notes via a server action (`addNote`) and optimistically updates the React Query cache.
- Notes are read from `/api/notes` using `fetchNotesByDate` and shown on the Notes page with edit/delete optimistic mutations.
- Note writes update Postgres and also upsert into Pinecone (`pineconeDB.upsert`).

Digest / Summaries:
- `/api/summarize` validates auth, enforces daily AI credits, checks for an existing summary, and otherwise runs Gemini-based summarization over notes for a date range.
- Summaries are stored in Postgres as `Digest` rows with child items, themes, corrections, and follow-ups.
- The Digest page queries `/api/summarize` and renders summary text and action items; it can force re-summarization.

Todos:
- `todos` page uses server actions (`getTodos`, `setTodoStatus`) with React Query for optimistic updates.
- Digest action menu can add a task as a todo via server action (`addTodo`).

Auth:
- Better Auth with Prisma adapter. Auth routes are mounted at `/api/auth/[...all]`.
- Client auth uses `better-auth/react` with a hardcoded base URL (`http://localhost:3000`).

## Data Model (Prisma)
Key models:
- `User`, `Account`, `Session`, `Verification`, `AdminUser`, `InviteCode`
- `Note` linked to `User`
- `Digest` with `DigestItem`, `DigestTheme`, `DigestCorrection`, `DigestFollowUpQuestion`
- `Todo`
- `AICredit` for daily summary credit tracking

## Shared Types
`@common/types` provides Zod schemas for `Note`, `Summary`, `Todo`, and `AICredit`.

## LLM + Embeddings
- `webapp/src/lib/llm/gemini.ts` handles text summarization + JSON parsing via Gemini models and Zod schemas.
- Date helper tools are defined for function calling (`next_day`, `add_days`).
- Embeddings client defaults to Gemini embeddings.
- Vector support:
  - Pinecone client is wired and used for note upserts and deletes.
  - Chroma client exists but is not currently used by the app flow.

## Environment Variables (observed usage)
`DATABASE_URL`: Prisma/Postgres connection string.
`PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `PINECONE_INDEX_HOST`: Pinecone configuration.
`GCP_PROJECT_ID`, `GCP_LOCATION`: Google Cloud Vertex AI helper (if used).

## Dev Commands
From `webapp/`:
- `pnpm dev` (Next.js dev server with Turbopack)
- `pnpm build`
- `pnpm start`
From project root:
- `pnpm --filter webapp run dev`

## Conventions
- Pure CSS is absolutely not allowed. Use Tailwind 99.99% of the time.
- No tabs, uses spaces. Indents should be 4 spaces.
