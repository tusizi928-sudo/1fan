/* Shared renderers: hero scatter photos + category-grouped project galleries. */

function playIconSm() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}

/* Normalise both project data shapes (sections vs flat media) into one entry list. */
window.collectEntries = function (p) {
  if (p.sections) {
    return p.sections.map((s) => ({
      title: s.title || null,
      caption: s.caption,
      items: s.video
        ? [{ type: "video", src: s.video.src, poster: s.video.poster }]
        : s.images.map((src) => ({ type: "image", src })),
    }));
  }
  return p.media.map((m) => ({
    title: null,
    caption: m.caption,
    items: [{ type: m.type, src: m.src, poster: m.poster }],
  }));
};

window.flattenEntries = function (entries) {
  const flat = [];
  entries.forEach((e) => {
    e.items.forEach((item) => flat.push({ ...item, caption: e.caption, entryTitle: e.title }));
  });
  return flat;
};

/* Small photos orbiting/wobbling around the "Welcome" hero text. */
window.HERO_SCATTER_IMAGES = [
  { src: "assets/img/hero/tiger.webp", projectId: "ikea-ecomat" },
  { src: "assets/img/hero/mirrorlake-title.webp", projectId: "mirror-lake" },
  { src: "assets/img/hero/whale.webp", projectId: "ikea-ecomat" },
  { src: "assets/img/hero/render-orange.webp", projectId: "harmony-of-essence" },
  { src: "assets/img/hero/yinyang-tree.webp", projectId: "rock-clock" },
  { src: "assets/img/hero/butterfly.webp", projectId: "ikea-ecomat" },
  { src: "assets/img/hero/sailboat.webp", projectId: "mirror-lake" },
  { src: "assets/img/hero/render-purple.webp", projectId: "harmony-of-essence" },
];

window.renderHeroScatter = function (containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  // organic mood-board scatter: varied position, size and a fixed tilt per card,
  // clear of the nav bar up top and the centred word
  const slots = [
    [4, 10, 128, -9, 6.2],
    [14, 60, 92, 13, 5.6],
    [27, 8, 76, -6, 6.8],
    [80, 6, 112, 10, 6.0],
    [88, 54, 132, -14, 5.4],
    [66, 78, 82, 8, 6.5],
    [4, 80, 104, -11, 5.9],
    [42, 85, 72, 15, 6.3],
  ];

  el.innerHTML = window.HERO_SCATTER_IMAGES
    .slice(0, slots.length)
    .map((item, i) => {
      const [x, y, w, r, dur] = slots[i % slots.length];
      return `
      <a href="project.html?id=${item.projectId}" class="scatter-item reveal"
         style="--x:${x}%; --y:${y}%; --w:${w}px; --r:${r}deg; --dur:${dur}s; --delay:${(i % 8) * -0.7}s; transition-delay:${(i % 8) * 0.05}s">
        <img src="${item.src}" alt="" loading="lazy">
      </a>`;
    })
    .join("");

  el.querySelectorAll(".scatter-item").forEach((item) => window.observeReveal(item));
};

function mediaThumbHTML(item, flatIdx) {
  if (item.type === "video") {
    return `
      <button class="media-thumb video-thumb" data-idx="${flatIdx}" aria-label="Play video">
        <img src="${item.poster || ""}" alt="" loading="lazy">
        <span class="proj-play big">${window.Lightbox.playIcon()}</span>
      </button>`;
  }
  return `<button class="media-thumb" data-idx="${flatIdx}"><img src="${item.src}" alt="" loading="lazy"></button>`;
}

/* H5 long-poster grid: each design gets its own "phone" frame with an independent
   internal scroll, so the full long-scroll page can be browsed in place rather than
   flattened (and badly cropped) into one static thumbnail. */
window.renderH5Grid = function (h5s, lang) {
  const hint = lang === "zh" ? "↕ 滑动查看完整设计" : "↕ Scroll to see full design";
  return `
    <div class="h5-grid">
      ${h5s
        .map(
          (h) => `
        <div>
          <div class="h5-frame"><div class="h5-frame-scroll"><img src="${h.image}" alt="${h.title[lang]}" loading="lazy"></div></div>
          <div class="h5-frame-label"><span>${h.title[lang]}</span><span class="hint">${hint}</span></div>
        </div>`
        )
        .join("")}
    </div>`;
};

/* How many images sit in each row of a multi-image group, top to bottom.
   Rule of thumb: rows of 2, with any odd remainder folded into one row of 3 at the
   end (4 images -> 2+2, 5 -> 2+3, 7 -> 2+2+3...) so no row is ever left with a single
   lonely image that can't fill the width. The "chanpin" (product design) category
   asks for a stricter rule instead — never more than 2 rows total, splitting the
   images as evenly as possible across those rows (4 -> 2+2, 5 -> 3+2, 6 -> 3+3). */
