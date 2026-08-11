/* Shared fullscreen lightbox: pass it any flat list of {type, src, poster} and an index. */

window.Lightbox = (function () {
  let list = [];
  let index = 0;

  function playIcon() {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  }

  function render() {
    const item = list[index];
    const stage = document.getElementById("lightbox-stage");
    stage.innerHTML =
      item.type === "video"
        ? `<video src="${item.src}" poster="${item.poster || ""}" controls autoplay playsinline></video>`
        : `<img src="${item.src}" alt="">`;
    document.getElementById("lightbox-count").textContent = `${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
  }

  function open(newList, idx) {
    list = newList;
    index = idx;
    document.getElementById("lightbox").classList.add("open");
    document.body.style.overflow = "hidden";
    render();
  }

  function close() {
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow = "";
    const v = document.querySelector("#lightbox-stage video");
    if (v) v.pause();
  }

  function step(delta) {
    const n = list.length;
    index = (index + delta + n) % n;
    render();
  }

  function bind() {
    document.getElementById("lightbox-close").addEventListener("click", close);
    document.getElementById("lightbox").addEventListener("click", (e) => {
      if (e.target.id === "lightbox") close();
    });
    document.getElementById("lb-prev").addEventListener("click", () => step(-1));
    document.getElementById("lb-next").addEventListener("click", () => step(1));
    window.addEventListener("keydown", (e) => {
      if (!document.getElementById("lightbox").classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  return { open, close, step, bind, playIcon };
})();

document.addEventListener("DOMContentLoaded", () => window.Lightbox.bind());
