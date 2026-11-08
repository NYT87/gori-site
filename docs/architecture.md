# Platform direction

Gori connects Korean services to applications and AI agents through a common tool catalog, managed connections, and execution API. The agreed delivery order is developer API first, then an English-first dashboard with Korean localization, initially covering Naver and Kakao. Gori is intended to be open source and independently deployable, with a future managed SaaS offering built from the same core.

## Runtime boundary

Use Web Request, Response, fetch, and Web Crypto in shared code. Keep Node-specific HTTP, filesystem, and database-driver code in adapters. `packages/core` is stateless and portable; `packages/storage` exposes a portable store contract with Node-only entry points (`sqlite`, `postgres`, `node`) and a Workers entry point (`d1`). The Docker deployment has no Cloudflare dependency, and the Worker must never import a Node-only entry point.

## Next milestones

1. Introduce workspaces, scoped API keys, and persistent connections. The storage interface, shared migrations, contract tests, and SQLite, D1, and PostgreSQL adapters exist (see Storage below); wiring workspace keys into HTTP authentication, key scopes and expiry, management routes, and encrypted provider tokens with a separately managed encryption key remain open.
2. Add Naver and Kakao OAuth connection flows with expiring one-use state, redirect allowlists, token refresh, revocation, and strict workspace ownership checks. Provider permissions determine available actions; login alone does not grant arbitrary service access.
3. Add execution records, credential-redacted audit events, per-workspace quotas, and provider-aware rate limits. Retry only safe operations; require idempotency controls before adding writes.
4. Expose tool discovery and execution through MCP and a typed SDK, backed by the same authorization layer.
5. Build an English-first dashboard with Korean localization for connections, tools, API keys, and execution history. Serve it alongside the API on either deployment target.

## Deployment parity

Cloudflare can use D1 and Queues behind interfaces. Node deployments, including Docker, choose storage through `openStore(env)` from `@gori/storage/node`: `GORI_STORAGE=sqlite` (with `GORI_SQLITE_PATH` on a persistent volume) or `GORI_STORAGE=postgres`. The default Docker Compose stack uses PostgreSQL. Every adapter implements the same store contract, including `ping()` and `close()`. A local job runner will implement the same interfaces as Queues. Avoid making Cloudflare bindings part of connector contracts.

## Current limits

The current bearer key is operator-level access, not multi-tenant authentication. Workspace and API-key persistence exists but is not consulted by the HTTP layer. There is no provider credential store, quota enforcement, OAuth, or execution history. Provider results retain their original shape. Do not market this initial slice as hosted multi-tenant infrastructure until isolation and lifecycle controls are implemented and tested.

## Self-hosted core and managed service

Start as a modular application, not separate network services. Share connectors, tool schemas, OAuth lifecycle, workspace authorization, execution, MCP, and the dashboard between self-hosted and hosted deployments. Keep workspace IDs in future persistence and authorization contracts from the start, even when a self-hosted instance has only one workspace.

The self-hosted edition must work without a Gori cloud account, license server, telemetry endpoint, or billing service. Operators supply their own provider credentials, storage, and encryption keys. Keep operational features such as API keys, usage visibility, and configurable quotas in the shared core. A managed service adds provisioning, subscriptions, payments, and fleet operations around that core; do not fork connector implementations.

Introduce logical module boundaries as features arrive:

- **Execution:** authenticated tool requests, connection ownership, validation, provider calls, and normalized errors.
- **Usage:** durable execution events and aggregate usage reports, available to self-hosted operators and SaaS alike.
- **Policy:** local admission controls and quotas; SaaS may supply plan limits through the same interface.
- **Billing:** an optional consumer of usage records, responsible for subscriptions, pricing, credits, and payment-provider integration. Connectors never call it.

Keep these modules in one deployment initially. Extract a billing worker or managed control service only when needed. Neither Docker nor Workers should require a separate metering server.

## Usage contract

Distinguish Gori executions from provider requests: a retry can create multiple provider requests for one execution. Record an execution ID, workspace ID, tool ID, timestamps, outcome, provider-attempt count, and schema version. Exclude tokens, request bodies, search text, and provider results from billing events.

Use unique event IDs and idempotent aggregation so redelivery cannot double-count usage. Define billable units explicitly when SaaS pricing is introduced; do not equate every failed attempt with a paid action. Reserve quota atomically before execution where strict limits are required. Persist admission and finalization records locally, then export asynchronously through an outbox. A payment-provider outage must not sit in the provider-call path; cached policy and an explicit reconciliation policy govern behavior.

