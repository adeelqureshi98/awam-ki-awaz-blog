/* ============================================================
   Khari Baat Tools — P3-19: Percentage & GPA Calculator
   (mount id: "percentagecalc")
   Mode A: obtained/total → percentage + grade on the common
   scale (A+ ≥90, A ≥80, B ≥70, C ≥60, D ≥50, E ≥40, F <40).
   Mode B: percentage problems — X% of Y · X is what % of Y ·
   percentage change from A to B.
   Check: 450/600 = 75% → grade B.
   Test hooks: pure helpers exported under Node.
   ============================================================ */
(function () {
  'use strict';

  function percent(obtained, total) {
    var o = parseFloat(obtained), t = parseFloat(total);
    if (!(t > 0) || isNaN(o) || o < 0) return null;
    return (o / t) * 100;
  }
  function grade(p) {
    if (p == null || !isFinite(p)) return null;
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B';
    if (p >= 60) return 'C';
    if (p >= 50) return 'D';
    if (p >= 40) return 'E';
    return 'F';
  }
  function gpaPoint(g) {
    return { 'A+': 4.0, 'A': 3.7, 'B': 3.0, 'C': 2.3, 'D': 1.7, 'E': 1.0, 'F': 0 }[g];
  }
  function xPercentOfY(x, y) { var a = parseFloat(x), b = parseFloat(y); return (isNaN(a) || isNaN(b)) ? null : (a / 100) * b; }
  function xIsWhatPercent(x, y) { var a = parseFloat(x), b = parseFloat(y); return (isNaN(a) || !(b > 0)) ? null : (a / b) * 100; }
  function pctChange(from, to) {
    var a = parseFloat(from), b = parseFloat(to);
    return (isNaN(a) || isNaN(b) || a === 0) ? null : ((b - a) / Math.abs(a)) * 100;
  }
  function fmt(n, dec) {
    if (n == null || !isFinite(n)) return '—';
    return n.toLocaleString('en-PK', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec == null ? 2 : dec });
  }

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function countUp(el, target, dec, suffix) {
    var start = null, dur = 650;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e, dec) + (suffix || '');
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
  function field(ur, en, input) {
    var w = h('div', 'tm-field'); w.appendChild(label(ur, en)); w.appendChild(input); return w;
  }
  function numInput(ph) { var i = h('input', 'tm-input'); i.type = 'number'; i.min = '0'; i.step = 'any'; i.inputMode = 'decimal'; if (ph) i.placeholder = ph; return i; }

  function mount() {
    var root = document.getElementById('percentagecalc');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');

    /* mode switch */
    var seg = h('div', 'tm-seg');
    var bA = h('button', null, 'Marks & Grade · نمبر و گریڈ'); bA.type = 'button'; bA.className = 'active';
    var bB = h('button', null, 'Percentage Problems · فیصد مسائل'); bB.type = 'button';
    seg.appendChild(bA); seg.appendChild(bB);
    var segField = h('div', 'tm-field'); segField.appendChild(seg);
    panel.appendChild(segField);

    /* ---- Mode A ---- */
    var boxA = h('div');
    var obt = numInput('450'), tot = numInput('600');
    var rowA = h('div', 'tm-row');
    rowA.appendChild(field('حاصل کردہ نمبر', 'Marks obtained', obt));
    rowA.appendChild(field('کل نمبر', 'Total marks', tot));
    boxA.appendChild(rowA);
    var btnA = h('button', 'tm-btn tm-btn-gold', 'Calculate · حساب لگائیے'); btnA.type = 'button';
    var actA = h('div', 'tm-actions'); actA.appendChild(btnA); boxA.appendChild(actA);
    var errA = h('p', 'tm-err', ''); errA.hidden = true; boxA.appendChild(errA);
    var resA = h('div', 'tm-result'); resA.hidden = true;
    var gridA = h('div', 'tm-grid');
    function mk(grid, lbl, hero) {
      var it = h('div', 'tm-ritem' + (hero ? ' tm-hero' : ''));
      it.appendChild(h('div', 'tm-rlbl', lbl));
      var v = h('div', 'tm-rval', '—'); it.appendChild(v); grid.appendChild(it); return v;
    }
    var pVal = mk(gridA, 'فیصد · Percentage', true);
    var gVal = mk(gridA, 'گریڈ · Grade');
    var gpaVal = mk(gridA, 'تخمینی جی پی اے · Approx. GPA point');
    var remVal = mk(gridA, 'نمبر باقی · Marks needed for next grade');
    resA.appendChild(gridA);
    boxA.appendChild(resA);
    panel.appendChild(boxA);

    /* ---- Mode B ---- */
    var boxB = h('div'); boxB.hidden = true;
    var bSel = h('select', 'tm-select');
    [['of', 'What is X% of Y? · Y کا X فیصد کتنا ہے؟'],
     ['iswhat', 'X is what % of Y? · X، Y کا کتنا فیصد ہے؟'],
     ['change', 'Percentage change from A to B · A سے B تک فیصد تبدیلی']]
      .forEach(function (o) { var op = h('option', null, o[1]); op.value = o[0]; bSel.appendChild(op); });
    boxB.appendChild(field('مسئلے کی قسم', 'Problem type', bSel));
    var bx = numInput(''), by = numInput('');
    var rowB = h('div', 'tm-row');
    var fx = field('X / A', 'X / From value', bx);
    var fy = field('Y / B', 'Y / To value', by);
    rowB.appendChild(fx); rowB.appendChild(fy);
    boxB.appendChild(rowB);
    var btnB = h('button', 'tm-btn tm-btn-gold', 'Solve · حل کریں'); btnB.type = 'button';
    var actB = h('div', 'tm-actions'); actB.appendChild(btnB); boxB.appendChild(actB);
    var errB = h('p', 'tm-err', ''); errB.hidden = true; boxB.appendChild(errB);
    var resB = h('div', 'tm-result'); resB.hidden = true;
    var gridB = h('div', 'tm-grid');
    var ansB = mk(gridB, 'جواب · Answer', true);
    resB.appendChild(gridB);
    boxB.appendChild(resB);
    panel.appendChild(boxB);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Grades use the common scale: A+ 90%+, A 80%+, B 70%+, C 60%+, D 50%+, E 40%+, F below 40%. Your board or university may use a different scale — their official table always wins. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">گریڈ عام پیمانے سے دیے گئے ہیں؛ آپ کے بورڈ یا یونیورسٹی کا پیمانہ مختلف ہو سکتا ہے۔</span>';
    panel.appendChild(note);

    function setMode(m) {
      bA.className = (m === 'A') ? 'active' : '';
      bB.className = (m === 'B') ? 'active' : '';
      boxA.hidden = (m !== 'A'); boxB.hidden = (m !== 'B');
    }
    bA.addEventListener('click', function () { setMode('A'); });
    bB.addEventListener('click', function () { setMode('B'); });

    function calcA() {
      var p = percent(obt.value, tot.value);
      if (p == null || p > 100) {
        errA.textContent = 'Please check the marks (obtained cannot exceed total). · نمبر درست لکھیں، حاصل کردہ کل سے زیادہ نہیں ہو سکتے';
        errA.hidden = false; resA.hidden = true; return;
      }
      errA.hidden = true; resA.hidden = false;
      var g = grade(p);
      countUp(pVal, p, 2, '');
      pVal.textContent = fmt(p, 2) + '%';
      gVal.textContent = g;
      gpaVal.textContent = fmt(gpaPoint(g), 1);
      var thresholds = [40, 50, 60, 70, 80, 90];
      var next = null;
      for (var i = 0; i < thresholds.length; i++) { if (p < thresholds[i]) { next = thresholds[i]; break; } }
      if (next == null) remVal.textContent = 'Top grade ✓';
      else {
        var need = Math.ceil((next / 100) * parseFloat(tot.value) - parseFloat(obt.value));
        remVal.textContent = fmt(need, 0) + ' more for ' + grade(next);
      }
    }
    btnA.addEventListener('click', calcA);

    function calcB() {
      var kind = bSel.value, ans;
      if (kind === 'of') ans = xPercentOfY(bx.value, by.value);
      else if (kind === 'iswhat') ans = xIsWhatPercent(bx.value, by.value);
      else ans = pctChange(bx.value, by.value);
      if (ans == null) {
        errB.textContent = 'Please enter valid numbers. · درست اعداد لکھیں';
        errB.hidden = false; resB.hidden = true; return;
      }
      errB.hidden = true; resB.hidden = false;
      if (kind === 'of') ansB.textContent = fmt(ans, 2);
      else ansB.textContent = fmt(ans, 2) + '%';
    }
    btnB.addEventListener('click', calcB);

    /* sample on load: 450 / 600 (integrator patch: prefill values so the sample calc shows results, not the error) */
    obt.value = 450; tot.value = 600;
    calcA();

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { percent: percent, grade: grade, gpaPoint: gpaPoint, xPercentOfY: xPercentOfY, xIsWhatPercent: xIsWhatPercent, pctChange: pctChange };
  }
})();
