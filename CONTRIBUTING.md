# Contributing

## Setup

```bash
git clone https://github.com/bay1inc/highnote-node-demo.git
cd highnote-node-demo

# API server
cd api
cp .env.template .env  # Fill in your Highnote credentials
npm install
npm run dev

# Web frontend (separate terminal)
cd web
npm install
npm run dev
```

## Development

### API

```bash
cd api
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript
npm run db:push          # Push schema changes to SQLite
```

### Web

```bash
cd web
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run typecheck        # Type-check without emitting
npm run lint             # Lint with ESLint
```

### Docker

```bash
docker compose up --build   # Full stack at http://localhost:3000
```

## CI

GitHub Actions runs on every PR and push to main:
- **API** — typecheck + build
- **Web** — build

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Ensure the build passes (`npm run build` in both `api/` and `web/`)
5. Open a pull request against `main`
