/* ============================================================
   Khari Baat Tools — P4-20: Land Area Converter
   (mount id: "landconverter")
   Punjab standard: 1 marla = 272.25 sq ft (toggle to the
   225 sq ft marla used in some areas), 1 kanal = 20 marla,
   1 acre = 8 kanal, 1 sq gaz = 9 sq ft, 1 sq m = 10.7639 sq ft.
   Check: 1 kanal @272.25 = 5445 sq ft.
   Test hooks: convertAll() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  var SQM_IN_SQFT = 10.7639;

  function unitSqft(unit, marlaSqft) {
    switch (unit) {
      case 'marla': return marlaSqft;
      case 'kanal': return 20 * marlaSqft;
      case 'acre': return 160 * marlaSqft;
      case 'sqft': return 1;
      case 'sqgaz': return 9;
      case 'sqm': return SQM_IN_SQFT;
      default: return NaN;
    }
  }
  var UNITS = ['marla', 'kanal', 'acre', 'sqft', 'sqgaz', 'sqm'];
  var UNIT_LABELS = {
    marla: 'Marla · مرلہ', kanal: 'Kanal · کنال', acre: 'Acre · ایکڑ',
    sqft: 'Sq Feet · مربع فٹ', sqgaz: 'Sq Gaz (Sq Yard) · مربع گز', sqm: 'Sq Meter · مربع میٹر'
  };
  function convertAll(value, fromUnit, marlaSqft) {
    var v = parseFloat(value);
    if (!(v >= 0) || isNaN(v)) return null;
    var base = v * unitSqft(fromUnit, marlaSqft);
    var out = {};
    UNITS.forEach(function (u) { out[u] = base / unitSqft(u, marlaSqft); });
    return out;
  }
  function fmt(n, dec) {
    if (n == null || !isFinite(n)) return '—';
    return n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: dec == null ? 4 : dec });
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
  function field(ur, en, input) {
    var w = h('div', 'tm-field'); w.appendChild(label(ur, en)); w.appendChild(input); return w;
  }

  function mount() {
    var root = document.getElementById('landconverter');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var marlaSqft = 272.25;
    var panel = h('div', 'tm-panel');

    /* marla standard toggle */
    var stdField = h('div', 'tm-field');
    stdField.appendChild(label('مرلہ کا معیار', 'Marla standard'));
    var seg = h('div', 'tm-seg');
    var b272 = h('button', null, '1 Marla = 272.25 sq ft (Punjab standard)'); b272.type = 'button'; b272.className = 'active';
    var b225 = h('button', null, '1 Marla = 225 sq ft'); b225.type = 'button';
    seg.appendChild(b272); seg.appendChild(b225);
    stdField.appendChild(seg);
    var stdHelp = h('p', 'tm-help', 'Some cities/areas use the 225 sq ft marla — pick the one your registry uses. بعض علاقوں میں مرلہ 225 مربع فٹ کا ہوتا ہے۔');
    stdField.appendChild(stdHelp);
    panel.appendChild(stdField);

    var amt = h('input', 'tm-input'); amt.type = 'number'; amt.min = '0'; amt.step = 'any'; amt.inputMode = 'decimal'; amt.value = '1';
    var from = h('select', 'tm-select');
    UNITS.forEach(function (u) { var o = h('option', null, UNIT_LABELS[u]); o.value = u; from.appendChild(o); });
    from.value = 'kanal';
    var row = h('div', 'tm-row');
    row.appendChild(field('رقبہ', 'Area', amt));
    row.appendChild(field('اکائی', 'From unit', from));
    panel.appendChild(row);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Convert · بدلیں'); btn.type = 'button';
    var sample = h('button', 'tm-btn', 'Sample: 5 Marla plot · نمونہ'); sample.type = 'button';
    actions.appendChild(btn); actions.appendChild(sample);
    panel.appendChild(actions);

    var err = h('p', 'tm-err', ''); err.hidden = true; panel.appendChild(err);

    var result = h('div', 'tm-result'); result.hidden = true;
    var tblWrap = h('div'); result.appendChild(tblWrap);
    var shareNote = h('p', 'tm-help', '');
    result.appendChild(shareNote);
    var share = h('div', 'tm-share');
    var copy = h('button', 'tm-btn tm-btn-small', 'Copy result · نتیجہ نقل کریں'); copy.type = 'button';
    var wa = h('button', 'tm-btn tm-btn-small tm-btn-wa', 'WhatsApp share'); wa.type = 'button';
    share.appendChild(copy); share.appendChild(wa);
    result.appendChild(share);
    panel.appendChild(result);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Conversions use the Punjab standard (1 kanal = 20 marla, 1 acre = 8 kanal, 1 sq gaz = 9 sq ft). Marla size varies by region and era — always confirm with your local land record / patwari before a deal. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">سودے سے پہلے مقامی ریکارڈ سے تصدیق ضرور کریں، کیونکہ مرلے کا سائز علاقے کے حساب سے بدل سکتا ہے۔</span>';
    panel.appendChild(note);

    var lastText = '';
    copy.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(lastText);
      copy.textContent = 'Copied ✓'; setTimeout(function () { copy.textContent = 'Copy result · نتیجہ نقل کریں'; }, 1800);
    });
    wa.addEventListener('click', function () { window.open('https://wa.me/?text=' + encodeURIComponent(lastText), '_blank', 'noopener'); });

    function calc() {
      var out = convertAll(amt.value, from.value, marlaSqft);
      if (!out) {
        err.textContent = 'Please enter a valid area. · درست رقبہ لکھیں';
        err.hidden = false; result.hidden = true; return;
      }
      err.hidden = true; result.hidden = false;
      var tbl = h('table', 'tm-table');
      tbl.innerHTML = '<tr><th>Unit · اکائی</th><th class="tm-num">Value · مقدار</th></tr>';
      UNITS.forEach(function (u) {
        var tr = h('tr');
        tr.appendChild(h('td', null, UNIT_LABELS[u]));
        var td = h('td', 'tm-num', fmt(out[u], u === 'sqft' || u === 'sqgaz' ? 2 : 4));
        tr.appendChild(td); tbl.appendChild(tr);
      });
      tblWrap.innerHTML = ''; tblWrap.appendChild(tbl);
      lastText = fmt(parseFloat(amt.value)) + ' ' + UNIT_LABELS[from.value].split(' ·')[0] +
        ' = ' + fmt(out.sqft, 2) + ' sq ft = ' + fmt(out.marla, 3) + ' marla = ' + fmt(out.kanal, 4) +
        ' kanal = ' + fmt(out.sqm, 2) + ' sq m (Khari Baat Land Converter, marla = ' + marlaSqft + ' sq ft)';
    }
    btn.addEventListener('click', calc);
    sample.addEventListener('click', function () { amt.value = 5; from.value = 'marla'; calc(); });
    b272.addEventListener('click', function () { marlaSqft = 272.25; b272.className = 'active'; b225.className = ''; calc(); });
    b225.addEventListener('click', function () { marlaSqft = 225; b225.className = 'active'; b272.className = ''; calc(); });
    from.addEventListener('change', calc);
    amt.addEventListener('input', function () { if (!result.hidden) calc(); });
    calc();

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { convertAll: convertAll, unitSqft: unitSqft, UNITS: UNITS };
  }
})();
