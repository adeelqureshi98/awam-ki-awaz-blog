/* ============================================================
   Khari Baat Tools — P3-18: Installment (Qist) Calculator
   (mount id: "installmentcalc")
   Standard amortization: M = P·r / (1 − (1+r)^−n),
   r = annualRate/100/12. Zero rate → P/n.
   Check: 100000, 12 months, 12% → 8884.88 per month.
   Test hooks: compute() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  function compute(principal, months, annualRatePct) {
    var P = parseFloat(principal), n = parseInt(months, 10), a = parseFloat(annualRatePct);
    if (!(P > 0) || !(n >= 1) || isNaN(a) || a < 0) return null;
    var r = a / 100 / 12;
    var m = (r === 0) ? P / n : P * r / (1 - Math.pow(1 + r, -n));
    var total = m * n;
    return {
      monthly: m, total: total, profit: total - P, principal: P, months: n,
      rate: a, monthlyRate: r
    };
  }
  function schedule(principal, months, annualRatePct) {
    var c = compute(principal, months, annualRatePct);
    if (!c) return null;
    var bal = c.principal, rows = [];
    for (var i = 1; i <= c.months; i++) {
      var interest = bal * c.monthlyRate;
      var princ = c.monthly - interest;
      bal = Math.max(0, bal - princ);
      rows.push({ n: i, pay: c.monthly, interest: interest, principal: princ, balance: bal });
    }
    return rows;
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
  function shareRow(text) {
    var row = h('div', 'tm-share');
    var copy = h('button', 'tm-btn tm-btn-small', 'Copy result · نتیجہ نقل کریں'); copy.type = 'button';
    var wa = h('button', 'tm-btn tm-btn-small tm-btn-wa', 'WhatsApp share'); wa.type = 'button';
    copy.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(text());
      copy.textContent = 'Copied ✓';
      setTimeout(function () { copy.textContent = 'Copy result · نتیجہ نقل کریں'; }, 1800);
    });
    wa.addEventListener('click', function () { window.open('https://wa.me/?text=' + encodeURIComponent(text()), '_blank', 'noopener'); });
    row.appendChild(copy); row.appendChild(wa);
    return row;
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
    var root = document.getElementById('installmentcalc');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var principal = numInput('100000');
    var months = numInput('12');
    var rate = numInput('12');
    var row = h('div', 'tm-row3');
    row.appendChild(field('کل رقم (روپے)', 'Amount (PKR)', principal));
    row.appendChild(field('مدت (مہینے)', 'Months', months));
    row.appendChild(field('سالانہ شرح %', 'Annual rate %', rate));
    panel.appendChild(row);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Calculate · حساب لگائیے'); btn.type = 'button';
    var sample = h('button', 'tm-btn', 'Sample · نمونہ'); sample.type = 'button';
    actions.appendChild(btn); actions.appendChild(sample);
    panel.appendChild(actions);

    var err = h('p', 'tm-err', ''); err.hidden = true; panel.appendChild(err);

    var result = h('div', 'tm-result'); result.hidden = true;
    var grid = h('div', 'tm-grid');
    function mkItem(lbl, hero) {
      var it = h('div', 'tm-ritem' + (hero ? ' tm-hero' : ''));
      it.appendChild(h('div', 'tm-rlbl', lbl));
      var v = h('div', 'tm-rval', '—'); it.appendChild(v);
      grid.appendChild(it); return v;
    }
    var mVal = mkItem('ماہانہ قسط · Monthly installment', true);
    var tVal = mkItem('کل ادائیگی · Total payable');
    var pVal = mkItem('کل منافع / سود · Total profit / interest');
    result.appendChild(grid);
    var tblWrap = h('div');
    result.appendChild(tblWrap);
    var lastText = '';
    result.appendChild(shareRow(function () { return lastText; }));
    panel.appendChild(result);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Equal monthly installments calculated with the standard amortization formula. Bank and dealer offers may add processing fees or insurance — always read the full schedule before signing. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ حساب ایک ہی فارمولے سے بنایا گیا ہے؛ اصل پیشکش میں فیس یا انشورنس شامل ہو سکتی ہے، دستخط سے پہلے مکمل شیڈول ضرور دیکھیں۔</span>';
    panel.appendChild(note);

    function calc() {
      var c = compute(principal.value, months.value, rate.value);
      if (!c) {
        err.textContent = 'Please enter a valid amount, months and rate. · براہ کرم درست رقم، مہینے اور شرح لکھیں';
        err.hidden = false; result.hidden = true; return;
      }
      err.hidden = true; result.hidden = false;
      countUp(mVal, c.monthly, 2, 'Rs ');
      countUp(tVal, c.total, 0, 'Rs ');
      countUp(pVal, c.profit, 0, 'Rs ');
      /* small schedule summary: first 3 + last row */
      var rows = schedule(c.principal, c.months, c.rate);
      var pick = rows.slice(0, 3);
      if (rows.length > 4) pick.push(rows[rows.length - 1]);
      else if (rows.length === 4) pick.push(rows[3]);
      var tbl = h('table', 'tm-table');
      tbl.innerHTML = '<tr><th>#</th><th class="tm-num">Payment · قسط</th><th class="tm-num">Profit part</th><th class="tm-num">Principal part</th><th class="tm-num">Balance left · باقی</th></tr>';
      pick.forEach(function (r) {
        var tr = h('tr');
        tr.appendChild(h('td', null, (r.n === rows.length && rows.length > 4 ? '… ' : '') + r.n));
        [r.pay, r.interest, r.principal, r.balance].forEach(function (v) {
          var td = h('td', 'tm-num', fmt(v, 0)); tr.appendChild(td);
        });
        tbl.appendChild(tr);
      });
      tblWrap.innerHTML = '';
      tblWrap.appendChild(h('p', 'tm-help', 'Schedule summary — first 3 and last payment · شیڈول کا خلاصہ'));
      tblWrap.appendChild(tbl);
      lastText = 'Installment plan: Rs ' + fmt(c.principal) + ' over ' + c.months + ' months @ ' + c.rate + '% → monthly Rs ' + fmt(c.monthly, 2) + ', total Rs ' + fmt(c.total) + ' (Khari Baat Installment Calculator)';
    }
    btn.addEventListener('click', calc);
    sample.addEventListener('click', function () {
      principal.value = 100000; months.value = 12; rate.value = 12; calc();
    });

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { compute: compute, schedule: schedule };
  }
})();
