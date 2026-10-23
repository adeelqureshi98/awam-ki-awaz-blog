/* ============================================================
   Khari Baat Tools — P3-15: Gold Price Calculator
   (mount id: "goldcalc")
   The per-tola rate default comes from the container's
   data-default-rate attribute (the integrator injects the
   researched current rate there). NO price is hardcoded here.
   1 tola = 11.6638 grams.
   Test hooks: pure helpers exported under Node.
   ============================================================ */
(function () {
  'use strict';

  var GRAMS_PER_TOLA = 11.6638;

  function totalPrice(ratePerTola, weight, unit) {
    var w = parseFloat(weight), r = parseFloat(ratePerTola);
    if (!(w > 0) || !(r > 0)) return null;
    var tolas = (unit === 'gram') ? w / GRAMS_PER_TOLA : w;
    return r * tolas;
  }
  function perGram(ratePerTola) {
    var r = parseFloat(ratePerTola);
    return (r > 0) ? r / GRAMS_PER_TOLA : null;
  }
  function fmt(n, dec) {
    if (n == null || !isFinite(n)) return '—';
    return n.toLocaleString('en-PK', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function countUp(el, target, dec, prefix, suffix) {
    var start = null, dur = 650, from = 0;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = from + (target - from) * eased;
      el.textContent = (prefix || '') + fmt(v, dec) + (suffix || '');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function shareRow(text) {
    var row = h('div', 'tm-share');
    var copy = h('button', 'tm-btn tm-btn-small', 'Copy result · نتیجہ نقل کریں');
    copy.type = 'button';
    var wa = h('button', 'tm-btn tm-btn-small tm-btn-wa', 'WhatsApp share');
    wa.type = 'button';
    copy.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(text());
      copy.textContent = 'Copied ✓';
      setTimeout(function () { copy.textContent = 'Copy result · نتیجہ نقل کریں'; }, 1800);
    });
    wa.addEventListener('click', function () {
      window.open('https://wa.me/?text=' + encodeURIComponent(text()), '_blank', 'noopener');
    });
    row.appendChild(copy); row.appendChild(wa);
    return row;
  }
  function label(ur, en) {
    var l = h('span', 'tm-label');
    var a = h('span', 'tm-lur', ur); a.setAttribute('lang', 'ur'); a.setAttribute('dir', 'rtl');
    l.appendChild(a); l.appendChild(h('span', 'tm-len', en));
    return l;
  }
  function field(ur, en, input, help) {
    var w = h('div', 'tm-field');
    w.appendChild(label(ur, en)); w.appendChild(input);
    if (help) { var hp = h('p', 'tm-help', help); w.appendChild(hp); }
    return w;
  }
  function numInput(ph) { var i = h('input', 'tm-input'); i.type = 'number'; i.min = '0'; i.step = 'any'; i.inputMode = 'decimal'; if (ph) i.placeholder = ph; return i; }

  function mount() {
    var root = document.getElementById('goldcalc');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var rate = numInput('e.g. 000000');
    var injected = parseFloat(root.getAttribute('data-default-rate'));
    if (injected > 0) rate.value = injected;

    var weight = numInput('1');
    var unit = 'tola';
    var seg = h('div', 'tm-seg');
    var bT = h('button', null, 'Tola · تولہ'); bT.type = 'button'; bT.className = 'active';
    var bG = h('button', null, 'Gram · گرام'); bG.type = 'button';
    seg.appendChild(bT); seg.appendChild(bG);
    function setUnit(u) {
      unit = u;
      bT.className = (u === 'tola') ? 'active' : '';
      bG.className = (u === 'gram') ? 'active' : '';
      calc();
    }
    bT.addEventListener('click', function () { setUnit('tola'); });
    bG.addEventListener('click', function () { setUnit('gram'); });

    var row = h('div', 'tm-row');
    row.appendChild(field('فی تولہ نرخ (روپے)', 'Rate per tola (PKR)', rate,
      'Enter today’s market rate — you can change it anytime. آج کا بازاری نرخ لکھیں، جب چاہیں بدل سکتے ہیں۔'));
    var wf = h('div', 'tm-field');
    wf.appendChild(label('وزن', 'Weight'));
    wf.appendChild(weight);
    var segWrap = h('div'); segWrap.style.marginTop = '10px'; segWrap.appendChild(seg);
    wf.appendChild(segWrap);
    row.appendChild(wf);
    panel.appendChild(row);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Calculate · حساب لگائیے'); btn.type = 'button';
    var sample = h('button', 'tm-btn', 'Sample · نمونہ'); sample.type = 'button';
    actions.appendChild(btn); actions.appendChild(sample);
    panel.appendChild(actions);

    var err = h('p', 'tm-err', ''); err.hidden = true; panel.appendChild(err);

    var result = h('div', 'tm-result'); result.hidden = true;
    var grid = h('div', 'tm-grid');
    var hero = h('div', 'tm-ritem tm-hero');
    hero.appendChild(h('div', 'tm-rlbl', 'کل قیمت · Total price'));
    var heroVal = h('div', 'tm-rval', '—');
    hero.appendChild(heroVal);
    var item2 = h('div', 'tm-ritem');
    item2.appendChild(h('div', 'tm-rlbl', 'فی گرام نرخ · Rate per gram'));
    var gramVal = h('div', 'tm-rval', '—');
    item2.appendChild(gramVal);
    var item3 = h('div', 'tm-ritem');
    item3.appendChild(h('div', 'tm-rlbl', 'وزن تولوں میں · Weight in tola'));
    var tolaVal = h('div', 'tm-rval', '—');
    item3.appendChild(tolaVal);
    grid.appendChild(hero); grid.appendChild(item2); grid.appendChild(item3);
    result.appendChild(grid);
    var lastText = '';
    result.appendChild(shareRow(function () { return lastText; }));
    panel.appendChild(result);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Estimate only, using 1 tola = 11.6638 grams. Actual prices differ by purity (24k / 22k), making charges and the day’s market rate. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ صرف تخمینہ ہے؛ اصل قیمت سونے کی قسم، بنائی اور اس دن کے نرخ سے بدل سکتی ہے۔</span>';
    panel.appendChild(note);

    function calc() {
      var r = parseFloat(rate.value), w = parseFloat(weight.value);
      var total = totalPrice(r, w, unit);
      if (total == null) {
        err.textContent = 'Please enter a valid rate and weight. · براہ کرم درست نرخ اور وزن لکھیں';
        err.hidden = false; result.hidden = true;
        return;
      }
      err.hidden = true; result.hidden = false;
      var tolas = (unit === 'gram') ? w / GRAMS_PER_TOLA : w;
      countUp(heroVal, total, 0, 'Rs ');
      countUp(gramVal, perGram(r), 2, 'Rs ');
      tolaVal.textContent = fmt(tolas, 4) + ' tola';
      lastText = 'Gold price: ' + fmt(w, unit === 'gram' ? 2 : 3) + ' ' + unit + ' @ Rs ' + fmt(r) + '/tola = Rs ' + fmt(total) + ' (Khari Baat Gold Calculator)';
    }
    btn.addEventListener('click', calc);
    sample.addEventListener('click', function () {
      if (!(parseFloat(rate.value) > 0)) rate.value = 100000; /* sample only, clearly an example */
      weight.value = 2.5; setUnit('tola'); calc();
    });
    [rate, weight].forEach(function (i) { i.addEventListener('input', function () { if (!result.hidden) calc(); }); });

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { totalPrice: totalPrice, perGram: perGram, GRAMS_PER_TOLA: GRAMS_PER_TOLA };
  }
})();
