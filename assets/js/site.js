import './preview.js';
import { whenNear } from './lib/scroll.js';

// Keep the original lazy video loading and interactive HBDIA illustration.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const av1 = document.createElement('video').canPlayType('video/mp4; codecs="av01.0.05M.08"') === 'probably';
const observer = new IntersectionObserver(records => {
  for (const record of records) {
    const video = record.target;
    if (record.isIntersecting && !video.src) {
      video.poster = video.dataset.poster;
      video.src = av1 && video.dataset.av1 ? video.dataset.av1 : video.dataset.h264;
    }
    if (!reduce && record.intersectionRatio > 0.4) video.play().catch(() => {});
    else video.pause();
  }
}, { threshold: [0, 0.4], rootMargin: '200px 0px' });
document.querySelectorAll('video[data-h264]').forEach(video => observer.observe(video));
document.querySelectorAll('[data-hbdia]').forEach(element => whenNear(element, () => import('./hbdia.js').then(m => m.mount(element)), '50% 0px'));
for (const element of document.querySelectorAll('[data-speedup], [data-weak]')) {
  const io = new IntersectionObserver(records => {
    if (records[0].isIntersecting) { element.classList.add('is-in'); io.disconnect(); }
  }, { threshold: 0.3 });
  io.observe(element);
}

// Editable viewer captions are text, never interpreted as HTML.
for (const root of document.querySelectorAll('[data-viewer]')) {
  const scenes = JSON.parse(root.dataset.scenes);
  const stage = root.querySelector('[data-stage]');
  const start = root.querySelector('[data-start]');
  const note = root.querySelector('[data-note]');
  const expand = root.querySelector('[data-expand]');
  const tabs = [...root.querySelectorAll('[role=tab]')];
  let current = 0;
  let loaded = false;
  function show(index) {
    current = index;
    tabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === index)));
    const count = document.createElement('span');
    count.className = 'mono'; count.textContent = `${scenes[index].particles} particles`;
    note.replaceChildren(document.createTextNode(`${scenes[index].note} `), count);
    if (!loaded) return;
    stage.querySelector('iframe')?.remove();
    const frame = document.createElement('iframe');
    const url = new URL(`${root.dataset.baseurl}${scenes[index].url}`, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith(`${root.dataset.baseurl}/media/viewer/`)) return;
    frame.src = url.href; frame.title = `3D tree viewer: ${tabs[index].textContent.trim()}`;
    frame.allow = 'fullscreen'; stage.prepend(frame);
  }
  root.querySelector('[data-load]').addEventListener('click', () => { loaded = true; start.remove(); expand.hidden = false; show(current); });
  tabs.forEach((tab, i) => tab.addEventListener('click', () => show(i)));
  expand.addEventListener('click', () => stage.requestFullscreen?.());
}

for (const root of document.querySelectorAll('[data-boxc]')) {
  const cells = [...root.querySelectorAll('.cell')];
  const stencil = root.querySelector('.stencil');
  const sweepLabel = root.querySelector('[data-sweep]');
  const info = root.querySelector('[data-info]');
  const button = root.querySelector('[data-play]');
  const idle = info.textContent.trim();
  let sweep = 0, timer = 0, playing = !reduce;
  const show = index => {
    sweep = index; root.classList.add('sweeping');
    cells.forEach(cell => { cell.classList.toggle('now', Number(cell.dataset.c) === index); cell.classList.toggle('done', Number(cell.dataset.c) < index); });
    sweepLabel.textContent = `Sweep ${index + 1} of 9: ${cells.filter(cell => Number(cell.dataset.c) === index).length} points updated at once`;
  };
  const stopTimer = () => { clearInterval(timer); timer = 0; };
  const startTimer = () => { stopTimer(); timer = setInterval(() => show((sweep + 1) % 9), 900); };
  button.addEventListener('click', () => {
    playing = !playing; button.textContent = playing ? 'Pause' : 'Play sweeps'; button.setAttribute('aria-pressed', String(!playing));
    if (playing) startTimer(); else stopTimer();
  });
  const svg = root.querySelector('svg');
  svg.addEventListener('pointerover', event => {
    const cell = event.target.closest('.cell'); if (!cell) return;
    const i = Number(cell.dataset.i), j = Number(cell.dataset.j), colour = Number(cell.dataset.c);
    root.classList.add('probing'); cells.forEach(c => c.classList.toggle('same', Number(c.dataset.c) === colour));
    stencil.setAttribute('x', String(Number(root.dataset.pad) + (i - 1) * Number(root.dataset.cell)));
    stencil.setAttribute('y', String(Number(root.dataset.pad) + (j - 1) * Number(root.dataset.cell)));
    stencil.classList.add('on'); info.textContent = `Point (${i}, ${j}) has colour ${colour + 1}. Its stencil reads 8 neighbours, all with other colours.`;
  });
  svg.addEventListener('pointerleave', () => { root.classList.remove('probing'); stencil.classList.remove('on'); info.textContent = idle; });
  new IntersectionObserver(records => { if (records[0].isIntersecting && playing) startTimer(); else stopTimer(); }).observe(root);
  show(0);
  if (reduce) { button.textContent = 'Play sweeps'; button.setAttribute('aria-pressed', 'true'); }
}
