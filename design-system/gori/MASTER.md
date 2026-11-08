# Gori Design System — Master

> **How to use:** When building a page, read `design-system/gori/pages/<page>.md` first.
> Its rules override this file; everything it does not mention follows this file.
> Pages: [`dashboard.md`](pages/dashboard.md), [`landing.md`](pages/landing.md).

**Project:** Gori (고리) — Korean-service integration platform for developers and AI agents
**Surfaces:** marketing landing page, operator/developer dashboard (`apps/dashboard`, planned)
**Locales:** English (default), Korean
**Stack:** not chosen. Tokens below are plain CSS custom properties so any stack can consume them.
**Source:** generated with ui-ux-pro-max (category *API Developer Portal*, style *Minimalism & Swiss*,
density 7/10), then corrected by hand. Hand decisions are marked **(decision)**.

---

## 1. Principles

1. **Developer tool, not a brochure.** Show real tool IDs, requests, and responses. Precision beats decoration.
2. **One accent.** Green means "connected / go / primary action". Nothing else is green.
3. **Language-independent core.** Tool IDs (`naver.search_news`), error codes, and API routes are
   never translated. They are always set in monospace.
4. **Both themes are first-class.** Dark is the default for the landing page; the dashboard follows
   the OS preference and offers a toggle.

---

## 2. Color tokens

All text pairs below were checked against WCAG 2.2 (ratios listed). Decorative borders are exempt from
3:1. Use `--color-input-border` for anything whose boundary the user must see: inputs, checkboxes,
and focusable containers.

### Dark (default)

| Token | Hex | Use | Contrast |
|-------|-----|-----|----------|
| `--color-background` | `#020617` | Page | — |
| `--color-foreground` | `#F8FAFC` | Body text | 19.3 on bg |
| `--color-card` | `#0E1223` | Cards, panels, table header | — |
| `--color-muted` | `#1A1E2F` | Hover rows, code blocks, chips | — |
| `--color-muted-foreground` | `#94A3B8` | Secondary text | 7.9 bg · 7.3 card · 6.5 muted |
| `--color-primary` | `#0F172A` | Nav/sidebar surface | — |
| `--color-secondary` | `#1E293B` | Secondary buttons, selected nav | — |
| `--color-border` | `#334155` | Dividers (decorative) | 1.95 |
| `--color-input-border` | `#64748B` | Inputs, focusable outlines **(decision)** | 4.2 |
| `--color-accent` | `#22C55E` | Primary CTA fill, success, "connected" | 8.9 as text on bg |
| `--color-on-accent` | `#0F172A` | Text on accent | 7.8 |
| `--color-accent-text` | `#22C55E` | Accent used as text/links | 8.9 |
| `--color-destructive` | `#F87171` | Errors, revoke **(decision: lighter than generated `#EF4444` for small text)** | 7.3 |
| `--color-warning` | `#F59E0B` | Expiring credentials, rate-limit near | 9.4 |
| `--color-ring` | `#F8FAFC` | Focus ring | 19.3 |

### Light **(decision: derived from the same slate/green scales)**

| Token | Hex | Contrast |
|-------|-----|----------|
| `--color-background` | `#FFFFFF` | — |
| `--color-foreground` | `#0F172A` | 17.9 |
| `--color-card` | `#F8FAFC` | — |
| `--color-muted` | `#F1F5F9` | — |
| `--color-muted-foreground` | `#475569` | 7.6 bg · 6.9 muted |
| `--color-primary` | `#F8FAFC` | — |
| `--color-secondary` | `#E2E8F0` | — |
| `--color-border` | `#E2E8F0` | decorative |
| `--color-input-border` | `#64748B` | 4.8 |
| `--color-accent` | `#22C55E` | fill only; never as text on white (2.3) |
| `--color-on-accent` | `#0F172A` | 7.8 |
| `--color-accent-text` | `#15803D` | 5.0 |
| `--color-destructive` | `#DC2626` | 4.8 |
| `--color-warning` | `#B45309` | 5.0 |
| `--color-ring` | `#0F172A` | 17.9 |

### Theme wiring

```css
:root { color-scheme: dark; /* dark tokens */ }
:root[data-theme="light"] { color-scheme: light; /* light tokens */ }
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) { /* light tokens */ }
}
```

Status is never conveyed by color alone: pair every status color with an icon and a text label.

---

## 3. Typography

