/* ============================================================
   Khari Baat Tools — P4-25: Pakistan Time Converter
   (mount id: "timeconverter")
   Enter a date & time as Pakistan time (Asia/Karachi) and see
   the same moment in Dubai, London, New York, Toronto, Riyadh
   and Kuala Lumpur. Uses Intl time-zone data, so daylight
   saving in London / New York / Toronto is handled
   automatically and correctly.
   Test hooks: zonedTimeToUTC() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  var CITIES = [
    { en: 'Dubai', ur: 'دبئی', tz: 'Asia/Dubai' },
    { en: 'London', ur: 'لندن', tz: 'Europe/London' },
    { en: 'New York', ur: 'نیو یارک', tz: 'America/New_York' },
    { en: 'Toronto', ur: 'ٹورنٹو', tz: 'America/Toronto' },
    { en: 'Riyadh', ur: 'ریاض', tz: 'Asia/Riyadh' },
    { en: 'Kuala Lumpur', ur: 'کوالالمپور', tz: 'Asia/Kuala_Lumpur' }
  ];

  /* Convert a wall-clock time in `timeZone` to the UTC instant. */
  function zonedTimeToUTC(year, month, day, hour, minute, timeZone) {
    var guess = Date.UTC(year, month - 1, day, hour, minute, 0);
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    var p = {};
    dtf.formatToParts(new Date(guess)).forEach(function (x) { p[x.type] = x.value; });
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
    var offset = asUTC - guess;
    return new Date(guess - offset);
  }
  function formatIn(instant, tz) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(instant);
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
    var root = document.getElementById('timeconverter');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var input = h('input', 'tm-input');
    input.type = 'datetime-local';
    function isoLocal(d) {
      function p2(n) { return ('0' + n).slice(-2); }
      return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + 'T' + p2(d.getHours()) + ':' + p2(d.getMinutes());
    }
    var now = new Date();
    now.setSeconds(0, 0);
    input.value = isoLocal(now); /* visitor's clock ≈ close enough as a starting value */
    var f = h('div', 'tm-field');
    f.appendChild(label('پاکستان کا وقت', 'Pakistan date & time (PKT)'));
    f.appendChild(input);
    var help = h('p', 'tm-help', 'The time you type is treated as Pakistan time. نیچے والا وقت پاکستان کے وقت کے حساب سے لیا گیا ہے۔');
    f.appendChild(help);
    panel.appendChild(f);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Convert · بدلیں'); btn.type = 'button';
    var nowBtn = h('button', 'tm-btn', 'Right now · اسی وقت'); nowBtn.type = 'button';
    actions.appendChild(btn); actions.appendChild(nowBtn);
    panel.appendChild(actions);

    var result = h('div', 'tm-result'); result.hidden = true;
    panel.appendChild(result);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Daylight saving in the UK, USA and Canada is applied automatically from your browser’s time-zone data, so summer and winter differences are both correct. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">گرمیوں اور سردیوں کے فرق خودکار طور پر درست لگائے جاتے ہیں۔</span>';
    panel.appendChild(note);

    function calc() {
      var v = input.value;
      if (!v) return;
      var m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (!m) return;
      var instant = zonedTimeToUTC(+m[1], +m[2], +m[3], +m[4], +m[5], 'Asia/Karachi');
      result.innerHTML = '';
      var pkRow = h('div', 'tm-time-row');
      var pkCity = h('span', 'tm-time-city');
      pkCity.appendChild(document.createTextNode('Pakistan · '));
      var pu = h('span', 'tm-ur', 'پاکستان'); pu.setAttribute('lang', 'ur'); pu.setAttribute('dir', 'rtl');
      pkCity.appendChild(pu);
      pkRow.appendChild(pkCity);
      var pkVal = h('span', 'tm-time-val', formatIn(instant, 'Asia/Karachi'));
      pkRow.appendChild(pkVal);
      result.appendChild(pkRow);
      CITIES.forEach(function (c) {
        var row = h('div', 'tm-time-row');
        var city = h('span', 'tm-time-city');
        city.appendChild(document.createTextNode(c.en + ' · '));
        var us = h('span', 'tm-ur', c.ur); us.setAttribute('lang', 'ur'); us.setAttribute('dir', 'rtl');
        city.appendChild(us);
        row.appendChild(city);
        row.appendChild(h('span', 'tm-time-val', formatIn(instant, c.tz)));
        result.appendChild(row);
      });
      result.hidden = false;
    }
    btn.addEventListener('click', calc);
    input.addEventListener('change', calc);
    nowBtn.addEventListener('click', function () {
      var n = new Date(); n.setSeconds(0, 0);
      /* show current Karachi wall time in the box */
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(n);
      var p = {}; parts.forEach(function (x) { p[x.type] = x.value; });
      function p2(s) { return ('0' + s).slice(-2); }
      input.value = p.year + '-' + p2(p.month) + '-' + p2(p.day) + 'T' + p2(p.hour % 24) + ':' + p2(p.minute);
      calc();
    });
    calc();

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { zonedTimeToUTC: zonedTimeToUTC, CITIES: CITIES };
  }
})();
