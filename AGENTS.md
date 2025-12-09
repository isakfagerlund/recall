# Recall - Expo React Native App

## Setup
- **Package Manager**: bun@1.3.1 (`packageManager` in `package.json`)
- **Installation**: Run `bun install` from root to install all workspace dependencies
- **Monorepo**: Uses bun workspaces (`apps/*`) with Turbo for task orchestration

## Commands

### Workspace Commands (from root)
- **Dev**: `bun dev` or `pnpm dev` - Runs `turbo run dev` (starts all apps)
- **Build**: `bun build` or `pnpm build` - Runs `turbo run build` (builds all apps)
- **Lint**: `bun lint` or `pnpm lint` - Runs `turbo run lint` (lints all apps)
- **Typecheck**: `bun typecheck` or `pnpm typecheck` - Runs `turbo run typecheck` (typechecks all apps)
- **Deploy API**: `bun deploy:api` - Deploys API to Cloudflare Workers

### Client App (`apps/client/`)
- **Start dev server**: `bun start` or `expo start` (from `apps/client/` or use `bun --filter client start`)
- **Run iOS**: `bun run ios` (runs `expo prebuild --platform ios && expo run:ios`)
- **Run iOS (device)**: `bun run ios-device`
- **Run iOS (device release)**: `bun run ios-device-release`
- **Run Android**: `bun run android` (runs `expo run:android`)
- **Run Web**: `bun run web` (runs `expo start --web`)
- **Typecheck**: `bun typecheck` or `npx tsc --noEmit`
- **Database migrations**: `bun db:generate` (generates migrations), `bun db:studio` (opens Drizzle Studio)

### API App (`apps/api/`)
- **Dev**: `bun dev` (runs `wrangler dev` - starts Cloudflare Workers dev server)
- **Deploy**: `bun deploy` (runs `wrangler deploy`)
- **Typecheck**: `bun typecheck` or `npx tsc --noEmit`

## Architecture

### Monorepo Structure
- **Workspaces**: `apps/client/` (Expo React Native), `apps/api/` (Cloudflare Workers)
- **Task Runner**: Turbo (`turbo.json`) handles build orchestration and caching
- **Build Dependencies**: Turbo manages task dependencies (e.g., `typecheck` depends on `^build`)

### Client App
- **Framework**: Expo SDK 54 + React Native 0.81 with React 19
- **Router**: expo-router (file-based routing in `app/` directory)
- **Database**: SQLite via expo-sqlite with Drizzle ORM (`db/schema.ts`, migrations in `db/migrations/`)
- **AI**: Uses AI SDK (`ai` package) with Apple's on-device model (`@react-native-ai/apple`) for structured text generation
- **Validation**: Zod v4 for schema validation and type inference
- **Permissions**: Contacts (expo-contacts), Audio recording (expo-audio), Calendar access (expo-calendar)
- **Sync**: Custom sync system with encrypted data storage (see `lib/sync/`)

### API App
- **Platform**: Cloudflare Workers (Hono framework)
- **Database**: Neon PostgreSQL (serverless Postgres) via `@neondatabase/serverless`
- **Deployment**: Wrangler CLI (`wrangler.toml` config)
- **Environment**: Uses Cloudflare Workers environment variables and secrets

## Database

### Client (SQLite)
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Schema**: Defined in `apps/client/db/schema.ts`
- **Migrations**: Stored in `apps/client/db/migrations/`
- **Commands**: 
  - `bun db:generate` - Generate new migration from schema changes
  - `bun db:studio` - Open Drizzle Studio for database inspection
- **Initialization**: Migrations run automatically on app startup (`db/index.ts`)

### API (PostgreSQL)
- **Provider**: Neon (serverless PostgreSQL)
- **Client**: `@neondatabase/serverless` (Cloudflare Workers compatible)
- **Schema**: Manual SQL (see `apps/api/src/lib/db.ts` for table initialization)
- **Environment**: `DATABASE_URL` environment variable (optional, throws error if missing when needed)

## Environment Variables

### Client App
- **Location**: `apps/client/.env` (gitignored)
- **Runtime**: Uses `process.env` for environment variables
- **Sync**: `DATABASE_URL` (optional, for sync functionality)

### API App
- **Location**: `.dev.vars` for local development (gitignored), Cloudflare secrets for production
- **Required Variables** (see `apps/api/src/types/env.ts`):
  - `OPEN_AI_KEY`: OpenAI API key for transcription
  - `API_KEY_SALT`: Salt for API key hashing
  - `API_KEY_HASH`: Hashed API key for authentication
  - `DATABASE_URL`: Neon PostgreSQL connection string (optional)
- **Setting Secrets**: Use `wrangler secret put SECRET_NAME` for production

## Code Style
- **TypeScript**: Strict mode enabled (`tsconfig.json`)
- **Imports**: Use `@/` alias for absolute imports (e.g., `@/components`, `@/types`)
- **Types**: Extract reusable types/schemas to `types/` directory (e.g., `types/person.ts`)
- **Formatting**: Prettier configured (`.prettierrc.json`, `.prettierignore`)
- **Nullish Coalescing**: Always use `??` over `||` for null/undefined checks
- **Components**: React functional components with TypeScript, explicit types for props and state
- **Error Handling**: Use proper error type checking with `instanceof Error` in catch blocks
- **Linting**: No ESLint configuration currently (lint scripts exist but may not be configured)

## Project Structure
- **Client Routes**: `apps/client/app/` - expo-router file-based routing
  - `(tabs)/` - Tab navigation routes
  - `_layout.tsx` - Root layout
  - `+not-found.tsx` - 404 page
- **Components**: `apps/client/components/` - Reusable React components
- **Database**: `apps/client/db/` - Drizzle schema and migrations
- **Types**: `apps/client/types/` - TypeScript type definitions
- **Utils**: `apps/client/utils/` - Utility functions
- **API Routes**: `apps/api/src/routes/` - Hono route handlers
- **API Lib**: `apps/api/src/lib/` - Shared utilities (auth, db)
