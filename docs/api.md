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

Returns `{ "tools": [...] }`. Each tool has `id`, `provider`, an English `title` and `summary`, a Korean `description`, and a JSON Schema `inputSchema`. Current tools: `naver.search_news` and `kakao.search_places`, both taking `{ "query": string }` of 1 to 200 characters with no extra properties, and the read-only Gmail tools `gmail.search_messages` (`{ query, max_results 1–25, connection? }`) and `gmail.get_message` (`{ id, connection? }`), which run against a workspace's [OAuth connection](#oauth-connections). The catalog is the same for every caller; whether a tool can run for a workspace is decided when it is called.

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

## Monthly quota

On Node deployments with storage, a workspace can have a monthly allowance of successful tool calls, counted per UTC calendar month and shared by the HTTP API and MCP. The limit is the workspace's own value, else the operator default `GORI_DEFAULT_MONTHLY_CALLS`, else none. The operator key and the admin API are never limited, and the Worker has no quota.

- One call counts when it succeeds (status 200). Failed calls (invalid input, missing credentials, provider errors) do not use up allowance.
- Over the limit, the call is refused before any provider is contacted: `429 { "error": "quota_exceeded" }` with `Retry-After` (seconds until the next UTC month). This is Gori's own limit; a provider's 429 is `provider_error`. Over MCP it is a tool error: `quota_exceeded: this workspace has used its monthly allowance of <n> calls; it resets on <date>.`
- Responses for a limited workspace key carry `X-Gori-Quota-Limit`, `X-Gori-Quota-Remaining` and `X-Gori-Quota-Reset` (ISO 8601 UTC). They are absent when no limit applies.
- A limit of `0` refuses every call. Calls made before a limit was set are not counted. Refused calls are recorded like any execution, with the error code `quota_exceeded`.

## OAuth connections

On Node deployments with storage, a workspace can connect accounts through OAuth (Google first) and let agents use them without handling tokens. An admin configures the provider's OAuth app once in the dashboard (see [Operations](operations.md#oauth-connections)); a workspace then connects one or more accounts, and a tool that needs an account takes an optional `connection` input.

- **Tools that need a connection** (`gmail.search_messages`, `gmail.get_message`, read-only) accept `connection`: the label or id of one of the workspace's connections. Omit it when the workspace has exactly one connection for the provider. With several and none named the call fails with `409 connection_required`, listing the available labels: `{ "error": "connection_required", "connections": ["home", "work"] }`. The operator key has no connections and gets `403 provider_not_connected`.
- `GET /v1/connections` (workspace key) returns `{ "connections": [{ id, provider, label, account_ref, status, scopes }] }`, never tokens. Over MCP the tool `list_connections` returns the same list. `status` is `active` or `needs_reauth`.
- `POST /v1/connections/start` (workspace key) with `{ "provider": "google", "label": "work" }` (`label` optional) returns `{ "authorize_url": "https://…" }`. A person opens that URL, approves access at the provider, and is returned to Gori; the connection then exists. The URL is a bearer capability for 10 minutes: whoever approves with it connects their own account to this workspace, so hand it only to the person who should connect, and do not post it in shared places. The label defaults to the account's email. Connecting an account that is already connected refreshes its tokens and scopes and keeps its label.
- `GET /v1/oauth/callback` is where the provider sends the browser. It needs no key: a one-use `state` (random, valid for 10 minutes, bound to the workspace and PKCE) is the only authority. What it answers depends on who started the flow. A flow started with a workspace key (the URL is usually handed to a person who has no dashboard session) gets a small self-contained HTML page with a fixed message (`connected`, `reconnected`, `denied` or `failed`, in English and Korean) and nothing from the request. A flow started from the dashboard (the admin route) gets `302` to the dashboard's connections page with `oauth=<result>`. A replayed, expired or unknown state is `400 { "error": "invalid_state" }`. It requires `GORI_PUBLIC_URL`.
- Renaming and disconnecting are admin actions (see the admin API); a workspace key cannot remove an account.
- Access tokens refresh automatically shortly before they expire. If the provider revokes the grant, the connection becomes `needs_reauth` and calls fail with `409 connection_expired` until someone connects the account again.
- Quota: calls refused for a missing, unknown, expired or under-scoped connection do not use allowance; a successful call counts once, like any other.

## Limits

