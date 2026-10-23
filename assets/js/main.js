// Awam ki Awaz — main.js (vanilla, no dependencies)
(function () {
  "use strict";

  // Scroll reveals
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px 220px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Post page: reading progress bar
  var bar = document.getElementById("progress");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Post page: language toggle (Urdu / English / Both)
  var buttons = document.querySelectorAll("[data-lang-btn]");
  var sections = {
    ur: document.getElementById("col-ur"),
    en: document.getElementById("col-en")
  };
  if (buttons.length && sections.ur && sections.en) {
    var setLang = function (mode) {
      sections.ur.hidden = (mode === "en");
      sections.en.hidden = (mode === "ur");
      buttons.forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-lang-btn") === mode);
      });
      try { localStorage.setItem("aka-lang", mode); } catch (e) {}
    };
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang-btn")); });
    });
    var saved = "both";
    try { saved = localStorage.getItem("aka-lang") || "both"; } catch (e) {}
    if (["ur", "en", "both"].indexOf(saved) === -1) saved = "both";
    setLang(saved);
  }
})();
