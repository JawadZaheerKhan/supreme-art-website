// Year
document.getElementById('year').textContent = new Date().getFullYear();

// CMYK loader — hide after first paint
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 900);
});

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Animated stat counters
const countEls = document.querySelectorAll('[data-count]');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
countEls.forEach((el) => countIO.observe(el));

// "Run the press" — speed up one print cycle
const printBtn = document.getElementById('printBtn');
const printer = document.querySelector('.printer');
if (printBtn && printer) {
  printBtn.addEventListener('click', () => {
    printer.classList.add('printing');
    printBtn.textContent = 'Printing…';
    setTimeout(() => {
      printer.classList.remove('printing');
      printBtn.textContent = 'Run the press ▸';
    }, 2700);
  });
}
