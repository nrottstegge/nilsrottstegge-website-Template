import { readFile, writeFile } from 'node:fs/promises';
import { cmsConfiguration, demoCmsConfiguration } from './cms-schema.mjs';
import { validateConfiguration } from './validate-config.mjs';

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const demo = args[0] === '--demo-url';
if (args.length && (!demo || args.length !== 2)) throw new Error('Aufruf: npm run configure oder node scripts/configure.mjs --demo-url https://OWNER.github.io/REPO');
let config;
let gitlabOrigin = '';
if (demo) {
  const url = new URL(args[1]);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Die Pages-Demo benötigt eine vollständige HTTPS-Adresse.');
  const siteUrl = url.href.replace(/\/$/, '');
  config = demoCmsConfiguration(siteUrl);
  await writeFile(new URL('_config.demo.yml', root), JSON.stringify({ url: url.origin, baseurl: url.pathname.replace(/\/$/, ''), demo_enabled: true, demo_only: true }, null, 2) + '\n');
} else {
  const input = JSON.parse(await readFile(new URL('template.config.json', root), 'utf8'));
  validateConfiguration(input);
  const site = new URL(input.siteUrl);
  const jekyll = JSON.parse(await readFile(new URL('_config.yml', root), 'utf8'));
  Object.assign(jekyll, { url: site.origin, baseurl: site.pathname.replace(/\/$/, ''), demo_enabled: input.demoEnabled, demo_only: false });
  await writeFile(new URL('_config.yml', root), JSON.stringify(jekyll, null, 2) + '\n');
  config = cmsConfiguration(input);
  gitlabOrigin = ` ${input.gitlabUrl}`;
}
await writeFile(new URL('admin/config.yml', root), JSON.stringify(config, null, 2) + '\n');
await writeFile(new URL('admin/security-policy.txt', root), `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:${gitlabOrigin}; font-src 'self' data:; connect-src 'self' blob:${gitlabOrigin}; frame-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'${gitlabOrigin}; upgrade-insecure-requests\n`);
console.log(demo ? 'GitHub-Pages-Demo ohne Repository-Zugriff konfiguriert.' : 'Uni-GitLab-PKCE konfiguriert.');
