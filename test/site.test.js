import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
    for (const asset of ['site.css', 'client.js', 'og-image.png', 'favicon.svg']) await stat(join(out, 'assets', asset));
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
