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

The default build publishes a coming-soon showcase, including the original Gori README banner. All previous docs, pricing, and agent URLs show the announcement while the platform is private. No private repository links or setup instructions are published. The earlier templates and documentation remain in source for future release; buildPreview is only used by their tests.
