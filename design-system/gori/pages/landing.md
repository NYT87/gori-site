# Landing Page — Overrides

> Overrides `design-system/gori/MASTER.md`. Anything not listed here follows Master.
> Pattern: **Hero + Features + CTA** (ui-ux-pro-max landing DB, `hero-features-cta`), adapted for
> an open-source, self-hosted developer product, plus a pricing section and FAQ borrowed from
> `pricing-focused-landing`. No invented prices: Gori Cloud is future work.

## Theme

Dark by default, with a light toggle. Max content width 1200px, 12-column grid, 64px vertical section
padding (48px on mobile).

## Section order

1. **Nav**: wordmark `Gori 고리`, Docs, GitHub (star count optional), locale switch, theme toggle.
   Sticky, 64px tall; the content below has matching scroll-padding.
2. **Hero**: left: eyebrow in mono (`OPEN SOURCE · AGPL-3.0`), headline *"Korean services.
   Connected to your agents."*, one-line subhead, two CTAs: **primary** "Self-host Gori" (→ deploy
   docs) and **secondary** "View on GitHub". Right: a real terminal/code card showing a
   `naver.search_news` call and its JSON response. The code is the hero image.
3. **The name**: short brand moment. 고리 = ring / link, plus the line "AI 에이전트를 현실 세계와 잇는
   고리." Typography only, no illustration needed.
4. **How it works**: 3 steps in a row (stacked on mobile): *Deploy* (Docker or Cloudflare) →
   *Add provider credentials* → *Call tools from your agent*. Each step has a short code snippet.
5. **Features (4)**: Gori Core / Vault / Hub plus "Runs on your infrastructure". Each card says honestly
   whether the feature is *Available* or *Planned*, matching the README status table. Don't oversell.
6. **Providers**: Naver and Kakao tiles with the tool IDs they expose; a "More coming" tile links to
   the roadmap or issues.
7. **Pricing** (`#pricing`, also in nav): three cards of equal height.
   - **Self-hosted**: *Free*, AGPL-3.0-only, status *Available*, highlighted with an accent border.
     CTA "Self-host Gori".
   - **Gori Cloud**: status *Coming soon*, price "TBA / pricing not set". Planned features use a
     clock icon in muted color, not checkmarks. Inline waitlist form: email field with a visible
     label, inline validation, and a polite live-region result.
   - **Support**: *Custom, for teams*. The contact email is shown as selectable text with a copy
     button (no `mailto:` reliance).
   - Note under the cards: provider fees (Naver, Kakao) are billed by each provider, not by Gori.
   - Don't show annual/monthly toggles, "most popular" badges, or prices until they are decided.
8. **FAQ**: 4 `<details>` items: is self-hosting free, what AGPL means for a company
   (unmodified use vs network-served modifications; "ask your counsel"), when Cloud launches
   (no date), whether a Gori account is needed (no).
9. **Deploy CTA**: two copyable command blocks side by side (Docker Compose with `/ready` check;
   Cloudflare `wrangler secret put` + `wrangler deploy`), plus the deploy-guide CTA.
10. **Footer**: GitHub, docs, pricing, license (AGPL-3.0-only).

Implemented in `apps/site` (`src/pages/index.html`), published at https://nyt87.github.io/gori/. The
dedicated pricing page (`src/pages/pricing.html`) adds a plan comparison table and the pricing FAQ;
both pages render the same cards from `pricingCards()` in `src/render.js`. On the public site the
Cloud card links to Watch on GitHub and email instead of a waitlist form, since GitHub Pages cannot store sign-ups.

## Visual rules

- Hero headline `--text-4xl` (`--text-3xl` under 1024px), weight 600, max 14ch per line in EN.
  For KO, allow a wider measure and keep `word-break: keep-all`.
- Background: flat `--color-background`. One optional subtle detail: a faint 1px grid
  (`--color-border` at 40% opacity) behind the hero, masked to fade out. No gradients or blobs.
- Code cards: `--color-card`, mono 14px, syntax colors limited to accent-text (strings),
  muted-foreground (punctuation/comments), and foreground (keys).
- CTA contrast: on-accent on accent is 7.8:1.

## Motion

Hero code card types out its response once on load (≤1.2s). Under `prefers-reduced-motion`, render the
final state immediately. Sections fade in on scroll (opacity only, 200ms). No parallax.

## Localization

Every section has KO copy written natively, not machine-translated literally. The tagline pair in
the README (EN + KO) is the reference voice. Tool IDs and commands stay identical in both locales.

## SEO / meta

`<html lang>` switched client-side (one URL per page, no `/ko/` routes yet), OG image
`docs/assets/banners/og-image.png` (1200×630, geometric direction), and the title
"Gori — Korean services, connected to your agents".
