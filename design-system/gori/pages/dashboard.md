# Dashboard — Overrides

> Overrides `design-system/gori/MASTER.md`. Anything not listed here follows Master, except where the public
> site note at the top of Master applies: the dashboard uses the nyt87 accent (orange, white text) with the
> Gori theme (`@nyt87/tokens/themes/gori.css`); green is only for success states.
> Built in `apps/dashboard`.

## Scope (v1: the operator, via the admin API)

Overview · Workspaces (API keys, Credentials) · Executions · Audit log. Not in v1, because the admin API has
no data for them: a tools catalog with "Try it", quotas, connection health, OAuth connections, and request or
response bodies. The dashboard is served on the same origin as the API at `/dashboard/`, only when the admin
API is enabled.

## Layout

- **Shell:** the nyt87 app shell (`ds-app`): sidebar, 56px-class top bar with the page title, language switch
  (`EN` / `한국어`), theme toggle and sign out. Below 860px the sidebar becomes a drawer (menu button).
- **Navigation:** Overview, Workspaces, Executions, Audit log. Every view has its own URL with filters in the
  query string (`#/executions?workspace=…&since=7d`), so links can be shared and Back works.
- **Tables:** 14px text, tabular numbers right-aligned, ids and tool names in monospace. Cursor "Load more",
  not numbered pages. Under 768px rows become stacked cards with the same field order.

## Page patterns

| View | Pattern |
|------|---------|
| Sign in | One card: admin key (password field, cleared after every attempt), error line. The key is kept only in `sessionStorage`. |
| Overview | 4 stat tiles (executions, errors with rate, average latency, workspaces) for the last 7 days, usage by day and by tool as tables, recent failures list. No charts. |
| Workspaces | Table with a "Create workspace" dialog; a row opens the detail with two tabs. |
| API keys | Table + "Create key" dialog. The token is shown once in a dialog that cannot be dismissed until "I've stored it" is pressed (no Esc, no backdrop close, no copy of it left in the DOM afterwards). Revoking asks to type the key name (the first 8 characters of the id if names collide) and says what breaks. |
| Credentials | One card per provider; write-only password fields cleared on submit, status "Set · updated 2d ago" or "Not set", removal behind a confirm dialog. Values are never shown again. |
| Executions | Table (time, tool, outcome, status, duration, key); workspace and time range filter on the server, tool and outcome filter only the loaded rows (and the page says so). A row opens a side sheet with the recorded fields only. |
| Audit log | Table (time, actor, action, target, details); a row opens a side sheet with the full details. |

## States (required for every data view)

- **Loading:** skeleton rows (no spinners over empty space).
- **Empty:** one sentence, plus the next action where there is one.
- **Error:** the stable error code in monospace, a translated message and Retry. Never raw server text.
- **Unauthorized:** any 401 returns to sign-in with a message.

## Destructive actions

Danger buttons stay outlined, never filled. Dialogs name the object and say what breaks ("Agents using this key
will immediately get unauthorized errors").

## Localization

English by default, Korean supported; the choice is stored in the browser (`gori-lang`); the first visit follows
the browser language. Dates and numbers use `Intl`; relative times in tables, absolute time in a tooltip.
Provider names keep their official forms (Naver/네이버, Kakao/카카오). Tool ids, error codes, ids and API field
names are never translated.
