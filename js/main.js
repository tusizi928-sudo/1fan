/* Shared behaviour across all pages: language toggle, nav, cursor, reveal. */

(function () {
  const STORAGE_KEY = "ifa-lyu-lang";

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || "zh";
  }

  function setLang(lang, opts) {
    opts = opts || {};
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    document.documentElement.setAttribute("data-lang", lang);
    applyStrings(lang);
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    // On first page load, each page's own DOMContentLoaded handler renders its
    // content already (reading data-lang, set synchronously above). Dispatching
    // langchange here too would re-enter that render a second time before the
    // page has even finished its own initial setup — skip it for the silent
    // (initial) call and only fire it for real, user-triggered language switches.
    if (!opts.silent) {
      document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
    }
  }

  function applyStrings(lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const entry = window.STRINGS[key];
      if (entry) el.textContent = entry[lang];
    });
  }

  function initLangToggle() {
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
    setLang(getLang(), { silent: true });
  }

  function initNavCurrent() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("current");
      }
    });
  }

  function renderCategoryNav() {
    const el = document.getElementById("nav-cat-links");
    if (!el || !window.CATEGORIES) return;
    const lang = document.documentElement.getAttribute("data-lang") || "zh";
    const s = window.STRINGS;
    const catLinks = window.CATEGORIES.map(
      (c) => `<a href="work.html?cat=${c.slug}">${lang === "zh" ? c.zh : c.en}</a>`
    ).join("");
    el.innerHTML =
      `<a href="index.html">${s.nav_home[lang]}</a>` +
      `<a href="index.html#featured-projects">${s.nav_featured[lang]}</a>` +
      catLinks +
      `<a href="about.html" data-i18n="nav_about">${s.nav_about[lang]}</a>`;
    initNavCurrent();
  }

  function initCursor() {
    if (window.matchMedia("(hover: none)").matches) return;
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    window.addEventListener("mousemove", (e) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
      dot.classList.add("active");
    });
    document.addEventListener("mouseleave", () => dot.classList.remove("active"));
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => dot.classList.add("big"));
      el.addEventListener("mouseleave", () => dot.classList.remove("big"));
    });
    document.body.__cursorDot = dot;
  }

  function refreshCursorTargets() {
    const dot = document.body.__cursorDot;
    if (!dot) return;
    document.querySelectorAll("a, button").forEach((el) => {
      if (el.__cursorBound) return;
      el.__cursorBound = true;
      el.addEventListener("mouseenter", () => dot.classList.add("big"));
      el.addEventListener("mouseleave", () => dot.classList.remove("big"));
    });
  }

  function initReveal() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      io.observe(el);
      window.setTimeout(() => el.classList.add("in"), 1200);
    });
  }
  window.observeReveal = function (el) {
    el.classList.add("reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    // Safety net: if for any reason the observer never fires (some browsers
    // are inconsistent about elements that start already in view, or content
    // injected in the middle of another event's dispatch), never leave the
    // element permanently invisible.
    window.setTimeout(() => el.classList.add("in"), 1200);
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLangToggle();
    renderCategoryNav();
    initNavCurrent();
    initCursor();
    initReveal();
  });
  document.addEventListener("langchange", () => {
    refreshCursorTargets();
    renderCategoryNav();
  });
})();
