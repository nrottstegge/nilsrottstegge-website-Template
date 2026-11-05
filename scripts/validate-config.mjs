export function validateConfiguration(input, production = false) {
  const expected = new Set(['repo', 'branch', 'siteUrl', 'gitlabUrl', 'applicationId', 'demoEnabled']);
  if (!input || Object.keys(input).some(name => !expected.has(name))) throw new Error('Unbekannte Konfiguration; keine Secrets oder Tokens in template.config.json speichern.');
  if (typeof input.repo !== 'string' || !/^[\w-]+(?:\/[\w.-]+)+$/.test(input.repo) || input.repo.split('/').some(part => part === '.' || part === '..')) throw new Error('repo muss Gruppe[/Untergruppe]/Projekt entsprechen.');
  if (typeof input.branch !== 'string' || !/^[\w][\w./-]*$/.test(input.branch) || input.branch.includes('..')) throw new Error('Ungültiger Branch.');
  for (const name of ['siteUrl', 'gitlabUrl']) {
    const url = new URL(input[name]);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error(`${name}: HTTPS-Adresse ohne Zugangsdaten oder Query angeben.`);
  }
  if (new URL(input.gitlabUrl).origin !== input.gitlabUrl) throw new Error('gitlabUrl muss eine HTTPS-Origin ohne Pfad sein.');
  if (!/^[\w-]+$/.test(input.applicationId ?? '')) throw new Error('Gültige Application ID angeben.');
  if (typeof input.demoEnabled !== 'boolean') throw new Error('demoEnabled muss true oder false sein.');
  if (production) {
    if (input.applicationId.startsWith('YOUR-')) throw new Error('Bitte die echte GitLab Application ID eintragen.');
    if (/(^|\.)(example\.(com|org|edu)|example\.net)$/.test(new URL(input.siteUrl).hostname) || new URL(input.gitlabUrl).hostname.endsWith('.example.edu')) throw new Error('Bitte echte Website- und Uni-GitLab-Adressen eintragen.');
  }
}
