/* Khari Baat — Tools v3.4 (Phase 2). Vanilla JS, client-side only. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function fmt(n, dec) {
    return Number(n).toLocaleString("en-US", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }
  function on(id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, fn); }

  /* ============ TOOL 5 — ZAKAT ============ */
  var TOLA = 11.664; /* grams per tola */
  function zkCalc() {
    var cash = parseFloat($("zk-cash").value) || 0;
    var gw = parseFloat($("zk-gold-w").value) || 0;
    var gp = parseFloat($("zk-gold-p").value) || 0;
    if ($("zk-gold-u").value === "gram") gw = gw / TOLA;
    var sw = parseFloat($("zk-silver-w").value) || 0;
    var sp = parseFloat($("zk-silver-p").value) || 0;
    if ($("zk-silver-u").value === "gram") sw = sw / TOLA;
    var other = parseFloat($("zk-other").value) || 0;
    var debts = parseFloat($("zk-debts").value) || 0;
    var goldVal = gw * gp, silverVal = sw * sp;
    var net = cash + goldVal + silverVal + other - debts;
    var nisab = ($("zk-basis") && $("zk-basis").value === "gold") ? 7.5 * gp : 52.5 * sp; /* silver nisab 612.36 g = 52.5 tola (default) · gold nisab 87.48 g = 7.5 tola */
    var due = net >= nisab && net > 0 ? net * 0.025 : 0;
    $("zk-nisab").textContent = "Rs " + fmt(nisab);
    $("zk-net").textContent = "Rs " + fmt(Math.max(net, 0));
    $("zk-due").textContent = "Rs " + fmt(due);
    $("zk-msg").textContent = due > 0
      ? "آپ کا مال نصاب سے زیادہ ہے — زکاٰۃ واجب ہے۔ · Your wealth is above nisab — zakat is due."
      : "آپ کا مال نصاب سے کم ہے — زکاٰۃ واجب نہیں۔ · Your wealth is below nisab — no zakat due.";
  }
  ["zk-cash", "zk-gold-w", "zk-gold-p", "zk-gold-u", "zk-silver-w", "zk-silver-p", "zk-silver-u", "zk-other", "zk-debts", "zk-basis"].forEach(function (id) {
    on(id, "input", zkCalc); on(id, "change", zkCalc);
  });
  if ($("zk-cash")) zkCalc();

  /* ============ TOOL 6 — CURRENCY ============ */
  var RATES = { USD: 1, PKR: 277.0, SAR: 3.74831, AED: 3.67347, GBP: 0.74663, EUR: 0.89160 }; /* per 1 USD — FACTS fallbacks 23 Oct 2026 (USD 277.0, SAR 73.9, AED 75.4, GBP 371.0, EUR 310.7) */
  var liveRates = false;
  function curConvert() {
    var amt = parseFloat($("cur-amt").value) || 0;
    var from = $("cur-from").value, to = $("cur-to").value;
    var out = amt / RATES[from] * RATES[to];
    $("cur-out").textContent = fmt(out, 2) + " " + to;
    $("cur-rate").textContent = "1 " + from + " = " + fmt(RATES[to] / RATES[from], 4) + " " + to;
  }
  function curBoard() {
    function per(cur) { return fmt(RATES.PKR / RATES[cur], 2); }
    $("rb-usd").textContent = "Rs " + per("USD");
    $("rb-sar").textContent = "Rs " + per("SAR");
    $("rb-aed").textContent = "Rs " + per("AED");
    $("rb-gbp").textContent = "Rs " + per("GBP");
  }
  function curInit() {
    curConvert(); curBoard();
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.rates) {
          RATES = d.rates; liveRates = true;
          $("cur-date").textContent = "Rates date: " + (d.time_last_update_utc || "latest");
          $("cur-offline").style.display = "none";
          curConvert(); curBoard();
        }
      })
      .catch(function () { /* fallback rates stay, offline note already visible */ });
  }
  ["cur-amt", "cur-from", "cur-to"].forEach(function (id) { on(id, "input", curConvert); on(id, "change", curConvert); });
  on("cur-swap", "click", function () {
    var f = $("cur-from").value; $("cur-from").value = $("cur-to").value; $("cur-to").value = f; curConvert();
  });
  if ($("cur-amt")) curInit();

  /* ============ TOOL 7 — ELECTRICITY BILL ============ */
  /* NEPRA notified uniform consumer tariff, in force from 1 Jan 2026 (FACTS-verified,
     4 news sources): Lifeline 1-50 Rs 3.95, 51-100 Rs 7.74 · Protected 1-100 Rs 10.54,
     101-200 Rs 13.01 · Non-protected 22.44 / 28.91 / 33.10 / 37.99 / 40.22 / 41.62 /
     42.76 / 47.69. Model: slab subtotal + FPA (editable, default Rs 3/unit) + customer
     charges -> GST 18% -> + TV fee Rs 35. All slab rates editable in the UI. */
  var NP_CAPS = [100, 200, 300, 400, 500, 600, 700, Infinity];
  var NP_DEF = [22.44, 28.91, 33.10, 37.99, 40.22, 41.62, 42.76, 47.69];
  var L_SLABS = [[50, 3.95], [100, 7.74]];
  function ebNp() {
    var out = [];
    for (var i = 0; i < 8; i++) { var v = parseFloat($("eb-r" + (i + 1)).value); out.push([NP_CAPS[i], isNaN(v) ? NP_DEF[i] : v]); }
    return out;
  }
  function ebPick(cat, units) {
    if (cat === "lifeline" && units <= 100) return { slabs: L_SLABS, note: "" };
    if (cat === "protected" || cat === "lifeline") {
      if (units <= 200) {
        var p1 = parseFloat($("eb-p1").value); if (isNaN(p1)) p1 = 10.54;
        var p2 = parseFloat($("eb-p2").value); if (isNaN(p2)) p2 = 13.01;
        return { slabs: [[100, p1], [200, p2]], note: cat === "lifeline" ? "نوٹ: 100 سے زیادہ یونٹ پر لائف لائن ختم ہو جاتی ہے — پروٹیکٹڈ نرخ لگائے گئے ہیں۔ · Note: above 100 units lifeline ends, so protected rates are applied." : "" };
      }
      return { slabs: ebNp(), note: "نوٹ: 200 سے زیادہ یونٹ پر پروٹیکٹڈ درجہ ختم ہو جاتا ہے — نان پروٹیکٹڈ نرخ لگائے گئے ہیں۔ · Note: above 200 units the protected status is lost, so non-protected rates are applied." };
    }
    return { slabs: ebNp(), note: "" };
  }
  function ebCalc() {
    var units = Math.max(0, Math.floor(parseFloat($("eb-units").value) || 0));
    var picked = ebPick($("eb-cat").value, units);
    var slabs = picked.slabs;
    var rows = "", energy = 0, prev = 0;
    for (var i = 0; i < slabs.length; i++) {
      var cap = slabs[i][0], rate = slabs[i][1];
      if (units <= prev) break;
      var inSlab = Math.min(units, cap) - prev;
      var amt = inSlab * rate; energy += amt;
      rows += "<tr><td>" + (prev + 1) + " – " + (cap === Infinity ? "∞" : cap) + "</td><td class='num'>" + inSlab + "</td><td class='num'>" + rate.toFixed(2) + "</td><td class='num'>" + fmt(amt, 2) + "</td></tr>";
      prev = cap;
    }
    var fpaRate = parseFloat($("eb-fpa-rate").value) || 0;
    var fpa = units * fpaRate;
    var cust = parseFloat($("eb-cust").value) || 0;
    var gst = (energy + fpa + cust) * 0.18;
    var tv = 35;
    var total = energy + fpa + cust + gst + tv;
    $("eb-rows").innerHTML = rows || "<tr><td colspan='4'>—</td></tr>";
    $("eb-energy").textContent = "Rs " + fmt(energy, 2);
    $("eb-fpa").textContent = "Rs " + fmt(fpa, 2);
    $("eb-cust-val").textContent = "Rs " + fmt(cust, 2);
    $("eb-gst").textContent = "Rs " + fmt(gst, 2);
    $("eb-total").textContent = "Rs " + fmt(total);
    $("eb-note").textContent = picked.note;
  }
  ["eb-units", "eb-fpa-rate", "eb-p1", "eb-p2", "eb-r1", "eb-r2", "eb-r3", "eb-r4", "eb-r5", "eb-r6", "eb-r7", "eb-r8"].forEach(function (id) { on(id, "input", ebCalc); });
  on("eb-cat", "change", ebCalc); on("eb-cust", "change", ebCalc); on("eb-cat", "input", ebCalc);
  if ($("eb-units")) ebCalc();

  /* ============ TOOL 8 — PASSPORT PHOTO ============ */
  var pp = { img: null, zoom: 1, x: 0, y: 0 };
  function ppDraw() {
    var cv = $("pp-canvas"); if (!cv) return;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 600, 600);
    if (!pp.img) {
      ctx.fillStyle = "#8a6a24"; ctx.font = "28px 'Source Serif 4', serif"; ctx.textAlign = "center";
      ctx.fillText("Upload a photo", 300, 290);
      ctx.font = "22px 'Noto Nastaliq Urdu', serif";
      ctx.fillText("تصویر منتخب کریں", 300, 340);
      return;
    }
    var iw = pp.img.naturalWidth, ih = pp.img.naturalHeight;
    var base = Math.max(600 / iw, 600 / ih);
    var eff = base * pp.zoom;
    var dw = iw * eff, dh = ih * eff;
    var dx = (600 - dw) / 2 + pp.x, dy = (600 - dh) / 2 + pp.y;
    ctx.drawImage(pp.img, dx, dy, dw, dh);
  }
  on("pp-file", "change", function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var img = new Image();
    img.onload = function () { pp.img = img; pp.zoom = 1; pp.x = 0; pp.y = 0; $("pp-zoom").value = 1; $("pp-x").value = 0; $("pp-y").value = 0; ppDraw(); };
    img.src = URL.createObjectURL(f);
  });
  on("pp-zoom", "input", function (e) { pp.zoom = parseFloat(e.target.value); ppDraw(); });
  on("pp-x", "input", function (e) { pp.x = parseFloat(e.target.value); ppDraw(); });
  on("pp-y", "input", function (e) { pp.y = parseFloat(e.target.value); ppDraw(); });
  function ppDownload(canvas, name) {
    canvas.toBlob(function (b) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = name; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, "image/png");
  }
  on("pp-dl", "click", function () { if (pp.img) ppDownload($("pp-canvas"), "passport-photo.png"); });
  on("pp-sheet", "click", function () {
    if (!pp.img) return;
    var sheet = document.createElement("canvas"); sheet.width = 1200; sheet.height = 2400;
    var sctx = sheet.getContext("2d");
    sctx.fillStyle = "#ffffff"; sctx.fillRect(0, 0, 1200, 2400);
    for (var r = 0; r < 4; r++) for (var c = 0; c < 2; c++) sctx.drawImage($("pp-canvas"), c * 600, r * 600);
    ppDownload(sheet, "passport-sheet-8.png");
  });
  ppDraw();

  /* ============ TOOL 9 — PRAYER TIMES + QIBLA ============ */
  var CITIES = {
    "kot-addu": { city: "Kot Addu", country: "Pakistan", method: 1, lat: 30.4691, lng: 70.9670 },
    "multan": { city: "Multan", country: "Pakistan", method: 1, lat: 30.1575, lng: 71.5249 },
    "lahore": { city: "Lahore", country: "Pakistan", method: 1, lat: 31.5204, lng: 74.3587 },
    "karachi": { city: "Karachi", country: "Pakistan", method: 1, lat: 24.8608, lng: 67.0011 },
    "islamabad": { city: "Islamabad", country: "Pakistan", method: 1, lat: 33.7294, lng: 73.0931 },
    "peshawar": { city: "Peshawar", country: "Pakistan", method: 1, lat: 34.0151, lng: 71.5785 },
    "quetta": { city: "Quetta", country: "Pakistan", method: 1, lat: 30.1798, lng: 66.9750 },
    "dubai": { city: "Dubai", country: "United Arab Emirates", method: 16, lat: 25.2048, lng: 55.2708 },
    "makkah": { city: "Makkah", country: "Saudi Arabia", method: 4, lat: 21.4225, lng: 39.8262 },
    "madinah": { city: "Madinah", country: "Saudi Arabia", method: 4, lat: 24.4672, lng: 39.6111 },
    "riyadh": { city: "Riyadh", country: "Saudi Arabia", method: 4, lat: 24.7136, lng: 46.6753 }
  };
  function qiblaBearing(lat, lng) {
    var kaabaLat = 21.4225 * Math.PI / 180, kaabaLng = 39.8262;
    var la = lat * Math.PI / 180, dl = (kaabaLng - lng) * Math.PI / 180;
    var y = Math.sin(dl);
    var x = Math.cos(la) * Math.tan(kaabaLat) - Math.sin(la) * Math.cos(dl);
    var b = Math.atan2(y, x) * 180 / Math.PI;
    return (b + 360) % 360;
  }
  function prLoad() {
    var key = $("pr-city").value, c = CITIES[key];
    var bearing = qiblaBearing(c.lat, c.lng);
    $("qb-deg").textContent = bearing.toFixed(1) + "°";
    var arrow = $("qb-arrow");
    if (arrow) arrow.setAttribute("transform", "rotate(" + bearing.toFixed(1) + " 75 75)");
    $("pr-err").style.display = "none";
    var url = "https://api.aladhan.com/v1/timingsByCity?city=" + encodeURIComponent(c.city) + "&country=" + encodeURIComponent(c.country) + "&method=" + c.method + "&school=" + (c.country === "Pakistan" ? 1 : 0); /* school=1: Hanafi Asr for Pakistan */
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var t = d.data.timings;
        function clean(v) { return (v || "--:--").split(" ")[0]; }
        $("pr-fajr").textContent = clean(t.Fajr);
        $("pr-dhuhr").textContent = clean(t.Dhuhr);
        $("pr-asr").textContent = clean(t.Asr);
        $("pr-maghrib").textContent = clean(t.Maghrib);
        $("pr-isha").textContent = clean(t.Isha);
        var h = d.data.date.hijri;
        $("pr-hijri").textContent = h.day + " " + h.month.en + " " + h.year + " AH · " + d.data.date.readable;
      })
      .catch(function () { $("pr-err").style.display = "block"; });
  }
  on("pr-city", "change", prLoad);
  if ($("pr-city")) prLoad();

  /* ============ TOOL 10 — WHATSAPP LINK + QR ============ */
  function waLink() {
    var raw = ($("wa-phone").value || "").replace(/\D/g, "");
    if (raw.indexOf("0") === 0) raw = "92" + raw.slice(1);
    else if (raw.length === 10) raw = "92" + raw;
    var msg = ($("wa-msg").value || "").trim();
    var link = "https://wa.me/" + raw + (msg ? "?text=" + encodeURIComponent(msg) : "");
    $("wa-out").textContent = link;
    $("wa-open").href = link;
    var box = $("wa-qr");
    box.innerHTML = "";
    if (raw.length >= 10) {
      if (window.QRCode) {
        new window.QRCode(box, { text: link, width: 180, height: 180, correctLevel: window.QRCode.CorrectLevel.M });
        $("wa-qr-note").style.display = "none";
      } else {
        $("wa-qr-note").style.display = "block";
      }
    }
  }
  on("wa-phone", "input", waLink); on("wa-msg", "input", waLink);
  on("wa-copy", "click", function () {
    var link = $("wa-out").textContent;
    function done() { $("wa-copy").textContent = "Copied ✓"; setTimeout(function () { $("wa-copy").textContent = "Copy Link · لنک کاپی کریں"; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done).catch(done);
    else done();
  });
  if ($("wa-phone")) waLink();

  /* ============ TOOL 11 — YOUTUBE THUMBNAIL ============ */
  function ytId(str) {
    str = (str || "").trim();
    var m = str.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return m[1];
    if (/^[\w-]{11}$/.test(str)) return str;
    return null;
  }
  function ytGo() {
    var id = ytId($("yt-url").value);
    var img = $("yt-img"), err = $("yt-err");
    if (!id) { err.style.display = "block"; img.style.display = "none"; return; }
    err.style.display = "none";
    var hd = "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg";
    var sd = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
    img.onerror = function () { img.onerror = null; img.src = sd; };
    img.src = hd; img.style.display = "block";
    $("yt-hd").href = hd; $("yt-sd").href = sd;
    $("yt-dls").style.display = "flex";
  }
  on("yt-go", "click", ytGo);
  on("yt-url", "keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ytGo(); } });

  /* ============ ENRICHMENT — share/copy actions, all-to-all, quick-fills ============ */
  function actionsRow(getText) {
    var d = document.createElement("div");
    d.className = "tool-actions"; d.style.flexWrap = "wrap"; d.style.marginTop = "18px";
    var b1 = document.createElement("button");
    b1.type = "button"; b1.className = "btn btn-ghost"; b1.textContent = "Copy Result · نتیجہ کاپی کریں";
    b1.addEventListener("click", function () {
      var t = getText();
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(function () {});
      b1.textContent = "Copied ✓"; setTimeout(function () { b1.textContent = "Copy Result · نتیجہ کاپی کریں"; }, 1600);
    });
    var a = document.createElement("a");
    a.className = "btn btn-ghost"; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Share on WhatsApp · واٹس ایپ پر بھیجیں";
    a.addEventListener("click", function () { a.href = "https://wa.me/?text=" + encodeURIComponent(getText()); });
    d.appendChild(b1); d.appendChild(a);
    return d;
  }
  function panelOf(secId) { var s = $(secId); return s ? s.querySelector(".tool-result") || s.querySelector(".tool-panel") : null; }

  var zkHost = panelOf("tool-zakat");
  if (zkHost) zkHost.appendChild(actionsRow(function () {
    return "Zakat Calculation (Khari Baat Tools)\nNisab: " + $("zk-nisab").textContent + "\nNet wealth: " + $("zk-net").textContent + "\nZakat due (2.5%): " + $("zk-due").textContent;
  }));
  on("zk-sample", "click", function () {
    $("zk-cash").value = 500000; $("zk-gold-w").value = 2; $("zk-gold-u").value = "tola";
    $("zk-silver-w").value = 0; $("zk-other").value = 0; $("zk-debts").value = 100000; zkCalc();
  });

  var curHost = panelOf("tool-currency");
  if (curHost) curHost.appendChild(actionsRow(function () {
    return "Currency (Khari Baat Tools)\n" + $("cur-amt").value + " " + $("cur-from").value + " = " + $("cur-out").textContent + "\n" + $("cur-rate").textContent;
  }));
  function curAll() {
    var body = $("cur-all"); if (!body) return;
    var amt = parseFloat($("cur-amt").value) || 0, from = $("cur-from").value;
    var names = { USD: "USD — Dollar", PKR: "PKR — Rupee", SAR: "SAR — Riyal", AED: "AED — Dirham", GBP: "GBP — Pound", EUR: "EUR — Euro" };
    var html = "";
    Object.keys(names).forEach(function (c) {
      html += "<tr><td>" + names[c] + "</td><td class='num'>" + fmt(amt / RATES[from] * RATES[c], 2) + " " + c + "</td></tr>";
    });
    body.innerHTML = html;
  }
  ["cur-amt", "cur-from", "cur-to"].forEach(function (id) { on(id, "input", curAll); on(id, "change", curAll); });
  on("cur-swap", "click", function () { setTimeout(curAll, 30); });
  if ($("cur-all")) { curAll(); setTimeout(curAll, 2500); }

  var ebHost = panelOf("tool-bill");
  if (ebHost) ebHost.appendChild(actionsRow(function () {
    return "Electricity Bill Estimate (Khari Baat Tools)\nUnits: " + $("eb-units").value + " (" + $("eb-cat").value + ")\nEnergy: " + $("eb-energy").textContent + "\nFuel adjustment (approx): " + $("eb-fpa").textContent + "\nGST 18%: " + $("eb-gst").textContent + "\nEstimated total: " + $("eb-total").textContent + " (estimate — actual bill may differ)";
  }));
  var ebSec = $("tool-bill");
  if (ebSec) {
    var chips = ebSec.querySelectorAll("[data-units]");
    for (var ci = 0; ci < chips.length; ci++) chips[ci].addEventListener("click", function () {
      $("eb-units").value = this.getAttribute("data-units"); ebCalc();
    });
  }

  var prHost = panelOf("tool-prayer");
  if (prHost) prHost.appendChild(actionsRow(function () {
    var city = $("pr-city").options[$("pr-city").selectedIndex].text;
    return "Prayer Times — " + city + " (Khari Baat)\n" + $("pr-hijri").textContent + "\nFajr " + $("pr-fajr").textContent + " · Dhuhr " + $("pr-dhuhr").textContent + " · Asr " + $("pr-asr").textContent + " · Maghrib " + $("pr-maghrib").textContent + " · Isha " + $("pr-isha").textContent + "\nQibla: " + $("qb-deg").textContent;
  }));
})();
