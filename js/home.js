/* Home page: hero scatter photos + compact category teaser grid + featured showcase. */

(function () {
  const FEATURED_IDS = ["harmony-of-essence", "qisphere", "rock-clock", "ikea-ecomat"];

  function render() {
    window.renderCategoryTiles("cat-tiles");
    window.renderFeatured("featured-projects", window.PROJECTS, FEATURED_IDS);
  }

  document.addEventListener("DOMContentLoaded", () => window.renderHeroScatter("hero-scatter"));
  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("langchange", render);
})();