function rowChunkSizes(n, category) {
  const chunks = [];
  if (category === "chanpin") {
    if (n <= 3) return [n];
    const first = Math.ceil(n / 2);
    return [first, n - first];
  }
  if (n % 2 === 0) {
    for (let i = 0; i < n / 2; i++) chunks.push(2);
    return chunks;
  }
  let remaining = n - 3;
  while (remaining > 0) {
    chunks.push(2);
    remaining -= 2;
  }
  chunks.push(3);
  return chunks;
}

/* Lays out a multi-image ".entry-gallery-row" so its images always fill the full row
   width — never left with a big blank gap on the right — without cropping any of them.
   Row membership is decided purely by count (rowChunkSizes above); within each row the
   shared height is solved from the images' natural aspect ratios so their widths + gaps
   sum to exactly the container width. */
function justifyRow(rowEl) {
  const gap = 18;
  const containerWidth = rowEl.clientWidth;
  if (!containerWidth) return;

  const thumbs = Array.from(rowEl.children).filter((el) => el.classList.contains("media-thumb"));
  if (thumbs.length < 2) return;
  const imgs = thumbs.map((t) => t.querySelector("img"));
  const ratios = imgs.map((img) => {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    return w && h ? w / h : 1.5;
  });

  const sizes = rowChunkSizes(thumbs.length, rowEl.dataset.cat);
  const rows = [];
  let cursor = 0;
  sizes.forEach((size) => {
    const idxs = [];
    for (let i = 0; i < size; i++) idxs.push(cursor++);
    rows.push(idxs);
  });

  // Remove any previous forced row-break spacers before re-inserting.
  rowEl.querySelectorAll(".row-break").forEach((el) => el.remove());

  rows.forEach((idxs, ri) => {
    // A lone leftover image (chanpin's odd-one-out) is allowed to grow taller so it
    // still fills the row width; rows of 2-3 keep a tighter cap to stay in proportion.
    const maxH = idxs.length === 1 ? 640 : 460;
    const gaps = gap * (idxs.length - 1);
    const sum = idxs.reduce((s, i) => s + ratios[i], 0);
    const h = Math.min(maxH, (containerWidth - gaps) / sum);
    idxs.forEach((i) => {
      const w = h * ratios[i];
      thumbs[i].style.width = w + "px";
      thumbs[i].style.height = h + "px";
    });
    if (ri < rows.length - 1) {
      const brk = document.createElement("div");
      brk.className = "row-break";
      thumbs[idxs[idxs.length - 1]].after(brk);
    }
  });
}

window.justifyGalleryRows = function (root) {
  const scope = root || document;
  scope.querySelectorAll(".entry-gallery-row").forEach((rowEl) => {
    const imgs = Array.from(rowEl.querySelectorAll(".media-thumb img"));
    const run = () => justifyRow(rowEl);
    const pending = imgs.filter((img) => !img.complete);
    if (!pending.length) {
      run();
      return;
    }
    let left = pending.length;
    pending.forEach((img) => {
      img.addEventListener("load", () => {
        left -= 1;
        if (left === 0) run();
      });
      img.addEventListener("error", () => {
        left -= 1;
        if (left === 0) run();
      });
    });
  });
};

let justifyResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(justifyResizeTimer);
  justifyResizeTimer = setTimeout(() => window.justifyGalleryRows(), 150);
});

/* Renders a project's entries (from collectEntries) as caption + gallery blocks.
   A single-image entry gets its own full row; a grouped multi-image entry lays its
   images out side by side (each keeping its natural ratio, no crop) so the row fills
   without leaving a gap. Only the current UI language is shown, never both at once. */
window.renderEntryList = function (entries, lang, category) {
  let flatCursor = 0;
  return entries
    .map((e, i) => {
      const startIdx = flatCursor;
      flatCursor += e.items.length;
      const multi = e.items.length > 1;
      const thumbs = e.items.map((item, j) => mediaThumbHTML(item, startIdx + j)).join("");
      // A project with only a single entry (one image/video total) doesn't need a
      // "01 / 01" counter — it's redundant with the project title already shown above.
      // Multi-entry projects still show a title (if any) plus its position in the set.
      const indexLabel =
        entries.length > 1
          ? `${e.title ? e.title[lang] + " — " : ""}${String(i + 1).padStart(2, "0")} / ${String(entries.length).padStart(2, "0")}`
          : e.title
          ? e.title[lang]
          : "";
      return `
      <div class="media-section reveal">
        <div class="section-text">
          ${indexLabel ? `<div class="media-index">${indexLabel}</div>` : ""}
          <p>${e.caption[lang]}</p>
        </div>
        <div class="${multi ? "entry-gallery-row" : "entry-gallery"}"${multi && category ? ` data-cat="${category}"` : ""}>${thumbs}</div>
      </div>`;
    })
    .join("");
};

/* One project rendered in full — title, description, tags, then every entry's
   caption + gallery, exactly like project.html's own detail view. */
