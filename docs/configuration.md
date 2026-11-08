# Configuration reference

All configuration is read from environment variables. The Node app (`apps/server`) reads `process.env`; root `npm run dev` and `npm start` load `.env` first. The Cloudflare Worker reads Wrangler secrets and bindings. Docker Compose maps `.env` to container variables in `compose.yaml`. Start from `.env.example` and never commit `.env`.

## HTTP API

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `GORI_API_KEY` | Yes | Node, Worker | Operator bearer token for every route except `/health` and the Node-only `/ready`. Without it protected routes answer 503 `service_not_configured`. Generate with `openssl rand -hex 32`. |
| `PORT` | No | Node | Listen port, default `3000`. Compose publishes it on `127.0.0.1` only. |

## Providers

Provider credentials belong to the deployment operator. A tool whose credentials are missing returns 503 `provider_not_configured`; other tools keep working.

| Variable | Tool | Notes |
| --- | --- | --- |
| `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | `naver.search_news` | NAVER API HUB application credentials. Legacy Naver Developers credentials do not work. |
| `KAKAO_REST_API_KEY` | `kakao.search_places` | REST API key of a Kakao application with the Local API enabled. |

## Storage (Node only)

| Variable | Required | Notes |
| --- | --- | --- |
| `GORI_STORAGE` | No | `sqlite` or `postgres`. Unset means no store is opened and `/ready` always reports ready. Any other value fails startup. |
| `GORI_SQLITE_PATH` | With `sqlite` | Database file path. The parent directory must exist and be writable. WAL mode creates `-wal` and `-shm` siblings. |
| `DATABASE_URL` | No | PostgreSQL connection string, for example `postgresql://user:password@host:5432/gori`. Takes precedence over `PG*`. |
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE` | No | Standard libpq variables read by the `pg` driver when `DATABASE_URL` is unset. Compose sets these. |

The pool uses a 10 second connection timeout and at most 10 connections. The database user needs privileges to create tables for migrations. For remote databases configure verified TLS as your provider requires.

## Docker Compose only

| Variable | Required | Notes |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | Yes | Password for the bundled PostgreSQL service and the app's `PGPASSWORD`. Compose refuses to start when it is empty; `.env.example` leaves it empty on purpose. |

## Cloudflare Workers

Set `GORI_API_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, and `KAKAO_REST_API_KEY` with `npx wrangler secret put`. For local development put them in an ignored `.dev.vars` file. The Worker does not open a store today; when it does, it will use a D1 binding named `DB` configured in `wrangler.jsonc` with `migrations_dir` pointing at `packages/storage/migrations`.

## Tests

| Variable | Notes |
| --- | --- |
| `GORI_TEST_POSTGRES_URL` | Connection string of a disposable PostgreSQL database. When set, the storage suite runs the live PostgreSQL test in a uniquely named schema that it drops afterwards. Unset skips it. |

## Build-time

`NODE_ENV=production` is set in the Dockerfile. The application does not branch on it.
