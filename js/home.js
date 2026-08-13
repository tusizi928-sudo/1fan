/* Home page: iBook scene with the WELCOME letters swaying on-screen +
   scattered "Virtual PC Console" bio-note windows (always upright, no
   tilt) + a system-notification toast + drifting soap bubbles + category
   teaser grid + featured showcase. */

(function () {
  const FEATURED_IDS = ["harmony-of-essence", "qisphere", "rock-clock", "ikea-ecomat"];

  /* Every note window lives beside the iBook — never underneath it — in two
     cascading stacks (left / right) that shingle downward, each one a touch
     further back (lower z) than the one above it. Windows are draggable
     (see initDraggableWindows), so these are just their starting spots. */
  const LEFT_SLOTS = [
    { x: "0%", y: "8%", w: "195px", z: 6 },
    { x: "5%", y: "22%", w: "205px", z: 5 },
    { x: "1%", y: "38%", w: "200px", z: 4 },
    { x: "6%", y: "54%", w: "205px", z: 3 },
    { x: "1%", y: "70%", w: "195px", z: 2 },
  ];
  const RIGHT_SLOTS = [
    { x: "80%", y: "6%", w: "205px", z: 6 },
    { x: "73%", y: "20%", w: "210px", z: 5 },
    { x: "76%", y: "58%", w: "205px", z: 4 },
  ];

  function render() {
    window.renderCategoryTiles("cat-tiles");
    window.renderFeatured("featured-projects", window.PROJECTS, FEATURED_IDS);
  }

  function currentLang() {
    return document.documentElement.getAttribute("data-lang") || "en";
  }

  /* Split the bio paragraph into standalone sentences — one per popup note —
     on Chinese/English sentence-ending punctuation. */
  function splitSentences(text) {
    return text
      .split(/(?<=[。！？.!?])\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function winControls() {
    return `<div class="win-controls"><span>_</span><span>&#9633;</span><span>x</span></div>`;
  }

  function renderScatterWindows() {
    const wrap = document.getElementById("scatter-windows");
    if (!wrap) return;
    const lang = currentLang();
    const S = window.STRINGS || {};
    const pick = (field, fallback) => (S[field] && (S[field][lang] || S[field].en)) || fallback || "";

    const bioSentences = [];
    if (S.intro_bio) {
      const text = S.intro_bio[lang] || S.intro_bio.en || S.intro_bio.zh || "";
      splitSentences(text).forEach((s) => bioSentences.push(s));
    }
    // Lead sentence becomes the compact "System Protection"-style toast;
    // the rest become full "Virtual PC Console" note windows. The tagline
    // already appears as its own line under the computer, and the closing
    // "feel free to reach out" sentence is dropped — no need to say either
    // twice in a floating window.
    const leadLine = bioSentences.shift();
    bioSentences.pop();
    const contactLabel = pick("footer_contact_kicker", "Contact");
    const extraLines = (S.hero_extra && (S.hero_extra[lang] || S.hero_extra.en)) || [];

    // Build the full note list in one place, then hand each one a slot —
    // first five go to the left stack, the rest to the right.
    const notes = [];
    if (leadLine) notes.push({ type: "sys", icon: "i", text: leadLine });
    bioSentences.forEach((body) => notes.push({ type: "win", body }));
    notes.push({ type: "sys", icon: "@", text: `${contactLabel} — yifan.lyu007@gmail.com` });
    extraLines.slice(0, 3).forEach((line) => notes.push({ type: "win", body: line }));
    notes.push({ type: "sys", icon: "&#128247;", text: "Instagram — @111fannnn" });

    const slotStyle = (slot) => `--slot-x:${slot.x}; --slot-y:${slot.y}; --slot-w:${slot.w}; --slot-z:${slot.z || 1};`;

    let html = "";
    notes.forEach((note, i) => {
      const slot = i < LEFT_SLOTS.length ? LEFT_SLOTS[i] : RIGHT_SLOTS[(i - LEFT_SLOTS.length) % RIGHT_SLOTS.length];
      if (note.type === "sys") {
        html += `<div class="sys-note" style="${slotStyle(slot)}">
          <div class="win-titlebar">
            <div class="win-icon"></div>
            <div class="win-title">System Protection</div>
            ${winControls()}
          </div>
          <div class="sys-body">
            <div class="sys-icon">${note.icon}</div>
            <div class="sys-text">${note.text}</div>
          </div>
        </div>`;
      } else {
        html += `<div class="win bio-win" style="${slotStyle(slot)}">
          <div class="win-titlebar">
            <div class="win-icon"></div>
            <div class="win-title">Virtual PC Console</div>
            ${winControls()}
          </div>
          <div class="win-menubar"><span>File</span><span>Action</span><span>Help</span></div>
          <div class="win-body">${note.body}</div>
        </div>`;
      }
    });

    wrap.innerHTML = html;
    initDraggableWindows();
  }

  /* Drag any note window by its titlebar — desktop-window style. Only
     active once the windows are actually absolutely positioned (the
     min-width:980px breakpoint); below that they're a static flex stack
     and dragging wouldn't make sense. */
  let dragInitialized = false;
  function initDraggableWindows() {
    if (dragInitialized) return;
    dragInitialized = true;
    const scene = document.getElementById("crt-scene");
    if (!scene) return;
    let dragEl = null;
    let offsetX = 0;
    let offsetY = 0;

    function pos(e) {
      return e.touches && e.touches[0] ? e.touches[0] : e;
    }

    function start(e) {
      const titlebar = e.target.closest(".win-titlebar");
      if (!titlebar) return;
      const win = titlebar.closest(".win, .sys-note");
      if (!win || getComputedStyle(win).position !== "absolute") return;
      const p = pos(e);
      const rect = win.getBoundingClientRect();
      const sceneRect = scene.getBoundingClientRect();
      offsetX = p.clientX - rect.left;
      offsetY = p.clientY - rect.top;
      win.style.left = rect.left - sceneRect.left + "px";
      win.style.top = rect.top - sceneRect.top + "px";
      win.style.zIndex = 50;
      win.classList.add("dragging");
      dragEl = win;
      e.preventDefault();
    }
    function move(e) {
      if (!dragEl) return;
      const p = pos(e);
      const sceneRect = scene.getBoundingClientRect();
      dragEl.style.left = p.clientX - sceneRect.left - offsetX + "px";
      dragEl.style.top = p.clientY - sceneRect.top - offsetY + "px";
      e.preventDefault();
    }
    function end() {
      if (dragEl) dragEl.classList.remove("dragging");
      dragEl = null;
    }

    scene.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    scene.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
  }

  /* Soap bubbles drift up from the bottom of the hero, each with its own
     size/speed/drift so they don't move in lockstep. Density is driven by
     the slider under the iBook — 0-100%, mapped onto MAX_BUBBLES. */
  const MAX_BUBBLES = 34;

  function spawnBubbles(pct) {
    const wrap = document.getElementById("hero-bubbles");
    if (!wrap) return;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      wrap.innerHTML = "";
      return;
    }

    // Bubbles should clear the whole hero, not just drift partway — base
    // the rise distance on the hero's actual rendered height.
    const hero = document.getElementById("welcome-hero");
    const rise = Math.max(700, (hero ? hero.getBoundingClientRect().height : 700) + 120);

    const count = Math.round((MAX_BUBBLES * (pct == null ? 75 : pct)) / 100);
    let html = "";
    for (let i = 0; i < count; i++) {
      const left = (2 + Math.random() * 96).toFixed(1);
      const size = Math.round(34 + Math.random() * 68);
      const duration = (9 + Math.random() * 8).toFixed(1);
      const delay = (Math.random() * 9).toFixed(1);
      const drift = Math.round(-40 + Math.random() * 80);
      html += `<div class="hero-bubble-float" style="left:${left}%; width:${size}px; height:${size}px; --drift:${drift}px; --rise:${rise}px; animation-duration:${duration}s; animation-delay:${delay}s;"></div>`;
    }
    wrap.innerHTML = html;
  }

  function initBubbleSlider() {
    const slider = document.getElementById("bubble-density");
    const label = document.getElementById("bubble-pct");
    if (!slider) return;
    spawnBubbles(Number(slider.value));
    slider.addEventListener("input", () => {
      if (label) label.textContent = `${slider.value}%`;
      spawnBubbles(Number(slider.value));
    });
  }

  /* Each letter/cluster piece drifts slightly toward the cursor, on top of
     its own gentle idle sway (see welcome-sway in style.css). Pieces closer
     to the pointer shift a touch more since the offset is computed from
     each piece's own center, not the wrap's. */
  function initHeroParallax() {
    const hero = document.getElementById("welcome-hero");
    const screen = document.querySelector(".crt-screen");
    const wrap = document.getElementById("welcome-3d-wrap");
    if (!hero || !screen || !wrap) return;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || matchMedia("(hover: none)").matches) return;

    const FACTOR = 4; // px of max drift — subtle, since the screen area is small; kept
    // small so pieces touching each other in the artwork don't drift apart
    // enough to reveal a gap of background between them
    const items = (window.WELCOME_PIECES && window.WELCOME_PIECES.items) || [];

    // Each piece's center is derived once from its known layout percentage
    // (same left/top/w data used to render it) rather than re-measured via
    // getBoundingClientRect on every mousemove — querying layout for 17
    // elements per mouse event forces 17 synchronous reflows and is what
    // was causing the stutter/garbled motion. Only the wrap + hero rects
    // are read live, and only once per animation frame (rAF-throttled).
    let pieces = null;
    function collectPieces() {
      pieces = Array.from(screen.querySelectorAll(".wp-piece")).map((el) => {
        const idx = Number(el.dataset.piece);
        const item = items[idx] || {};
        const cxFrac = ((item.left || 0) + (item.w || 0) / 2) / 100;
        const cyFrac = ((item.top || 0) + 8) / 100; // approximate vertical center
        return { el, cxFrac, cyFrac };
      });
    }

    let lastEvent = null;
    let ticking = false;
    function update() {
      ticking = false;
      if (!lastEvent) return;
      if (!pieces) collectPieces();
      const wrapRect = wrap.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const halfW = heroRect.width / 2 || 1;
      const halfH = heroRect.height / 2 || 1;
      pieces.forEach((p) => {
        const cx = wrapRect.left + wrapRect.width * p.cxFrac;
        const cy = wrapRect.top + wrapRect.height * p.cyFrac;
        const dx = (lastEvent.clientX - cx) / halfW;
        const dy = (lastEvent.clientY - cy) / halfH;
        p.el.style.setProperty("--mx", (dx * FACTOR).toFixed(2) + "px");
        p.el.style.setProperty("--my", (dy * FACTOR).toFixed(2) + "px");
      });
    }

    hero.addEventListener("mousemove", (e) => {
      lastEvent = e;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    });

    // On mouseleave, ease every piece back to its resting spot over a few
    // frames (manually, in JS) instead of a CSS transition — a transition
    // on the same "transform" property that JS also drives every frame
    // during mousemove is what caused the stutter/garble in the first
    // place, so it stays out of the CSS entirely.
    hero.addEventListener("mouseleave", () => {
      lastEvent = null;
      if (!pieces) collectPieces();
      const start = pieces.map((p) => ({
        mx: parseFloat(p.el.style.getPropertyValue("--mx")) || 0,
        my: parseFloat(p.el.style.getPropertyValue("--my")) || 0,
      }));
      const duration = 260;
      const t0 = performance.now();
      function ease(t) {
        return 1 - Math.pow(1 - t, 3);
      }
      function step(now) {
        const t = Math.min(1, (now - t0) / duration);
        const k = 1 - ease(t);
        pieces.forEach((p, i) => {
          p.el.style.setProperty("--mx", (start[i].mx * k).toFixed(2) + "px");
          p.el.style.setProperty("--my", (start[i].my * k).toFixed(2) + "px");
        });
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  document.addEventListener("DOMContentLoaded", () => window.renderWelcomePieces("welcome-3d-wrap"));
  document.addEventListener("DOMContentLoaded", renderScatterWindows);
  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("DOMContentLoaded", initHeroParallax);
  document.addEventListener("DOMContentLoaded", initBubbleSlider);
  document.addEventListener("langchange", render);
  // Browser back/forward can restore this page straight from the bfcache
  // instead of re-running our scripts — the bubbles' CSS animations resume
  // mid-flight, so they look "already risen" the instant the page appears.
  // Re-spawning fresh elements on a bfcache restore resets them to the
  // bottom, matching a real first load.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      const slider = document.getElementById("bubble-density");
      spawnBubbles(slider ? Number(slider.value) : null);
    }
  });
  document.addEventListener("langchange", renderScatterWindows);
})();
