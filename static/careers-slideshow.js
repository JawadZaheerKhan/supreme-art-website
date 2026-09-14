(() => {
  const gallery = document.querySelector('[data-careers-slideshow]');
  if (!gallery) return;
  const photos = [...gallery.querySelectorAll('.careers-slideshow__photo')];
  const caption = gallery.querySelector('[data-slide-caption]');
  const pause = gallery.querySelector('[data-slide-pause]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = motion.matches;
  let timer;
  const show = (next) => {
    index = (next + photos.length) % photos.length;
    photos.forEach((photo, i) => {
      photo.classList.toggle('is-active', i === index);
      photo.setAttribute('aria-hidden', String(i !== index));
    });
    photos[index].loading = 'eager';
    photos[(index + 1) % photos.length].loading = 'eager';
    caption.textContent = photos[index].alt + ' · ' + (index + 1) + ' / ' + photos.length;
  };
  const schedule = () => {
    clearInterval(timer);
    pause.textContent = paused ? 'Play' : 'Pause';
    pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    if (!paused && !document.hidden && !gallery.matches(':hover') && !gallery.contains(document.activeElement)) {
      timer = setInterval(() => show(index + 1), 4500);
    }
  };
  gallery.querySelector('.careers-slideshow__controls').hidden = photos.length < 2;
  gallery.querySelector('[data-slide-prev]').addEventListener('click', () => { show(index - 1); schedule(); });
  gallery.querySelector('[data-slide-next]').addEventListener('click', () => { show(index + 1); schedule(); });
  pause.addEventListener('click', () => { paused = !paused; schedule(); });
  gallery.addEventListener('mouseenter', schedule);
  gallery.addEventListener('mouseleave', schedule);
  gallery.addEventListener('focusin', schedule);
  gallery.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
  show(0);
  schedule();
})();
