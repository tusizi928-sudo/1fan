/* Work page: full archive by default, or a single category when ?cat=<slug> is present.
   In filtered mode nothing from other categories renders — the nav's promise of
   "click a category, see only that category" holds all the way through. */

(function () {
  function catSlug() {
    return new URLSearchParams(location.search).get("cat");
  }

  function render() {
    const lang = document.documentElement.getAttribute("data-lang") || "zh";
    const slug = catSlug();
    const titleEl = document.getElementById("work-title");
    const descEl = document.getElementById("work-desc");

    if (slug) {
      const cat = window.CATEGORIES.find((c) => c.slug === slug);
      if (cat) {
        titleEl.textContent = lang === "zh" ? cat.zh : cat.en;
        descEl.textContent = cat.desc[lang];
      }
    } else {
      titleEl.textContent = window.STRINGS.work_title[lang];
      descEl.textContent = window.STRINGS.work_subtitle[lang];
    }

    window.renderCategoryGroups("work-categories", window.PROJECTS, slug || null);
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("langchange", render);
})();
