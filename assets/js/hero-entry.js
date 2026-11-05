const scene = document.getElementById('top');
if (scene) {
  const start = () => import('./hero/main.js').then(({ init }) => init(scene));
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 600 });
  else setTimeout(start, 100);
}
