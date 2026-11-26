# Repository Guidelines

## What this repository is

The public website for Gori: homepage, agents guide, pricing, and documentation, built to static HTML and published at https://nyt87.github.io/gori-site/. The platform itself lives in the separate, private repository `NYT87/gori` (local clone: `/home/motoko/workspace/gori`), which is the source of truth for product behavior and documentation. Nothing here is hosted from that repository.

## Keep it in sync with the platform repository

- `docs/` is a **copy** of the public docs in `NYT87/gori` (`agents.md`, `api.md`, `architecture.md`, `configuration.md`, `development.md`, `operations.md`) plus the design references (`docs/brand-guidelines.md`, `design-system/`). Do not change them here on their own: change the platform repository first, then copy the file across. If you must fix a doc here, apply the same fix there in the same task.
- When platform behavior, endpoints, configuration, error codes, tool IDs, or provider status change, update the affected page copy too: `src/pages/*.html`, the pricing cards in `src/render.js`, and the Korean strings in `src/client.js`. English and Korean change together. Pricing must match what exists: no prices until they are decided, and nothing offered that is not built.
- Tell the user when the platform repository needs the matching commit.

## Pre-release rules

Gori is private for now. Keep the "Coming soon" notice, and never link visitors to the private repository: `src/build.js` replaces links to `github.com/NYT87/gori` with "Coming soon" labels, and a test enforces it. Remove that step and the notice only at the public release, and update `SITE_URL` and the absolute 404 links if hosting changes.

## Design system

The site is built on `@nyt87/tokens` and `@nyt87/ui` (header, footer, buttons, the 0.45 KB menu script). Use their classes instead of custom ones, and take colors from the tokens. Gori's own palette is the shared preset `@nyt87/tokens/themes/gori.css` (change it in the design-system repo, not here): the build copies it to `assets/gori-theme.css`, and its build fails if any text pair drops below WCAG contrast. The accent comes from the design system, so primary buttons match nyt87.github.io; green is only for success states. The header stays one fixed 64px row that never wraps.

## Build, test, and deploy

Node 24 or later. The design-system packages come from GitHub Packages, which needs a token even for public packages: `export NODE_AUTH_TOKEN=$(gh auth token)` (scope `read:packages`), then `npm ci`. Run `npm test`, `npm run check`, and `npm run build` before claiming work is done, and report any check you could not run. Preview with `python3 -m http.server 8080 --directory _site`.

Pushing to `main` builds, tests, and deploys through GitHub Actions, so commit and push only when asked. Concise imperative commit subjects. Never commit credentials.
