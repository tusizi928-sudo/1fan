/* About page: render education / work / research / awards / skills / contact from data.js */

(function () {
  function lang() {
    return document.documentElement.getAttribute("data-lang") || "en";
  }

  function renderEducation() {
    const l = lang();
    const wrap = document.getElementById("education-list");
    wrap.innerHTML = window.ABOUT.education
      .map(
        (e) => `
      <div class="timeline-item">
        <div class="timeline-period">${e.period}</div>
        <div>
          <div class="timeline-title">${e.school[l]}</div>
          <div class="timeline-role">${e.degree[l]}</div>
          ${e.note[l] ? `<div class="timeline-note">${e.note[l]}</div>` : ""}
        </div>
      </div>`
      )
      .join("");
  }

  function bulletsHTML(bullets, l) {
    if (!bullets || !bullets.length) return "";
    return `<ul class="timeline-bullets">${bullets.map((b) => `<li>${b[l]}</li>`).join("")}</ul>`;
  }

  function resultHTML(result, l) {
    if (!result || !result[l]) return "";
    return `<div class="timeline-result">${result[l]}</div>`;
  }

  function renderWork() {
    const l = lang();
    const wrap = document.getElementById("work-list");
    wrap.innerHTML = window.ABOUT.work
      .map(
        (w) => `
      <div class="timeline-item">
        <div class="timeline-period">${w.period}</div>
        <div>
          <div class="timeline-title">${w.org[l]}</div>
          <div class="timeline-role">${w.role[l]}</div>
          ${bulletsHTML(w.bullets, l)}
          ${resultHTML(w.result, l)}
        </div>
      </div>`
      )
      .join("");
  }

  function renderResearch() {
    const l = lang();
    const wrap = document.getElementById("research-list");
    wrap.innerHTML = window.ABOUT.research
      .map((r) => {
        if (!r.org) {
          return `<div class="timeline-note timeline-note-standalone">${r.note[l]}</div>`;
        }
        return `
      <div class="timeline-item">
        <div class="timeline-period">${r.period}</div>
        <div>
          <div class="timeline-title">${r.org[l]}</div>
          <div class="timeline-role">${r.role[l]}</div>
          ${bulletsHTML(r.bullets, l)}
          ${resultHTML(r.result, l)}
        </div>
      </div>`;
      })
      .join("");
  }

  function renderAwards() {
    const l = lang();
    const wrap = document.getElementById("awards-list");
    wrap.innerHTML = window.ABOUT.awards
      .map(
        (group) => `
      <div class="award-group">
        <h4>${group.category[l]}</h4>
        <div class="awards-grid">
          ${group.items
            .map(
              (a) => `
          <div class="award-item">
            <span>${a[l]}</span>
            <span class="award-year">${a.date}</span>
          </div>`
            )
            .join("")}
        </div>
      </div>`
      )
      .join("");
  }

  function renderSkills() {
    const l = lang();
    document.getElementById("skills-design").innerHTML = window.ABOUT.skills.tools
      .map((s) => `<span class="chip">${s}</span>`)
      .join("");
    document.getElementById("skills-research").innerHTML = window.ABOUT.skills.certificates[l]
      .map((s) => `<span class="chip">${s}</span>`)
      .join("");
    document.getElementById("skills-lang").innerHTML = window.ABOUT.skills.lang[l]
      .map((s) => `<span class="chip">${s}</span>`)
      .join("");
    document.getElementById("skills-hobbies").innerHTML = window.ABOUT.skills.hobbies[l]
      .map((s) => `<span class="chip">${s}</span>`)
      .join("");
  }

  function renderContact() {
    document.getElementById("contact-email").textContent = window.ABOUT.contact.email;
    document.getElementById("contact-email").href = "mailto:" + window.ABOUT.contact.email;
    document.getElementById("contact-instagram").textContent = window.ABOUT.contact.instagram;
    document.getElementById("contact-instagram").href = window.ABOUT.contact.instagramUrl;
    document.getElementById("contact-wechat").textContent = window.ABOUT.contact.wechat;
  }

  function renderAll() {
    renderEducation();
    renderWork();
    renderResearch();
    renderAwards();
    renderSkills();
    renderContact();
  }

  document.addEventListener("DOMContentLoaded", renderAll);
  document.addEventListener("langchange", renderAll);
})();
