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
| `apps/site` | `@gori/site` | Public website (homepage, pricing, docs) built to static HTML for GitHub Pages. |
| `docs/` | | Architecture, API, configuration, operations, this guide. |

Shared packages never import application code. Applications import packages only through their `exports` map.

## Test matrix

| Suite | What it covers | Needs |
| --- | --- | --- |
| `packages/core/test` | Routing, auth, validation, provider calls with a fake `fetch`, error redaction | Nothing |
| `apps/worker/test` | Worker adapter resolves the core and passes bindings | Nothing |
| `apps/site/test` | Doc link rewriting, private docs excluded, full site build into a temp directory | Nothing |
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

Everything is pinned through the root `package-lock.json`. Database drivers are optional peer dependencies of `@gori/storage` and hard dependencies of the app that needs them, so Workers builds never pull Node drivers. Do not install packages outside the lockfile, in the Dockerfile or otherwise. `marked` is a dev dependency of `@gori/site` only; it never reaches the server or Worker.

## Public website

`apps/site` renders the homepage, the pricing page, and the user-facing docs into `_site/` (ignored by git). It is deployed to https://nyt87.github.io/gori/ by `.github/workflows/pages.yml` on every push to `main` that touches `apps/site/`, `docs/`, or the lockfile.

```sh
npm run build --workspace=@gori/site        # writes _site/
open _site/index.html                       # links are relative, so it works from disk
```

Published docs are the files listed in `PUBLIC_DOCS` in `apps/site/src/render.js`: api, configuration, operations, development, and architecture. Everything else in `docs/` (design specs, brand guidelines) stays out of the site; links to it point at GitHub. Links between public docs are rewritten from `.md` to `.html`. To publish a new doc, add it to `PUBLIC_DOCS` with a one-line summary.

English copy lives in `apps/site/src/pages/*.html` and the shared pricing cards in `render.js`; Korean strings live in `apps/site/src/client.js`, keyed by `data-i18n`. Change both when you change copy. Pricing must match what exists: no prices until they are decided. Docs pages are English-only for now. One-time setup on GitHub: Settings → Pages → Source: GitHub Actions.
