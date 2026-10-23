/* ============================================================
   Khari Baat Tools — P4-21: Construction Cost Estimator
   (mount id: "constructioncalc")
   Covered area = plot (marla) × 272.25 sq ft × covered% × floors.
   Per-sq-ft rates are EDITABLE fields. Their defaults come
   from the container's data attributes (integrator injects
   researched values): data-rate-grey, data-rate-average,
   data-rate-premium. If unset they start at 0 and the page
   says so — no unverified rate is hardcoded here.
   Split assumption (shown in the UI, editable): for Average /
   Premium, the grey-structure share is 55% of the total cost
   and finishing is the rest (total − grey).
   Test hooks: estimate() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  var SQFT_PER_MARLA = 272.25;

  function estimate(marla, floors, coveredPct, type, rates, splitPct) {
    var m = parseFloat(marla), f = parseFloat(floors), cp = parseFloat(coveredPct);
    if (!(m > 0) || !(f >= 1) || !(cp > 0 && cp <= 100)) return null;
    var perFloor = m * SQFT_PER_MARLA * (cp / 100);
    var covered = perFloor * f;
    var rate = rates[type];
    if (!(rate > 0)) return { covered: covered, perFloor: perFloor, needsRate: true, type: type };
    var total = covered * rate;
    var grey, finishing;
    if (type === 'grey') { grey = total; finishing = 0; }
    else {
      var sp = parseFloat(splitPct);
      if (isNaN(sp) || sp < 0 || sp > 100) sp = 55;
      grey = total * (sp / 100);
      finishing = total - grey;
    }
    return { covered: covered, perFloor: perFloor, total: total, grey: grey, finishing: finishing, rate: rate, type: type, split: splitPct };
  }
  function fmt(n, dec) {
    if (n == null || !isFinite(n)) return '—';
    return n.toLocaleString('en-PK', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }
  function lakh(n) {
    if (!(n > 0)) return '—';
    if (n >= 10000000) return 'Rs ' + fmt(n / 10000000, 2) + ' crore';
    if (n >= 100000) return 'Rs ' + fmt(n / 100000, 2) + ' lakh';
    return 'Rs ' + fmt(n);
  }

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function countUp(el, target, dec, prefix) {
    var start = null, dur = 650;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (prefix || '') + fmt(target * e, dec);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function label(ur, en) {
    var l = h('span', 'tm-label');
    var a = h('span', 'tm-lur', ur); a.setAttribute('lang', 'ur'); a.setAttribute('dir', 'rtl');
    l.appendChild(a); l.appendChild(h('span', 'tm-len', en));
    return l;
  }
  function field(ur, en, input, help) {
    var w = h('div', 'tm-field'); w.appendChild(label(ur, en)); w.appendChild(input);
    if (help) w.appendChild(h('p', 'tm-help', help)); return w;
  }
  function numInput(ph) { var i = h('input', 'tm-input'); i.type = 'number'; i.min = '0'; i.step = 'any'; i.inputMode = 'decimal'; if (ph) i.placeholder = ph; return i; }

  function mount() {
    var root = document.getElementById('constructioncalc');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    function attrRate(name) {
      var v = parseFloat(root.getAttribute(name));
      return (v > 0) ? v : 0;
    }

    var panel = h('div', 'tm-panel');
    var marla = numInput('7'); marla.value = 7;
    var floors = numInput('2'); floors.value = 2;
    var coveredPct = numInput('80'); coveredPct.value = 80;
    var row = h('div', 'tm-row3');
    row.appendChild(field('پلاٹ (مرلہ)', 'Plot size (marla)', marla));
    row.appendChild(field('منزلیں', 'Floors', floors));
    row.appendChild(field('تعمیر شدہ حصہ % فی منزل', 'Covered area % per floor', coveredPct));
    panel.appendChild(row);

    var typeSel = h('select', 'tm-select');
    [['grey', 'Grey structure only · صرف گرے ڈھانچہ'],
     ['average', 'Average finishing · اوسط فنشنگ'],
     ['premium', 'Premium finishing · اعلیٰ فنشنگ']]
      .forEach(function (o) { var op = h('option', null, o[1]); op.value = o[0]; typeSel.appendChild(op); });
    typeSel.value = 'average';
    panel.appendChild(field('تعمیر کی قسم', 'Construction type', typeSel));

    var rGrey = numInput('0'); rGrey.value = attrRate('data-rate-grey') || '';
    var rAvg = numInput('0'); rAvg.value = attrRate('data-rate-average') || '';
    var rPrem = numInput('0'); rPrem.value = attrRate('data-rate-premium') || '';
    var split = numInput('55'); split.value = 55;
    var row2 = h('div', 'tm-row3');
    row2.appendChild(field('گرے نرخ فی مربع فٹ', 'Grey rate / sq ft (Rs)', rGrey));
    row2.appendChild(field('اوسط فنشنگ نرخ فی مربع فٹ', 'Average rate / sq ft (Rs)', rAvg));
    row2.appendChild(field('اعلیٰ فنشنگ نرخ فی مربع فٹ', 'Premium rate / sq ft (Rs)', rPrem));
    panel.appendChild(row2);
    panel.appendChild(field('گرے ڈھانچے کا حصہ % (اوسط / اعلیٰ کے لیے)', 'Structure (grey) share % — for Average / Premium', split,
      'Assumption: for finished construction, the grey structure is about 55% of total cost and finishing is the remaining 45%. You can change it. فرض: تیار تعمیر میں گرے ڈھانچہ کل لاگت کا لگ بھگ پچپن فیصد ہوتا ہے۔'));

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Estimate · تخمینہ لگائیے'); btn.type = 'button';
    actions.appendChild(btn);
    panel.appendChild(actions);

    var err = h('p', 'tm-err', ''); err.hidden = true; panel.appendChild(err);

    var result = h('div', 'tm-result'); result.hidden = true;
    var grid = h('div', 'tm-grid');
    function mk(lbl, hero) {
      var it = h('div', 'tm-ritem' + (hero ? ' tm-hero' : ''));
      it.appendChild(h('div', 'tm-rlbl', lbl));
      var v = h('div', 'tm-rval', '—'); it.appendChild(v); grid.appendChild(it); return v;
    }
    var totVal = mk('کل تخمینہ لاگت · Estimated total cost', true);
    var covVal = mk('کل تعمیر شدہ رقبہ · Total covered area');
    var greyVal = mk('گرے ڈھانچہ · Grey structure share');
    var finVal = mk('فنشنگ · Finishing share');
    result.appendChild(grid);
    var words = h('p', 'tm-help', ''); result.appendChild(words);
    panel.appendChild(result);

    var note = h('p', 'tm-note');
    note.innerHTML = 'This is a rough budget estimate (takhmeena), not a quotation. Real cost depends on the city, design, materials and market rates on the day you build. Rates are editable — set them to your city’s current contractor rates for a closer figure. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ صرف بجٹ کا تخمینہ ہے، کوٹیشن نہیں۔ اصل لاگت شہر، نقشے اور میٹیریل سے بدلتی ہے۔</span>';
    panel.appendChild(note);

    function currentRates() {
      return { grey: parseFloat(rGrey.value) || 0, average: parseFloat(rAvg.value) || 0, premium: parseFloat(rPrem.value) || 0 };
    }
    function calc() {
      var e = estimate(marla.value, floors.value, coveredPct.value, typeSel.value, currentRates(), parseFloat(split.value));
      if (!e) {
        err.textContent = 'Please check plot size, floors and covered %. · پلاٹ، منزلیں اور فیصد درست لکھیں';
        err.hidden = false; result.hidden = true; return;
      }
      if (e.needsRate) {
        err.textContent = 'The rate for this type is not set yet. Please type your city’s current per-sq-ft rate in the rate field above (or ask the site admin to set researched defaults). · اس قسم کا نرخ درج نہیں۔ اوپر نرخ والے خانے میں اپنے شہر کا موجودہ نرخ لکھیں۔';
        err.hidden = false; result.hidden = true; return;
      }
      err.hidden = true; result.hidden = false;
      countUp(totVal, e.total, 0, 'Rs ');
      covVal.textContent = fmt(e.covered, 0) + ' sq ft (' + fmt(e.perFloor, 0) + ' / floor)';
      countUp(greyVal, e.grey, 0, 'Rs ');
      countUp(finVal, e.finishing, 0, 'Rs ');
      words.textContent = 'In words: about ' + lakh(e.total) + ' · لگ بھگ ' + lakh(e.total);
    }
    btn.addEventListener('click', calc);
    typeSel.addEventListener('change', function () { if (!result.hidden) calc(); });

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { estimate: estimate, SQFT_PER_MARLA: SQFT_PER_MARLA };
  }
})();
