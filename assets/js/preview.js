// Drafts are read only from the editor window that opened this preview.
// Nothing is stored, uploaded or written to the public website.
const parameters = new URLSearchParams(location.search);
if (parameters.get('cms-preview') === '1') {
  let snapshot;
  try {
    if (window.opener && !window.opener.closed && window.opener.location.origin === location.origin) {
      snapshot = window.opener.getWebsitePreview?.();
    }
  } catch { /* A different origin cannot provide or read a draft. */ }

  const notice = document.createElement('aside');
  notice.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:10000;padding:12px 16px;background:#163c32;color:#fff;text-align:center;font:14px/1.5 system-ui';
  notice.textContent = snapshot ? 'Private Vorschau · Änderungen nur in diesem Browser · nichts veröffentlicht. ' : 'Vorschau nicht verfügbar. Bitte im Editor „Website-Vorschau“ öffnen. ';
  if (snapshot) {
    const back = document.createElement('button');
    back.textContent = 'Zurück zum Editor';
    back.style.cssText = 'margin-left:12px;padding:5px 10px;cursor:pointer';
    back.addEventListener('click', () => window.opener?.focus());
    notice.append(back);
    applyPreview(snapshot);
  }
  document.body.append(notice);
}

function applyPreview(snapshot) {
  const base = document.body.dataset.previewBase || '';
  const text = (node, value) => { if (node) node.textContent = value ?? ''; };
  const copyScope = (node, example) => {
    for (const attr of example?.attributes || []) if (attr.name.startsWith('data-astro-cid-')) node.setAttribute(attr.name, '');
    return node;
  };
  const element = (tag, example) => copyScope(document.createElement(tag), example);
  function localPath(path) { return base && !path.startsWith(`${base}/`) ? `${base}${path}` : path; }
  function safeURL(value, mail = false) {
    if (typeof value !== 'string' || !value) return '';
    try {
      const url = new URL(value.startsWith('/') && !value.startsWith('//') ? localPath(value) : value, location.href);
      if (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) || (url.protocol === 'blob:' && url.origin === location.origin) || (mail && url.protocol === 'mailto:')) return url.href;
    } catch { /* Incomplete fields stay empty in the preview. */ }
    return '';
  }
  function link(node, value, mail = false) {
    if (!node) return;
    const url = safeURL(value, mail);
    if (url) node.setAttribute('href', url); else node.removeAttribute('href');
  }
  function list(node, items) {
    if (!node) return;
    const example = node.firstElementChild || node;
    node.replaceChildren(...(items || []).map(value => { const li = element('li', example); text(li, value); return li; }));
  }
  const mediaExample = document.querySelector('figure.media');
  const projectExample = document.querySelector('article.page');
  function media(item = {}, full = false) {
    const figure = element('figure', mediaExample);
    figure.className = `media${item.paper ? ' paper' : ''}${item.interactive ? ' live' : ''}${item.video || item.video_file ? ' clip' : ''}`;
    if (item.interactive) {
      const template = document.querySelector(`template[data-preview-figure="${CSS.escape(item.interactive)}"]`);
      if (template) figure.append(template.content.cloneNode(true));
      if (!full) { figure.querySelector('.hbdia')?.classList.add('compact'); figure.querySelector('.threshold')?.remove(); }
    } else if (item.video || item.video_file) {
      const video = element('video', mediaExample);
      video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
      video.setAttribute('aria-label', item.alt || '');
      const mp4 = safeURL(item.video_file || `${item.video}.h264.mp4`);
      if (mp4) video.dataset.h264 = mp4;
      if (!item.video_file) video.dataset.av1 = safeURL(`${item.video}.av1.mp4`);
      video.dataset.poster = safeURL(item.video_file ? item.poster : `${item.video}.webp`);
      figure.append(video);
    } else if (item.image) {
      const image = element('img', mediaExample);
      const src = safeURL(item.image);
      if (src) image.src = src;
      image.alt = item.alt || ''; image.loading = 'lazy'; image.decoding = 'async';
      figure.append(image);
    }
    if (full) { const caption = element('figcaption', projectExample); text(caption, item.caption); figure.append(caption); }
    return figure;
  }

  const profile = snapshot.profile;
  if (profile) {
    text(document.querySelector('.brand .name'), profile.name);
    const heading = document.querySelector('#hero-name');
    if (heading) heading.replaceChildren(document.createTextNode(profile.name_first || ''), document.createElement('br'), document.createTextNode(profile.name_last || ''));
    text(document.querySelector('#contact .about .text'), profile.about);
    text(document.querySelector('#contact .muted'), profile.contact_intro);
    const email = document.querySelector('#contact a.big');
    text(email, profile.email); link(email, `mailto:${profile.email || ''}`, true);
    link(document.querySelector('#contact a[href*="linkedin"]'), profile.linkedin);
    link(document.querySelector('#contact a[href*="github"]'), profile.github);
    for (const anchor of document.querySelectorAll('.cv-links a')) link(anchor, profile.cv_file);
    text(document.querySelector('.page .about'), profile.about);
    text(document.querySelector('.footer .row span'), `© ${new Date().getFullYear()} ${profile.name || ''}`);
    if (profile.page_title) document.title = profile.page_title;
  }
  const home = snapshot.home;
  if (home && document.querySelector('.hero')) {
    for (const [selector, key] of Object.entries({ '.title .kicker': 'kicker', '.title .sub': 'subtitle', '#projects h2': 'projects_title', '#projects .intro': 'projects_intro', '.cta h2': 'cv_title', '.cta p': 'cv_intro' })) text(document.querySelector(selector), home[key]);
    document.querySelectorAll('.beat').forEach((beat, index) => {
      const highlight = home.highlights?.[index]; if (!highlight) return;
      text(beat.querySelector('.label'), highlight.label); text(beat.querySelector('.line'), highlight.description);
      const pair = beat.querySelector('.pair'); if (!pair) return;
      pair.replaceChildren(...(highlight.logos || []).map(logo => {
        const figure = element('figure', beat), image = element('img', beat), caption = element('figcaption', beat);
        image.className = `logo ${['eth', 'fzj', 'sq'].includes(logo.style) ? logo.style : 'sq'}`;
        const src = safeURL(logo.image); if (src) image.src = src;
        image.alt = logo.alt || ''; image.decoding = 'async'; figure.append(image);
        if (logo.caption) { text(caption, logo.caption); figure.append(caption); }
        return figure;
      }));
    });
    const skills = document.querySelector('.skills'), example = skills?.firstElementChild;
    if (skills) skills.replaceChildren(...[...(home.glyph_skills || []), ...(home.more_skills || [])].map((value, index) => {
      const box = element('span', example); box.className = `box${index >= 18 ? ' extra' : ''}`; box.dataset.k = index; text(box, value); return box;
    }));
    text(document.querySelector('.hero p.visually-hidden'), `Skills: ${[...(home.glyph_skills || []), ...(home.more_skills || [])].join(', ')}.`);
  }

  const projects = [...(snapshot.projects || [])].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  const fallback = snapshot.projectFallback;
  const projectURL = project => {
    const url = new URL(localPath(project.url || fallback), location.origin);
    url.searchParams.set('cms-preview-project', project.slug);
    return url.href;
  };
  const grid = document.querySelector('#projects .grid');
  if (grid) {
    const cardExample = grid.querySelector('.card');
    grid.replaceChildren(...projects.map(project => {
      const item = project.data, card = cardExample.cloneNode(true);
      text(card.querySelector('.kicker'), item.kicker); text(card.querySelector('h3 a'), item.title); text(card.querySelector('.short'), item.short);
      card.querySelectorAll('a').forEach(anchor => { anchor.href = projectURL(project); });
      list(card.querySelector('.tags'), (item.tech || []).slice(0, 4));
      const cover = item.cover && ['image', 'video', 'video_file', 'interactive'].some(key => item.cover[key]) ? item.cover : item.media?.[0];
      card.querySelector('.media')?.replaceWith(media(cover));
      return card;
    }));
  }

  const selectedSlug = parameters.get('cms-preview-project');
  const path = location.pathname.slice(base.length);
  const selected = projects.find(project => project.slug === selectedSlug || (!selectedSlug && project.url === path));
  if (selected && path.startsWith('/projects/')) {
    const item = selected.data, article = document.querySelector('article.page');
    text(article.querySelector('.kicker'), item.kicker); text(article.querySelector('h1'), item.title); text(article.querySelector('.lead'), item.summary);
    document.title = `${item.title || 'Projekt'} · ${profile?.name || ''}`;
    article.querySelector('.gallery')?.replaceChildren(...(item.media || []).map(value => media(value, true)));
    for (const [title, key] of Object.entries({ 'My contribution': 'contribution', 'Results': 'results', 'Technologies': 'tech' })) {
      const section = [...article.querySelectorAll('section')].find(section => section.querySelector('h2')?.textContent === title);
      list(section?.querySelector('ul'), item[key]);
    }
    const links = article.querySelector('ul.links'), linkExample = links?.firstElementChild;
    if (links) links.replaceChildren(...(item.links || []).map(value => {
      const li = linkExample ? linkExample.cloneNode(true) : element('li', article);
      let anchor = li.querySelector('a'); if (!anchor) { anchor = element('a', article); anchor.className = 'btn'; li.append(anchor); }
      text(anchor, `${value.label || ''} ↗`); link(anchor, value.href); return li;
    }));
    article.querySelector('.viewer')?.closest('section')?.remove();
    if (item.viewer?.length) {
      const section = element('section', article), heading = element('h2', article);
      text(heading, 'Explore the trees in 3D'); section.append(heading);
      const template = document.querySelector('template[data-preview-viewer]');
      if (template) {
        const viewer = template.content.firstElementChild.cloneNode(true);
        viewer.dataset.scenes = JSON.stringify(item.viewer); viewer.dataset.baseurl = base;
        const tabs = viewer.querySelector('.tabs');
        tabs.replaceChildren(...item.viewer.map((scene, index) => {
          const button = element('button', viewer), number = element('span', viewer); number.className = 'n'; text(number, index + 1);
          button.setAttribute('role', 'tab'); button.setAttribute('aria-selected', String(index === 0)); button.dataset.i = index;
          button.append(number, document.createTextNode(`${scene.dataset || ''} · ${scene.short || ''}`)); return button;
        }));
        text(viewer.querySelector('[data-note]'), `${item.viewer[0].note || ''} ${item.viewer[0].particles || ''} particles`);
        section.append(viewer); article.querySelector('.gallery').after(section);
      }
    }
    if (selected.bodyHtml !== undefined) {
      let content = article.querySelector('.prose-content');
      if (!content) { content = element('section', article); content.className = 'prose-content'; article.querySelector('.next').before(content); }
      content.replaceChildren(safeMarkup(selected.bodyHtml));
    }
    const next = projects[(projects.indexOf(selected) + 1) % projects.length];
    const nextLink = article.querySelector('.next'); if (next && nextLink) { nextLink.href = projectURL(next); text(nextLink.querySelector('strong'), next.data.title); }
  }

  if (snapshot.legal && path.startsWith('/legal/')) {
    const article = document.querySelector('article'), example = article.querySelector('p'), heading = article.querySelector('h1').cloneNode(true);
    text(heading, snapshot.legal.title); article.replaceChildren(heading);
    for (const section of snapshot.legal.sections || []) {
      const title = element('h2', example); text(title, section.title); article.append(title);
      for (const paragraph of section.paragraphs || []) { const p = element('p', example); text(p, paragraph); article.append(p); }
    }
  }

  // Keep private navigation in the preview tab. Regular URLs have no draft.
  for (const anchor of document.querySelectorAll('a[href]')) {
    const url = new URL(anchor.href, location.href);
    if (url.origin === location.origin && url.pathname.startsWith(`${base}/`) && !url.pathname.startsWith(`${base}/admin/`) && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) && !anchor.hasAttribute('download')) {
      url.searchParams.set('cms-preview', '1'); anchor.href = url.href;
    }
  }
  document.querySelector('meta[name="robots"]')?.remove();
  const robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex,nofollow'; document.head.append(robots);

  function safeMarkup(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const allowed = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'PRE', 'CODE', 'BLOCKQUOTE', 'A', 'IMG', 'BR', 'HR', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'DEL', 'S']);
    function clean(source) {
      if (source.nodeType === Node.TEXT_NODE) return document.createTextNode(source.textContent);
      if (source.nodeType !== Node.ELEMENT_NODE || ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'TEMPLATE'].includes(source.tagName)) return document.createDocumentFragment();
      const result = allowed.has(source.tagName) ? document.createElement(source.tagName.toLowerCase()) : document.createDocumentFragment();
      if (source.tagName === 'A') { link(result, source.getAttribute('href')); result.setAttribute('rel', 'noopener'); }
      if (source.tagName === 'IMG') { const src = safeURL(source.getAttribute('src')); if (src) result.src = src; result.alt = source.getAttribute('alt') || ''; }
      for (const child of source.childNodes) result.append(clean(child));
      return result;
    }
    const fragment = document.createDocumentFragment(); for (const child of parsed.body.childNodes) fragment.append(clean(child)); return fragment;
  }
}
