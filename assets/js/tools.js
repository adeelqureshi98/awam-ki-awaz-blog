// Khari Baat — tools.js (v3.3) — all client-side, no dependencies
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var fmtMoney = function (n, dec) {
    return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };

  /* ================= Tool A — Nastaliq Poetry Card Generator ================= */
  var card = (function () {
    var cv = $("cardCanvas");
    if (!cv) return null;
    var ctx = cv.getContext("2d");
    var size = "1:1";
    var THEMES = {
      royal:   { bg1: "#16203a", bg2: "#0B0F1A", frame: "#C9A24B", frame2: "#E7C877", text: "#F4E3B2", sub: "#E7C877", wm: "rgba(231,200,119,.62)" },
      emerald: { bg1: "#14665A", bg2: "#07332c", frame: "#C9A24B", frame2: "#E7C877", text: "#F7F2E9", sub: "#E7C877", wm: "rgba(231,200,119,.62)" },
      ivory:   { bg1: "#FFFDF7", bg2: "#EFE7D7", frame: "#9A7B2D", frame2: "#C9A24B", text: "#232323", sub: "#9A7B2D", wm: "rgba(154,123,45,.66)" },
      midnight:{ bg1: "#232323", bg2: "#000000", frame: "#C9A24B", frame2: "#E7C877", text: "#EFE7D7", sub: "#E7C877", wm: "rgba(231,200,119,.6)" }
    };

    function diamond(x, y, r, color) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = color; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
    }

    function draw() {
      var W = cv.width, H = cv.height;
      var th = THEMES[$("cardTheme").value] || THEMES.royal;
      var g = ctx.createLinearGradient(0, 0, W * 0.25, H);
      g.addColorStop(0, th.bg1); g.addColorStop(1, th.bg2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // soft glow
      var rg = ctx.createRadialGradient(W / 2, H * 0.36, 40, W / 2, H * 0.36, W * 0.75);
      rg.addColorStop(0, "rgba(201,162,75,.20)"); rg.addColorStop(1, "rgba(201,162,75,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

      // double gold frame + corner diamonds
      ctx.strokeStyle = th.frame; ctx.lineWidth = 6; ctx.strokeRect(30, 30, W - 60, H - 60);
      ctx.strokeStyle = th.frame2; ctx.lineWidth = 2; ctx.strokeRect(52, 52, W - 104, H - 104);
      [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]].forEach(function (p) { diamond(p[0], p[1], 9, th.frame2); });

      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      try { ctx.direction = "rtl"; } catch (e) {}

      var cx = W / 2;
      // top ornament
      diamond(cx, 104, 8, th.frame2);
      ctx.strokeStyle = th.frame; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 120, 104); ctx.lineTo(cx - 26, 104); ctx.moveTo(cx + 26, 104); ctx.lineTo(cx + 120, 104); ctx.stroke();

      var tag = ($("cardTag").value || "").trim();
      var y = 150;
      if (tag) {
        ctx.fillStyle = th.sub;
        ctx.font = "44px 'Noto Nastaliq Urdu', serif";
        ctx.fillText(tag, cx, y + 16);
        y += 108;
      }

      // main sher text — auto-fit
      var raw = ($("cardText").value || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      if (!raw.length) raw = ["اپنا شعر یہاں لکھیے"];
      var availH = H - y - 330; // leave room for divider, creator, watermark
      var fs = size === "1:1" ? 64 : 68;
      var lh, total;
      while (fs > 26) {
        ctx.font = "700 " + fs + "px 'Noto Nastaliq Urdu', serif";
        lh = fs * 2.2; total = raw.length * lh;
        var tooWide = raw.some(function (ln) { return ctx.measureText(ln).width > W - 190; });
        if (total <= availH && !tooWide) break;
        fs -= 3;
      }
      ctx.font = "700 " + fs + "px 'Noto Nastaliq Urdu', serif";
      lh = fs * 2.2; total = raw.length * lh;
      var ty = y + 40 + (availH - total) / 2 + lh / 2;
      ctx.fillStyle = th.text;
      raw.forEach(function (ln) { ctx.fillText(ln, cx, ty); ty += lh; });

      // divider ornament under the verse
      var dy = H - 258;
      ctx.strokeStyle = th.frame; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 150, dy); ctx.lineTo(cx - 24, dy); ctx.moveTo(cx + 24, dy); ctx.lineTo(cx + 150, dy); ctx.stroke();
      diamond(cx, dy, 7, th.frame2);

      var creator = ($("cardCreator").value || "").trim();
      if (creator) {
        ctx.fillStyle = th.sub;
        ctx.font = "38px 'Noto Nastaliq Urdu', serif";
        ctx.fillText(creator, cx, dy + 58);
      }

      // watermark
      try { ctx.direction = "ltr"; } catch (e) {}
      ctx.fillStyle = th.wm;
      ctx.font = "600 25px 'Playfair Display', Georgia, serif";
      ctx.fillText("K H A R I   B A A T", cx, H - 128);
      ctx.font = "23px 'Source Serif 4', Georgia, serif";
      ctx.fillText("adeelqureshi98.github.io/awam-ki-awaz-blog", cx, H - 92);
    }

    function setSize(s) {
      size = s;
      cv.width = 1080; cv.height = (s === "9:16") ? 1920 : 1080;
      document.querySelectorAll("[data-card-size]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-card-size") === s);
      });
      var wrap = $("cardPreviewWrap");
      if (wrap) wrap.classList.toggle("tall", s === "9:16");
      draw();
    }

    ["cardText", "cardTag", "cardCreator"].forEach(function (id) { on($(id), "input", draw); });
    on($("cardTheme"), "change", draw);
    document.querySelectorAll("[data-card-size]").forEach(function (b) {
      b.addEventListener("click", function () { setSize(b.getAttribute("data-card-size")); });
    });
    document.querySelectorAll("[data-fill]").forEach(function (b) {
      b.addEventListener("click", function () {
        $("cardText").value = b.getAttribute("data-fill");
        draw();
      });
    });
    on($("cardDownload"), "click", function () {
      draw();
      if (cv.toBlob) {
        cv.toBlob(function (blob) {
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "khari-baat-card.png";
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
        }, "image/png");
      } else {
        var a2 = document.createElement("a");
        a2.href = cv.toDataURL("image/png"); a2.download = "khari-baat-card.png"; a2.click();
      }
    });

    // draw now, and again once the Nastaliq webfont is truly ready
    draw();
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load("700 64px 'Noto Nastaliq Urdu'"),
        document.fonts.load("44px 'Noto Nastaliq Urdu'")
      ]).then(draw).catch(function () {});
      if (document.fonts.ready) document.fonts.ready.then(draw);
    }
    return { draw: draw };
  })();

  /* ================= Tool B — Age + Hijri Converter ================= */
  (function () {
    var btn = $("ageBtn");
    if (!btn) return;
    var UR_DAYS = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];
    var EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var hijriFmt = null, hijriFmtFB = null;
    try { hijriFmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }); } catch (e) {}
    try { hijriFmtFB = new Intl.DateTimeFormat("en-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }); } catch (e) {}
    function hijri(d) {
      try { var hs = (hijriFmt || hijriFmtFB).format(d); return /AH/i.test(hs) ? hs : hs + " AH"; } catch (e) { return "—"; }
    }
    btn.addEventListener("click", function () {
      var v = $("dob").value, err = $("ageErr"), box = $("ageResult");
      err.hidden = true;
      if (!v) { err.hidden = false; box.hidden = true; return; }
      var p = v.split("-").map(Number);
      var dob = new Date(p[0], p[1] - 1, p[2], 12, 0, 0);
      var now = new Date();
      if (isNaN(dob.getTime()) || dob > now) { err.hidden = false; box.hidden = true; return; }

      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
      var years = today.getFullYear() - dob.getFullYear();
      var months = today.getMonth() - dob.getMonth();
      var days = today.getDate() - dob.getDate();
      if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }
      var totalDays = Math.floor((today - dob) / 86400000);
      var totalHours = Math.floor((now - new Date(p[0], p[1] - 1, p[2])) / 3600000);

      var nb = new Date(today.getFullYear(), dob.getMonth(), dob.getDate(), 12, 0, 0);
      if (nb < today) nb = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate(), 12, 0, 0);
      var cd = Math.round((nb - today) / 86400000);

      $("ageYMD").textContent = years + " years, " + months + " months, " + days + " days";
      $("ageYMDSub").textContent = years + " سال، " + months + " ماہ، " + days + " دن";
      $("ageDays").textContent = fmt(totalDays);
      $("ageHours").textContent = fmt(totalHours);
      $("ageWeekday").textContent = EN_DAYS[dob.getDay()];
      $("ageWeekdaySub").textContent = UR_DAYS[dob.getDay()];
      $("ageCountdown").textContent = cd === 0 ? "Today — آج!" : fmt(cd) + " days";
      $("ageHijriDob").textContent = hijri(dob);
      $("ageHijriToday").textContent = hijri(now);
      box.hidden = false;
    });
  })();

  /* ================= Tool C — YouTube Income Calculator ================= */
  (function () {
    var btn = $("ytBtn");
    if (!btn) return;
    var RPM = {
      shorts: { pk: 0.03, gulf: 0.06, usuk: 0.08, mixed: 0.05 },
      long:   { pk: 0.60, gulf: 2.50, usuk: 4.50, mixed: 1.50 }
    };
    var NICHE = { edu: 1.3, tech: 1.3, biz: 1.3, ent: 0.9, vlog: 1.0, other: 1.0 };
    btn.addEventListener("click", function () {
      var views = parseFloat($("ytViews").value), err = $("ytErr"), box = $("ytResult");
      err.hidden = true;
      if (!views || views <= 0) { err.hidden = false; box.hidden = true; return; }
      var rpm = RPM[$("ytFormat").value][$("ytRegion").value] * NICHE[$("ytNiche").value];
      var daily = views / 1000 * rpm;
      var monthly = daily * 30, yearly = daily * 365;
      $("ytRpm").textContent = "$" + rpm.toFixed(2) + " / 1000 views";
      $("ytDaily").textContent = "$" + fmtMoney(daily, 2);
      $("ytMonthly").textContent = "$" + fmtMoney(monthly, 2);
      $("ytMonthlySub").textContent = "≈ Rs " + fmt(Math.round(monthly * 280)) + " · ≈ AED " + fmtMoney(monthly * 3.67, 0);
      $("ytYearly").textContent = "$" + fmtMoney(yearly, 2);
      $("ytYearlySub").textContent = "≈ Rs " + fmt(Math.round(yearly * 280)) + " · ≈ AED " + fmtMoney(yearly * 3.67, 0);
      box.hidden = false;
    });
  })();

  /* ================= Tool D — BMI & Health Calculator ================= */
  (function () {
    var btn = $("bmiBtn");
    if (!btn) return;
    var unit = "cm";
    document.querySelectorAll("[data-hunit]").forEach(function (b) {
      b.addEventListener("click", function () {
        unit = b.getAttribute("data-hunit");
        document.querySelectorAll("[data-hunit]").forEach(function (x) {
          x.classList.toggle("active", x === b);
        });
        $("hCmGroup").hidden = unit !== "cm";
        $("hFtGroup").hidden = unit !== "ft";
      });
    });
    var ACT = { sed: 1.2, light: 1.375, mod: 1.55, act: 1.725 };
    function cat(bmi) {
      if (bmi < 18.5) return { en: "Underweight", ur: "کم وزن", cls: "bmi-under" };
      if (bmi < 25) return { en: "Normal", ur: "درست وزن", cls: "bmi-normal" };
      if (bmi < 30) return { en: "Overweight", ur: "زائد وزن", cls: "bmi-over" };
      return { en: "Obese", ur: "موٹاپا", cls: "bmi-obese" };
    }
    btn.addEventListener("click", function () {
      var err = $("bmiErr"), box = $("bmiResult");
      err.hidden = true;
      var hCm;
      if (unit === "cm") { hCm = parseFloat($("hCm").value); }
      else {
        var ft = parseFloat($("hFt").value) || 0, inch = parseFloat($("hIn").value) || 0;
        hCm = (ft * 12 + inch) * 2.54;
      }
      var w = parseFloat($("bmiWeight").value);
      var age = parseFloat($("bmiAge").value);
      if (!hCm || hCm < 80 || hCm > 260 || !w || w < 15 || w > 500 || !age || age < 2 || age > 120) {
        err.hidden = false; box.hidden = true; return;
      }
      var m = hCm / 100;
      var bmi = w / (m * m);
      var c = cat(bmi);
      var lo = 18.5 * m * m, hi = 24.9 * m * m;
      var bmr = 10 * w + 6.25 * hCm - 5 * age + ($("bmiGender").value === "m" ? 5 : -161);
      var cal = bmr * ACT[$("bmiActivity").value];
      var water = w * 35 / 1000;
      $("bmiVal").textContent = bmi.toFixed(1);
      var chip = $("bmiChip");
      chip.textContent = c.ur + " · " + c.en;
      chip.className = "bmi-chip " + c.cls;
      $("bmiIdeal").textContent = lo.toFixed(1) + " – " + hi.toFixed(1) + " kg";
      $("bmiWater").textContent = water.toFixed(1) + " litres";
      $("bmiWaterSub").textContent = "≈ " + Math.round(water / 0.25) + " glasses · گلاس";
      $("bmiCal").textContent = fmt(Math.round(cal)) + " kcal";
      box.hidden = false;
    });
  })();
})();
