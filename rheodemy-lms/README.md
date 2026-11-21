# rheodemy-lms

A Headless LMS installation.

## Run

    docker compose up -d      # if you chose the bundled Postgres/MinIO
    pnpm install
    pnpm migrate
    pnpm dev                  # API on http://localhost:8000, docs at /docs

## Layout

- `src/main.ts` — entry point: config → container → server
- `src/config.ts` — reads .env into the ServerConfig
- `src/plugins/` — integrations (see its README)
- `.env` — secrets and runtime config (never commit)
