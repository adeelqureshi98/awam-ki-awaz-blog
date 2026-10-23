/* Khari Baat — "Column Sunen" listen button (speechSynthesis). */
(function () {
  "use strict";
  var btn = document.getElementById("listenBtn");
  if (!btn) return;
  if (!("speechSynthesis" in window)) { btn.hidden = true; return; }
  btn.hidden = false;

  var ico = btn.querySelector(".listen-ico");
  var label = btn.querySelector(".listen-label");
  var playing = false;
  var chunks = [];
  var idx = 0;
  var voice = null;

  function pickVoice() {
    var vs = window.speechSynthesis.getVoices() || [];
    voice = null;
    for (var i = 0; i < vs.length; i++) { if (/^ur/i.test(vs[i].lang || "")) { voice = vs[i]; break; } }
    if (!voice) { for (var j = 0; j < vs.length; j++) { if (/^hi/i.test(vs[j].lang || "")) { voice = vs[j]; break; } } }
    if (!voice && vs.length) voice = vs[0];
  }
  pickVoice();
  if ("onvoiceschanged" in window.speechSynthesis) window.speechSynthesis.onvoiceschanged = pickVoice;

  function articleText() {
    var art = document.querySelector("article.article") || document.querySelector("article");
    if (!art) return "";
    var clone = art.cloneNode(true);
    var junk = clone.querySelectorAll(".stars, .rate-note, .rate-box, .rating, .share-row, script, style, button");
    for (var i = 0; i < junk.length; i++) { if (junk[i].parentNode) junk[i].parentNode.removeChild(junk[i]); }
    var blocks = clone.querySelectorAll("p, h2, h3, li, blockquote");
    var parts = [];
    for (var k = 0; k < blocks.length; k++) {
      var el = blocks[k];
      if (el.offsetParent === null && el.closest("[hidden]")) continue;
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    }
    var full = parts.join(" ");
    if (!full) full = (clone.textContent || "").replace(/\s+/g, " ").trim();
    /* keep only the currently visible language blocks when the page toggles languages */
    var visParts = [];
    var liveBlocks = art.querySelectorAll("p, h2, h3, li, blockquote");
    for (var m = 0; m < liveBlocks.length; m++) {
      var lb = liveBlocks[m];
      if (lb.closest(".stars, .rate-note, .rate-box, .rating, .share-row")) continue;
      var style = window.getComputedStyle(lb);
      if (style.display === "none" || style.visibility === "hidden") continue;
      var lt = (lb.textContent || "").replace(/\s+/g, " ").trim();
      if (lt) visParts.push(lt);
    }
    if (visParts.length) full = visParts.join(" ");
    return full;
  }

  function makeChunks(text) {
    var out = [];
    var sents = text.match(/[^.!?۔]+[.!?۔]*/g) || [text];
    var cur = "";
    for (var i = 0; i < sents.length; i++) {
      var s = sents[i].trim();
      if (!s) continue;
      if ((cur + " " + s).length > 700 && cur) { out.push(cur); cur = s; }
      else cur = cur ? cur + " " + s : s;
    }
    if (cur) out.push(cur);
    return out;
  }

  function setUI(on) {
    playing = on;
    btn.classList.toggle("playing", on);
    if (ico) ico.textContent = on ? "■" : "▶";
    if (label) label.textContent = on ? "سننا بند کریں · Stop" : "کالم سنیں · Column Sunen — Listen";
  }

  function speakNext() {
    if (!playing || idx >= chunks.length) { setUI(false); return; }
    var u = new SpeechSynthesisUtterance(chunks[idx]);
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.rate = 0.98;
    u.onend = function () { idx++; speakNext(); };
    u.onerror = function () { if (playing) { idx++; speakNext(); } };
    window.speechSynthesis.speak(u);
  }

  btn.addEventListener("click", function () {
    if (playing) {
      window.speechSynthesis.cancel();
      setUI(false);
      return;
    }
    var text = articleText();
    if (!text) return;
    chunks = makeChunks(text);
    idx = 0;
    window.speechSynthesis.cancel();
    setUI(true);
    speakNext();
  });

  window.addEventListener("beforeunload", function () {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });
})();
