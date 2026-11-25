# Gori public website

Standalone showcase, pricing, agent guide, and documentation for [Gori](https://github.com/NYT87/gori).

Website: https://nyt87.github.io/gori-site/

## Development

Requires Node.js 24 or later.

```sh
npm ci
npm test
npm run check
npm run build
python3 -m http.server 8080 --directory _site
```

Open http://localhost:8080. Generated HTML lives in ignored `_site/`.

## Deployment

Push to `main` to build, test, and deploy through GitHub Actions.
Repository Settings → Pages → Source must be **GitHub Actions**.
The workflow can also be started manually.

## Design system

The site is built on the nyt87 design system: `@nyt87/tokens` (colour, type, spacing) and `@nyt87/ui` (header, footer, buttons and the 0.45 KB menu script). Gori's slate neutrals and dark-first default are in `src/theme.js`; the build turns them into `assets/gori-theme.css` and fails if any text pair drops below WCAG contrast. The accent (buttons, links, focus ring) is the design system's own, so buttons match nyt87.github.io.

The packages come from GitHub Packages, which needs a token even for public packages: run `gh auth refresh -s read:packages` once, then `export NODE_AUTH_TOKEN=$(gh auth token)` before `npm ci`. The `.npmrc` maps the scope, and the Pages workflow passes `secrets.GITHUB_TOKEN`.

## Content

- `src/pages/`: homepage, agents, pricing.
- `src/render.js`: shared layout, metadata, and documentation rendering.
- `src/client.js`: language and theme controls.
- `src/site.css`: styling.
- `docs/`: copied public documentation snapshot from the platform repository.
- `design-system/` and `docs/brand-guidelines.md`: design references.

The platform repository remains the source of truth for API documentation.
Copy updated public markdown into `docs/` when platform behavior changes, then run tests and build.
Source-code links intentionally point to NYT87/gori.
When changing hosting, update SITE_URL in src/render.js and the absolute 404 links in src/build.js.

## License

AGPL-3.0-only; see LICENSE. Preserves the original Gori license.

## Pre-release publishing

The full site remains browsable: agents, connection guides, pricing, and documentation.
A coming-soon notice identifies the private development stage. The build replaces private platform repository links with coming-soon labels.
The homepage adapts the original code-generated Gori README banner using the active theme colors, including explicit theme overrides and system preference.
