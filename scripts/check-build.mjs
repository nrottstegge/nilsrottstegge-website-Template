import { readdir, readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const root = new URL('../_site/', import.meta.url);
const site = JSON.parse(await readFile(new URL('../_config.yml', import.meta.url), 'utf8'));
for (const override of process.argv.slice(2)) Object.assign(site, JSON.parse(await readFile(new URL(`../${override}`, import.meta.url), 'utf8')));
const pages = [];
async function walk(directory = '') {
  for (const entry of await readdir(new URL(directory, root), { withFileTypes: true })) {
    const name = path.posix.join(directory, entry.name);
    if (entry.isDirectory() && !name.startsWith('media/')) await walk(`${name}/`);
    else if (entry.name.endsWith('.html')) pages.push(name);
  }
}
await walk();
for (const forbidden of ['deploy', 'scripts', 'tests', 'docs', '.env', 'template.config.json', 'Gemfile', 'Gemfile.lock', '.gitlab-ci.yml', '.github', '_config.demo.yml']) {
  let present = false; try { await stat(new URL(forbidden, root)); present = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  assert.ok(!present, `Nicht öffentliche Datei im Build: ${forbidden}`);
}
for (const page of pages) {
  const html = await readFile(new URL(page, root), 'utf8');
  assert.ok(!/\{[{%]/.test(html), `Nicht ausgewertete Liquid-Anweisung: ${page}`);
  for (const match of html.matchAll(/(?:src|href|data-h264|data-av1|data-poster)="(\/[^"#?]*)/g)) {
    let url = decodeURI(match[1]);
    if (site.baseurl) { assert.ok(url.startsWith(`${site.baseurl}/`), `${page}: falscher baseurl in ${url}`); url = url.slice(site.baseurl.length); }
    if (url.endsWith('/')) url += 'index.html';
    await stat(new URL(url.replace(/^\//, ''), root)).catch(() => { throw new Error(`${page}: fehlendes Ziel ${url}`); });
  }
}
const home = await readFile(new URL('index.html', root), 'utf8');
const homeData = JSON.parse(await readFile(new URL('../_data/home.json', import.meta.url), 'utf8'));
assert.equal((home.match(/data-k="\d+"/g) || []).length, 18 + homeData.more_skills.length);
assert.ok(home.includes('data-title') && home.includes('data-cta'));
const previewData = JSON.parse(await readFile(new URL('preview/data.json', root), 'utf8'));
assert.ok(previewData.profile && previewData.home && previewData.legal && Array.isArray(previewData.projects));
for (const project of previewData.projects) {
  assert.ok(project.slug && project.url && project.data.title);
  assert.ok(!('output' in project.data) && !('next' in project.data) && !('previous' in project.data), 'Vorschau enthält nur öffentliche Inhaltsfelder, keine rekursiven Jekyll-Dokumente.');
}
console.log(`${pages.length} Seiten, interne Links, Animation und Ausschluss privater Quelldateien geprüft.`);

if (site.demo_only) {
  const cms = JSON.parse(await readFile(new URL('admin/config.yml', root), 'utf8'));
  assert.deepEqual(cms.backend, { name: 'test-repo' }, 'Die Pages-Demo darf keine Repository-Anmeldung enthalten.');
  const admin = await readFile(new URL('admin/index.html', root), 'utf8');
  assert.ok(admin.includes('data-demo="true"'), 'Der Pages-Einstieg /admin/ muss die Demo starten.');
  const csp = await readFile(new URL('admin/security-policy.txt', root), 'utf8');
  assert.ok(csp.includes("connect-src 'self' blob:;"), 'Die Demo darf keine externe Repository-API freigeben.');
}
