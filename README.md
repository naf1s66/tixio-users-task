# Fullstack Users Dashboard

A full-stack application that displays a list of users with search, filtering, pagination, and a details view.

## Tech Stack

**Frontend:** Vite + React + TypeScript, React Query, Tailwind CSS, shadcn/ui

**Backend:** NestJS + TypeScript, MongoDB, Prisma 6.19.2, Swagger OpenAPI

## Setup

### Prerequisites
- Node.js 20+
- PNPM
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
pnpm install
```

### Backend

```bash
cd apps/backend
cp .env.example .env
# Edit .env with your MongoDB connection string

pnpm prisma:generate
pnpm prisma:push
pnpm seed
pnpm dev
```

Swagger docs: http://localhost:3000/docs

### Frontend

```bash
cd apps/frontend
cp .env.example .env
pnpm dev
```

App: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users?search=&role=&page=&limit=` | List users with pagination |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id/toggle-active` | Toggle user active status |

## What is Done

### Core Requirements
- [x] PNPM Workspaces monorepo structure
- [x] User model with all required fields (id, name, email, role, active, createdAt)
- [x] GET /users endpoint with search (by name) and role filter
- [x] GET /users/:id endpoint
- [x] PATCH /users/:id/toggle-active endpoint
- [x] React Query for data fetching
- [x] Search input with automatic refetch
- [x] Request cancellation via AbortSignal when typing quickly
- [x] Role filter dropdown
- [x] Sort by Name button
- [x] Users list displaying name, role badge, and active status
- [x] User details panel
- [x] Loading skeleton while fetching details

### Bonus Features
- [x] Activity indicator ("Viewing profile for X seconds")
- [x] Strong TypeScript typing throughout
- [x] Disable sorting while loading
- [x] Optimistic update for toggle active (with rollback on error)
- [x] OpenAPI/Swagger documentation

### Additional Features
- [x] Pagination with Previous/Next controls

## What is Not Done

- [ ] Live deployment (optional per instructions)

## Deviations

None. The implementation follows all specified requirements using the recommended tech stack.
