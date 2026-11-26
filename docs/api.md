# HTTP API

The same handler serves the Node server and the Cloudflare Worker. Responses are JSON. Successful executions return `{ "data": ... }`; failures return `{ "error": "<code>" }`.

Connecting an AI agent? See [Connecting agents](agents.md) for the tool-calling pattern and the planned MCP server.

## Authentication

Every route except `/health` and the Node-only `/ready` requires `Authorization: Bearer <GORI_API_KEY>`. Two kinds of bearer token are accepted:

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

Returns `{ "tools": [...] }`. Each tool has `id`, `provider`, a Korean `description`, and a JSON Schema `inputSchema`. Current tools: `naver.search_news` and `kakao.search_places`, both taking `{ "query": string }` of 1 to 200 characters with no extra properties.

### `POST /v1/tools/{id}/execute`

Body: a JSON object matching the tool's `inputSchema`. Tool IDs match `[a-z_.]+`. Returns `200 { "data": <provider JSON> }` with the provider response unchanged.

```sh
curl http://localhost:3000/v1/tools/kakao.search_places/execute \
  -H "Authorization: Bearer $GORI_API_KEY" \
  -H 'Content-Type: application/json' -d '{"query":"성수 카페"}'
```

## Limits

- Request bodies above 4096 bytes are rejected. The Node server closes with an empty 413 while reading; the shared handler counts streamed bytes and cancels reading as soon as the limit is exceeded, returning 413 `payload_too_large`.
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
