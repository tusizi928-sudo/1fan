/* Shared behaviour across all pages: language toggle, nav, cursor, reveal. */

(function () {
  const STORAGE_KEY = "ifa-lyu-lang";

  /* localStorage can throw (private browsing, disabled storage, some
     file:// / sandboxed contexts) — never let that take language switching
     or nav rendering down with it. */
  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch (e) {
      return "en";
    }
  }

  function setLang(lang, opts) {
    opts = opts || {};
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
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
    const params = new URLSearchParams(location.search);
    // On work.html filtered by category, or on a project's detail page,
    // highlight that project's category pill in the nav too — not just an
    // exact Home/Resume-style pathname match.
    let catHref = null;
    if (path === "work.html") {
      const slug = params.get("cat");
      if (slug) catHref = `work.html?cat=${slug}`;
    } else if (path === "project.html") {
      const id = params.get("id");
      const proj = window.PROJECTS && window.PROJECTS.find((p) => p.id === id);
      if (proj) catHref = `work.html?cat=${proj.category}`;
    }
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const href = a.getAttribute("href");
      const pageMatch = href === path || (path === "" && href === "index.html");
      const catMatch = catHref !== null && href === catHref;
      a.classList.toggle("current", pageMatch || catMatch);
    });
  }

  // Nav-bar pills need to fit ~11 items on one line, so they use shorter
  // labels than the full category names shown on tiles/headings elsewhere.
  const NAV_SHORT = {
    jiaohu: { zh: "交互", en: "Interaction" },
    shouhui: { zh: "插画", en: "Illustration" },
    shuji: { zh: "书籍", en: "Book" },
    vi: { zh: "展览", en: "Exhibition" },
    yingxiang: { zh: "动画", en: "Animation" },
    chanpin: { zh: "产品", en: "Product" },
    haibao: { zh: "海报", en: "Poster" },
  };

  function renderCategoryNav() {
    const el = document.getElementById("nav-cat-links");
    if (!el || !window.CATEGORIES) return;
    const lang = document.documentElement.getAttribute("data-lang") || "en";
    const s = window.STRINGS;
    const catLinks = window.CATEGORIES.map((c) => {
      const short = NAV_SHORT[c.slug];
      const label = short ? short[lang] : (lang === "zh" ? c.zh : c.en);
      return `<a href="work.html?cat=${c.slug}">${label}</a>`;
    }).join("");
    const photoLink = window.PHOTOGRAPHY_LINK
      ? `<a href="${window.PHOTOGRAPHY_LINK}" target="_blank" rel="noopener">${s.nav_photography[lang]}</a>`
      : "";
    el.innerHTML =
      `<a href="index.html">${s.nav_home[lang]}</a>` +
      `<a href="index.html#featured-projects">${s.nav_featured[lang]}</a>` +
      catLinks +
      photoLink +
      `<a href="about.html" data-i18n="nav_about">${s.nav_about[lang]}</a>`;
    initNavCurrent();
  }

  /* The pointer itself is now a static metallic-arrow image set via CSS
     `cursor` on <body> (see style.css) — no JS-driven follower needed. */

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

  // work.html / project.html footers only — click-to-copy the WeChat ID.
  // No-op on pages that don't have this markup (homepage, resume).
  function initFooterWechat() {
    const btn = document.getElementById("foot-wechat");
    const tip = document.getElementById("foot-wechat-tip");
    if (!btn) return;
    const wechatId = (window.ABOUT && window.ABOUT.contact && window.ABOUT.contact.wechat) || "tusizi928";
    btn.addEventListener("click", () => {
      const lang = document.documentElement.getAttribute("data-lang") || "en";
      const showTip = () => {
        if (!tip) return;
        tip.textContent = (window.STRINGS.wechat_copied && window.STRINGS.wechat_copied[lang]) || "Copied";
        tip.classList.add("show");
        window.setTimeout(() => tip.classList.remove("show"), 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(wechatId).then(showTip).catch(showTip);
      } else {
        showTip();
      }
    });
  }

  /* Confirm before leaving for the external photography site — there are
     two links to it (the nav's "Photography" pill, present on every page,
     and the homepage's "Photography Site" folder tile), so this matches by
     URL rather than by a class scoped to just one of them, and lives here
     (loaded on all 4 pages) rather than in home.js (homepage-only). */
  function initPhotoConfirm() {
    const modal = document.getElementById("photo-confirm-modal");
    const okBtn = document.getElementById("photo-confirm-ok");
    if (!modal || !okBtn || !window.PHOTOGRAPHY_LINK) return;
    let pendingUrl = null;

    function open(url) {
      pendingUrl = url;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }
    function close() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      pendingUrl = null;
    }

    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (link && link.href === window.PHOTOGRAPHY_LINK) {
        e.preventDefault();
        open(link.href);
      }
    });
    // Delegated (not bound per-element) so a click anywhere inside the
    // close control — including its padded hit area — reliably closes it.
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-confirm-close]")) close();
    });
    okBtn.addEventListener("click", () => {
      const url = pendingUrl;
      close();
      if (url) window.open(url, "_blank", "noopener");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) close();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLangToggle();
    renderCategoryNav();
    initNavCurrent();
    initReveal();
    initFooterWechat();
    initPhotoConfirm();
  });
  document.addEventListener("langchange", () => {
    renderCategoryNav();
  });
})();
