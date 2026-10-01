// Keep the gentle live photo zoom, pausing it when its photo is off screen.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      target.style.animationPlayState = isIntersecting ? 'running' : 'paused';
    });
  });
  document.querySelectorAll('.process-photo-frame img').forEach(image => {
    image.style.animationPlayState = 'paused';
    observer.observe(image);
  });
})();
