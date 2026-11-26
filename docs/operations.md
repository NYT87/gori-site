# Operations

How the Node deployment behaves in production. The Worker deployment is stateless today; see the Cloudflare section of the README.

## Startup sequence

1. `openStore(process.env)` runs before the HTTP server listens. With `GORI_STORAGE` unset nothing is opened.
2. Opening a store applies pending migrations. SQLite wraps each file in `BEGIN IMMEDIATE`; PostgreSQL wraps the whole batch in one transaction and takes a transaction-scoped advisory lock, so several replicas starting at once apply the schema exactly once.
3. Every applied migration's SHA-256 checksum is compared with the recorded one. A mismatch aborts startup with `Applied migration changed: <file>`.
4. Any storage failure exits the process with `Storage initialization failed (GORI_STORAGE=...)` and the driver error attached as `cause`, so the log shows the real reason: missing driver, refused connection, authentication, or checksum.
5. The server listens on `0.0.0.0:$PORT`.

## Health and readiness

- `/health` is liveness. It never touches storage and needs no credentials.
- `/ready` is readiness. It pings the store and returns 503 `storage_unavailable` while the database is unreachable. Point load balancers and the Compose healthcheck at `/ready`.

Idle pool errors from PostgreSQL are logged as `PostgreSQL idle connection failed: <message>` and do not crash the process. The next request obtains a fresh connection.

## Shutdown

On `SIGINT` or `SIGTERM` the server stops accepting connections, waits for in-flight requests, closes the store, and exits 0. If that takes more than 10 seconds the process exits 1. Give the container at least that long before a kill signal.

## Docker Compose

```sh
docker compose up --build -d     # build the image, start PostgreSQL, then Gori
docker compose logs -f gori      # follow application logs
docker compose down              # stop; the database volume survives
docker compose down -v           # stop and delete the database volume
```

The stack publishes only `127.0.0.1:${PORT:-3000}`; PostgreSQL has no published port. Put HTTPS termination in front of Gori for remote use. The app waits for the PostgreSQL healthcheck before starting and restarts unless stopped.

## Workspace credentials

Each workspace's Naver and Kakao credentials are encrypted at rest with the key ring in `GORI_ENCRYPTION_KEYS`, which is required whenever `GORI_STORAGE` is set. Manage them with `npm run admin -- <command>` (or `docker compose exec gori node apps/server/src/admin.js <command>`): `workspace create|list|quota`, `key create|list|revoke`, `credential set|list|delete|rotate`, `oauth provider list|set|delete`, `connection list`, `encryption-key generate`. API key tokens and secrets are shown or read once and never logged.

Rotating the encryption key:

1. `npm run admin -- encryption-key generate k2` and put the new entry **first** in `GORI_ENCRYPTION_KEYS`, keeping the old one.
2. Restart the server, then run `credential rotate`. It re-encrypts workspace credentials, OAuth provider apps and OAuth connections, prints `rotated <n>`, and exits 1, naming the kind (and workspace and provider where there is one), for any row that cannot be decrypted.
3. Run `credential list <workspaceId>` for each workspace; when every `key` shows the new id, remove the old entry.

Losing every key that encrypted a row makes those credentials unrecoverable: re-enter them with `credential set`. Requests for such a workspace return 500 `credential_unavailable` and the server logs the workspace id, provider and key id, never secrets.

## Usage and audit

Every authenticated `POST /v1/tools/<id>/execute` request that reaches the handler is recorded once, including ones rejected for `payload_too_large`, `invalid_json`, `unknown_tool` or `invalid_input` (a tool name outside the catalog is recorded as `unknown`): principal (operator or workspace), workspace and key ids, tool id, outcome, error code, HTTP status, provider attempts, duration and start time. Every admin action (workspace create, API key create/revoke, credential set/delete/rotate, quota set) is recorded as an audit event with the actor, a target id and non-secret details.

Never recorded: requests that fail on a storage error before the handler finishes (they return 500), search text, request bodies, provider responses, tokens, secrets, IP addresses, authentication failures, and catalog reads. A recording failure is logged as `usage_record_failed tool=<id>` and never changes the response. Without storage (and on the Worker) nothing is recorded.

Query with `npm run admin -- usage|executions|audit` (add `--json` for scripting; see the README for flags). Execution rows are kept until pruned with `usage prune --before <date>`; audit events are never pruned by the CLI. Date-only values such as `2026-11-08` mean UTC midnight.

## Admin API