function renderProjectBlock(p, lang, num) {
  const entriesHTML = p.h5s
    ? window.renderH5Grid(p.h5s, lang)
    : window.renderEntryList(window.collectEntries(p), lang, p.category);

  return `
    <div class="cat-project reveal" id="project-${p.id}" data-project="${p.id}">
      <div class="cat-project-head">
        <div class="cat-project-title"><span class="num">${String(num).padStart(2, "0")}</span>${p.title[lang]}</div>
        <p class="cat-project-desc">${p.desc[lang]}</p>
        <div class="tag-row">${p.tags[lang].map((t) => `<span>${t}</span>`).join("")}</div>
      </div>
      ${entriesHTML}
    </div>`;
}

function bindCategoryLightbox(wrap) {
  wrap.querySelectorAll(".cat-project").forEach((projectEl) => {
    const p = window.PROJECTS.find((x) => x.id === projectEl.dataset.project);
    if (p.h5s) return; // H5 frames scroll in place — no lightbox to bind.
    const flat = window.flattenEntries(window.collectEntries(p));
    projectEl.querySelectorAll(".media-thumb").forEach((btn) => {
      btn.addEventListener("click", () => window.Lightbox.open(flat, parseInt(btn.dataset.idx, 10)));
    });
  });
}

/* Project galleries grouped under their category heading.
   Pass `onlySlug` to render just one category — nothing else appears in the DOM,
   and the (now redundant) category heading is skipped since the page's own h1 already names it. */
window.renderCategoryGroups = function (containerId, projectList, onlySlug) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const lang = document.documentElement.getAttribute("data-lang") || "zh";
  const cats = onlySlug ? window.CATEGORIES.filter((c) => c.slug === onlySlug) : window.CATEGORIES;

  wrap.innerHTML = cats.map((c) => {
    const items = projectList.filter((p) => p.category === c.slug);
    if (!items.length) return "";
    const heading = onlySlug
      ? ""
      : `
        <div class="cat-group-head">
          <span class="dot" style="background:var(--c-${c.slug})"></span>
          <h3>${lang === "zh" ? c.zh : c.en}</h3>
          <span class="cat-en">${lang === "zh" ? c.en : c.zh}</span>
        </div>`;
    const blocks = items.map((p, i) => renderProjectBlock(p, lang, i + 1)).join("");
    return `<div class="cat-group" id="cat-${c.slug}">${heading}<div class="cat-projects">${blocks}</div></div>`;
  }).join("");

  wrap.querySelectorAll(".cat-project, .cat-group, .media-section").forEach((el) => window.observeReveal(el));
  bindCategoryLightbox(wrap);
  window.justifyGalleryRows(wrap);
};

/* Homepage teaser grid: one tile per category + a photography link, 3 per row. */
window.renderCategoryTiles = function (containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const lang = document.documentElement.getAttribute("data-lang") || "zh";

  const tiles = window.CATEGORIES.map(
    (c) => `
    <a href="work.html?cat=${c.slug}" class="cat-tile reveal" style="--tile-c: var(--c-${c.slug})">
      <div class="cat-tile-num" style="color: var(--c-${c.slug})">${c.num}</div>
      <div class="cat-tile-name">${lang === "zh" ? c.zh : c.en}</div>
      <div class="cat-tile-en">${lang === "zh" ? c.en : c.zh}</div>
    </a>`
  );

  const photoStrings = window.STRINGS.photography;
  tiles.push(`
    <a href="${window.PHOTOGRAPHY_LINK}" target="_blank" rel="noopener" class="cat-tile cat-tile-external reveal">
      <div class="cat-tile-num">★</div>
      <div class="cat-tile-name">${photoStrings.zh_en_label[lang]}</div>
      <div class="cat-tile-en">PHOTOGRAPHY ↗</div>
    </a>`);

  wrap.innerHTML = tiles.join("");
  wrap.querySelectorAll(".cat-tile").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 0.05}s`;
    window.observeReveal(el);
  });
};

/* Homepage showcase: a handful of standout projects picked out from the archive. */
window.renderFeatured = function (containerId, projectList, ids) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const lang = document.documentElement.getAttribute("data-lang") || "zh";

  const cards = ids
    .map((id) => projectList.find((p) => p.id === id))
    .filter(Boolean)
    .map((p, i) => {
      const cat = window.CATEGORIES.find((c) => c.slug === p.category);
      const eyebrow = `${String(i + 1).padStart(2, "0")} · ${cat ? (lang === "zh" ? cat.zh : cat.en) : ""}`;
      return `
      <a href="project.html?id=${p.id}" class="feature-card reveal" style="transition-delay:${i * 0.06}s; --tile-c: var(--c-${p.category})">
        <img src="${p.coverHome || p.cover}" alt="" loading="lazy">
        <div class="feature-card-body">
          <div class="feature-card-eyebrow" style="color: var(--c-${p.category})">${eyebrow}</div>
          <div class="feature-card-title">${p.title[lang]}</div>
          <div class="feature-card-desc">${p.desc[lang]}</div>
        </div>
      </a>`;
    })
    .join("");

  wrap.innerHTML = cards;
  wrap.querySelectorAll(".feature-card").forEach((el) => window.observeReveal(el));
};