| Role | Family | Notes |
|------|--------|-------|
| UI / body / headings | **IBM Plex Sans** | 400 body, 500 labels, 600 headings |
| Korean | **IBM Plex Sans KR** | Same design family, so metrics match Plex Sans **(decision: not in the skill's font DB; its Korean entries are serif or display only)** |
| Code, tool IDs, keys, numbers | **JetBrains Mono** | 400/500. Also short uppercase "eyebrow" labels on the landing page |

**(decision)** The generator proposed JetBrains Mono for all headings. That fails in Korean: Hangul
would fall back to another face mid-heading. Headings use Plex Sans, and mono is reserved for literal
technical content, which is never translated anyway.

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

--font-sans: "IBM Plex Sans", "IBM Plex Sans KR", system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
:lang(ko) { --font-sans: "IBM Plex Sans KR", "IBM Plex Sans", system-ui, sans-serif; }
```

Self-hosted deployments may serve the fonts from the app instead of Google Fonts. Both approaches are fine,
as long as the fallbacks above stay in place.

### Scale (1.25, base 16px)

| Token | Size / line-height | Use |
|-------|-------------------|-----|
| `--text-xs` | 12 / 16 | Badges and table meta only; never body |
| `--text-sm` | 14 / 20 | Dashboard tables, helper text |
| `--text-base` | 16 / 24 | Body |
| `--text-lg` | 20 / 28 | Card titles |
| `--text-xl` | 25 / 32 | Page titles (dashboard) |
| `--text-2xl` | 31 / 38 | Section headings (landing) |
| `--text-3xl` | 39 / 46 | Hero (mobile) |
| `--text-4xl` | 49 / 56 | Hero (≥1024px) |

### Korean text rules

- `word-break: keep-all; overflow-wrap: anywhere;` on Korean content, so lines break between words, not inside them.
- Korean body line-height: 1.6–1.7 (vs 1.5 EN).
- Never letter-space Hangul. Uppercase/tracking styles apply to Latin only.
- Set `<html lang>` per locale. Labels must tolerate ±40% length difference, so no fixed-width buttons.

---

## 4. Spacing, radius, elevation

| Token | Value | | Token | Value |
|-------|-------|-|-------|-------|
| `--space-xs` | 4px | | `--radius-sm` | 6px (chips, inputs) |
| `--space-sm` | 8px | | `--radius-md` | 8px (buttons) |
| `--space-md` | 16px | | `--radius-lg` | 12px (cards) |
| `--space-lg` | 24px | | `--radius-xl` | 16px (modals) |
| `--space-xl` | 32px | | | |
| `--space-2xl` | 48px | | | |
| `--space-3xl` | 64px | | | |

Swiss style: separate surfaces with borders and tonal steps (`background → card → muted`) rather than
shadows. In the dark theme, shadows are only used for overlays (menus, modals):
`--shadow-overlay: 0 12px 32px rgb(0 0 0 / 0.45)`. In light, `0 12px 32px rgb(15 23 42 / 0.12)`.

---

## 5. Components

```css
.btn { min-height: 44px; padding: 0 var(--space-lg); border-radius: var(--radius-md);
  font: 600 var(--text-base)/1 var(--font-sans); cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease; }
.btn-primary   { background: var(--color-accent); color: var(--color-on-accent); }
.btn-primary:hover { background: #16A34A; }
.btn-secondary { background: var(--color-secondary); color: var(--color-foreground);
  border: 1px solid var(--color-input-border); }
.btn-ghost     { background: transparent; color: var(--color-foreground); }
.btn-danger    { background: transparent; color: var(--color-destructive);
  border: 1px solid currentColor; }
.btn:focus-visible { outline: 2px solid var(--color-ring); outline-offset: 2px; }
.btn[disabled], .btn[aria-busy="true"] { opacity: .55; cursor: not-allowed; }

.card { background: var(--color-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-lg); }
/* Clickable cards: change the border color on hover. No transform, so no layout shift. */
.card-link:hover { border-color: var(--color-input-border); }

.input { min-height: 44px; padding: 0 var(--space-md); font-size: 16px;
  background: var(--color-background); color: var(--color-foreground);
  border: 1px solid var(--color-input-border); border-radius: var(--radius-sm); }
.input:focus-visible { outline: 2px solid var(--color-ring); outline-offset: 1px; }
.input[aria-invalid="true"] { border-color: var(--color-destructive); }

.code { font-family: var(--font-mono); font-size: 0.875em;
  background: var(--color-muted); border-radius: var(--radius-sm); padding: 2px 6px; }

.modal-overlay { background: rgb(2 6 23 / 0.7); }
.modal { background: var(--color-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-xl); padding: var(--space-xl);
  box-shadow: var(--shadow-overlay); width: min(500px, calc(100% - 32px)); }
```

**Status badge**: icon + label + tone. Tones: `connected` (accent), `error` (destructive),
`expiring` (warning), `disabled` (muted-foreground). Text in the matching `*-text` token on
`--color-muted`.

**Copyable value** (API keys, tool IDs, curl): mono text + icon button with `aria-label="Copy"`.
After copying, the icon changes to a check for 2s and a polite live region announces "Copied".

**Icons:** Lucide only, 16px in tables and 20px in nav, `stroke-width: 1.75`. Decorative icons get
`aria-hidden="true"`; icon-only buttons need an `aria-label`. No emoji. Provider logos (Naver, Kakao)
are used only as provider identifiers, following each provider's brand guidelines.

---

## 6. Motion

- Micro-interactions 150ms; menus and popovers 200ms in and 150ms out; modals 250ms.
- Animate only `opacity`, `transform` (on overlays), and colors.
- `@media (prefers-reduced-motion: reduce)`: remove transforms and keep opacity fades ≤100ms.

---

## 7. Anti-patterns

- ❌ Buried endpoints. Every tool page shows its ID and an example request above the fold.
- ❌ Missing rate-limit / quota state. Show it wherever execution can fail because of it.
- ❌ Translating tool IDs, error codes, or API routes.
- ❌ Showing a full secret after creation, or logging one to the console.
- ❌ Green for anything but success or primary action. A second accent color.
- ❌ Emoji icons, invisible focus, hover-only affordances, `transition: all`, transforms on hover.
- ❌ Text under 12px, or status shown by color alone.

---

## 8. Pre-delivery checklist

- [ ] Both themes checked; text ≥4.5:1, input boundaries and focus ≥3:1
- [ ] Both locales checked at 375 / 768 / 1024 / 1440px; no overflow or clipped Korean labels
- [ ] Keyboard: every action reachable, visible focus, logical order, Esc closes overlays
- [ ] Targets ≥44×44px; `cursor: pointer` on clickable elements
- [ ] Loading, empty, and error states exist for every data view
- [ ] `prefers-reduced-motion` respected
- [ ] No horizontal scroll on mobile; nothing hidden behind sticky headers
