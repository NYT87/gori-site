// Builds the public site (homepage, pricing, docs) into static HTML for GitHub Pages.
// Usage: npm run build [-- <outDir>]   (default: <repo>/_site)
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICON, PUBLIC_DOCS, REPO, docPage, escapeHtml, htmlName, layout, pricingCards } from './render.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#020617"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#F8FAFC" stroke-width="3" stroke-linecap="round" stroke-dasharray="44 60" transform="rotate(-20 16 16)"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-dasharray="5.5 60" transform="rotate(-64 16 16)"/></svg>
`;

function fill(template, root) {
  return template
    .replaceAll('{{pricing_cards}}', pricingCards(root))
    .replaceAll('{{root}}', root)
    .replaceAll('{{repo}}', REPO)
    .replace(/\{\{icon\.(\w+)\}\}/g, (_, name) => {
      if (!ICON[name]) throw new Error(`Unknown icon placeholder: ${name}`);
      return ICON[name];
    });
}

export async function build(outDir = join(repoRoot, '_site')) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(join(outDir, 'docs'), { recursive: true });
  await mkdir(join(outDir, 'assets'), { recursive: true });
  const written = [];
  const write = async (path, html) => {
    // Keep the complete preview, but never send visitors to the private platform repository.
    const published = html
      .replace(/<a\b([^>]*?)href="https:\/\/github\.com\/NYT87\/gori(?:[/#?][^"]*)?"([^>]*)>([\s\S]*?)<\/a>/gi,
        '<span class="status planned" data-i18n="launch.status">Coming soon</span>')
      .replaceAll(REPO + '.git', '&lt;repository-url-at-launch&gt;')
      .replaceAll(REPO, 'Repository available at public launch');
    await writeFile(join(outDir, path), published);
    written.push(path);
  };

  // Top-level pages
  const pages = [
    { src: 'index.html', out: 'index.html', page: 'home', title: 'Gori',
      description: 'The open-source tool layer for AI agents: Naver, Kakao, and other Korean services as typed tools over MCP or HTTP. Self-host on Docker or Cloudflare Workers.' },
    { src: 'agents.html', out: 'agents.html', page: 'agents', title: 'Gori for agents',
      description: 'Connect AI agents to Naver, Kakao, and other Korean services: typed tools over HTTP tool calling today, MCP soon.' },
    { src: 'pricing.html', out: 'pricing.html', page: 'pricing', title: 'Pricing',
      description: 'Gori is free to self-host under AGPL-3.0. Gori Cloud is coming soon; support is available for teams.' },
  ];
  for (const p of pages) {
    const body = fill(await readFile(join(here, 'pages', p.src), 'utf8'), '');
    await write(p.out, layout({ ...p, root: '', body, path: p.out === 'index.html' ? '' : p.out }));
  }

  // Docs
  const docs = [];
  for (const d of PUBLIC_DOCS) {
    const markdown = await readFile(join(repoRoot, 'docs', d.file), 'utf8');
    const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? d.file;
    docs.push({ ...d, title, markdown });
  }
  for (const d of docs) {
    const { title, body } = docPage({ file: d.file, markdown: d.markdown, docs });
    const path = `docs/${htmlName(d.file)}`;
    await write(path, layout({ title, description: d.summary, root: '../', page: 'docs', body, path }));
  }
  const cards = docs.map(d => `<a class="doc-card" href="${htmlName(d.file)}"><strong>${escapeHtml(d.title)}</strong><span>${escapeHtml(d.summary)}</span></a>`).join('\n');
  const indexBody = `<section class="page-hero" aria-labelledby="docs-h">
  <div class="wrap">
    <div class="eyebrow" data-i18n="docs.eyebrow">Documentation</div>
    <h1 id="docs-h" data-i18n="docs.title">Gori documentation</h1>
    <p class="lede" data-i18n="docs.lede">Connecting agents, the API reference, configuration, operations, and the development guide.</p>
  </div>
</section>
<section aria-label="Documents">
  <div class="wrap" style="display:grid;gap:32px">
    <div class="doc-cards">${cards}</div>
    <div class="head" style="margin:0">
      <h2 class="h2" style="font-size:22px" data-i18n="docs.start">New here?</h2>
      <p class="lede" data-i18n="docs.start.body">Start with local development in the README, then connect your agent with the agent guide.</p>
      <a class="more-link" style="margin-top:0" href="${REPO}#local-development"><span data-i18n="docs.readme">Read the README on GitHub</span>${ICON.arrow}</a>
    </div>
  </div>
</section>`;
  await write('docs/index.html', layout({ title: 'Docs', description: 'Gori documentation: API, configuration, operations, and development.', root: '../', page: 'docs', body: indexBody, path: 'docs/' }));

  // 404 (GitHub Pages serves it for unknown paths; absolute links because the depth is unknown)
  const notFound = `<section class="page-hero"><div class="wrap">
  <div class="eyebrow">404</div>
  <h1>This page isn't here.</h1>
  <p class="lede">The link may be old, or the page moved. Try the homepage or the docs.</p>
  <div class="ctas"><a class="btn btn-primary" href="/gori-site/">Gori home</a><a class="btn btn-secondary" href="/gori-site/docs/">Docs</a></div>
</div></section>`;
  await write('404.html', layout({ title: 'Not found', description: 'Page not found.', root: '/gori-site/', page: '404', body: notFound, path: '404.html' }));

  // Assets
  await copyFile(join(here, 'site.css'), join(outDir, 'assets/site.css'));
  await copyFile(join(here, 'client.js'), join(outDir, 'assets/client.js'));
  await copyFile(join(repoRoot, 'docs/assets/banners/og-image.png'), join(outDir, 'assets/og-image.png'));
  await writeFile(join(outDir, 'assets/favicon.svg'), FAVICON);
  await writeFile(join(outDir, '.nojekyll'), '');
  return { outDir, pages: written };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ? resolve(process.argv[2]) : undefined;
  const { outDir, pages } = await build(out);
  console.log(`Built ${pages.length} pages into ${outDir}`);
}
