/* Project detail page: renders every project as a list of entries (image/video + one caption each),
   never cropping source images, with a click-to-enlarge lightbox that pages through all media. */

(function () {
  function lang() {
    return document.documentElement.getAttribute("data-lang") || "en";
  }

  function getProject() {
    const id = new URLSearchParams(location.search).get("id");
    return window.PROJECTS.find((p) => p.id === id);
  }

  function renderHero(p, l) {
    const c = window.CATEGORIES.find((x) => x.slug === p.category);
    document.title = `${p.title[l]} — Yifan Lyu`;
    document.getElementById("project-cat").innerHTML =
      `<span class="dot" style="background:var(--c-${p.category})"></span>${l === "zh" ? c.zh : c.en}${p.year ? " · " + p.year : ""}`;
    document.getElementById("project-title").textContent = p.title[l];
    document.getElementById("project-desc").textContent = p.desc[l];
    document.getElementById("project-tags").innerHTML = p.tags[l].map((t) => `<span>${t}</span>`).join("");
    // Section index numbers ("01 / 03") pick up each project's own theme
    // color when set, falling back to its category color otherwise.
    document.documentElement.style.setProperty("--project-color", p.color || `var(--c-${p.category})`);
  }

  let flatMedia = [];

  function renderMedia(p, l) {
    const list = document.getElementById("media-list");

    if (p.h5s) {
      list.innerHTML = window.renderH5Grid(p.h5s, l);
      window.observeReveal(list);
      return;
    }

    const entries = window.collectEntries(p);
    flatMedia = window.flattenEntries(entries);

    list.innerHTML = window.renderEntryList(entries, l, p.category);

    list.querySelectorAll(".media-section").forEach((el) => window.observeReveal(el));
    list.querySelectorAll(".media-thumb").forEach((btn) => {
      btn.addEventListener("click", () => window.Lightbox.open(flatMedia, parseInt(btn.dataset.idx, 10)));
    });
    window.justifyGalleryRows(list);
  }

  function renderNav(p, l) {
    const idx = window.PROJECTS.findIndex((x) => x.id === p.id);
    const prev = window.PROJECTS[(idx - 1 + window.PROJECTS.length) % window.PROJECTS.length];
    const next = window.PROJECTS[(idx + 1) % window.PROJECTS.length];
    const wrap = document.getElementById("project-nav");
    wrap.innerHTML = `
      <a href="project.html?id=${prev.id}" class="prev">
        <span class="pn-label">${l === "zh" ? "上一件" : "Previous"}</span>
        <span>← ${prev.title[l]}</span>
      </a>
      <a href="project.html?id=${next.id}" class="next">
        <span class="pn-label">${l === "zh" ? "下一件" : "Next"}</span>
        <span>${next.title[l]} →</span>
      </a>`;
  }

  function render() {
    const p = getProject();
    const l = lang();
    if (!p) {
      document.getElementById("project-title").textContent = window.STRINGS.project_not_found[l];
      document.getElementById("project-cat").innerHTML = "";
      document.getElementById("project-desc").textContent = "";
      document.getElementById("media-list").innerHTML = "";
      document.getElementById("project-nav").innerHTML = "";
      return;
    }
    renderHero(p, l);
    renderMedia(p, l);
    renderNav(p, l);
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("langchange", render);
})();
