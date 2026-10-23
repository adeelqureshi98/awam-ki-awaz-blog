/* ============================================================
   Khari Baat Tools — P4-23: Ramadan / Eid Countdown
   (mount id: "countdown")
   Finds the next 1 Ramadan, next 1 Shawwal (Eid-ul-Fitr) and
   next 10 Dhul-Hijjah (Eid-ul-Adha) by scanning Gregorian days
   forward through Intl's Umm al-Qura calendar, then ticks a
   live countdown to the nearest one.
   Dates are EXPECTED — the final word belongs to the moon
   (Ruet-e-Hilal), and the page says so.
   Test hooks: hijriParts() / findNext() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  var HIJRI_UR = ['محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذیقعدہ', 'ذوالحجہ'];
  var HIJRI_EN = ['Muharram', 'Safar', 'Rabi-ul-Awwal', 'Rabi-us-Sani', 'Jumada Awwal', 'Jumada Sani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Zilqad', 'Zilhajj'];

  var dtfParts = null;
  function getDtf() {
    if (!dtfParts) {
      dtfParts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
    }
    return dtfParts;
  }
  function hijriParts(date) {
    var parts = getDtf().formatToParts(date), out = {};
    parts.forEach(function (p) {
      if (p.type === 'day') out.d = parseInt(p.value, 10);
      if (p.type === 'month') out.m = parseInt(p.value, 10);
      if (p.type === 'year') out.y = parseInt(p.value, 10);
    });
    return out;
  }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  /* Scan forward from `from` for the next Gregorian date whose
     Hijri month/day match exactly. Max ~800 days (just over 2
     Hijri years) guarantees a hit for any month/day pair. */
  function findNext(hMonth, hDay, from) {
    var cur = startOfDay(from);
    for (var i = 0; i < 800; i++) {
      var p = hijriParts(cur);
      if (p.m === hMonth && p.d === hDay) return { date: new Date(cur), hijri: p };
      cur.setDate(cur.getDate() + 1);
    }
    return null;
  }
  var EVENTS = [
    { key: 'ramadan', m: 9, d: 1, en: 'Ramadan begins', ur: 'رمضان کا آغاز' },
    { key: 'fitr', m: 10, d: 1, en: 'Eid-ul-Fitr', ur: 'عید الفطر' },
    { key: 'adha', m: 12, d: 10, en: 'Eid-ul-Adha', ur: 'عید الاضحیٰ' }
  ];
  function upcoming(from) {
    return EVENTS.map(function (e) {
      var r = findNext(e.m, e.d, from);
      return { key: e.key, en: e.en, ur: e.ur, date: r ? r.date : null, hijri: r ? r.hijri : null };
    }).filter(function (e) { return e.date; })
      .sort(function (a, b) { return a.date - b.date; });
  }
  function fmtGreg(d) {
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function mount() {
    var root = document.getElementById('countdown');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    panel.style.textAlign = 'center';
    var headUr = h('p', null, '');
    headUr.innerHTML = '<span lang="ur" dir="rtl" style="font-family:var(--ur);font-size:22px;color:var(--gold-deep)">اگلی بڑی گھڑی</span>';
    panel.appendChild(headUr);
    var title = h('h3', null, '');
    title.style.cssText = 'font-family:var(--serif);font-size:clamp(22px,3vw,30px);color:var(--ink);margin:4px 0 2px';
    panel.appendChild(title);
    var sub = h('p', 'tm-help', '');
    sub.style.textAlign = 'center';
    panel.appendChild(sub);

    var count = h('div', 'tm-count');
    var cells = {};
    [['days', 'Days', 'دن'], ['hours', 'Hours', 'گھنٹے'], ['mins', 'Minutes', 'منٹ'], ['secs', 'Seconds', 'سیکنڈ']].forEach(function (c) {
      var cell = h('div', 'tm-cell');
      var n = h('div', 'tm-n', '—');
      var u = h('div', 'tm-u');
      u.appendChild(document.createTextNode(c[1] + ' · '));
      var us = h('span', 'tm-ur', c[2]); us.setAttribute('lang', 'ur'); us.setAttribute('dir', 'rtl');
      u.appendChild(us);
      cell.appendChild(n); cell.appendChild(u);
      count.appendChild(cell);
      cells[c[0]] = n;
    });
    panel.appendChild(count);

    var listWrap = h('div');
    listWrap.style.marginTop = '24px';
    panel.appendChild(listWrap);

    var note = h('p', 'tm-note');
    note.style.textAlign = 'left';
    note.innerHTML = 'Dates are expected, calculated from the Umm al-Qura calendar. In Pakistan the final announcement belongs to the Ruet-e-Hilal Committee after the moon is sighted, so a date can shift by a day. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">تاریخیں متوقع ہیں؛ حتمی اعلان چاند نظر آنے پر رویت ہلال کمیٹی کرتی ہے، ایک دن کا فرق ممکن ہے۔</span>';
    panel.appendChild(note);
    root.appendChild(panel);

    var now = new Date();
    var ups = upcoming(now);
    if (!ups.length) {
      title.textContent = 'Could not calculate the dates on this browser.';
      return;
    }
    var next = ups[0];
    title.innerHTML = '';
    title.appendChild(document.createTextNode('Next: ' + next.en + ' · '));
    var tu = h('span', null, next.ur);
    tu.setAttribute('lang', 'ur'); tu.setAttribute('dir', 'rtl');
    tu.style.fontFamily = 'var(--ur)'; tu.style.color = 'var(--gold-deep)';
    title.appendChild(tu);
    sub.textContent = fmtGreg(next.date) + ' — ' + next.hijri.d + ' ' + HIJRI_EN[next.hijri.m - 1] + ' ' + next.hijri.y + ' AH (expected)';

    var tbl = h('table', 'tm-table');
    tbl.innerHTML = '<tr><th>Event · موقع</th><th>Hijri · ہجری</th><th class="tm-num">Expected date · متوقع تاریخ</th><th class="tm-num">Days left · دن باقی</th></tr>';
    var today0 = startOfDay(new Date());
    ups.forEach(function (e) {
      var tr = h('tr');
      tr.appendChild(h('td', null, e.en + ' · ' + e.ur));
      tr.appendChild(h('td', null, e.hijri.d + ' ' + HIJRI_EN[e.hijri.m - 1] + ' ' + e.hijri.y));
      var td = h('td', 'tm-num', fmtGreg(e.date)); tr.appendChild(td);
      var days = Math.round((startOfDay(e.date) - today0) / 86400000);
      tr.appendChild(h('td', 'tm-num', days === 0 ? 'Today · آج' : String(days)));
      tbl.appendChild(tr);
    });
    listWrap.appendChild(tbl);

    var target = startOfDay(next.date).getTime();
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        /* event day has started: if it is today, celebrate; else stop */
        var isToday = startOfDay(new Date()).getTime() === target;
        cells.days.textContent = '0'; cells.hours.textContent = '0'; cells.mins.textContent = '0'; cells.secs.textContent = '0';
        if (isToday) sub.textContent = 'Today! Mubarak · آج ہی کا دن ہے، مبارک ہو — ' + fmtGreg(next.date);
        return;
      }
      var s = Math.floor(diff / 1000);
      cells.days.textContent = Math.floor(s / 86400);
      cells.hours.textContent = Math.floor((s % 86400) / 3600);
      cells.mins.textContent = Math.floor((s % 3600) / 60);
      cells.secs.textContent = s % 60;
    }
    tick();
    setInterval(tick, 1000);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { hijriParts: hijriParts, findNext: findNext, upcoming: upcoming, EVENTS: EVENTS };
  }
})();