- Request bodies above 4096 bytes are rejected (16 384 for `/mcp`). On the HTTP routes the Node server closes with an empty 413 while reading (on `/mcp` it answers a JSON-RPC `-32600` body); the shared handler counts streamed bytes and cancels reading as soon as the limit is exceeded, returning 413 `payload_too_large`.
- Provider calls time out after 10 seconds and do not follow redirects.
- The only Gori-side limit is the optional [monthly quota](#monthly-quota); there is no burst rate limit. Provider 429 responses are passed through as `provider_error` with status 429.

## Error codes

| Status | Code | Cause |
| --- | --- | --- |
| 400 | `invalid_json` | Body is not valid JSON. |
| 400 | `invalid_input` | Missing or empty `query`, over 200 characters, or extra properties. |
| 401 | `unauthorized` | Missing or wrong bearer token. |
| 404 | `not_found` | Unknown route. |
| 404 | `unknown_tool` | Tool ID not in the catalog. |
| 400 | `invalid_state` | OAuth callback with a replayed, expired or unknown state. |
| 404 | `connection_not_found` | The named `connection` is not one of this workspace's connections. |
| 409 | `connection_required` | The tool needs an OAuth connection and none was named (with several) or none exists; the body lists the labels. |
| 409 | `connection_expired` | The connection's access was revoked or expired; connect the account again. |
| 409 | `connection_scope_missing` | The connection was not granted the permission the tool needs. |
| 409 | `provider_disabled` | The provider's OAuth app is not configured or not enabled on this deployment. |
| 409 | `oauth_not_configured` | `GORI_PUBLIC_URL` is not set, so OAuth flows are unavailable. |
| 413 | `payload_too_large` | Body over 4096 bytes. |
| 429 | `quota_exceeded` | The workspace has used its monthly call allowance (Gori's own limit, not the provider's). |
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
| `GET /v1/admin/workspaces/{id}` |  | the workspace with its `quota`: `{ limit, source, period, used, remaining, resets_at }` (`limit` is null without a limit; `source` is `workspace`, `default` or null) |
| `PUT /v1/admin/workspaces/{id}/quota` | `{ "monthly_call_limit": 100 }` | the new `quota`. An integer from 0 to 2 147 483 647 sets the workspace limit; `null` follows the operator default. Audited as `quota.set`. |
| `GET /v1/admin/workspaces/{id}/keys` |  | `[{ id, name, created_at, revoked_at }]` |
| `POST /v1/admin/workspaces/{id}/keys` | `{ "name" }` | 201, `{ id, name, created_at, token }`. The token appears only here. |
| `DELETE /v1/admin/workspaces/{id}/keys/{keyId}` |  | `{ id, revoked_at }`; repeating it succeeds |
| `GET /v1/admin/workspaces/{id}/credentials` |  | `[{ provider, key_id, updated_at }]`, never secrets |
| `PUT /v1/admin/workspaces/{id}/credentials/{provider}` | `{ "secrets": { … } }` | `{ provider, updated_at }` |
| `DELETE /v1/admin/workspaces/{id}/credentials/{provider}` |  | `{ provider }`; succeeds when nothing was stored |
| `POST /v1/admin/credentials/rotate` |  | `{ rotated, failed: [{ kind, workspace_id, provider, key_id }] }` (`kind` is `credential`, `oauth_provider` or `connection`; `workspace_id` is null for provider apps); rotates credentials, OAuth provider apps and connections; 200 even when some rows cannot be decrypted |
| `GET /v1/admin/oauth/providers` |  | `[{ id, title, configured, enabled, client_id, scopes, allowed_scopes, redirect_uri }]` for every built-in provider, never the secret. `redirect_uri` is what to register with the provider (null without `GORI_PUBLIC_URL`). |
| `PUT /v1/admin/oauth/providers/{provider}` | `{ "client_id", "client_secret"?, "scopes"?, "enabled"? }` | the provider as listed. `client_secret` is required the first time and write-only (omitted keeps the stored one); `scopes` must be allowed for the provider (`openid` and `email` are always added). Audited as `oauth_provider.set` without the secret. |
| `DELETE /v1/admin/oauth/providers/{provider}` |  | `{ provider }`; existing connections stop working until the app is configured again |
| `GET /v1/admin/workspaces/{id}/connections` |  | `[{ id, provider, label, account_ref, status, scopes, last_error_code, created_at }]` |
| `POST /v1/admin/workspaces/{id}/connections/start` | `{ "provider", "label"? }` | `{ authorize_url }`, as for a workspace key |
| `PATCH /v1/admin/workspaces/{id}/connections/{connectionId}` | `{ "label" }` | `{ id, label }`; audited as `connection.rename` |
| `DELETE /v1/admin/workspaces/{id}/connections/{connectionId}` |  | `{ id }`; revokes the grant at the provider (best effort), then deletes; audited as `connection.delete` |
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
| 409 | `provider_disabled` | The provider's OAuth app is not configured or not enabled. |
| 409 | `oauth_not_configured` | `GORI_PUBLIC_URL` is not set. |
| 409 | `label_taken` | Another connection of that provider in the workspace already has the label. |
| 500 | `credential_unavailable` | Stored credentials cannot be decrypted. |
| 500 | `internal_error` | Unexpected failure; no detail is returned. |

Example:

```sh
curl -X POST http://localhost:3000/v1/admin/workspaces \
  -H "Authorization: Bearer $GORI_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Acme"}'
```
