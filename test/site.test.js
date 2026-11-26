import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineTheme } from '@nyt87/tokens/theme';
import { gori } from '@nyt87/tokens/themes';
import { REPO, layout, pricingCards, renderDoc, rewriteDocLink, slugify } from '../src/render.js';
import { build } from '../src/build.js';

test('rewriteDocLink maps public docs to html pages and keeps anchors', () => {
  assert.equal(rewriteDocLink('api.md', 'development.md'), 'api.html');
  assert.equal(rewriteDocLink('configuration.md#gori_api_key', 'architecture.md'), 'configuration.html#gori_api_key');
});

test('rewriteDocLink sends other repository paths to GitHub', () => {
  assert.equal(rewriteDocLink('../README.md', 'api.md'), `${REPO}/blob/main/README.md`);
  assert.equal(rewriteDocLink('../packages/core/src/tools.js', 'api.md'), `${REPO}/blob/main/packages/core/src/tools.js`);
  // Private docs are never published, so they link to the source on GitHub instead of a missing page.
  assert.equal(rewriteDocLink('brand-guidelines.md', 'api.md'), `${REPO}/blob/main/docs/brand-guidelines.md`);
  assert.equal(rewriteDocLink('superpowers/specs/x.md', 'api.md'), `${REPO}/blob/main/docs/superpowers/specs/x.md`);
});

test('rewriteDocLink leaves absolute, protocol, and anchor links alone', () => {
  for (const href of ['https://example.com/a.md', 'mailto:a@b.c', '#limits', '//cdn.example/x']) {
    assert.equal(rewriteDocLink(href, 'api.md'), href);
  }
  assert.equal(rewriteDocLink('', 'api.md'), '');
});

test('renderDoc takes the title from the first h1 and outlines h2 headings with ids', () => {
  const { title, html, outline } = renderDoc('# HTTP API\n\n## Error codes\n\nSee [ops](operations.md).\n\n|a|b|\n|-|-|\n|1|2|\n', 'api.md');
  assert.equal(title, 'HTTP API');
  assert.deepEqual(outline.map(o => o.id), ['error-codes']);
  assert.match(html, /<h2 id="error-codes">/);
  assert.match(html, /href="operations.html"/);
  assert.match(html, /<div class="table-wrap"><table>/);
});

test('slugify keeps Korean text and drops punctuation', () => {
  assert.equal(slugify('GET /v1/tools'), 'get-v1tools');
  assert.equal(slugify('설정 레퍼런스!'), '설정-레퍼런스');
});

test('pricing never shows an invented price for Cloud', () => {
  const html = pricingCards('');
  assert.match(html, />Free</);
  assert.match(html, />TBA</);
  assert.doesNotMatch(html, /[$₩€]\s?\d/);
});

