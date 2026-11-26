// Pure rendering helpers for the public site. No filesystem access here, so tests can call them directly.
import { icon } from '@nyt87/icons';
import { Marked, Renderer } from 'marked';

export const REPO = 'https://github.com/NYT87/gori';
export const SITE_URL = 'https://nyt87.github.io/gori-site/';
export const CONTACT = 'nyt87@proton.me';
export const COMPANY_URL = 'https://nyt87.github.io';

// User-facing docs, in sidebar order. Anything else in docs/ (design specs, brand guidelines) stays private.
export const PUBLIC_DOCS = [
  { file: 'agents.md', summary: 'Connect an AI agent: MCP or tool calling over HTTP.', ko: '에이전트 연결' },
  { file: 'api.md', summary: 'Endpoints, authentication, limits, and every error code.', ko: 'HTTP API' },
  { file: 'configuration.md', summary: 'Every environment variable for Node, Docker, and Cloudflare.', ko: '설정 레퍼런스' },
  { file: 'operations.md', summary: 'Running the Node deployment: health checks, upgrades, backups.', ko: '운영' },
  { file: 'development.md', summary: 'Repository layout, tests, and how to add a tool.', ko: '개발 가이드' },
  { file: 'architecture.md', summary: 'Platform direction, module boundaries, and the roadmap.', ko: '플랫폼 방향' },
];

