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
