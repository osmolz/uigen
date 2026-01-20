# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe React components in natural language and Claude generates them with real-time preview.

## Commands

```bash
npm run setup     # Install dependencies, generate Prisma client, run migrations
npm run dev       # Start dev server with Turbopack (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm run test      # Run Vitest test suite
npm run db:reset  # Reset database (destructive)
```

## Architecture

### Tech Stack
- Next.js 15 with App Router and React Server Components
- React 19, TypeScript, Tailwind CSS v4
- Prisma with SQLite for persistence
- Vercel AI SDK with Anthropic Claude integration
- Shadcn/ui components (New York style)

### Key Directories
- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components organized by feature (chat, editor, preview, auth, ui)
- `/src/lib` - Core utilities: contexts, tools, prompts, file-system
- `/src/actions` - Server actions for project CRUD
- `/prisma` - Database schema and SQLite database

### Core Patterns

**Virtual File System**: All generated code lives in-memory via `VirtualFileSystem` class (`/lib/file-system.ts`). No files written to disk. State persisted to database as serialized JSON.

**State Management**: React Context for global state - `FileSystemContext` manages virtual files, `ChatContext` manages conversation state.

**AI Tools**: Two tools exposed to Claude:
- `str_replace_editor` - Create/modify component files
- `file_manager` - File operations (view, delete)

**Provider Selection** (`/lib/provider.ts`): Uses real Claude API if `ANTHROPIC_API_KEY` is set, falls back to `MockLanguageModel` for demo mode.

**Authentication**: Optional JWT-based auth. App works for anonymous users with temporary project storage.

### Database Models
- `User` - email, hashed password, projects relation
- `Project` - name, serialized messages (chat history), serialized data (virtual file system)

### UI Layout
Three-panel resizable layout: Chat (left), Preview/Code (right). Preview renders generated components live; Code view shows file tree + Monaco editor.

## Environment

Set `ANTHROPIC_API_KEY` in `.env` for real AI generation. Without it, the app returns static mock responses.
