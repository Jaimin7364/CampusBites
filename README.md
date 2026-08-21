# CampusBites

CampusBites is a campus-focused food ordering and pre-ordering platform for students, food sellers, and platform administrators.

## Prerequisites

- Node.js 20.9 or newer
- npm 10 or newer
- MySQL 8 for database-backed features and the database health check

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and adjust the MySQL connection if needed.

3. Copy `apps/web/.env.example` to `apps/web/.env.local`.

4. Generate the Prisma client:

   ```bash
   npm run prisma:generate -w @campusbites/api
   ```

5. Start the API and web app together:

   ```bash
   npm run dev
   ```

The web app runs at `http://localhost:3000` and the API at `http://localhost:4000`. Service health is available at `/api/health`; database health is at `/api/health/database`.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

## Workspace Layout

- `apps/api`: Express, TypeScript, Prisma, MySQL, and REST API
- `apps/web`: Next.js App Router, TypeScript, and Tailwind CSS
- `packages`: future shared packages
- `CampusBites Web Platform Build Prompt.md`: product specification
- `CampusBites Module-Wise Build Plan.md`: vertical implementation plan and progress

Domain tables and migrations are added by the module that owns them. Module 0 intentionally verifies Prisma connectivity without introducing premature domain models.

## Module 1 Backend

Authentication backend setup and manual API verification are documented in [`docs/MODULE_1_BACKEND_API_TESTING.md`](docs/MODULE_1_BACKEND_API_TESTING.md). Start MySQL and run the committed migrations before testing database-backed endpoints:

```bash
npm run prisma:deploy -w @campusbites/api
npm run dev:api
```
