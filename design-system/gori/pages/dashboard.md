# Dashboard — Overrides

> Overrides `design-system/gori/MASTER.md`. Anything not listed here follows Master.
> Scope from `docs/architecture.md`: connections, tools, API keys, execution history; English
> first with Korean localization; served alongside the API on both Node/Docker and Cloudflare Workers.

## Layout

- **Shell:** fixed left sidebar (240px, `--color-primary`) + top bar (56px) + content.
  - Below 1024px, the sidebar collapses to an icon rail. Below 768px, it becomes an off-canvas drawer with a menu button.
- **Content width:** fluid, max 1440px, 24px gutters (16px on mobile).
- **Top bar:** workspace name (future multi-workspace switcher), locale switch (`EN / 한국어`),
  theme toggle, docs link.
- **Density:** 7/10. Tables use 14px text and 44px rows; forms keep 16px inputs.

## Navigation (sidebar order)

1. **Overview**: health of connections, executions in the last 24h, errors, quota usage
2. **Connections**: provider accounts per workspace (Naver, Kakao), status, last used
3. **Tools**: catalog grouped by provider; each tool shows its ID, schema, and "Try it"
4. **Executions**: history with filters (tool, status, time, API key)
5. **API keys**: create, label, scope, last used, revoke
6. **Provider credentials**: workspace-owned app credentials (see
   `docs/superpowers/specs/2026-11-08-provider-credentials-design.md`)
7. **Settings**

Every view has its own URL with filters in the query string, so links can be shared and Back works.

## Page patterns

| View | Pattern |
|------|---------|
| Overview | 4 stat tiles (label, value in mono, delta) + recent failures list. No decorative charts. |
| Connections | Card grid: provider logo, status badge, scopes, actions. Empty state: "Connect your first provider" + setup doc link. |
| Tools | Two-pane: list (search + provider filter) and detail (ID copyable, input schema table, example request in a code block, "Try it" form generated from the schema). |
| Executions | Data table: time, tool ID (mono), status badge, latency (mono, right-aligned), key label. A row opens a side sheet with redacted request and response. |
| API keys | Table + "Create key" dialog. Show the secret **once**, with copy button and an explicit "I've stored it" confirm. Afterwards show only the prefix (`gori_…a1b2`). |
| Provider credentials | Form per provider, with secret fields write-only (show "Set · updated 2d ago", never the value). Rotate and remove are behind a confirm dialog. |

## Tables

- Sticky header on `--color-card`. Hovered row uses `--color-muted`.
- Numbers and IDs: mono, tabular figures, right-aligned numbers.
- Pagination by cursor ("Load more" / next/prev), not numbered pages.
- Under 768px, rows become stacked cards that keep the same field order.

## States (required for every data view)

- **Loading:** skeleton rows matching final layout (no spinners over empty space, no layout shift).
- **Empty:** one sentence + primary action + doc link.
- **Error:** stable error code in mono + a translated message + retry. Never show raw provider
  error bodies (AGENTS.md rule); show the Gori error code instead.
- **Rate-limited / quota:** warning badge with reset time.

## Destructive actions

Revoking keys and removing credentials or connections: the confirm dialog names the object, says what
breaks ("Agents using this key will get `unauthorized`"), and requires typing the key label for
API keys. Danger buttons stay outlined, never filled.

## Localization

- Locale stored per user (cookie/localStorage); `Accept-Language` decides the first visit.
- Dates: locale-formatted absolute time in a tooltip, relative time in tables ("2분 전" / "2 min ago").
- Provider names keep their official forms (Naver/네이버, Kakao/카카오) per locale.
