# Configuration reference

All configuration is read from environment variables. The Node app (`apps/server`) reads `process.env`; root `npm run dev` and `npm start` load `.env` first. The Cloudflare Worker reads Wrangler secrets and bindings. Docker Compose maps `.env` to container variables in `compose.yaml`. Start from `.env.example` and never commit `.env`.

## HTTP API

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `GORI_API_KEY` | Yes | Node, Worker | Operator bearer token for every route except `/health` and the Node-only `/ready`. Without it protected routes answer 503 `service_not_configured`. Generate with `openssl rand -hex 32`. |
| `GORI_ENCRYPTION_KEYS` | When `GORI_STORAGE` is set | Node | Key ring for workspace provider credentials: comma-separated `id:base64key` entries (ids of 1–32 letters, digits, `_` or `-`; each key 32 bytes). The first entry encrypts new data; the others only decrypt. Whitespace and trailing commas are ignored. Generate an entry with `npm run admin -- encryption-key generate [id]`. Startup fails without it, and error messages never include key material. |
| `GORI_ADMIN_KEY` | No | Node | Enables the admin API (`/v1/admin/*`, see [API](api.md#admin-api)) when `GORI_STORAGE` is set. At least 32 characters, different from `GORI_API_KEY`, and not shaped like a workspace key (`gori_` plus 64 hex characters); the server refuses to start otherwise, naming the variable but never its value. Unset or empty keeps the admin API off: every `/v1/admin/*` path answers 404. The dashboard at `/dashboard/` is served exactly when the admin API is on (there is no separate setting). Generate with `openssl rand -hex 32`. |
| `GORI_DEFAULT_MONTHLY_CALLS` | No | Node (with storage) | Default monthly allowance of successful tool calls per workspace: a non-negative integer. Unset or empty means no limit. A workspace can override it; the operator key is never limited. Invalid values stop the server at startup. |
| `GORI_MCP_ALLOWED_ORIGINS` | No | Node, Worker | Comma-separated origins (for example `https://app.example.com`; case and a trailing slash are ignored) that may call `/mcp` from a browser. Empty or unset: requests with any `Origin` header are refused with 403; agents and IDEs send none and are always accepted. |
| `GORI_ACTOR` | No | Node CLI | Name recorded as the actor of admin actions in the audit log when `--actor` is not passed. Defaults to `cli:<operating system user>`. |
| `PORT` | No | Node | Listen port, default `3000`. Compose publishes it on `127.0.0.1` only. |

## Providers

Provider credentials for the operator key (`GORI_API_KEY`) come from the variables below. A tool whose credentials are missing returns 503 `provider_not_configured`; other tools keep working. Requests authenticated with a workspace API key never use these variables: they use that workspace's own encrypted credentials (see [operations](operations.md#workspace-credentials)) and fail with 403 `provider_not_connected` when none are stored.

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
