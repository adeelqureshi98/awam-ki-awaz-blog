// Khari Baat — tools.js (v3.3) — all client-side, no dependencies
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var fmtMoney = function (n, dec) {
    return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };

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

/* Khari Baat — Tools v3.6 enrichment: share/copy rows for the Phase 1 tools. */
(function () {
  "use strict";
  function row(containerId, title) {
    var host = document.getElementById(containerId);
    if (!host) return;
    var d = document.createElement("div");
    d.className = "tool-actions"; d.style.flexWrap = "wrap"; d.style.marginTop = "16px";
    function text() {
      var t = (host.innerText || "").replace(/\n{2,}/g, "\n").trim();
      return title + "\n" + t + "\n— Khari Baat Tools";
    }
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn btn-ghost"; b.textContent = "Copy Result · نتیجہ کاپی کریں";
    b.addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(text()).catch(function () {});
      b.textContent = "Copied ✓"; setTimeout(function () { b.textContent = "Copy Result · نتیجہ کاپی کریں"; }, 1600);
    });
    var a = document.createElement("a");
    a.className = "btn btn-ghost"; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Share on WhatsApp · واٹس ایپ پر بھیجیں";
    a.addEventListener("click", function () { a.href = "https://wa.me/?text=" + encodeURIComponent(text()); });
    d.appendChild(b); d.appendChild(a); host.appendChild(d);
  }
  row("ageResult", "My Age & Hijri Date (Khari Baat Tools)");
  row("ytResult", "YouTube Income Estimate (Khari Baat Tools)");
  row("bmiResult", "My BMI & Health Numbers (Khari Baat Tools)");
})();