test('layout escapes metadata and points og:image at the published banner', () => {
  const html = layout({ title: 'A <b>', description: 'x "y"', root: '', page: 'pricing', body: '', path: 'pricing.html' });
  assert.match(html, /<title>A &lt;b&gt; · Gori<\/title>/);
  assert.match(html, /content="x &quot;y&quot;"/);
  assert.match(html, /og:image" content="https:\/\/nyt87\.github\.io\/gori-site\/assets\/og-image\.png"/);
  assert.match(html, /aria-current="page">Pricing</);
});

test('build writes every public page and no private docs', async () => {
  const out = await mkdtemp(join(tmpdir(), 'gori-site-'));
  try {
    const { pages } = await build(out);
    for (const p of ['index.html', 'pricing.html', 'agents.html', '404.html', 'docs/index.html', 'docs/agents.html', 'docs/api.html', 'docs/configuration.html', 'docs/operations.html', 'docs/development.html', 'docs/architecture.html']) {
      assert.ok(pages.includes(p), `missing ${p}`);
    }
    const docs = await readdir(join(out, 'docs'));
    assert.ok(!docs.some(f => f.includes('brand') || f.includes('superpowers')), 'private docs must not be published');
    for (const asset of ['site.css', 'client.js', 'og-image.png', 'favicon.svg', 'tokens.css', 'ds.css', 'menu.js', 'gori-theme.css']) await stat(join(out, 'assets', asset));
    await stat(join(out, '.nojekyll'));

    const home = await readFile(join(out, 'index.html'), 'utf8');
    assert.doesNotMatch(home, /\{\{[^}]+\}\}/, 'unreplaced template placeholder');
    assert.match(home, /class="plans"/);
    assert.match(home, /id="agents"/, 'homepage has the Built for agents section');
    assert.match(home, /href="agents.html"/);

    // MCP is not implemented yet: every page that mentions it must label it as coming soon.
    const agents = await readFile(join(out, 'agents.html'), 'utf8');
    for (const [name, html] of [['index.html', home], ['agents.html', agents]]) {
      assert.match(html, /MCP/, `${name} mentions MCP`);
      assert.match(html, /Coming soon/, `${name} labels MCP as coming soon`);
    }
    assert.match(agents, /claude-opus-5-5/);
    const agentsDoc = await readFile(join(out, 'docs/agents.html'), 'utf8');
    assert.match(agentsDoc, /Status: planned/);
    assert.match(agentsDoc, /href="api.html#error-codes"/);
    const api = await readFile(join(out, 'docs/api.html'), 'utf8');
    assert.match(api, /<h1>HTTP API<\/h1>/);
    assert.match(api, /href="\.\.\/assets\/site\.css"/);
    assert.match(api, /href="\.\.\/assets\/tokens\.css"/);
    const theme = await readFile(join(out, 'assets/gori-theme.css'), 'utf8');
    assert.equal(theme, await readFile(fileURLToPath(import.meta.resolve('@nyt87/tokens/themes/gori.css')), 'utf8'), 'the site ships the shared Gori theme file as is');
    assert.match(theme, /:root\[data-accent='gori'\]/);
    assert.match(theme, /--bg: #020617/);
    assert.doesNotMatch(theme, /--accent:|--on-accent:|--link:/, 'the accent family comes from the design system');
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test('full preview keeps content while removing private repository links', async () => {
  const out = await mkdtemp(join(tmpdir(), 'gori-preview-'));
  try {
    const { pages } = await build(out);
    for (const page of pages) {
      const html = await readFile(join(out, page), 'utf8');
      assert.match(html, /Coming soon/);
      assert.doesNotMatch(html, /github\.com\/NYT87\/gori(?:[/"#?.]|$)/i);
      assert.doesNotMatch(html, /\{\{/);
    }
    const home = await readFile(join(out, 'index.html'), 'utf8');
    assert.match(home, /class="brand-banner"/);
    assert.match(home, /stroke="var\(--fg\)"/);
    assert.match(home, /id="deploy"/);
    assert.match(await readFile(join(out, 'pricing.html'), 'utf8'), /class="plans"/);
    assert.match(await readFile(join(out, 'docs/agents.html'), 'utf8'), /tool-calling-over-http/);
  } finally { await rm(out, { recursive: true, force: true }); }
});

test('the Gori theme meets WCAG contrast in light and dark', () => {
  assert.deepEqual(defineTheme(gori).failures, []);
});

test('the theme has one source: the site keeps no copy of its values', () => {
  assert.equal(existsSync(new URL('../src/theme.js', import.meta.url)), false);
});

test('layout uses the shared header and footer with a working menu and no leftover custom nav', () => {
  const html = layout({ title: 'T', description: 'd', root: '', page: 'home', body: '', path: '' });
  assert.match(html, /<html lang="en" data-accent="gori">/);
  assert.match(html, /<header class="ds-header ds-header--sticky">/);
  assert.match(html, /<footer class="ds-footer">/);
  assert.match(html, /<script type="module" src="assets\/menu\.js">/);
  // The menu button points at a panel that exists, and the panel repeats the links.
  assert.match(html, /aria-controls="nav-panel"/);
  assert.match(html, /<nav id="nav-panel" class="ds-header__panel"[^>]*hidden>/);
  assert.equal((html.match(/class="ds-header__link"/g) ?? []).length, 10, 'five links in the bar and five in the menu panel');
  assert.doesNotMatch(html, /class="nav"|class="nav-mobile"|class="wordmark"|class="btn /);
  // Language and theme controls keep the ids and attributes client.js relies on.
  assert.match(html, /id="theme-toggle"/);
  assert.match(html, /data-lang="ko"/);
});

test('buttons on every page use the shared classes', async () => {
  const out = await mkdtemp(join(tmpdir(), 'gori-site-'));
  try {
    await build(out);
    for (const f of ['index.html', 'pricing.html', 'agents.html', '404.html']) {
      const html = await readFile(join(out, f), 'utf8');
      assert.doesNotMatch(html, /class="btn[ "]/, `${f} still has a custom .btn`);
      assert.match(html, /class="ds-btn ds-btn--/, `${f} has no shared button`);
    }
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test('links are not underlined anywhere in the stylesheet', async () => {
  const css = await readFile(new URL('../src/site.css', import.meta.url), 'utf8');
  assert.match(css, /\ba \{ color: inherit; text-decoration: none; \}/);
  assert.doesNotMatch(css, /text-decoration:\s*underline/);
  // The header marks the current page with a background, not an underline.
  assert.match(css, /\.ds-header__link\[aria-current='page'\] \{[^}]*background: var\(--bg-sunken\); text-decoration: none;/);
});

test('the footer centres the copyright and has no email link', () => {
  const html = layout({ title: 'T', description: 'd', root: '', page: 'home', body: '', path: '' });
  const footer = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
  assert.match(footer, /<p class="ds-footer__credit">© 2026 <a [^>]*>NYT87<\/a><\/p>/);
  assert.doesNotMatch(footer, /mailto:/);
});

test('the support plan offers an Email us button instead of showing the address', () => {
  const html = pricingCards('');
  const support = html.slice(html.indexOf('id="plan-support"'));
  assert.match(support, /<a class="ds-btn ds-btn--secondary ds-btn--lg" href="mailto:[^"]+\?subject=Gori%20support"[^>]*>Email us<\/a>/);
  assert.doesNotMatch(support, />nyt87@proton\.me</, 'the address is not displayed');
  assert.doesNotMatch(html, /contact-addr|Copy email address/, 'no copy-the-address control');
});

// Icons come from @nyt87/icons: no hand-written paths in the site's own code.
import { icon } from '@nyt87/icons';
import { ICON } from '../src/render.js';

test('the site icons are the shared @nyt87/icons ones', () => {
  assert.equal(ICON.check, icon('check', { class: 'i' }));
  assert.equal(ICON.later, icon('clock', { class: 'i' }));
  assert.equal(ICON.copy, icon('copy', { class: 'i' }));
  assert.equal(ICON.arrow, icon('arrow-right', { class: 'i' }));
  assert.equal(ICON.plus, icon('plus', { class: 'i' }));
  assert.match(ICON.check, /class="ds-icon i"/);
});

test('the theme toggle ships both icons from the package and the script only toggles them', async () => {
  const html = layout({ title: 'T', description: 'd', root: '', page: 'home', body: '', path: '' });
  const button = html.match(/<button[^>]*id="theme-toggle"[\s\S]*?<\/button>/)[0];
  assert.ok(button.includes('data-theme-icon="dark"') && button.includes('data-theme-icon="light"'), 'each icon says which theme shows it');
  assert.equal((button.match(/<svg/g) ?? []).length, 2);
  assert.ok(button.includes(icon('sun').match(/<path[^>]*>|<circle[^>]*>/)[0]), 'the sun artwork is the package one');
  assert.ok(button.includes(icon('moon').match(/<path[^>]*>/)[0]), 'the moon artwork is the package one');
  const client = await readFile(new URL('../src/client.js', import.meta.url), 'utf8');
  assert.doesNotMatch(client, /M12 2v2M12 20v2|M12 3a6 6 0 0 0 9 9/, 'client.js carries no icon artwork');
  // SVG elements have no `hidden` property (only HTML elements do), so assigning it silently does nothing.
  assert.match(client, /svg\.toggleAttribute\('hidden'/);
  assert.doesNotMatch(client, /svg\.hidden\s*=/);
});
