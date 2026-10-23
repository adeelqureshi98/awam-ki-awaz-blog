/* ============================================================
   Khari Baat Tools — P4-24: Desi (Punjabi / Bikrami) Calendar
   (mount id: "desicalendar")
   Month-start table reconciled by the integrator to the fixed
   Nanakshahi table (research FACTS.md, canonical): Chet Mar 14,
   Baisakh Apr 14, Jeth May 15, Harh Jun 15, Sawan Jul 16,
   Bhadon Aug 16, Assu Sep 15, Katak Oct 15, Maghar Nov 14,
   Poh Dec 14, Magh Jan 13, Phagan Feb 12.
   Desi day = days since the desi month started + 1.
   The desi (Bikrami) year begins at Chet; year = Gregorian
   year of that Chet + 57. Approximate — ±1 day is normal
   (leap years shift the table), and the page says so.
   Test hooks: desiDate() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  var MONTHS = [
    { en: 'Chet', ur: 'چیت', gm: 3, gd: 14 },
    { en: 'Baisakh', ur: 'بیساکھ', gm: 4, gd: 14 },
    { en: 'Jeth', ur: 'جیٹھ', gm: 5, gd: 15 },
    { en: 'Harh', ur: 'ہاڑھ', gm: 6, gd: 15 },
    { en: 'Sawan', ur: 'ساون', gm: 7, gd: 16 },
    { en: 'Bhadon', ur: 'بھادوں', gm: 8, gd: 16 },
    { en: 'Assu', ur: 'اسو', gm: 9, gd: 15 },
    { en: 'Katak', ur: 'کتک', gm: 10, gd: 15 },
    { en: 'Maghar', ur: 'مگھر', gm: 11, gd: 14 },
    { en: 'Poh', ur: 'پوہ', gm: 12, gd: 14 },
    { en: 'Magh', ur: 'ماگھ', gm: 1, gd: 13 },
    { en: 'Phagan', ur: 'پھگن', gm: 2, gd: 12 }
  ];
  var DAY = 86400000;
  function dayOnly(y, m, d) { return new Date(y, m - 1, d); }

  function desiDate(input) {
    var date = dayOnly(input.getFullYear(), input.getMonth() + 1, input.getDate());
    var y = date.getFullYear();
    /* build all month starts for years y-1 and y, pick the latest ≤ date */
    var starts = [];
    [y - 1, y].forEach(function (yy) {
      MONTHS.forEach(function (mo, idx) { starts.push({ mo: mo, idx: idx, start: dayOnly(yy, mo.gm, mo.gd), year: yy }); });
    });
    starts.sort(function (a, b) { return a.start - b.start; });
    var chosen = null, next = null;
    for (var i = 0; i < starts.length; i++) {
      if (starts[i].start <= date) { chosen = starts[i]; next = starts[i + 1] || null; }
      else break;
    }
    if (!chosen) return null;
    var day = Math.round((date - chosen.start) / DAY) + 1;
    /* Bikrami year: months Mar..Dec belong to the cycle whose Chet
       starts in the same Gregorian year; Jan/Feb months (Magh,
       Phagan) belong to the previous year's Chet. */
    var chetYear = (chosen.mo.gm >= 3) ? chosen.year : chosen.year - 1;
    var bikrami = chetYear + 57;
    var endDate = next ? new Date(next.start.getTime() - DAY) : null;
    return {
      day: day, monthEn: chosen.mo.en, monthUr: chosen.mo.ur,
      year: bikrami, start: chosen.start, end: endDate
    };
  }
  function fmtGreg(d) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function label(ur, en) {
    var l = h('span', 'tm-label');
    var a = h('span', 'tm-lur', ur); a.setAttribute('lang', 'ur'); a.setAttribute('dir', 'rtl');
    l.appendChild(a); l.appendChild(h('span', 'tm-len', en));
    return l;
  }

  function mount() {
    var root = document.getElementById('desicalendar');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var input = h('input', 'tm-input');
    input.type = 'date';
    var now = new Date();
    function iso(d) {
      var m = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
      return d.getFullYear() + '-' + m + '-' + dd;
    }
    input.value = iso(now);
    var f = h('div', 'tm-field');
    f.appendChild(label('عیسوی تاریخ', 'Gregorian date'));
    f.appendChild(input);
    panel.appendChild(f);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Convert · دیسی تاریخ دیکھیں'); btn.type = 'button';
    var todayBtn = h('button', 'tm-btn', 'Today · آج'); todayBtn.type = 'button';
    actions.appendChild(btn); actions.appendChild(todayBtn);
    panel.appendChild(actions);

    var result = h('div', 'tm-result'); result.hidden = true;
    var grid = h('div', 'tm-grid');
    var hero = h('div', 'tm-ritem tm-hero');
    hero.appendChild(h('div', 'tm-rlbl', 'دیسی تاریخ · Desi date'));
    var heroVal = h('div', 'tm-rval', '—'); hero.appendChild(heroVal);
    var range = h('div', 'tm-ritem');
    range.appendChild(h('div', 'tm-rlbl', 'اس دیسی مہینے کی حدود · This desi month runs'));
    var rangeVal = h('div', 'tm-rval', '—'); rangeVal.style.fontSize = '20px';
    range.appendChild(rangeVal);
    grid.appendChild(hero); grid.appendChild(range);
    result.appendChild(grid);
    panel.appendChild(result);

    /* full-year mini table */
    var tbl = h('table', 'tm-table');
    var head = h('tr');
    head.appendChild(h('th', null, 'Desi month · دیسی مہینہ'));
    head.appendChild(h('th', null, 'Starts (Gregorian) · آغاز'));
    tbl.appendChild(head);
    MONTHS.forEach(function (mo) {
      var tr = h('tr');
      tr.appendChild(h('td', null, mo.en + ' · ' + mo.ur));
      tr.appendChild(h('td', null, mo.gd + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mo.gm - 1]));
      tbl.appendChild(tr);
    });
    var tblWrap = h('div'); tblWrap.style.marginTop = '20px';
    tblWrap.appendChild(h('p', 'tm-help', 'All twelve desi months · بارہ دیسی مہینے'));
    tblWrap.appendChild(tbl);
    panel.appendChild(tblWrap);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Based on the standard Punjabi desi calendar table. A difference of about one day is possible around leap years and local panchang traditions — treat it as approximate (±1 day). ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ معیاری دیسی جدول سے بنایا گیا ہے؛ ایک دن کا فرق ممکن ہے۔</span>';
    panel.appendChild(note);

    function calc() {
      var v = input.value;
      if (!v) return;
      var parts = v.split('-');
      var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      var r = desiDate(d);
      if (!r) return;
      result.hidden = false;
      heroVal.innerHTML = '';
      heroVal.appendChild(document.createTextNode(r.day + ' ' + r.monthEn + ' ' + r.year + ' · '));
      var us = h('span', null, r.day + ' ' + r.monthUr);
      us.setAttribute('lang', 'ur'); us.setAttribute('dir', 'rtl');
      us.style.fontFamily = 'var(--ur)';
      heroVal.appendChild(us);
      rangeVal.textContent = fmtGreg(r.start) + (r.end ? ' → ' + fmtGreg(r.end) : '');
    }
    btn.addEventListener('click', calc);
    input.addEventListener('change', calc);
    todayBtn.addEventListener('click', function () { input.value = iso(new Date()); calc(); });
    calc();

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { desiDate: desiDate, MONTHS: MONTHS };
  }
})();
