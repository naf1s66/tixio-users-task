# Fullstack Users Dashboard

## Tech
- Frontend: Vite + React + TypeScript, React Query, Tailwind, shadcn/ui
- Backend: NestJS + TypeScript, MongoDB, Prisma (6.19.2), Swagger OpenAPI

## Setup

### 1) Start MongoDB
Example with local MongoDB:
- `mongodb://localhost:27017/fullstack_users`

### 2) Install
From repo root:
```bash
pnpm install
```

### 3) Backend
```bash
cd apps/backend
cp .env.example .env
pnpm prisma:generate
pnpm prisma:push
pnpm seed
pnpm dev
```

Swagger: http://localhost:3000/docs

### 4) Frontend
```bash
cd apps/frontend
cp .env.example .env
pnpm dev
```

Frontend: http://localhost:5173

## API
- `GET /users?search=&role=`
- `GET /users/:id`
- `PATCH /users/:id/toggle-active`

## Done
- Search & role filter
- React Query fetching + request cancellation via AbortSignal
- Sort by name (disabled while loading)
- Details view with skeleton
- Optimistic toggle active
- Bonus: viewing profile timer
- Swagger OpenAPI docs

## Not done
- Pagination (optional)
- Deployment (optional)
