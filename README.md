# recinote-api

## Requirements

- Node 20.x
- Docker + Docker Compose (for containerized dev)

## Quick start (Docker — recommended)

```sh
cp .env.example .env
docker compose up --build
curl http://localhost:4000/health
```

## Local dev (without Docker)

```sh
cp .env.example .env
npm install
# ensure Postgres is reachable per DATABASE_URL in .env
npm run prisma:migrate:dev
npm run dev
```

## Scripts

- `npm run dev` — start dev server with hot reload
- `npm run build` / `npm start` — compile and run production build
- `npm run prisma:migrate:dev` — create/apply a migration locally
- `npm run prisma:migrate:deploy` — apply committed migrations (used automatically in Docker)
- `npm run prisma:studio` — open Prisma Studio
- `npm run lint` / `npm run format` — lint and format the codebase
