(() => {
  const button = document.querySelector('[data-enquiry-button]');
  if (!button) return;
  let touchActivation = false;
  let opening = false;
  button.addEventListener('pointerdown', event => {
    touchActivation = event.pointerType === 'touch' || event.pointerType === 'pen';
  });
  button.addEventListener('click', event => {
    const touch = touchActivation || (event.detail > 0 && matchMedia('(hover: none)').matches);
    touchActivation = false;
    if (opening) {
      event.preventDefault();
      return;
    }
    if (!touch) return;
    event.preventDefault();
    opening = true;
    button.classList.add('is-expanded');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Let the glass tab finish expanding, then use the form's normal validation
    // and email composition flow without requiring another tap.
    setTimeout(() => {
      opening = false;
      button.form.requestSubmit(button);
    }, reducedMotion ? 0 : 1100);
  });
  document.addEventListener('pointerdown', event => {
    if (!opening && !button.contains(event.target)) button.classList.remove('is-expanded');
  });
  button.addEventListener('blur', () => {
    if (!opening) button.classList.remove('is-expanded');
  });
  button.addEventListener('keydown', event => {
    if (!opening && event.key === 'Escape') button.classList.remove('is-expanded');
  });
})();
