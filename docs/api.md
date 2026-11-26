# HTTP API

The same handler serves the Node server and the Cloudflare Worker. Responses are JSON. Successful executions return `{ "data": ... }`; failures return `{ "error": "<code>" }`.

Connecting an AI agent? See [Connecting agents](agents.md) for the tool-calling pattern and the [MCP server](#mcp).

## Authentication

Every route except `/health` and the Node-only `/ready` requires `Authorization: Bearer <GORI_API_KEY>`. `/v1/admin/*` is separate and uses only `GORI_ADMIN_KEY` (see [Admin API](#admin-api)). On every other route, two kinds of bearer token are accepted:

- **Operator key** (`GORI_API_KEY`): deployment-level access that executes tools with the credentials from the server environment.
- **Workspace API key** (`gori_` followed by 64 hex characters), Node deployments with `GORI_STORAGE` only: executes tools with that workspace's own provider credentials, never another workspace's and never the operator's. Revoked or unknown keys return 401. Create keys and credentials with the operator CLI (`npm run admin`); the Worker has no store yet and rejects workspace keys with 401.

## Routes

### `GET /health`

Public liveness check. Always `200 {"name":"Gori","nameKo":"고리","status":"ok"}`, including when the API key or storage is not configured.

### `GET /ready` (Node server only)

Public readiness check for orchestrators. Calls `ping()` on the configured store.

| Status | Body | Meaning |
| --- | --- | --- |
| 200 | `{"status":"ready"}` | Store reachable, or no store configured. |
| 503 | `{"error":"storage_unavailable"}` | `ping()` failed. |

The Worker does not expose this route; it falls through to authentication and `not_found`.

### `GET /v1/tools`

Returns `{ "tools": [...] }`. Each tool has `id`, `provider`, an English `title` and `summary`, a Korean `description`, and a JSON Schema `inputSchema`. Current tools: `naver.search_news` and `kakao.search_places`, both taking `{ "query": string }` of 1 to 200 characters with no extra properties.

### `POST /v1/tools/{id}/execute`

Body: a JSON object matching the tool's `inputSchema`. Tool IDs match `[a-z_.]+`. Returns `200 { "data": <provider JSON> }` with the provider response unchanged.

```sh
curl http://localhost:3000/v1/tools/kakao.search_places/execute \
  -H "Authorization: Bearer $GORI_API_KEY" \
  -H 'Content-Type: application/json' -d '{"query":"성수 카페"}'
```

### `POST /mcp`

The [MCP server](#mcp). Same authentication as the routes above: a missing or wrong key is `401` with `WWW-Authenticate: Bearer realm="gori"` and a plain JSON body, before any JSON-RPC is read.

## MCP

`POST /mcp` speaks the Model Context Protocol over stateless Streamable HTTP: one JSON-RPC 2.0 message per request, always answered with `application/json`. There are no sessions (Gori never sends `Mcp-Session-Id`) and no streaming. Protocol versions `2025-11-25`, `2025-06-18` and `2025-03-26` are supported; a request without `MCP-Protocol-Version` is treated as `2025-03-26`. Only the `tools` capability exists.

| Request | Response |
| --- | --- |
| Any method except `POST` | `405`, `Allow: POST` |
| `Origin` header not listed in `GORI_MCP_ALLOWED_ORIGINS` | `403 { "error": "origin_not_allowed" }`; a request with no `Origin` is accepted |
| Unsupported `MCP-Protocol-Version` | `400`, JSON-RPC `-32600` |
| Body over 16 384 bytes | `413`, JSON-RPC `-32600` |
| Invalid JSON, a batch (array), or a malformed message | `400`, JSON-RPC `-32700` or `-32600` |
| A notification (no `id`), for example `notifications/initialized` | `202`, empty body |

Methods: `initialize`, `ping`, `tools/list` (every catalog tool in one page) and `tools/call`; any other method is JSON-RPC `-32601`.

**Tool names.** `.` becomes `_`: `naver.search_news` is `naver_search_news`. The description combines the English summary, the Korean description and the canonical ID.

**`tools/call`.** `params.name` is the MCP name and `params.arguments` an object (default `{}`). Success returns the provider JSON as one text item plus `structuredContent`. Tool failures are normal results with `isError: true` and one text item `<code>: <fixed sentence>`; provider response bodies, your arguments and secrets never appear in it. The codes are the [error codes](#error-codes) below (`invalid_input` includes the tool's input schema so the model can correct the call). An unknown tool name or a malformed `params` is a JSON-RPC `-32602` error.

**Usage.** Each `tools/call` is recorded like an HTTP execution, with the channel `mcp` instead of `http` (the `channel` field of [`GET /v1/admin/executions`](#admin-api)). `initialize`, `ping`, `tools/list`, notifications and rejected requests record nothing.

## Limits

- Request bodies above 4096 bytes are rejected (16 384 for `/mcp`). On the HTTP routes the Node server closes with an empty 413 while reading (on `/mcp` it answers a JSON-RPC `-32600` body); the shared handler counts streamed bytes and cancels reading as soon as the limit is exceeded, returning 413 `payload_too_large`.
- Provider calls time out after 10 seconds and do not follow redirects.
- No rate limiting or quotas are enforced yet. Provider 429 responses are passed through as 429.

## Error codes

| Status | Code | Cause |
| --- | --- | --- |
| 400 | `invalid_json` | Body is not valid JSON. |
| 400 | `invalid_input` | Missing or empty `query`, over 200 characters, or extra properties. |
| 401 | `unauthorized` | Missing or wrong bearer token. |
| 404 | `not_found` | Unknown route. |
| 404 | `unknown_tool` | Tool ID not in the catalog. |
| 413 | `payload_too_large` | Body over 4096 bytes. |
| 429 | `provider_error` | Provider returned 429. |
| 500 | `internal_error` | Unhandled failure in the Node adapter. |
| 403 | `provider_not_connected` | Workspace key whose workspace has no credentials for the tool's provider. |
| 500 | `credential_unavailable` | Stored credentials cannot be decrypted (missing or wrong encryption key). |
| 502 | `provider_error` | Provider returned any other non-2xx status. |
| 502 | `provider_unavailable` | Network error, timeout, or redirect from the provider. |
| 503 | `service_not_configured` | `GORI_API_KEY` is unset and no storage is configured. |
| 503 | `provider_not_configured` | Credentials for the tool's provider are unset. |
| 503 | `storage_unavailable` | `/ready` could not reach the store. |

Provider error bodies are never forwarded to clients. Error codes are stable identifiers; translate them in presentation layers rather than changing them.

## Admin API

Node deployments with storage can manage workspaces, API keys, provider credentials and history over HTTP, for the dashboard and for scripts. It is off unless `GORI_ADMIN_KEY` is set; with it unset (or without `GORI_STORAGE`) every `/v1/admin/*` path answers `404 {"error":"not_found"}`.

Authenticate with `Authorization: Bearer <GORI_ADMIN_KEY>`. This key is separate from the tool-call key: `GORI_API_KEY` and workspace keys do not work here, and the admin key does not work on `/v1/tools`. Missing or wrong tokens return `401 {"error":"unauthorized"}`. Responses are JSON with `Cache-Control: no-store`. Writes need `Content-Type: application/json` (415 otherwise) and valid JSON (400 `invalid_json`). There are no CORS headers: serve the dashboard from the same origin.

| Method and path | Body | Result |
| --- | --- | --- |
| `GET /v1/admin/me` |  | `{ kind, actor, role }` |
| `GET /v1/admin/providers` |  | `[{ id, fields }]`: providers and the secret fields each needs |
| `GET /v1/admin/workspaces?limit&cursor` |  | `{ items: [{ id, name, created_at }], next_cursor }` |
| `POST /v1/admin/workspaces` | `{ "name" }` | 201, the workspace |
| `GET /v1/admin/workspaces/{id}` |  | the workspace |
| `GET /v1/admin/workspaces/{id}/keys` |  | `[{ id, name, created_at, revoked_at }]` |
| `POST /v1/admin/workspaces/{id}/keys` | `{ "name" }` | 201, `{ id, name, created_at, token }`. The token appears only here. |
| `DELETE /v1/admin/workspaces/{id}/keys/{keyId}` |  | `{ id, revoked_at }`; repeating it succeeds |
| `GET /v1/admin/workspaces/{id}/credentials` |  | `[{ provider, key_id, updated_at }]`, never secrets |
| `PUT /v1/admin/workspaces/{id}/credentials/{provider}` | `{ "secrets": { … } }` | `{ provider, updated_at }` |
| `DELETE /v1/admin/workspaces/{id}/credentials/{provider}` |  | `{ provider }`; succeeds when nothing was stored |
| `POST /v1/admin/credentials/rotate` |  | `{ rotated, failed: [{ workspace_id, provider, key_id }] }`; 200 even when some rows cannot be decrypted |
| `GET /v1/admin/usage?workspace&since&until&by` |  | `[{ key, count, success, error, avg_duration_ms }]`; `by` is `day` (default), `tool`, `outcome` or `workspace` |
| `GET /v1/admin/executions?workspace&since&until&limit&cursor` |  | `{ items, next_cursor }`, newest first; each item has a `channel` (`http` or `mcp`) |
| `GET /v1/admin/audit?workspace&since&until&limit&cursor` |  | `{ items, next_cursor }`, newest first |

- `workspace` omitted means every workspace; `workspace=operator` selects operator rows.
- `since` and `until` accept `<n>d`, `<n>h`, a date (`2026-11-08`, UTC midnight) or a time with a zone (`2026-11-08T10:00:00Z`). `since` is inclusive and `until` exclusive.
- `limit` is 1–200 (default 50). Pass a response's `next_cursor` as `cursor` for the next page; it is opaque and stays valid as new rows arrive. A malformed cursor is `400 invalid_input`.
- A wrong method on a known path returns `405` with `Allow`.

Admin errors use `{ "error": code, "message": … }`; the message never includes secrets.

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `invalid_input` | A field, id, date, limit or cursor failed validation. |
| 403 | `forbidden` | Reserved for roles; not returned today. |
| 404 | `not_found` | Unknown workspace, key or path, or the admin API is off. |
| 409 | `credentials_not_configured` | The server has no `GORI_ENCRYPTION_KEYS`. |
| 500 | `credential_unavailable` | Stored credentials cannot be decrypted. |
| 500 | `internal_error` | Unexpected failure; no detail is returned. |

Example:

```sh
curl -X POST http://localhost:3000/v1/admin/workspaces \
  -H "Authorization: Bearer $GORI_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Acme"}'
```
