/* Homepage hero: the "WELCOME to Yifan's Portfolio" artwork sits inside the
   iBook screen. This is the user's own final cutout, auto-sliced into its
   natural connected clusters (never force-cut through a solid letter — where
   letters visually touch/overlap in the artwork itself, like "ELCO" or "ME",
   they stay one piece and sway together; separated letters get their own
   independent sway + mouse-follow drift). */

window.WELCOME_PIECES = {
  canvasW: 2503, canvasH: 1490,
  dust: "welcome-dust.webp",
  items: [
    { file: "welcome-pieces/q1.webp", left: 32.201, top: 0, w: 39.912 },
    { file: "welcome-pieces/q2.webp", left: 0, top: 5.973, w: 35.877 },
    { file: "welcome-pieces/q3.webp", left: 69.037, top: 5.57, w: 30.204 },
    { file: "welcome-pieces/q4.webp", left: 47.863, top: 37.517, w: 9.748 },
    { file: "welcome-pieces/q5.webp", left: 15.302, top: 44.027, w: 7.631 },
    { file: "welcome-pieces/q6.webp", left: 33.44, top: 41.477, w: 12.026 },
    { file: "welcome-pieces/q7.webp", left: 43.628, top: 39.463, w: 5.993 },
    { file: "welcome-pieces/q8.webp", left: 53.935, top: 44.161, w: 18.018 },
    { file: "welcome-pieces/q9.webp", left: 71.035, top: 40.336, w: 3.476 },
    { file: "welcome-pieces/q10.webp", left: 21.215, top: 47.248, w: 10.707 },
    { file: "welcome-pieces/q11.webp", left: 72.193, top: 46.242, w: 7.911 },
    { file: "welcome-pieces/q12.webp", left: 43.108, top: 64.295, w: 16.42 },
    { file: "welcome-pieces/q13.webp", left: 66.121, top: 64.497, w: 6.352 },
    { file: "welcome-pieces/q14.webp", left: 72.034, top: 65.839, w: 16.38 },
    { file: "welcome-pieces/q15.webp", left: 10.148, top: 66.711, w: 23.052 },
    { file: "welcome-pieces/q16.webp", left: 31.682, top: 66.51, w: 18.138 },
    { file: "welcome-pieces/q17.webp", left: 55.533, top: 71.678, w: 11.546 },
  ],
};

window.renderWelcomePieces = function (containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const data = window.WELCOME_PIECES;
  const base = "assets/img/hero/";
  let html = `<img class="wp-dust" src="${base}${data.dust}" alt="" aria-hidden="true">`;
  html += data.items
    .map((p, i) => {
      // Amplitude/rotation kept small on purpose: pieces are cropped tight
      // to their own letterforms, and where two pieces visually touch in
      // the source artwork, drifting them too far out of phase with each
      // other reveals a gap of bare background between them. Small drift
      // still reads as "independent floating" without letters pulling
      // apart from their neighbors.
      const dur = (3.6 + (i % 5) * 0.45).toFixed(2);
      const delay = ((i % 7) * 0.28).toFixed(2);
      const amp = -(2 + (i % 4) * 1);
      const rot = (0.2 + (i % 5) * 0.12).toFixed(2);
      return `<img class="wp-piece" src="${base}${p.file}" alt="" data-piece="${i}" style="left:${p.left}%; top:${p.top}%; width:${p.w}%; --dur:${dur}s; --delay:${delay}s; --amp:${amp}px; --rot:${rot}deg;">`;
    })
    .join("");
  wrap.innerHTML = html;
};