Usage reports and quota enforcement are separate concerns: reports may lag, while admission controls need concurrency-safe counters. Self-hosting defaults to no commercial limits, with optional operator-defined limits and provider rate-limit protection.

## Dashboard localization

English (`en`) is the default interface language; Korean (`ko`) is a supported locale. Keep all user-facing strings in locale catalogs, use stable translation keys, and fall back to English for missing translations. Persist an explicit language selection per user; use English before a preference is set. Format dates and numbers with locale-aware APIs and keep timezone selection separate from language.

API routes, tool IDs, error codes, and storage values remain language-independent. Translate labels and error messages in presentation layers. Preserve Korean service names and provider content where appropriate. Test catalog completeness and both locales as dashboard functionality is added.

## Open-source release readiness

The open-source distribution should include the shared core, connectors, dashboard, migrations, and deployment documentation. The repository is licensed under GNU AGPL v3.0 only (`AGPL-3.0-only`); see the root LICENSE. Keep managed-only modules optional for building and running the self-hosted distribution. A separate package or service does not by itself establish that proprietary licensing is permissible; assess any future differently licensed components against the AGPL obligations before release.

All boundaries described above are planned architecture. The current implementation is the API slice described under Current limits plus the storage foundation described under Storage.

## Monorepo organization

npm workspaces manage `apps/*` and `packages/*`, with one root lockfile. `packages/core` owns portable execution and API code. `packages/storage` owns persistence, migrations, and database adapters. `apps/server` and `apps/worker` adapt that core to Node/Docker and Cloudflare respectively. Applications depend on shared packages through package exports; shared packages must not import application code. Keep deployment configuration at the root so both targets use the same checkout and lockfile.

Create additional workspaces only as their implementation begins. The future dashboard belongs in `apps/dashboard`; usage and optional billing can become shared packages with explicit interfaces. No dashboard or billing workspace exists yet.

## Storage

`packages/storage` provides workspace creation and lookup, API-key issuance, authentication, and workspace-scoped revocation behind one contract. `createStore(adapter)` builds that contract from two adapter primitives, `run(sql, values)` and `first(sql, values)`, and supplies default `ping()` and `close()` implementations that adapters may override. Three adapters exist:

| Adapter | Entry point | Runtime | Migrations |
| --- | --- | --- | --- |
| SQLite (`node:sqlite`) | `@gori/storage/sqlite` | Node 24+ | Applied at open, one transaction per file, checksum table |
| PostgreSQL (`pg`) | `@gori/storage/postgres` | Node 24+ | Applied at open, one transaction per batch under an advisory lock, checksum table |
| Cloudflare D1 | `@gori/storage/d1` | Workers | Applied by Wrangler before deploy, primary-first session |

Migrations are numbered SQL files in `packages/storage/migrations/`, shared by every dialect. A same-named file under `migrations/<dialect>/` overrides the shared file for that dialect only when its SQL must differ; today no override exists. SQLite and PostgreSQL record a SHA-256 checksum per applied file and refuse to start if an applied file changes, so schema changes are always new numbered files.

Node deployments choose an adapter with `openStore(env)` from `@gori/storage/node`, driven by `GORI_STORAGE`. The adapter is opened before the HTTP server listens, so a storage failure stops the process with the underlying error attached as `cause`. `/ready` calls `ping()` and reports 503 while storage is unreachable; `/health` stays a liveness check. Graceful shutdown closes the server, then the store.

Tokens are 256 random bits and only SHA-256 digests are persisted. Store methods are internal building blocks: callers must authorize workspace management before invoking them, and `authenticate` is the only source of a caller's workspace identity.

The store is not yet connected to HTTP authentication; the operator key remains the only accepted credential. Before enabling workspace keys for provider execution, introduce workspace-owned provider connections so one workspace cannot use another workspace's credentials. Key scopes, expiry, management routes, encrypted provider secrets, and OAuth follow. Verification status: SQLite persistence, the PostgreSQL adapter and migration runner (with mocks), and a D1 contract double are tested; a live PostgreSQL test runs only when `GORI_TEST_POSTGRES_URL` is set, and the Docker Compose stack has been verified locally; live D1 has not been exercised.

Operational details live in [operations](operations.md); the environment reference is in [configuration](configuration.md).
