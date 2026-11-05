import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cmsConfiguration, demoCmsConfiguration } from '../scripts/cms-schema.mjs';
import { validateConfiguration } from '../scripts/validate-config.mjs';
const valid = { repo: 'university/faculty/website', branch: 'main', siteUrl: 'https://www.university.ch', gitlabUrl: 'https://gitlab.university.ch', applicationId: 'abc123-client-id', demoEnabled: false };

test('self-hosted GitLab uses PKCE, the selected API and a public app ID, without a secret', () => {
  validateConfiguration(valid, true);
  const config = cmsConfiguration(valid);
  assert.deepEqual(config.backend, { name: 'gitlab', repo: valid.repo, branch: 'main', auth_type: 'pkce', app_id: valid.applicationId, api_root: `${valid.gitlabUrl}/api/v4`, base_url: valid.gitlabUrl, auth_endpoint: 'oauth/authorize' });
  assert.equal(config.publish_mode, 'editorial_workflow');
  assert.equal(config.local_backend, undefined);
});

test('configuration rejects insecure origins, credentials, secrets, malformed projects and deployment placeholders', () => {
  for (const overrides of [{ gitlabUrl: 'http://gitlab.university.ch' }, { siteUrl: 'http://www.university.ch' }, { gitlabUrl: 'https://user:password@gitlab.university.ch' }, { gitlabUrl: 'https://gitlab.university.ch/path' }, { siteUrl: 'https://www.university.ch/?token=secret' }, { repo: 'group/../website' }, { repo: 'group' }, { branch: '../main' }, { clientSecret: 'must-not-be-written' }, { applicationId: '' }, { demoEnabled: 'false' }]) {
    assert.throws(() => validateConfiguration({ ...valid, ...overrides }));
  }
  assert.throws(() => validateConfiguration({ ...valid, applicationId: 'YOUR-GITLAB-APPLICATION-ID' }, true));
  assert.throws(() => validateConfiguration({ ...valid, siteUrl: 'https://www.example.com' }, true));
});

test('subpath hosting keeps media paths usable by Jekyll and admin links under that subpath', () => {
  const config = cmsConfiguration({ ...valid, siteUrl: `${valid.siteUrl}/portfolio` });
  assert.equal(config.logo_url, '/portfolio/icon.svg');
  assert.equal(config.public_folder, '/uploads');
  assert.equal(config.backend.base_url, valid.gitlabUrl);
});

test('Pages demo has the same editable fields but no repository, OAuth endpoints or application ID', () => {
  const url = 'https://nrottstegge.github.io/nilsrottstegge-website-Template';
  const demo = demoCmsConfiguration(url);
  assert.deepEqual(demo.backend, { name: 'test-repo' });
  assert.deepEqual(demo.collections, cmsConfiguration(valid).collections);
  assert.equal(demo.site_url, url);
  assert.equal(demo.logo_url, '/nilsrottstegge-website-Template/icon.svg');
});

test('demo starts with real example content in a separate in-memory test backend', async () => {
  const root = new URL('../', import.meta.url);
  const seed = JSON.parse(await readFile(new URL('admin/demo/seed.json', root), 'utf8'));
  for (const file of ['_data/profile.json', '_data/home.json', '_data/legal.json', '_projects/adaptive-trees.md', '_projects/hbdia.md', '_projects/hpcg.md', '_projects/porous-convection.md']) {
    assert.equal(seed[file], await readFile(new URL(file, root), 'utf8'));
  }
  for (const path of Object.keys(seed)) assert.ok(path.startsWith('_data/') || path.startsWith('_projects/'));
  const page = await readFile(new URL('admin/demo/index.html', root), 'utf8');
  assert.ok(page.includes("jekyll.environment != 'production' or site.demo_enabled"));
  assert.ok(page.includes("connect-src 'self' blob:"));
  assert.ok(!page.includes('gitlab.university.ch'));
});

test('deploy jobs are restricted to a protected default branch and a dedicated internal runner', async () => {
  const ci = await readFile(new URL('../.gitlab-ci.yml', import.meta.url), 'utf8');
  assert.ok(ci.includes('CI_COMMIT_REF_PROTECTED == "true"'));
  assert.ok(ci.includes('CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'));
  assert.ok(ci.includes('tags: [website-deploy]'));
  assert.ok(ci.includes('resource_group: website-production'));
});
