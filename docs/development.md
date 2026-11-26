# Development guide

Node 24 or later. Run everything from the repository root.

```sh
npm ci                       # install workspace links from the lockfile
npm run dev                  # Node server with --watch, loads .env
npm test                     # all workspace test suites (node --test)
npm run check                # syntax check every entry point
npm test --workspace=@gori/storage
```

No build step, bundler, formatter, or linter is configured. Use ES modules, two-space indentation, and descriptive names.

## Layout

| Path | Package | Role |
| --- | --- | --- |
| `packages/core` | `@gori/core` | Portable request handler, tool catalog, provider execution. Web APIs only. |
| `packages/storage` | `@gori/storage` | Store contract, migrations, SQLite, PostgreSQL, and D1 adapters. |
| `apps/server` | `@gori/server` | Node HTTP adapter used by Docker. Opens storage, adds `/ready`, handles signals. |
| `apps/worker` | `@gori/worker` | Cloudflare Worker entry point. |
| `docs/` | | Architecture, API, configuration, operations, this guide. |

Shared packages never import application code. Applications import packages only through their `exports` map.

## Test matrix

| Suite | What it covers | Needs |
| --- | --- | --- |
| `packages/core/test` | Routing, auth, validation, provider calls with a fake `fetch`, error redaction | Nothing |
| `apps/worker/test` | Worker adapter resolves the core and passes bindings | Nothing |
| `packages/storage/test/storage.test.js` | Real SQLite persistence, D1 contract double, migration loader, `openStore` selection | Nothing |
| `packages/storage/test/postgres.test.js` | Placeholder translation, migration transaction and rollback with a mock pool | Nothing |
| `packages/storage/test/postgres.integration.test.js` | Live migrations and persistence | `GORI_TEST_POSTGRES_URL` |

Real provider calls are never made by the suite.

## Adding a tool

1. Add the definition to the `tools` array in `packages/core/src/tools.js`: `id` as `provider.action`, `provider`, a Korean `description`, and a strict `inputSchema` with `additionalProperties: false`.
2. Extend `executeTool` with the provider URL, headers, and the credential check that yields `provider_not_configured`.
3. Keep provider error bodies out of responses and logs; only the status mapping leaves `executeTool`.
4. Add tests in `packages/core/test` for the success path, missing credentials, invalid input, and provider failure.
5. Document the tool and any new variables in [api.md](api.md) and [configuration.md](configuration.md).

## Adding a migration

1. Create the next numbered file in `packages/storage/migrations/`, for example `0002_connections.sql`. Files are applied in sorted name order.
2. Write dialect-neutral SQL. If one dialect genuinely needs different SQL, add a same-named file under `migrations/<dialect>/`; the loader prefers it for that dialect only.
3. Never edit a file that has been applied anywhere. Checksums are verified at every open and a change aborts startup.
4. Run the storage suite. The SQLite tests apply the real file; set `GORI_TEST_POSTGRES_URL` to exercise PostgreSQL. For D1, run `npx wrangler d1 migrations apply DB --local`.
5. Extend the store contract in `packages/storage/src/index.js` and the shared contract tests so every adapter is covered.

## Adding a storage adapter

An adapter supplies `run(sql, values)` and `first(sql, values)`, both async, taking SQL with `?` placeholders and a values array, and optionally `ping()` and `close()`. Pass it to `createStore`. Translate placeholders inside the adapter if the driver needs a different style, as the PostgreSQL adapter does. Register Node adapters in the `switch` in `packages/storage/src/node.js` and give the package a new `exports` entry. Add the adapter to the shared contract tests and to the table in [architecture.md](architecture.md).

## Dependency policy

Everything is pinned through the root `package-lock.json`. Database drivers are optional peer dependencies of `@gori/storage` and hard dependencies of the app that needs them, so Workers builds never pull Node drivers. Do not install packages outside the lockfile, in the Dockerfile or otherwise.

## Public website

The public website lives in its own repository, [NYT87/gori-site](https://github.com/NYT87/gori-site), published at https://nyt87.github.io/gori-site/. It is not built from this repository, which is private for now. `docs/` here is the source of truth for the user-facing documentation (agents, API, configuration, operations, development, architecture); gori-site keeps a copy.

When platform behaviour, endpoints, or configuration change, update `docs/` and `README.md` here in the same change, then copy the changed public markdown into gori-site's `docs/`, run its tests, and push. Pricing on the site must match what exists: no prices until they are decided, and nothing offered that is not built. English and Korean copy change together.