export const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const slugify = text => text.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '')
  .replace(/[`*_~]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');

export const htmlName = file => file.replace(/\.md$/, '.html');

/**
 * Rewrite a link found in docs/<fromFile>:
 * public doc → sibling .html page; other repo path → GitHub blob URL; absolute/anchor links unchanged.
 */
export function rewriteDocLink(href, fromFile = '', publicFiles = PUBLIC_DOCS.map(d => d.file)) {
  if (!href || /^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href)) return href;
  const [path, hash = ''] = href.split('#');
  const anchor = hash ? `#${hash}` : '';
  const fromDir = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/') + 1) : '';
  const segments = [];
  for (const part of `docs/${fromDir}${path}`.split('/')) {
    if (part === '..') segments.pop();
    else if (part && part !== '.') segments.push(part);
  }
  const resolved = segments.join('/');
  if (resolved.startsWith('docs/') && publicFiles.includes(resolved.slice(5))) return htmlName(resolved.slice(5)) + anchor;
  return `${REPO}/blob/main/${resolved}${anchor}`;
}

/** Render one Markdown doc. Returns its title (first h1), HTML body, and h2 outline. */
export function renderDoc(markdown, fromFile) {
  let title = '';
  const outline = [];
  const marked = new Marked({
    gfm: true,
    walkTokens(token) {
      if (token.type === 'link') token.href = rewriteDocLink(token.href, fromFile);
    },
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        const id = slugify(text);
        if (depth === 1 && !title) { title = text; return `<h1>${inner}</h1>\n`; }
        if (depth === 2) outline.push({ id, text: inner });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${depth}>\n`;
      },
      table(token) {
        // Wide tables scroll inside their own container, never the page.
        return `<div class="table-wrap">${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
    },
  });
  const html = marked.parse(markdown);
  return { title: title || fromFile, html, outline };
}

// Icons come from the shared @nyt87/icons set. The `i` class keeps the site's own sizing and stroke rules working.
const ICON = {
  check: icon('check', { class: 'i' }),
  later: icon('clock', { class: 'i' }),
  copy: icon('copy', { class: 'i' }),
  arrow: icon('arrow-right', { class: 'i' }),
  plus: icon('plus', { class: 'i' }),
};
// The theme toggle carries both icons; client.js only shows the one for the current theme.
const THEME_ICONS = `${icon('sun', { class: 'i' }).replace('<svg ', '<svg data-theme-icon="dark" ')}${icon('moon', { class: 'i' }).replace('<svg ', '<svg data-theme-icon="light" hidden ')}`;
export { ICON };

const li = (key, text, kind = 'check') => `<li${kind === 'later' ? ' class="later"' : ''}>${ICON[kind]}<span data-i18n="${key}">${text}</span></li>`;

/** The three plan cards, shared by the homepage and the pricing page. */
export function pricingCards(root) {
  return `<div class="plans">
  <article class="plan featured" aria-labelledby="plan-self">
    <div class="plan-top"><h3 id="plan-self" data-i18n="plan.self.t">Self-hosted</h3><span class="status ok" data-i18n="st.ok">Coming soon</span></div>
    <div class="price"><strong data-i18n="plan.self.price">Free</strong><span>AGPL-3.0-only</span></div>
    <p data-i18n="plan.self.d">Everything in the repository, on your Cloudflare account or Docker host.</p>
    <ul>
      ${li('plan.self.f1', 'All tools and providers')}
      ${li('plan.self.f2', 'Docker or Cloudflare Workers')}
      ${li('plan.self.f3', 'No usage limits set by Gori')}
      ${li('plan.self.f4', 'No Gori account required')}
      ${li('plan.self.f5', 'Community support on GitHub')}
    </ul>
    <a class="ds-btn ds-btn--primary ds-btn--lg" href="${root}index.html#deploy" data-i18n="cta.selfhost">Self-host Gori</a>
  </article>
  <article class="plan" aria-labelledby="plan-cloud">
    <div class="plan-top"><h3 id="plan-cloud">Gori Cloud</h3><span class="status planned" data-i18n="st.soon">Coming soon</span></div>
    <div class="price"><strong data-i18n="plan.cloud.price">TBA</strong><span data-i18n="plan.cloud.unit">pricing not set</span></div>
    <p data-i18n="plan.cloud.d">The same core, hosted and operated for you. Built from the open-source code.</p>
    <ul>
      ${li('plan.cloud.f1', 'Managed hosting and upgrades', 'later')}
      ${li('plan.cloud.f2', 'Dashboard in English and Korean', 'later')}
      ${li('plan.cloud.f3', 'Usage reporting and quotas', 'later')}
    </ul>
    <div class="notify">
      <p data-i18n="plan.cloud.notify">Watch the repository for release news, or email us to hear when Cloud opens.</p>
      <div class="notify-row">
        <a class="ds-btn ds-btn--secondary ds-btn--lg" href="${REPO}" data-i18n="plan.cloud.watch">Watch on GitHub</a>
        <a class="ds-btn ds-btn--ghost ds-btn--lg" href="mailto:${CONTACT}?subject=Gori%20Cloud%20waitlist" data-i18n="plan.cloud.email">Email us</a>
      </div>
    </div>
  </article>
  <article class="plan" aria-labelledby="plan-support">
    <div class="plan-top"><h3 id="plan-support" data-i18n="plan.sup.t">Support</h3></div>
    <div class="price"><strong data-i18n="plan.sup.price">Custom</strong><span data-i18n="plan.sup.unit">for teams</span></div>
    <p data-i18n="plan.sup.d">Help running Gori in production, or a connector your business depends on.</p>
    <ul>
      ${li('plan.sup.f1', 'Deployment and upgrade help')}
      ${li('plan.sup.f2', 'Custom Korean-service connectors')}
      ${li('plan.sup.f3', 'Support in English or Korean')}
    </ul>
    <a class="ds-btn ds-btn--secondary ds-btn--lg" href="mailto:${CONTACT}?subject=Gori%20support" data-i18n="plan.sup.email">Email us</a>
  </article>
</div>`;
}

/** Full HTML document around a page body. `root` is the relative path back to the site root ('' or '../'). */
export function layout({ title, description, root, page, body, path }) {
  const nav = [
    ['agents.html', 'nav.agents', 'Agents', 'agents'],
    ['index.html#how', 'nav.how', 'How it works', null],
    ['pricing.html', 'nav.pricing', 'Pricing', 'pricing'],
    ['docs/index.html', 'nav.docs', 'Docs', 'docs'],
  ].map(([href, key, label, id]) => `<a class="ds-header__link" href="${root}${href}" data-i18n="${key}"${page === id ? ' aria-current="page"' : ''}>${label}</a>`).join('')
    + `<a class="ds-header__link" href="${REPO}">GitHub</a>`;
  const fullTitle = page === 'home' ? 'Gori — Korean services, connected to your agents' : `${title} · Gori`;
  return `<!doctype html>
<html lang="en" data-accent="gori">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${SITE_URL}${path}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${SITE_URL}${path}">
<meta property="og:image" content="${SITE_URL}assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<script>try{var t=localStorage.getItem('gori-theme'),d=document.documentElement;if(t)d.dataset.theme=t;else if(!matchMedia('(prefers-color-scheme: light)').matches&&!matchMedia('(prefers-color-scheme: dark)').matches)d.dataset.theme='dark';var l=localStorage.getItem('gori-lang');if(l==='ko')document.documentElement.lang='ko'}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${root}assets/tokens.css">
<link rel="stylesheet" href="${root}assets/ds.css">
<link rel="stylesheet" href="${root}assets/gori-theme.css">
<link rel="stylesheet" href="${root}assets/site.css">
</head>
<body class="page-${page}">
<a class="ds-skip" href="#main" data-i18n="skip">Skip to content</a>
<header class="ds-header ds-header--sticky">
  <div class="ds-container ds-header__bar">
    <a class="ds-brand" href="${root}index.html" aria-label="Gori home"><span class="ds-brand__name">Gori <span class="ko" lang="ko">고리</span></span></a>
    <nav class="ds-header__nav" aria-label="Primary">${nav}</nav>
    <div class="ds-header__actions">
      <div class="lang" role="group" aria-label="Language">
        <button type="button" data-lang="en" aria-pressed="true">EN</button>
        <button type="button" data-lang="ko" aria-pressed="false" lang="ko">한국어</button>
      </div>
      <button class="icon-btn" type="button" id="theme-toggle" aria-label="Switch theme">${THEME_ICONS}</button>
      <button class="ds-header__menu" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Open navigation menu" data-label-open="Open navigation menu" data-label-close="Close navigation menu"><span class="ds-header__burger" aria-hidden="true"></span></button>
    </div>
  </div>
  <nav id="nav-panel" class="ds-header__panel" aria-label="Primary (menu)" hidden><div class="ds-container">${nav}</div></nav>
</header>
<main id="main">
<div class="release-notice wrap" role="note" data-i18n="release.notice">Coming soon — Gori is in private development. Explore the preview below; the repository and public release are not available yet.</div>
${body}
</main>
<footer class="ds-footer">
  <div class="ds-container ds-footer__top">
    <a class="ds-brand" href="${root}index.html" aria-label="Gori home"><span class="ds-brand__name">Gori <span class="ko" lang="ko">고리</span></span></a>
    <p class="ds-footer__credit">© 2026 <a class="ds-footer__link ds-footer__link--inline" href="${COMPANY_URL}">NYT87</a></p>
    <nav class="ds-footer__row" aria-label="Footer">
      <a class="ds-footer__link" href="${root}docs/index.html" data-i18n="nav.docs">Docs</a>
      <a class="ds-footer__link" href="${root}pricing.html" data-i18n="nav.pricing">Pricing</a>
      <a class="ds-footer__link" href="${REPO}">GitHub</a>
      <a class="ds-footer__link" href="${REPO}/blob/main/LICENSE">AGPL-3.0-only</a>
    </nav>
  </div>
</footer>
<div class="sr-only" id="announce" role="status" aria-live="polite"></div>
<script type="module" src="${root}assets/menu.js"></script>
<script src="${root}assets/client.js" defer></script>
</body>
</html>
`;
}

/** Docs page: sidebar + article. */
export function docPage({ file, markdown, docs }) {
  const { title, html, outline } = renderDoc(markdown, file);
  const side = docs.map(d => {
    const current = d.file === file;
    return `<a href="${htmlName(d.file)}"${current ? ' aria-current="page"' : ''}>${escapeHtml(d.title)}</a>`;
  }).join('');
  const toc = outline.length > 1
    ? `<nav class="toc" aria-label="On this page"><div class="eyebrow" data-i18n="docs.onpage">On this page</div>${outline.map(o => `<a href="#${o.id}">${o.text}</a>`).join('')}</nav>`
    : '';
  const body = `<div class="docs wrap">
  <nav class="docs-side" aria-label="Documentation"><a href="index.html" data-i18n="docs.overview">Overview</a>${side}</nav>
  <article class="prose">
    <p class="ko-only note" lang="ko" data-i18n="docs.enonly">문서는 현재 영어로만 제공됩니다.</p>
    ${html}
    <p class="edit"><a href="${REPO}/blob/main/docs/${file}" data-i18n="docs.edit">Edit this page on GitHub</a></p>
  </article>
  ${toc}
</div>`;
  return { title, body };
}
