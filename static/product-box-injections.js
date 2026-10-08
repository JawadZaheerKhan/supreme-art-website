// Face coordinates refer to the supplied, unmodified product photographs.
// Reuse the shared projective-texture renderer and accessible rotation controls.
window.productBoxInjectionBoxes = {
  tuff: {
    width: 208, height: 290, depth: 78, ext: '.jpg',
    sources: { top: 'left' },
    faces: [
      ['front', [[279,488],[624,488],[621,959],[290,956]], 624,870],
      ['left', [[318,494],[437,508],[442,935],[336,908]], 234,870],
      ['right', [[498,433],[622,429],[617,857],[498,880]], 234,870],
      ['top', [[383,458],[568,451],[616,467],[430,496]], 624,234]
    ]
  },
  norbac: {
    width: 208, height: 290, depth: 82, ext: '.jpg',
    sources: { top: 'left' },
    faces: [
      ['front', [[316,422],[645,427],[637,884],[316,883]], 624,870],
      ['left', [[335,424],[472,438],[488,907],[354,887]], 246,870],
      ['right', [[543,446],[654,440],[630,895],[520,917]], 246,870],
      ['top', [[387,401],[622,393],[580,414],[447,430]], 624,246]
    ]
  }
};