`GORI_ADMIN_KEY` turns on `/v1/admin/*` (see the [API](api.md#admin-api)). Treat it like a root credential: it can create keys and replace provider credentials. It is separate from `GORI_API_KEY` so a leaked agent key cannot manage the platform. Rotating it means setting a new value (at least 32 characters) and restarting; there is no overlap period, so update the dashboard and scripts together. Unset it to switch the admin API off.

The admin API has no rate limiting and no CORS. Put HTTPS and, for internet-facing deployments, request limiting or an IP allow-list in front of it, and serve any browser dashboard from the same origin. Admin actions are audited with the actor `admin-key`.

## Free tier and quotas

To cap what a workspace can do for free, set `GORI_DEFAULT_MONTHLY_CALLS` (for example `1000`): every workspace then gets that many successful tool calls per UTC month, and further calls get `quota_exceeded` (429) until the month rolls over. When a workspace starts paying, raise its own limit in the dashboard (workspace page, "Set limit"), with `admin workspace quota <workspaceId> --set <n>`, or through `PUT /v1/admin/workspaces/{id}/quota`; `--clear` returns it to the default. Each change is audited (`quota.set`). Usage is counted only while a limit applies. Gori does no billing: you decide the numbers and when to raise them.

## OAuth connections

OAuth connections let a workspace connect accounts (Google first, read-only Gmail tools) and let agents use them. It needs storage, `GORI_ENCRYPTION_KEYS` and `GORI_PUBLIC_URL`; the Cloudflare Worker has no OAuth.

1. Set `GORI_PUBLIC_URL` to the address people reach the dashboard on (for example `https://gori.example`) and restart.
2. In the provider's console (for Google: a Google Cloud project, OAuth consent screen, then an OAuth client of type "Web application"), add the redirect URI shown on the dashboard's **Providers** page (`<GORI_PUBLIC_URL>/v1/oauth/callback`). Google restricts Gmail permissions to verified apps for public use; a self-hosted app in testing mode can connect the accounts listed as test users.
3. On the Providers page (or `npm run admin -- oauth provider set google --client-id <id>`, with the secret on stdin or at a hidden prompt), enter the client ID and secret, choose permissions and enable the provider. Changes apply immediately without a restart. The secret is write-only: it is never shown again, and an empty field on later saves keeps the stored one.
4. On a workspace's **Connections** tab, choose Connect, approve access at the provider, and the account appears. Repeat for more accounts; agents pick one with the `connection` input. Rename or disconnect from the same tab.

Tokens are encrypted like workspace credentials and refresh automatically; if the provider revokes access the connection shows "Needs reconnecting" and calls fail with `connection_expired` until the account is connected again. Disabling or deleting a provider app stops its tools immediately without deleting connections. Disconnecting revokes the grant at the provider on a best-effort basis; Google revokes a grant per user and OAuth client, so if the same Google account is connected in two workspaces of this deployment, disconnecting it in one can send the other to "Needs reconnecting" at its next refresh. Provider setup, renames and disconnects are audited (`oauth_provider.set`, `oauth_provider.delete`, `connection.rename`, `connection.delete`), as are connects and reconnects (`connection.create`, `connection.reconnect`, actor `oauth`) and a grant found revoked (`connection.reauth_required`); no audit event contains a token, code or client secret. Logs carry only the provider and an HTTP status for a failed exchange or refresh.

## Dashboard

The operator dashboard is a set of static files served by the Node server at `/dashboard/`, on the same port as the API, and only when the admin API is enabled (`GORI_ADMIN_KEY` set and `GORI_STORAGE` configured); otherwise every `/dashboard` path answers 404. Signing in asks for the admin key, which the browser keeps in `sessionStorage` for the life of the tab and sends only as a bearer token to `/v1/admin`. Signing out or closing the tab discards it. There is no throttling of failed sign-ins (the key is at least 32 characters): put request limiting in front of the server on public networks, as for the admin API.

Every dashboard response carries `Content-Security-Policy` (`default-src 'none'`, scripts, styles, images and connections only from the same origin, no framing), `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`. If a reverse proxy strips or replaces these headers, the dashboard still works but loses that protection.

The design system under `apps/dashboard/public/vendor/` is a pinned, committed copy, so building and running Gori needs no private package token. The copy carries the design system's MIT licence and the notices for the icon artwork (`LICENSE`, `THIRD-PARTY-NOTICES.md`); keep both with it. To update it, a maintainer edits `apps/dashboard/vendor/versions.json`, runs `NODE_AUTH_TOKEN=<GitHub token with read:packages> npm run vendor:dashboard`, and commits the changed files; a test fails if the files and the pinned versions disagree or a vendored file was edited by hand.

## Schema changes and upgrades

Migrations run automatically at startup, so an upgrade is: back up, deploy the new image, confirm `/ready`. There is no manual migrate command. If startup reports a checksum mismatch, a committed migration file was edited after it was applied; restore the original file and add a new numbered migration instead.

Rollback of application code is safe only while the newer schema is still compatible with the older code. Write migrations additively where possible.

## Backups

- **PostgreSQL:** `docker compose exec postgres pg_dump -U gori gori > backup.sql`, or snapshot the `postgres_data` volume while the service is stopped.
- **SQLite:** stop the app or use `sqlite3 <path> ".backup <dest>"`. Copying the file alone is not enough in WAL mode; the `-wal` and `-shm` files must go with it.

Backups contain only token hashes, never tokens, but they do contain workspace and key names.

## Capacity notes

- The PostgreSQL pool holds at most 10 connections per process with a 10 second connect timeout.
- SQLite runs in WAL mode with a 5 second busy timeout and is suitable for a single process on a persistent volume.
- Request bodies are capped at 4096 bytes and provider calls at 10 seconds; see [api.md](api.md).

## Verification status

The Docker image and Compose stack with PostgreSQL have been verified locally: health, readiness, migrations, restart, database outage recovery, and startup failure reporting. Cloudflare deployment remains unverified. These are recorded development checks, not a guarantee for a new deployment; verify the stack in your staging environment before production use.
