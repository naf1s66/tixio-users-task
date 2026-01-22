# Backend (NestJS)

Short, project-specific backend README. For full project context, see the root `README.md`.

## Setup
From repo root:
```bash
pnpm install
```

From this folder:
```bash
cp .env.example .env
pnpm prisma:generate
pnpm prisma:push
pnpm seed
pnpm run start:dev
```

Swagger: http://localhost:3000/docs

## Done
- Users API (list, get by id, toggle active)
- Prisma + MongoDB integration
- Swagger OpenAPI docs

## Not done
- Pagination (optional)
- Deployment (optional)

## Deviations
- None noted.

## Live deployment
- None (local only).
