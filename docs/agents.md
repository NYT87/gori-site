# Connecting agents

Gori is built for AI agents. Every provider action is a tool with a stable ID, a JSON Schema for its input, and a stable error code, so a model can discover what Gori offers, call it, and recover from mistakes without custom glue code. The same HTTP API also works for scripts and backends that have no agent at all.

There are two ways to connect an agent:

| Path | Status | Use when |
| --- | --- | --- |
| [Tool calling over HTTP](#tool-calling-over-http) | Available | You run your own agent loop with Claude, OpenAI, or any model that supports tool use. |
| [MCP server](#mcp-server) | Planned | Your agent or IDE speaks the Model Context Protocol (Claude Code, Cursor, MCP SDK clients). |

## How an agent uses Gori

1. **Discover.** `GET /v1/tools` returns every tool with its `id`, `provider`, `description`, and `inputSchema`.
2. **Offer.** Your agent passes those tools to the model as tool definitions.
3. **Call.** When the model picks a tool, your agent sends its arguments to `POST /v1/tools/{id}/execute`.
4. **Return.** Send Gori's response back to the model: the provider data on success, or `{"error": "<code>"}` on failure. Error codes are stable and documented in the [HTTP API](api.md#error-codes), so the model can tell a bad argument (`invalid_input`) from a missing credential (`provider_not_configured`) or a rate limit (`provider_error` with status 429).

Authenticate every request with `Authorization: Bearer <key>`. See [Configuration](configuration.md) for keys and provider credentials.

## Tool calling over HTTP

This example gives Claude every Gori tool and lets it answer a question with them. It uses the official Anthropic TypeScript SDK and its tool runner, which handles the call-and-return loop. Install it in your agent's project with `npm install @anthropic-ai/sdk`; Gori itself does not depend on it.

```js
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";

const GORI_URL = process.env.GORI_URL; // e.g. http://localhost:3000
const headers = {
  Authorization: `Bearer ${process.env.GORI_API_KEY}`,
  "Content-Type": "application/json",
};

// 1. Discover Gori's tools and turn each one into a Claude tool.
const { tools: catalog } = await (await fetch(`${GORI_URL}/v1/tools`, { headers })).json();

const tools = catalog.map((tool) =>
  betaTool({
    name: tool.id.replaceAll(".", "_"), // Claude tool names cannot contain dots
    description: `${tool.description} (Gori tool ${tool.id})`,
    inputSchema: tool.inputSchema,
    run: async (input) => {
      const response = await fetch(`${GORI_URL}/v1/tools/${tool.id}/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });
      // Provider data on success, {"error": "<code>"} otherwise. Both go back to the model.
      return JSON.stringify(await response.json());
    },
  }),
);

// 2. Let Claude decide which tools to call.
const client = new Anthropic(); // reads ANTHROPIC_API_KEY
const message = await client.beta.messages.toolRunner({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default", // retry on a fallback model if a request is declined
  tools,
  messages: [{ role: "user", content: "Find three cafés in Seongsu-dong." }],
});

if (message.stop_reason === "refusal") {
  console.error("The request was declined.");
} else {
  for (const block of message.content) {
    if (block.type === "text") console.log(block.text);
  }
}
```

Notes:

- **Tool names.** Gori IDs use dots (`kakao.search_places`); many model APIs only allow letters, digits, `_`, and `-` in tool names. Replace dots with underscores, as above, and keep the original ID for the execute URL. The planned MCP server uses the same convention.
- **Validation.** Gori validates every input against the tool's schema and answers `400 invalid_input` when it does not match. Returning that error to the model lets it fix its call.
- **Other models.** The pattern is the same for any model with tool use: map `inputSchema` to the model's parameter schema field and forward the arguments to the execute route.

## Plain API

Agents are the main audience, but nothing in Gori requires one. Any HTTP client can list tools and execute them:

```sh
curl http://localhost:3000/v1/tools/kakao.search_places/execute \
  -H "Authorization: Bearer $GORI_API_KEY" \
  -H 'Content-Type: application/json' -d '{"query":"성수 카페"}'
```

See the [HTTP API](api.md) for every route, limit, and error code.

## MCP server

**Status: planned.** The MCP endpoint described here is designed but not yet available; Gori does not serve `/mcp` today. Use [tool calling over HTTP](#tool-calling-over-http) until it ships.

The planned server:

- Runs at `https://<your-gori>/mcp` on both the Docker and Cloudflare Workers deployments.
- Uses the Streamable HTTP transport, stateless, with the same `Authorization: Bearer <key>` as the HTTP API.
- Lists every catalog tool with underscore names (`naver_search_news`, `kakao_search_places`), an English summary, and the original input schema.
- Returns provider data as structured content, and Gori error codes as tool errors the model can read and act on.
- Records MCP calls in usage history alongside HTTP executions.

Planned client setup (preview, not working yet):

```sh
# Claude Code
claude mcp add --transport http gori https://<your-gori>/mcp \
  --header "Authorization: Bearer <key>"
```

```json
{
  "mcpServers": {
    "gori": {
      "url": "https://<your-gori>/mcp",
      "headers": { "Authorization": "Bearer <key>" }
    }
  }
}
```

The second snippet is the shape Cursor uses in `mcp.json`. This page will be updated when the MCP server is released.
