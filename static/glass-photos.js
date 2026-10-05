// Photo loupe: a round lens that magnifies the spot under the cursor. Frames marked data-glass="fit" are first
// sized to the photo they hold, so the lens maps exactly onto the picture.
(() => {
  const frames = [...document.querySelectorAll(".glass-photo")];
  if (!frames.length || matchMedia("(hover: none)").matches) return;
  frames.forEach(frame => {
    const img = frame.querySelector("img");
    if (!img) return;
    const lens = document.createElement("span");
    lens.className = "loupe";
    lens.setAttribute("aria-hidden", "true");
    frame.appendChild(lens);
    const zoom = parseFloat(getComputedStyle(frame).getPropertyValue("--zoom")) || 2.2;
    function move(event) {
      const r = frame.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = event.clientX - r.left, y = event.clientY - r.top;
      const size = lens.offsetWidth || 170;
      frame.style.setProperty("--lens-img", `url("${img.currentSrc || img.src}")`);
      frame.style.setProperty("--bgw", (r.width * zoom) + "px");
      frame.style.setProperty("--bgh", (r.height * zoom) + "px");
      frame.style.setProperty("--bgx", (size / 2 - x * zoom) + "px");
      frame.style.setProperty("--bgy", (size / 2 - y * zoom) + "px");
      frame.style.setProperty("--lx", x + "px");
      frame.style.setProperty("--ly", y + "px");
    }
    frame.addEventListener("pointerenter", event => { move(event); frame.classList.add("is-lensing"); });
    frame.addEventListener("pointermove", move);
    frame.addEventListener("pointerleave", () => frame.classList.remove("is-lensing"));
  });
  const fits = frames.filter(f => f.dataset.glass === "fit");
  if (!fits.length) return;
  const wide = matchMedia("(min-width: 901px)");
  function fit(frame) {
    const img = frame.querySelector("img"), cell = frame.parentElement;
    if (!img || !img.naturalWidth) return;
    if (!wide.matches) { frame.style.width = ""; frame.style.height = ""; return; }
    const cap = cell.querySelector("figcaption");
    const gap = parseFloat(getComputedStyle(cell).rowGap) || 0;
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
