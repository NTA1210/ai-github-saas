# 🤖 Github AI — AI-Powered GitHub Repository Assistant

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-teal?style=for-the-badge&logo=postgresql)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green?style=for-the-badge&logo=openai)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-purple?style=for-the-badge)
![Clerk](https://img.shields.io/badge/Clerk-Auth-orange?style=for-the-badge)
![LangChain](https://img.shields.io/badge/LangChain-1.x-teal?style=for-the-badge)

**An intelligent SaaS platform that turns any GitHub repository into an interactive, AI-powered knowledge base.**

[Live Demo](#) · [Report Bug](https://github.com/NTA1210/ai-github-saas/issues) · [Request Feature](https://github.com/NTA1210/ai-github-saas/issues)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Features](#4-features)
5. [Installation Guide](#5-installation-guide)
6. [Environment Variables](#6-environment-variables)
7. [API Documentation](#7-api-documentation)
8. [Project Structure](#8-project-structure)
9. [Database Design](#9-database-design)
10. [Security](#10-security)
11. [Deployment](#11-deployment)
12. [Future Improvements](#12-future-improvements)
13. [Author / License](#13-author--license)

---

## 1. Project Overview

**Github AI** is a full-stack SaaS application that integrates deeply with GitHub repositories to provide:

- **AI-powered Q&A** over your entire codebase using Retrieval-Augmented Generation (RAG)
- **Automated commit summarization** using GPT-4o-mini to help teams stay up to date
- **Meeting intelligence**: Upload audio recordings of meetings and get AI-generated issue summaries
- **Team collaboration**: Invite teammates via secure links and collaborate within shared projects

### Problem Statement

Modern software teams struggle with:

- **Onboarding friction** — new developers spend days understanding an unfamiliar codebase
- **Knowledge silos** — critical architectural decisions are buried in commit histories
- **Meeting overhead** — hours of meeting recordings go unwatched

**Github AI** solves all three by combining GitHub integration, vector search, and LLMs into a single, collaborative workspace.

---

## 2. System Architecture

### Overview

The application follows a **Modular Monolith** architecture built on Next.js App Router with clear separation between feature modules, API routes, and shared infrastructure.

```
Browser (React 19 + TanStack Query)
         │
         ▼
  Next.js App Router (SSR + API Routes)
         │
   ┌─────┴─────────────────────────────┐
   │                                   │
API Routes (/api/*)              Server Components
   │                                   │
   ├── Clerk Auth Middleware            └── Prisma ORM
   ├── Prisma → NeonDB (PostgreSQL)
   ├── OpenAI (GPT-4o-mini, text-embedding-3-small)
   ├── Pinecone (Vector Search)
   ├── Supabase Storage (Audio files)
   ├── GitHub API (Octokit)
   └── Inngest (Background jobs)
```

### Request Flow — AI Q&A (RAG)

```
User asks question
       │
       ▼
POST /api/projects/:id/ask/stream
       │
       ├─ 1. Create AskSession (DB) — prevent duplicate concurrent asks
       │
       ├─ 2. Embed question → OpenAI text-embedding-3-small
       │
       ├─ 3. Vector search → Pinecone (top-5, score ≥ 0.4)
       │
       ├─ 4. Fetch matched source code → PostgreSQL
       │
       ├─ 5. Build context prompt + stream → OpenAI GPT-4o-mini
       │
       └─ 6. SSE stream response → Browser
                       │
                       └─ 7. Save Q&A to DB (Question + QuestionReference)
```

### Request Flow — Meeting Processing

```
User uploads audio file
       │
       ▼
PUT /api/upload-url → Supabase signed upload URL
       │
       ▼
File uploaded to Supabase Storage
       │
       ▼
POST /api/meetings → Create Meeting record (PROCESSING)
       │
       ▼
Inngest event: "meeting/process" fired
       │
  Background job (up to 2h timeout, 3 retries):
       ├─ 1. Generate signed URL from Supabase
       ├─ 2. AssemblyAI transcription (auto_chapters + language_detection)
       ├─ 3. Save issues to DB
       └─ 4. Update Meeting status → COMPLETED
```

### Frontend–Backend Communication

- **REST API** via Next.js Route Handlers (`/api/**`)
- **Server-Sent Events (SSE)** for streaming AI responses
- **TanStack Query** for client-side data fetching, caching, and polling
- **Zustand** for global client state (selected project)

---

## 3. Tech Stack

### Frontend

| Technology            | Version   | Purpose                            |
| --------------------- | --------- | ---------------------------------- |
| Next.js               | 16.1.6    | Full-stack framework (App Router)  |
| React                 | 19.2.3    | UI library                         |
| TypeScript            | 5.x       | Type safety                        |
| TailwindCSS           | 4.x       | Utility-first CSS                  |
| shadcn/ui             | 3.x       | Component library (Radix UI based) |
| TanStack React Query  | 5.x       | Async state management & caching   |
| Zustand               | 5.x       | Global client state                |
| React Hook Form + Zod | 7.x / 4.x | Form handling & validation         |
| Sonner                | 2.x       | Toast notifications                |
| react-markdown        | 10.x      | Markdown rendering                 |
| @uiw/react-md-editor  | 4.x       | Markdown editor                    |

### Backend

| Technology                                   | Version | Purpose                                                               |
| -------------------------------------------- | ------- | --------------------------------------------------------------------- |
| Next.js Route Handlers                       | 16.1.6  | REST API endpoints                                                    |
| Prisma ORM                                   | 7.x     | Database access & migrations                                          |
| Inngest                                      | 3.x     | Durable background jobs                                               |
| OpenAI SDK                                   | 6.x     | GPT-4o-mini + embeddings                                              |
| LangChain (`@langchain/core`)                | 1.x     | `Document` type, abstraction layer for LLM pipelines                  |
| LangChain Community (`@langchain/community`) | 1.x     | `GithubRepoLoader` — crawl & load all source files from a GitHub repo |
| Octokit REST                                 | 22.x    | GitHub API integration (commits, diffs)                               |
| AssemblyAI                                   | 4.x     | Audio transcription + auto-chapter detection                          |
| Zod                                          | 4.x     | Schema validation (API bodies + env vars)                             |

### Infrastructure & Services

| Service               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| **Neon** (PostgreSQL) | Primary relational database (serverless) |
| **Pinecone**          | Vector database for semantic code search |
| **Supabase Storage**  | Audio file storage                       |
| **Clerk**             | Authentication & user management         |
| **Inngest**           | Serverless background job orchestration  |

### Dev Tools

| Tool         | Purpose                    |
| ------------ | -------------------------- |
| pnpm         | Package manager            |
| tsx          | TypeScript script runner   |
| ESLint       | Code linting               |
| concurrently | Run multiple dev processes |

---

## 4. Features

### 🔐 Authentication (via Clerk)

- Sign up / Sign in with email or Google OAuth
- Auto user sync on first login (`/sync-user` flow)
- Session management handled by Clerk middleware
- All protected routes require authentication

### 📁 Project Management

- **Create project** by linking a GitHub repository URL (public or private with PAT)
- Validates the GitHub URL against the real API before creating
- **Soft delete** (archive) projects — data preserved, removed from active view
- **Team collaboration** — invite members via secure time-limited invite links
- View team members per project

### 📊 Dashboard

- At-a-glance view of linked GitHub repository
- **Commit log** with per-commit AI-generated summaries
- Empty state handled gracefully when no project is selected

### 🧠 AI Code Q&A (RAG)

- Ask natural-language questions about any file, function, or behavior in the codebase
- Answers stream in real-time via Server-Sent Events (SSE)
- References exact source files used to generate the answer
- Answers are saved to the Q&A history and can be reviewed anytime
- Session deduplication prevents concurrent duplicate requests

### 🎙️ Meeting Intelligence

- Upload meeting audio files (MP3, WAV, etc.) per project
- AI automatically transcribes + splits into chapters via **AssemblyAI**
- Each chapter becomes a structured **Issue** with: `headline`, `gist`, `summary`, `start`, `end` timestamps
- Real-time processing status (**PROCESSING → COMPLETED**) with polling and toast notifications
- Delete meetings when no longer needed

### 💳 Billing (Coming Soon)

- Credit-based system designed in schema (`credits` field on `User`)
- Billing page scaffolded — payment integration planned

---

## 5. Installation Guide

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- A PostgreSQL database (Neon recommended)
- Accounts for: Clerk, OpenAI, Pinecone, Supabase, AssemblyAI, Inngest

### Step 1 — Clone the repository

```bash
git clone https://github.com/NTA1210/ai-github-saas.git
cd ai-github-saas
```

### Step 2 — Install dependencies

```bash
pnpm install
```

### Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Fill in all required values (see [Environment Variables](#6-environment-variables) section).

### Step 4 — Run database migrations

```bash
pnpm prisma migrate deploy
```

Or for development (auto-creates migration files):

```bash
pnpm prisma migrate dev
```

### Step 5 — Generate Prisma client

```bash
pnpm prisma generate
```

### Step 6 — Run the development server

```bash
# Run Next.js + Inngest dev server in parallel
pnpm dev:all
```

Or separately:

```bash
# Terminal 1: Next.js
pnpm dev

# Terminal 2: Inngest Dev Server
pnpm dev:inngest
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ─── App ──────────────────────────────────────────────
# Base URL of the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ─── Database ─────────────────────────────────────────
# PostgreSQL connection string (Neon serverless recommended)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# ─── Clerk (Authentication) ───────────────────────────
# Publishable key from Clerk Dashboard (safe to expose publicly)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Secret key from Clerk Dashboard (NEVER expose publicly)
CLERK_SECRET_KEY=sk_test_...

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/sync-user   # Triggers user sync on first signup

# ─── GitHub ───────────────────────────────────────────
# Personal Access Token for GitHub API (read:repo scope)
# Required to fetch commits from private repos and avoid rate limits
GITHUB_PAT=ghp_...

# ─── OpenAI ───────────────────────────────────────────
# API key for GPT-4o-mini completions and text-embedding-3-small
OPENAI_API_KEY=sk-proj-...

# ─── Pinecone (Vector Database) ───────────────────────
# API key from Pinecone console
PINECONE_API_KEY=pcsk_...

# Name of the Pinecone index to use (must be pre-created with 1536 dimensions)
PINECONE_INDEX=ai-github-saas

# ─── Supabase (File Storage) ──────────────────────────
# Project URL from Supabase Dashboard
SUPABASE_PROJECT_URL=https://xxxx.supabase.co

# Anon (public) key — safe for client-side signed URL generation
SUPABASE_ANON_KEY=eyJ...

# Storage bucket name for audio file uploads
SUPABASE_BUCKET_NAME=github-ai-saas

# Service role key — used server-side only for generating signed URLs
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ─── AssemblyAI ───────────────────────────────────────
# API key for audio transcription
ASSEMBLY_AI_API_KEY=...

# ─── Inngest (Background Jobs) ────────────────────────
# Required in production; optional in local dev (Inngest Dev Server handles it)
INNGEST_SIGNING_KEY=signkey-prod-...
INNGEST_EVENT_KEY=...
```

### Variables Summary Table

| Variable                            | Required      | Description                    |
| ----------------------------------- | ------------- | ------------------------------ |
| `NEXT_PUBLIC_BASE_URL`              | ✅            | App base URL                   |
| `DATABASE_URL`                      | ✅            | PostgreSQL connection string   |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅            | Clerk public key               |
| `CLERK_SECRET_KEY`                  | ✅            | Clerk secret key (server-only) |
| `GITHUB_PAT`                        | ✅            | GitHub Personal Access Token   |
| `OPENAI_API_KEY`                    | ✅            | OpenAI API key                 |
| `PINECONE_API_KEY`                  | ✅            | Pinecone API key               |
| `PINECONE_INDEX`                    | ✅            | Pinecone index name            |
| `SUPABASE_PROJECT_URL`              | ✅            | Supabase project URL           |
| `SUPABASE_ANON_KEY`                 | ✅            | Supabase anon key              |
| `SUPABASE_BUCKET_NAME`              | ✅            | Supabase storage bucket        |
| `SUPABASE_SERVICE_ROLE_KEY`         | ✅            | Supabase service role key      |
| `ASSEMBLY_AI_API_KEY`               | ✅            | AssemblyAI API key             |
| `INNGEST_SIGNING_KEY`               | ⚠️ Production | Inngest webhook signing key    |
| `INNGEST_EVENT_KEY`                 | ⚠️ Production | Inngest event API key          |

---

## 7. API Documentation

### Base URL

```
Development: http://localhost:3000/api
Production:  https://<your-domain>/api
```

### Authentication

All endpoints (except `/api/inngest`) require a valid **Clerk session**. The session token is automatically attached via HTTP-only cookies managed by Clerk.

Unauthorized requests receive:

```json
{ "error": "Unauthorized" } // HTTP 401
```

---

### Projects

#### `GET /api/projects`

Returns all non-archived projects belonging to the authenticated user.

**Response `200`:**

```json
{
  "projects": [
    {
      "id": "clxxx...",
      "name": "My Repo",
      "githubUrl": "https://github.com/owner/repo",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/projects`

Create a new project linked to a GitHub repository.

**Request Body:**

```json
{
  "projectName": "My Repo",
  "repoUrl": "https://github.com/owner/repo",
  "githubToken": "ghp_..." // optional, for private repos
}
```

**Response `201`:**

```json
{
  "project": { "id": "clxxx...", "name": "My Repo", ... }
}
```

**Errors:**

- `422` — Invalid GitHub URL or cannot access repository
- `404` — User not found in DB

---

#### `GET /api/projects/:id`

Get a single project by ID.

---

#### `DELETE /api/projects/:id/archive`

Soft-delete (archive) a project. Sets `deletedAt` timestamp.

---

#### `GET /api/projects/:id/commits`

Get all commits with AI summaries for a project.

---

#### `POST /api/projects/:id/summarize`

Trigger batch AI summarization for unsummarized commits.

---

#### `GET /api/projects/:id/questions`

Get all saved Q&A pairs for a project.

**Response `200`:**

```json
{
  "questions": [
    {
      "id": "clxxx...",
      "question": "How does auth work?",
      "answer": "## Authentication\n...",
      "createdAt": "...",
      "user": { "imageUrl": "..." },
      "fileReferences": [
        {
          "sourceCodeEmbedding": {
            "fileName": "src/proxy.ts",
            "summary": "..."
          }
        }
      ]
    }
  ]
}
```

---

#### `POST /api/projects/:id/ask` _(non-streaming)_

Ask a question about the codebase (blocking response).

#### `GET /api/projects/:id/ask/stream`

Ask a question via **Server-Sent Events** for real-time streaming.

**Query Params:**

- `question` (string, required)
- `sessionId` (string, required) — created via `/api/projects/:id/ask` first

**SSE Events:**

```
event: chunk
data: {"content": "The auth"}

event: chunk
data: {"content": " system uses..."}

event: done
data: {"questionId": "clxxx..."}

event: error
data: {"message": "Session not found or expired"}
```

---

#### `POST /api/projects/:id/invite-links`

Generate a new invite link for the project (expires in 7 days).

---

#### `GET /api/projects/:id/team-members`

Get all team members of a project.

---

### Meetings

#### `GET /api/projects/:id/meetings`

Get all meetings for a project (includes issues count and processing status).

#### `POST /api/meetings`

Create a new meeting entry and trigger background processing.

**Request Body:**

```json
{
  "projectId": "clxxx...",
  "meetingUrl": "storage/path/to/audio.mp3",
  "name": "Sprint Planning"
}
```

**Response `201`:**

```json
{
  "meeting": { "id": "clxxx...", "status": "PROCESSING", ... }
}
```

---

#### `DELETE /api/meetings/:id`

Delete a meeting and all its associated issues.

---

#### `GET /api/issues/:meetingId`

Get all AI-generated issues for a meeting.

---

### File Upload

#### `GET /api/upload-url`

Get a pre-signed Supabase upload URL for direct browser-to-storage upload.

**Query Params:**

- `fileName` (string, required)
- `contentType` (string, e.g. `audio/mpeg`)

**Response `200`:**

```json
{
  "signedUrl": "https://supabase.co/storage/v1/object/sign/...",
  "filePath": "meetings/2025-01-01_filename.mp3"
}
```

---

### Background Jobs (Inngest)

#### `POST /api/inngest`

Inngest webhook endpoint. Not called directly by clients — used by Inngest cloud to trigger and orchestrate background functions.

**Registered functions:**

- `process-meeting` — triggered by `meeting/process` event

---

## 8. Project Structure

```
ai-github-saas/
├── prisma/
│   ├── schema.prisma         # Database schema & models
│   └── migrations/           # Auto-generated migration SQL files
│
├── src/
│   ├── app/
│   │   ├── (protected)/      # Auth-required pages (route group)
│   │   │   ├── layout.tsx    # Protected layout (sidebar + providers)
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── dashboard/    # Main dashboard page
│   │   │   ├── qa/           # Q&A history page
│   │   │   ├── meetings/     # Meetings list & detail pages
│   │   │   ├── billing/      # Billing page (WIP)
│   │   │   ├── create/       # Create project page
│   │   │   └── join/         # Join project via invite link
│   │   │
│   │   ├── api/
│   │   │   ├── projects/     # Project CRUD + sub-resources
│   │   │   │   └── [id]/
│   │   │   │       ├── ask/  # Q&A endpoints (streaming + blocking)
│   │   │   │       ├── commits/
│   │   │   │       ├── summarize/
│   │   │   │       ├── questions/
│   │   │   │       ├── meetings/
│   │   │   │       ├── invite-links/
│   │   │   │       ├── team-members/
│   │   │   │       └── archive/
│   │   │   ├── meetings/     # Meeting-level endpoints
│   │   │   ├── issues/       # Issue retrieval
│   │   │   ├── upload-url/   # Supabase signed URL
│   │   │   ├── signed-url/   # Supabase signed download URL
│   │   │   └── inngest/      # Inngest webhook handler
│   │   │
│   │   ├── sign-in/          # Clerk sign-in page
│   │   ├── sign-up/          # Clerk sign-up page
│   │   ├── sync-user/        # Post-signup user sync to DB
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   │
│   ├── features/             # Feature-scoped API hooks & schemas
│   │   ├── projects/         # useGetProjects, useCreateProject, schemas
│   │   ├── questions/        # useGetQuestions, useSaveAnswer
│   │   ├── meetings/         # useGetMeetings, useDeleteMeeting
│   │   ├── issues/           # useGetIssues
│   │   └── uploads/          # useUploadFile
│   │
│   ├── lib/                  # Core service integrations
│   │   ├── openai.ts         # OpenAI: summarize commits, code, Q&A stream, embeddings
│   │   ├── github.ts         # Octokit: getCommits, pollCommits, summarizeCommit
│   │   ├── github-loader.ts  # LangChain GitHub document loader
│   │   ├── pipecone.ts       # Pinecone: indexGithubRepo, getAskQuestionContext
│   │   ├── assembly-ai.ts    # AssemblyAI: audio transcription
│   │   ├── inngest.ts        # Inngest client + processMeetingFn
│   │   ├── prisma.ts         # Singleton Prisma client
│   │   ├── supabase.ts       # Supabase client + storage client
│   │   └── utils.ts          # cn() helper
│   │
│   ├── components/           # Shared UI components
│   │   └── ui/               # shadcn/ui primitives + custom components
│   │
│   ├── configs/
│   │   └── env.ts            # Zod-validated environment variable config
│   │
│   ├── store/
│   │   └── use-project-store.ts  # Zustand store: selected project state
│   │
│   ├── hooks/                # Custom React hooks (useRefetch, etc.)
│   ├── providers/            # React context providers
│   ├── utils/                # http client, etc.
│   └── proxy.ts              # Clerk middleware configuration
│
├── generated/
│   └── prisma/               # Auto-generated Prisma client
│
├── public/                   # Static assets
├── .env                      # Environment variables (gitignored)
├── next.config.ts
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. Database Design

### Entity Relationship Overview

```
User ─────────── UserToProject ─────────── Project
                                               │
                               ┌───────────────┼───────────────────┐
                               │               │                   │
                            Commit    SourceCodeEmbedding       Meeting
                                               │                   │
                                       QuestionReference        Issue
                                               │
                                          Question ──── User
                                                   └─── Project

Project ────── InviteLink
```

### Tables

#### `User`

| Column                  | Type              | Description                         |
| ----------------------- | ----------------- | ----------------------------------- |
| `id`                    | `cuid`            | Internal primary key                |
| `clerkId`               | `String (unique)` | Clerk user ID                       |
| `emailAddress`          | `String (unique)` | User email                          |
| `firstName`, `lastName` | `String?`         | Display name                        |
| `imageUrl`              | `String?`         | Avatar URL                          |
| `credits`               | `Int`             | AI credits remaining (default: 150) |

#### `Project`

| Column             | Type        | Description                     |
| ------------------ | ----------- | ------------------------------- |
| `id`               | `cuid`      | Primary key                     |
| `name`             | `String`    | Human-readable project name     |
| `githubUrl`        | `String`    | Linked GitHub repository URL    |
| `isFirstTimeSetup` | `Boolean`   | Flag for initial indexing state |
| `deletedAt`        | `DateTime?` | Soft-delete timestamp           |

#### `UserToProject` _(join table)_

| Column      | Type     | Description  |
| ----------- | -------- | ------------ |
| `userId`    | `String` | FK → User    |
| `projectId` | `String` | FK → Project |

Unique composite index on `(userId, projectId)` prevents duplicate memberships.

#### `Commit`

| Column               | Type      | Description                                     |
| -------------------- | --------- | ----------------------------------------------- |
| `projectId`          | `String`  | FK → Project                                    |
| `commitHash`         | `String`  | Git commit SHA                                  |
| `commitMessage`      | `String`  | Original commit message                         |
| `commitAuthorName`   | `String`  | Author name                                     |
| `commitAuthorAvatar` | `String`  | Author avatar URL                               |
| `commitDate`         | `String`  | ISO date string                                 |
| `summary`            | `String?` | AI-generated summary (nullable until processed) |

#### `SourceCodeEmbedding`

| Column       | Type     | Description                                    |
| ------------ | -------- | ---------------------------------------------- |
| `projectId`  | `String` | FK → Project                                   |
| `fileName`   | `String` | Relative file path within the repo             |
| `sourceCode` | `String` | Raw source code content                        |
| `branch`     | `String` | Git branch name                                |
| `summary`    | `String` | AI-generated code summary (used for embedding) |

Unique index on `(projectId, branch, fileName)`. Also stored in Pinecone with vector ID `{projectId}-{branch}-{fileName}`.

#### `AskSession`

| Column      | Type       | Description                  |
| ----------- | ---------- | ---------------------------- |
| `userId`    | `String`   | The user asking              |
| `projectId` | `String`   | The project being queried    |
| `question`  | `String`   | The question text            |
| `expiresAt` | `DateTime` | Auto-expires after 5 minutes |

Used to prevent concurrent duplicate streaming requests.

#### `Question`

| Column      | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| `question`  | `String` | User's question                |
| `answer`    | `String` | AI-generated answer (Markdown) |
| `projectId` | `String` | FK → Project                   |
| `userId`    | `String` | FK → User                      |

#### `QuestionReference` _(join table)_

Links a `Question` to the `SourceCodeEmbedding` records that were used to answer it, enabling "referenced files" display in the UI.

#### `Meeting`

| Column       | Type            | Description                                                       |
| ------------ | --------------- | ----------------------------------------------------------------- |
| `name`       | `String`        | Meeting name (updated to first chapter headline after processing) |
| `meetingUrl` | `String`        | Supabase storage file path                                        |
| `projectId`  | `String`        | FK → Project                                                      |
| `status`     | `MeetingStatus` | `PROCESSING` or `COMPLETED`                                       |

#### `Issue`

| Column      | Type     | Description                     |
| ----------- | -------- | ------------------------------- |
| `start`     | `String` | Timestamp (`MM:SS`)             |
| `end`       | `String` | Timestamp (`MM:SS`)             |
| `headline`  | `String` | Short title of the segment      |
| `gist`      | `String` | One-line gist                   |
| `summary`   | `String` | Detailed summary of the chapter |
| `meetingId` | `String` | FK → Meeting                    |

#### `InviteLink`

| Column      | Type        | Description                  |
| ----------- | ----------- | ---------------------------- |
| `projectId` | `String`    | FK → Project                 |
| `expiresAt` | `DateTime`  | When the invite link expires |
| `revokedAt` | `DateTime?` | If set, link is revoked      |

---

## 10. Security

### Authentication & Authorization

- **Clerk** handles all authentication (OAuth + email/password) with zero-trust session management
- **Middleware** (`src/proxy.ts`) uses `clerkMiddleware` to protect all routes except explicitly whitelisted public paths
- Every API handler calls `await auth()` from `@clerk/nextjs/server` and returns `401` if no session exists
- Users can only access projects they are members of — enforced at the database query level (`users: { some: { userId: user.id } }`)

### Input Validation

- All request bodies are validated with **Zod schemas** before any DB operation
- GitHub URLs are validated against the real GitHub API before a project is created — invalid or inaccessible URLs are rejected with `422`
- Environment variables are validated via a typed Zod schema at startup (`src/configs/env.ts`)

### Secrets & Key Management

- All sensitive keys live exclusively in `.env` files (`.gitignore`d)
- Supabase Storage uses **service role key** only on the server side
- Client side uses the **anon key** exclusively
- Inngest webhook uses a **signing key** to verify request authenticity in production

### API Protection

- **Inngest endpoint** (`/api/inngest`) is intentionally public (required for webhook delivery) but is verified with the signing key by the Inngest SDK
- **Join page** (`/join/[linkId]`) is public to allow unauthenticated link access, but joining requires authentication
- `AskSession` model prevents session replay and concurrent duplicate AI requests per user/project

---

## 11. Deployment

### Platform Recommendation

**Vercel** (recommended) — native Next.js deployment with zero configuration.

### Steps

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import the repository at [vercel.com/new](https://vercel.com/new)
   - Framework: **Next.js** (auto-detected)

3. **Set Environment Variables**
   - Copy all variables from `.env` into the Vercel project settings
   - Change `NEXT_PUBLIC_BASE_URL` to your production domain

4. **Deploy Inngest**
   - Connect your Vercel deployment to [Inngest Cloud](https://www.inngest.com/)
   - Set `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` from Inngest dashboard
   - Inngest will automatically discover your functions at `/api/inngest`

5. **Run Database Migrations**

   ```bash
   # Run from local machine against production DB
   DATABASE_URL=<prod-url> pnpm prisma migrate deploy
   ```

### Server Requirements (if self-hosting)

| Resource   | Minimum                           |
| ---------- | --------------------------------- |
| Node.js    | >= 20                             |
| RAM        | >= 512 MB                         |
| Storage    | Minimal (Supabase offloads files) |
| PostgreSQL | Managed (Neon recommended)        |

### Environment Differences

| Variable               | Development             | Production               |
| ---------------------- | ----------------------- | ------------------------ |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| `INNGEST_SIGNING_KEY`  | Optional                | **Required**             |
| `INNGEST_EVENT_KEY`    | Optional                | **Required**             |

---

## 12. Future Improvements

| Feature                          | Description                                                         |
| -------------------------------- | ------------------------------------------------------------------- |
| 💳 **Billing & Credits**         | Stripe integration for credit top-ups and subscription plans        |
| 🔒 **Private Repo Support (UX)** | Guided UI for generating and storing GitHub PATs per project        |
| 🔄 **Commit Webhook**            | GitHub webhook to auto-poll new commits on push events              |
| 🌐 **Multi-branch Support**      | Index and query across multiple branches per project                |
| 🗂️ **File Tree Explorer**        | Visual source tree with per-file AI summaries                       |
| 📤 **Export Q&A**                | Export saved questions and answers to Markdown / PDF                |
| 🔔 **Notifications**             | Email or Slack notifications when meeting processing completes      |
| 👥 **Role-based Access**         | Owner / Member / Viewer roles per project                           |
| 📈 **Usage Analytics**           | Track credits used, questions asked, meetings processed per project |
| ♻️ **Re-index Project**          | Manually trigger re-indexing when the repo changes significantly    |

---

## 13. Author / License

### Author

**Nguyen Tuan Anh (NTA1210)**

- GitHub: [@NTA1210](https://github.com/NTA1210)

### License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Nguyen Tuan Anh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
Built with ❤️ using Next.js, OpenAI, Pinecone, and the GitHub API.
</div>
