// Glass photos: the highlight follows the cursor; frames marked data-glass="fit" are sized to the photo they hold,
// so the glass covers the picture and not the empty part of its cell.
(() => {
  const frames = [...document.querySelectorAll(".glass-photo")];
  if (!frames.length) return;
  frames.forEach(frame => {
    frame.addEventListener("pointermove", event => {
      const r = frame.getBoundingClientRect();
      if (!r.width || !r.height) return;
      frame.style.setProperty("--mx", ((event.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      frame.style.setProperty("--my", ((event.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
  });
  const fits = frames.filter(f => f.dataset.glass === "fit");
  if (!fits.length) return;
  const wide = matchMedia("(min-width: 901px)");
  function fit(frame) {
    const img = frame.querySelector("img"), cell = frame.parentElement;
    if (!img || !img.naturalWidth) return;
    if (!wide.matches) { frame.style.width = ""; frame.style.height = ""; return; }
    const cs = getComputedStyle(cell);
    // the room the cell gives the photo: its grid row minus the caption
    const cap = cell.querySelector("figcaption");
    const gap = parseFloat(cs.rowGap) || 0;
    const availW = cell.clientWidth, availH = cell.clientHeight - (cap ? cap.offsetHeight + gap : 0);
    const s = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
    frame.style.width = Math.floor(img.naturalWidth * s) + "px";
    frame.style.height = Math.floor(img.naturalHeight * s) + "px";
  }
  const fitAll = () => fits.forEach(fit);
  fits.forEach(frame => { const img = frame.querySelector("img"); if (img && !img.complete) img.addEventListener("load", () => fit(frame)); });
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(fitAll); fits.forEach(f => ro.observe(f.parentElement)); }
  addEventListener("resize", fitAll);
  fitAll();
})();
