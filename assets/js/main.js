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
