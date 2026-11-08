# Gori Brand Guidelines v0.1

> Last updated: 2026-11-08
> Status: Draft. The wordmark is defined; the ring mark is not yet drawn.
> Visual tokens live in [`design-system/gori/MASTER.md`](../design-system/gori/MASTER.md). This
> document covers identity, voice, and messaging, and repeats only the brand-level colors.

## Quick Reference

| Element | Value |
|---------|-------|
| Name | Gori · 고리 (*go-ree*: a ring, a link) |
| Developed by | NYT87 · [nyt87.github.io](https://nyt87.github.io) |
| Contact | nyt87@proton.me |
| Tagline (EN) | Korean services. Connected to your agents. |
| Tagline (KO) | AI 에이전트를 현실 세계와 잇는 고리. |
| Descriptor | The integration loop for autonomous agents. |
| Primary Color | Slate Night `#020617` |
| Secondary Color | Slate `#1E293B` |
| Accent Color | Link Green `#22C55E` |
| Primary Font | IBM Plex Sans / IBM Plex Sans KR |
| Mono Font | JetBrains Mono |
| Voice | Precise, honest, builder-to-builder, bilingual |

---

## 1. Brand concept

**고리** is an everyday Korean word for a ring or a link: a small piece that joins things into
something larger. Gori is that piece between an agent's decision and a real Korean service:
finding a place through Kakao, searching news through Naver, and eventually the tools Korean businesses
use every day. Each integration adds another link.

Three ideas carry the brand:

1. **The link**: small, sturdy, unglamorous parts that make bigger things work.
2. **The loop**: agents observe, act, and loop again. Gori is where the loop touches the world.
3. **Your infrastructure**: open source (AGPL-3.0-only) and self-hosted first, on Cloudflare or Docker.

## 2. Positioning

**For** developers and teams building AI agents and applications that need Korean services,
**Gori is** an open-source integration platform **that** turns Naver, Kakao, and other Korean APIs
into one tool catalog with a single execution API, **unlike** global integration platforms where
Korean services are missing or an afterthought. **It runs** on infrastructure you control.

### Message architecture

| Level | Message |
|-------|---------|
| Primary | Korean services, connected to your agents. |
| Support 1 | **One catalog.** Every provider action is a tool with a stable ID (`kakao.search_places`), schema, and errors. |
| Support 2 | **Your infrastructure.** Deploy to your own Cloudflare account or Docker host. No Gori cloud account required. |
| Support 3 | **Built for Korea.** Real Korean providers, Korean documentation, provider quirks handled. |
| Support 4 | **Open source.** AGPL-3.0-only. Read it, run it, change it. |

### Elevator pitches

- **5 s:** Korean services for your AI agents, self-hosted.
- **30 s:** Gori gives agents and apps one API for Korean services like Naver and Kakao. Every action
  is a typed tool with a stable ID. You deploy it on your own Cloudflare or Docker setup, and it's
  open source.

### By audience

| Audience | Cares about | Lead with |
|----------|-------------|-----------|
| Agent builders | Tools that just work in their agent loop | Tool IDs, schemas, the example call |
| Self-hosters / platform teams | Control, data residency, cost | Docker + Workers, no external account, AGPL |
| Global devs new to Korea | Getting past provider setup | English-first docs, setup guides per provider |
| Korean developers | Native quality, not a translation | Korean docs written natively, local providers first |

## 3. Voice and tone

### Brand Personality

| Trait | We are | We are not |
|-------|--------|------------|
| **Precise** | Exact names, real commands, real IDs | Vague ("powerful integrations") |
| **Honest** | Clear about what is shipped vs planned | Overselling a roadmap as a product |
| **Builder-to-builder** | Plain and direct, like a good README | Corporate, salesy, cute |
| **Bilingual by design** | Natural in both English and Korean | Machine-translated or English-only |
| **Calm** | Steady, confident, short | Hype, exclamation marks, urgency |

### Tone by context

| Context | Tone | Example (EN) | Example (KO) |
|---------|------|--------------|--------------|
| Landing | Confident, concrete | "Search Naver news from your agent in one call." | "에이전트에서 한 번의 호출로 네이버 뉴스를 검색하세요." |
| Docs | Instructional, imperative | "Set `KAKAO_REST_API_KEY` and restart the server." | "`KAKAO_REST_API_KEY`를 설정하고 서버를 다시 시작하세요." |
| Errors | Calm, actionable, stable code | "Naver credentials are missing (`provider_not_configured`). Add them in Provider credentials." | "네이버 인증 정보가 없습니다 (`provider_not_configured`). 제공자 인증 정보에서 추가하세요." |
| Success | Brief | "Key created. Copy it now. It won't be shown again." | "키가 생성되었습니다. 지금 복사하세요. 다시 표시되지 않습니다." |
| Status / roadmap | Factual | "Planned: OAuth connections." | "예정: OAuth 연결." |

### Writing rules

- **Show, then tell.** Lead with a command, tool ID, or example response where possible.
- **Say "planned" when it's planned.** Product claims must match the README status table.
- **Literal identifiers are sacred.** Tool IDs, error codes, routes, and env vars are never translated
  and are always in code formatting.
- **Korean copy is written, not translated.** Use 합니다/하세요 style (polite formal) in UI and docs.
  Keep official provider names (네이버, 카카오) and avoid unnatural loanwords when a common Korean term exists.
- **Name provider credentials precisely.** For example, "NAVER API HUB application credentials", not "Naver keys".
- Sentence case for headings and buttons. No exclamation marks in product UI.
- **Don't misuse the comparison.** Composio may be named factually as a comparison point in docs. Never use it in marketing claims or to disparage.

### Prohibited Terms

| Avoid |
|-------|
| Seamless |
| Effortless |
| Magic |
| Revolutionary |
| Game-changing |
| Best-in-class |
| Enterprise-grade |
| Leverage |
| Synergy |
| Unlock |
| AI-powered |
| Supports all Korean services |

### Instead

- Seamless, effortless, magic: say what actually happens.
- Revolutionary, game-changing, best-in-class: unverifiable, so drop them.
- Enterprise-grade: not a claim we can back yet.
- Leverage, synergy, unlock: write "use", "connect", or "enable".
- AI-powered: Gori connects AI; it isn't the AI.
- Supports all Korean services: name the providers that exist.

## 4. Logo

### Wordmark (defined)

`Gori` in IBM Plex Sans SemiBold, followed by `고리` in IBM Plex Sans KR Regular at the same cap height,
separated by one space and colored `--color-muted-foreground`. Lowercase/uppercase as written. The
Latin part is never set in a different font.

| Variant | Use |
|---------|-----|
| `Gori 고리` (primary) | Landing nav, docs header, README banner |
| `Gori` (short) | Tight spaces, dashboard sidebar |
| Mark + `Gori` | Once the mark exists |

### Mark (to be designed)

Brief for the mark: **a single open link or ring**, built from one continuous stroke with a gap
where it connects. It should read as one link in a chain or a loop being closed. Geometric, drawn
on a 24px grid with a 2px stroke so it sits with Lucide icons. Monochrome by default; Link Green only
for the "connected" variant or favicon dot. Avoid chains of three or more links, padlocks, plugs, and
literal Korean motifs (taegeuk, hanok roofs).

### Usage

- Clear space: the height of the "G" on all sides.
- Minimum size: wordmark 96px wide; mark 16px (favicon) / 24px (UI).
- Colors: foreground on `--color-background` (either theme), or `--color-on-accent` on Link Green.
- Don't: recolor outside the palette, add gradients/shadows/outlines, stretch, rotate, set on busy images, or
  split `Gori` and `고리` across lines.
- Provider logos (Naver, Kakao) are trademarks of their owners. Use them only to identify the provider,
  per each owner's brand rules, and never merged with the Gori mark.

## 5. Color

Brand-level summary; exact tokens, light theme values, and contrast ratios live in
[`MASTER.md` §2](../design-system/gori/MASTER.md).

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Slate Night | #020617 | Default background; the brand's "ground" |
| Slate Card | #0E1223 | Surfaces, code cards |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Slate | #1E293B | Secondary surfaces, secondary buttons |
| Link Green | #22C55E | The only accent: primary action, "connected", success |
| Link Green Text | #15803D | Green text on light backgrounds |

### Neutral Palette

| Name | Hex | Usage |
|------|-----|-------|
| Paper | #F8FAFC | Text on dark; light surfaces |
| Mist | #94A3B8 | Secondary text (dark theme) |
| Slate Ink | #475569 | Secondary text (light theme) |
| Divider | #334155 | Decorative borders (dark theme) |

### Semantic Colors

| State | Dark | Light | Usage |
|-------|------|-------|-------|
| Success | #22C55E | #15803D | Connected, completed |
| Warning | #F59E0B | #B45309 | Expiring credentials, near rate limit |
| Error | #F87171 | #DC2626 | Failures, revoke |

Green is earned: it means a link is made. Don't use it for decoration, illustration fills, or large
background areas.

## 6. Typography

IBM Plex Sans + IBM Plex Sans KR for everything people read; JetBrains Mono for anything a machine reads
(code, tool IDs, keys, commands, numbers in tables). Scale, Korean line-breaking, and loading are in
[`MASTER.md` §3](../design-system/gori/MASTER.md).

### Font Stack

```css
--font-heading: 'IBM Plex Sans', 'IBM Plex Sans KR', system-ui, sans-serif;
--font-body: 'IBM Plex Sans', 'IBM Plex Sans KR', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

## 7. Imagery

- **Code is the hero image.** Real requests and responses beat illustrations.
- **Diagrams:** thin-line (1.5–2px) boxes and arrows in foreground/muted colors; one green line marks the
  active link.
- **No stock photos** of people at laptops, robots, glowing brains, or generic Seoul skyline shots.
- **Icons:** Lucide, outline, 1.75px stroke. No emoji in product or marketing graphics.

## AI Image Generation

For OG images and banners. Text is added afterward in IBM Plex Sans, never rendered by the model.

### Base Prompt Template

```
Minimal technical graphic, flat dark slate background #020617, thin precise geometric line work in #F8FAFC at low opacity, a single open ring or link shape highlighted in #22C55E, generous negative space, Swiss grid layout, no people, no text, no gradients, no glow, no 3D.
```

### Style Keywords

| Category | Keywords |
|----------|----------|
| **Lighting** | flat, even, no glow |
| **Mood** | calm, precise, engineered, quiet confidence |
| **Composition** | grid-aligned, asymmetric, negative space |
| **Treatment** | flat, high contrast, monochrome with one green accent |
| **Aesthetic** | Swiss, minimal, technical line drawing |

### Visual Mood Descriptors

- A single link closing a loop
- Engineering drawing, not illustration
- Quiet, dark, deliberate

### Visual Don'ts

| Avoid | Reason |
|-------|--------|
| Neon, cyberpunk, glow | Hype, off-voice |
| Robots, glowing brains | Gori connects AI; it is not the AI |
| Circuit-board clichés | Generic tech stock look |
| Chains, padlocks | Read as restriction, not connection |
| Seoul skyline, hanok, taegeuk | Literal Korean clichés |

### Example Prompts

**Hero Banner:**
```
Minimal technical graphic on flat #020617, a faint 1px grid in #334155, one open ring drawn as a single 2px stroke in #22C55E slightly right of center, thin lines in #94A3B8 linking it to two small squares, large empty area on the left for a headline, no text, no glow.
```

**Social Media Post:**
```
Square composition, flat #020617 background, a single open link shape in #F8FAFC with its gap highlighted in #22C55E, centered, thin geometric construction lines at 20% opacity, no text, no gradients, no 3D.
```

## 8. Consistency checklist

- [ ] Claims match the README status table (shipped vs planned)
- [ ] Tool IDs, error codes, env vars in mono and untranslated
- [ ] Korean copy reviewed by a native speaker; polite formal style
- [ ] Only one green, used for action/success
- [ ] Name written `Gori` / `고리`. Never all caps (`GORI`) except env var prefixes, and never `Go-ri`.
- [ ] No banned words from §3

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-11-08 | Initial guidelines: concept, positioning, voice, wordmark, mark brief, color, imagery |
