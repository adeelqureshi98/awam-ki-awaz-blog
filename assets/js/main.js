// Khari Baat — main.js (vanilla, no dependencies)
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

/* ---------- v2: sidebar drawer ---------- */
(function(){
  var sb=document.getElementById('sidebar'), btn=document.getElementById('menuBtn'), sc=document.getElementById('scrim');
  if(!sb||!btn) return;
  function set(open){ sb.classList.toggle('open',open); if(sc) sc.classList.toggle('on',open); btn.setAttribute('aria-expanded',open?'true':'false'); }
  btn.addEventListener('click',function(){ set(!sb.classList.contains('open')); });
  if(sc) sc.addEventListener('click',function(){ set(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') set(false); });
  sb.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ set(false); }); });
})();

/* ---------- v2: gold dust particles ---------- */
(function(){
  var cv=document.getElementById('dust'); if(!cv) return;
  var ctx=cv.getContext('2d');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=0,H=0,ps=[],running=true,raf=null;
  function count(){ return window.innerWidth<700?34:76; }
  function seed(){
    ps=[];
    for(var i=0;i<count();i++){ ps.push({x:Math.random()*W,y:Math.random()*H,r:.7+Math.random()*1.6,s:.08+Math.random()*.28,ph:Math.random()*6.283,ps:.004+Math.random()*.01,dr:(Math.random()-.5)*.08}); }
  }
  function size(){ W=cv.width=window.innerWidth; H=cv.height=window.innerHeight; }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<ps.length;i++){ var p=ps[i];
      var a=.16+.4*(0.5+0.5*Math.sin(p.ph));
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283);
      ctx.fillStyle='rgba(231,200,119,'+a.toFixed(3)+')'; ctx.fill();
    }
  }
  function tick(){
    if(!running) return;
    for(var i=0;i<ps.length;i++){ var p=ps[i];
      p.y-=p.s; p.x+=p.dr+Math.sin(p.ph)*0.05; p.ph+=p.ps;
      if(p.y<-4){ p.y=H+4; p.x=Math.random()*W; }
      if(p.x<-4) p.x=W+4; if(p.x>W+4) p.x=-4;
    }
    draw(); raf=requestAnimationFrame(tick);
  }
  size(); seed(); draw();
  if(!reduced){ raf=requestAnimationFrame(tick); }
  document.addEventListener('visibilitychange',function(){
    if(reduced) return;
    if(document.hidden){ running=false; if(raf) cancelAnimationFrame(raf); }
    else if(!running){ running=true; raf=requestAnimationFrame(tick); }
  });
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ size(); seed(); draw(); },180); });
})();

/* ---------- v3: share links · reading time · rating · search · back-to-top ---------- */
(function(){
  "use strict";
  var pageUrl = location.href.split("#")[0].split("?")[0];
  var pageTitle = document.title.split("|")[0].trim();

  // Share buttons: build real share URLs for this page
  document.querySelectorAll("[data-share]").forEach(function(el){
    var net = el.getAttribute("data-share");
    var text = encodeURIComponent(pageTitle + " — by Muhammad Adeel");
    var url = encodeURIComponent(pageUrl);
    if(net === "wa") el.setAttribute("href", "https://wa.me/?text=" + text + "%20" + url);
    if(net === "fb") el.setAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=" + url);
    if(net === "x") el.setAttribute("href", "https://twitter.com/intent/tweet?text=" + text + "&url=" + url);
    if(net === "copy") el.addEventListener("click", function(){
      var done = function(){ el.textContent = "Link copied"; setTimeout(function(){ el.textContent = "Copy link"; }, 2200); };
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(pageUrl).then(done, done); }
      else {
        var ta = document.createElement("textarea"); ta.value = pageUrl; document.body.appendChild(ta);
        ta.select(); try { document.execCommand("copy"); } catch(e){} document.body.removeChild(ta); done();
      }
    });
  });

  // Reading time: average of the Urdu and English versions (one full read)
  var dateEl = document.querySelector(".post-hero .date");
  var ur = document.getElementById("col-ur"), en = document.getElementById("col-en");
  if(dateEl && ur && en){
    var words = function(el){ return (el.textContent || "").trim().split(/\s+/).filter(Boolean).length; };
    var mins = Math.max(1, Math.round(((words(ur) + words(en)) / 2) / 185));
    var span = document.createElement("span");
    span.textContent = " · " + mins + " min read";
    dateEl.appendChild(span);
  }

  // Rating: the visitor's own stars, saved only in their browser
  document.querySelectorAll("[data-rate]").forEach(function(box){
    var key = "kb-rate-" + box.getAttribute("data-rate");
    var stars = box.querySelectorAll(".star");
    var note = box.querySelector("[data-rate-note]");
    var val = 0;
    try { val = parseInt(localStorage.getItem(key) || "0", 10) || 0; } catch(e){}
    var paint = function(v, saved){
      stars.forEach(function(s){
        var sv = parseInt(s.getAttribute("data-v"), 10);
        s.classList.toggle("on", sv <= v);
        s.setAttribute("aria-checked", sv === v ? "true" : "false");
      });
      if(note){
        if(v > 0){ note.textContent = "Your rating: " + v + " of 5 stars." + (saved ? " Saved in your browser." : ""); note.classList.add("saved"); }
        else { note.textContent = "Tap a star to save your rating. It is stored only in your own browser."; note.classList.remove("saved"); }
      }
    };
    stars.forEach(function(s){
      s.addEventListener("click", function(){
        val = parseInt(s.getAttribute("data-v"), 10);
        try { localStorage.setItem(key, String(val)); } catch(e){}
        paint(val, true);
      });
      s.addEventListener("mouseenter", function(){ paint(parseInt(s.getAttribute("data-v"), 10), false); });
    });
    box.addEventListener("mouseleave", function(){ paint(val, false); });
    paint(val, false);
  });

  // Listing search: filter cards/rows by title text (also reads ?q=)
  document.querySelectorAll("input[data-filter]").forEach(function(input){
    var cls = input.getAttribute("data-filter");
    var items = Array.prototype.slice.call(document.querySelectorAll("." + cls));
    var note = document.querySelector("[data-no-match]");
    var q = "";
    try { q = new URLSearchParams(location.search).get("q") || ""; } catch(e){}
    var apply = function(){
      var needle = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function(it){
        var hay = (it.getAttribute("data-search") || it.textContent || "").toLowerCase();
        var hit = !needle || hay.indexOf(needle) !== -1;
        it.style.display = hit ? "" : "none";
        if(hit) shown++;
      });
      if(note) note.hidden = shown !== 0;
    };
    input.addEventListener("input", apply);
    if(q){ input.value = q; }
    apply();
  });

  // Back to top (long pages)
  if(document.querySelector(".article") || document.querySelector(".blog-grid")){
    var btn = document.createElement("button");
    btn.id = "toTop"; btn.type = "button"; btn.setAttribute("aria-label", "Back to top"); btn.textContent = "↑";
    document.body.appendChild(btn);
    var toggleTop = function(){ btn.classList.toggle("show", window.scrollY > 700); };
    document.addEventListener("scroll", toggleTop, { passive: true }); toggleTop();
    btn.addEventListener("click", function(){ window.scrollTo({ top: 0, behavior: "smooth" }); });
  }
})();
