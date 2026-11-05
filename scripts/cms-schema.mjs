const text = (name, label, extra = {}) => ({ name, label, widget: 'string', ...extra });
const list = (name, label, extra = {}) => ({ name, label, widget: 'list', field: text('value', 'Text'), ...extra });
const image = (name, label, extra = {}) => ({ name, label, widget: 'image', required: false, ...extra });
const url = (name, label) => text(name, label, { pattern: ['^https://[^\\s]+$', 'Bitte eine vollständige HTTPS-Adresse eingeben.'] });
const mediaFields = [
  image('image', 'Bild'), text('alt', 'Alternativtext', { hint: 'Beschreibt das Bild für Menschen mit Sehbehinderung.' }),
  text('caption', 'Bildunterschrift', { widget: 'text', required: false }),
  { name: 'paper', label: 'Heller Rahmen für Diagramme', widget: 'boolean', default: false, required: false },
  { name: 'video_file', label: 'Video (MP4)', widget: 'file', required: false, media_library: { config: { multiple: false } } },
  image('poster', 'Vorschaubild für Video'),
  text('video', 'Vorbereitete Video-Serie (optional)', { required: false, hint: 'Für bestehende AV1/H264-Dateien: Pfad ohne Endung, z. B. /media/projects/adaptive-trees. Sonst das MP4-Feld verwenden.' }),
  { name: 'interactive', label: 'Interaktive Abbildung (optional)', widget: 'select', required: false, options: [{ label: 'HBDIA', value: 'hbdia' }, { label: 'HPCG Speedup', value: 'hpcg-speedup' }, { label: 'HPCG Weak Scaling', value: 'hpcg-weak-scaling' }, { label: 'Box Colouring', value: 'box-colouring' }] },
];
export const collections = [
  { name: 'settings', label: 'Website', files: [
    { name: 'profile', label: 'Profil, Kontakt und CV', file: '_data/profile.json', format: 'json', fields: [
      text('name', 'Vollständiger Name'), text('name_first', 'Erste Namenszeile'), text('name_last', 'Zweite Namenszeile'),
      text('email', 'E-Mail-Adresse', { pattern: ['^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', 'Bitte eine E-Mail-Adresse eingeben.'] }),
      url('github', 'GitHub-Adresse'), url('linkedin', 'LinkedIn-Adresse'),
      { name: 'cv_file', label: 'Lebenslauf (PDF)', widget: 'file', hint: 'Hier die neue PDF-Datei hochladen oder auswählen.' },
      text('page_title', 'Titel der Startseite (Suchmaschinen)'), text('description', 'Beschreibung (Suchmaschinen)', { widget: 'text' }),
      text('about', 'Über mich', { widget: 'text' }), text('contact_intro', 'Einleitung Kontaktbereich', { widget: 'text' }),
    ] },
    { name: 'home', label: 'Startseite und Animation', file: '_data/home.json', format: 'json', fields: [
      text('kicker', 'Themenzeile'), text('subtitle', 'Untertitel'), text('projects_title', 'Überschrift Projekte'),
      text('projects_intro', 'Einleitung Projekte', { widget: 'text' }), text('cv_title', 'Überschrift CV'), text('cv_intro', 'Einleitung CV'),
      list('glyph_skills', '18 Begriffe für die CV-Animation', { min: 18, max: 18, hint: 'Die Animation benötigt genau 18 Begriffe.' }),
      list('more_skills', 'Weitere Fähigkeiten'),
      { name: 'highlights', label: 'Drei Stationen der Animation', widget: 'list', min: 3, max: 3, fields: [
        text('label', 'Überschrift'), text('description', 'Beschreibung', { widget: 'text', required: false }),
        { name: 'logos', label: 'Logos', widget: 'list', min: 1, max: 2, fields: [image('image', 'Logo', { required: true }), text('alt', 'Bezeichnung'), text('caption', 'Bildunterschrift', { required: false }), { name: 'style', label: 'Darstellung', widget: 'select', options: [{ label: 'Breites Logo', value: 'eth' }, { label: 'Mittleres Logo', value: 'fzj' }, { label: 'Kompaktes Logo', value: 'sq' }] }] },
      ] },
    ] },
    { name: 'legal', label: 'Datenschutz und Bildnachweise', file: '_data/legal.json', format: 'json', fields: [text('title', 'Seitentitel'), { name: 'sections', label: 'Abschnitte', widget: 'list', fields: [text('title', 'Überschrift'), list('paragraphs', 'Absätze', { field: { name: 'paragraph', label: 'Absatz', widget: 'text' } })] }] },
  ] },
  { name: 'projects', label: 'Projekte', label_singular: 'Projekt', folder: '_projects', create: true, delete: true, extension: 'md', format: 'frontmatter', slug: '{{slug}}', summary: '{{title}}', sortable_fields: ['order', 'title'], preview_path: 'projects/{{slug}}/', fields: [
    text('title', 'Titel'), { name: 'order', label: 'Reihenfolge', widget: 'number', value_type: 'int', min: 1, default: 1 },
    text('kicker', 'Kategorie / Zeitraum'), text('short', 'Kurzbeschreibung', { widget: 'text' }), text('summary', 'Einleitung', { widget: 'text' }),
    list('contribution', 'Mein Beitrag'), list('results', 'Ergebnisse'), list('tech', 'Technologien'),
    { name: 'links', label: 'Weiterführende Links', widget: 'list', fields: [text('label', 'Beschriftung'), url('href', 'HTTPS-Adresse')] },
    { name: 'media', label: 'Bilder, Videos und Abbildungen', widget: 'list', min: 1, fields: mediaFields },
    { name: 'cover', label: 'Abweichendes Bild auf der Startseite', widget: 'object', required: false, collapsed: true, fields: mediaFields.map(field => ({ ...field, required: false })) },
    { name: 'viewer', label: 'Optionale 3D-Szenen', widget: 'list', required: false, collapsed: true, fields: [text('url', 'Szenendatei', { pattern: ['^/media/viewer/[a-zA-Z0-9._-]+\\.html$', 'Bitte eine vorhandene HTML-Szene unter /media/viewer/ angeben.'] }), text('dataset', 'Datensatz'), text('short', 'Kurzname'), text('note', 'Beschreibung', { widget: 'text' }), text('particles', 'Anzahl Partikel')] },
    { name: 'body', label: 'Zusätzlicher Inhalt', widget: 'markdown', required: false },
  ] },
];
function editorConfiguration(siteUrl) {
  const base = new URL(siteUrl).pathname.replace(/\/$/, '');
  return { locale: 'de', publish_mode: 'editorial_workflow', media_folder: 'uploads', public_folder: '/uploads', site_url: siteUrl, display_url: siteUrl, logo_url: `${base}/icon.svg`, show_preview_links: false, collections };
}
export function cmsConfiguration({ repo, branch, siteUrl, gitlabUrl, applicationId }) {
  return { backend: { name: 'gitlab', repo, branch, auth_type: 'pkce', app_id: applicationId, api_root: `${gitlabUrl}/api/v4`, base_url: gitlabUrl, auth_endpoint: 'oauth/authorize' }, ...editorConfiguration(siteUrl) };
}
export function demoCmsConfiguration(siteUrl) {
  return { backend: { name: 'test-repo' }, ...editorConfiguration(siteUrl) };
}
