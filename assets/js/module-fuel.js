/* ============================================================
   Khari Baat Tools — P4-22: Fuel / Trip Cost Calculator
   (mount id: "fuelcalc")
   Fuel needed = distance ÷ average; cost = fuel × price.
   Price default comes from the container's data-default-price
   attribute (integrator injects the researched pump price).
   No price is hardcoded here. Round-trip toggle + per-person
   split included.
   Test hooks: compute() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  function compute(distanceKm, kmPerLiter, pricePerLiter, roundTrip, persons) {
    var d = parseFloat(distanceKm), a = parseFloat(kmPerLiter), p = parseFloat(pricePerLiter);
    if (!(d > 0) || !(a > 0) || !(p > 0)) return null;
    var totalDist = roundTrip ? d * 2 : d;
    var fuel = totalDist / a;
    var cost = fuel * p;
    var n = parseInt(persons, 10);
    return {
      distance: totalDist, fuel: fuel, cost: cost,
      perPerson: (n >= 1) ? cost / n : null, persons: (n >= 1) ? n : null
    };
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
    var start = null, dur = 650;
    function frame(ts) {
      if (!start) start = ts;
      var pr = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - pr, 3);
      el.textContent = (prefix || '') + fmt(target * e, dec) + (suffix || '');
      if (pr < 1) requestAnimationFrame(frame);
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
    var root = document.getElementById('fuelcalc');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var dist = numInput('250');
    var avg = numInput('14');
    var price = numInput('');
    var injected = parseFloat(root.getAttribute('data-default-price'));
    if (injected > 0) price.value = injected;
    var persons = numInput('1'); persons.value = 1;

    var row = h('div', 'tm-row3');
    row.appendChild(field('فاصلہ (کلومیٹر)', 'Distance (km)', dist));
    row.appendChild(field('گاڑی کی اوسط (km فی لیٹر)', 'Vehicle average (km / litre)', avg));
    row.appendChild(field('پیٹرول نرخ فی لیٹر (روپے)', 'Petrol price / litre (PKR)', price,
      injected > 0 ? 'Prefilled with the latest rate we listed — change it if the pump price differs. نرخ بدلا ہو تو یہاں درست کر لیں۔'
                    : 'Type the current pump price. موجودہ پمپ نرخ لکھیں۔'));
    panel.appendChild(row);

    var row2 = h('div', 'tm-row');
    var rtField = h('div', 'tm-field');
    rtField.appendChild(label('واپسی بھی شامل؟', 'Round trip?'));
    var seg = h('div', 'tm-seg');
    var bOne = h('button', null, 'One way · یک طرفہ'); bOne.type = 'button'; bOne.className = 'active';
    var bRound = h('button', null, 'Round trip · آنا جانا'); bRound.type = 'button';
    seg.appendChild(bOne); seg.appendChild(bRound);
    rtField.appendChild(seg);
    row2.appendChild(rtField);
    row2.appendChild(field('افراد (خرچ تقسیم)', 'Persons (split the cost)', persons));
    panel.appendChild(row2);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Calculate · حساب لگائیے'); btn.type = 'button';
    var sample = h('button', 'tm-btn', 'Sample: Kot Addu → Multan · نمونہ'); sample.type = 'button';
    actions.appendChild(btn); actions.appendChild(sample);
    panel.appendChild(actions);

    var err = h('p', 'tm-err', ''); err.hidden = true; panel.appendChild(err);

    var result = h('div', 'tm-result'); result.hidden = true;
    var grid = h('div', 'tm-grid');
    function mk(lbl, hero) {
      var it = h('div', 'tm-ritem' + (hero ? ' tm-hero' : ''));
      it.appendChild(h('div', 'tm-rlbl', lbl));
      var v = h('div', 'tm-rval', '—'); it.appendChild(v); grid.appendChild(it); return v;
    }
    var costVal = mk('کل پیٹرول خرچ · Total fuel cost', true);
    var fuelVal = mk('پیٹرول درکار · Fuel needed');
    var ppVal = mk('فی شخص حصہ · Per person');
    result.appendChild(grid);
    var lastText = '';
    var share = h('div', 'tm-share');
    var copy = h('button', 'tm-btn tm-btn-small', 'Copy result · نتیجہ نقل کریں'); copy.type = 'button';
    var wa = h('button', 'tm-btn tm-btn-small tm-btn-wa', 'WhatsApp share'); wa.type = 'button';
    share.appendChild(copy); share.appendChild(wa);
    result.appendChild(share);
    panel.appendChild(result);
    copy.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(lastText);
      copy.textContent = 'Copied ✓'; setTimeout(function () { copy.textContent = 'Copy result · نتیجہ نقل کریں'; }, 1800);
    });
    wa.addEventListener('click', function () { window.open('https://wa.me/?text=' + encodeURIComponent(lastText), '_blank', 'noopener'); });

    var note = h('p', 'tm-note');
    note.innerHTML = 'Estimate only — actual fuel use changes with AC, load, traffic and road condition. Tolls and food are not included. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ تخمینہ ہے؛ اصل خرچ اے سی، بوجھ اور راستے سے بدل سکتا ہے۔ ٹول اور کھانا شامل نہیں۔</span>';
    panel.appendChild(note);

    var roundTrip = false;
    bOne.addEventListener('click', function () { roundTrip = false; bOne.className = 'active'; bRound.className = ''; if (!result.hidden) calc(); });
    bRound.addEventListener('click', function () { roundTrip = true; bRound.className = 'active'; bOne.className = ''; if (!result.hidden) calc(); });

    function calc() {
      var c = compute(dist.value, avg.value, price.value, roundTrip, persons.value);
      if (!c) {
        err.textContent = 'Please enter distance, average and the current petrol price. · فاصلہ، اوسط اور پیٹرول کا نرخ لکھیں';
        err.hidden = false; result.hidden = true; return;
      }
      err.hidden = true; result.hidden = false;
      countUp(costVal, c.cost, 0, 'Rs ');
      countUp(fuelVal, c.fuel, 2, '', ' litres');
      ppVal.textContent = (c.perPerson != null && c.persons > 1) ? 'Rs ' + fmt(c.perPerson, 0) + ' × ' + c.persons : 'Rs ' + fmt(c.cost, 0) + ' (1 person)';
      lastText = 'Trip fuel: ' + fmt(c.distance, 0) + ' km → ' + fmt(c.fuel, 2) + ' litres = Rs ' + fmt(c.cost, 0) + (c.persons > 1 ? ' (Rs ' + fmt(c.perPerson, 0) + ' per person × ' + c.persons + ')' : '') + ' (Khari Baat Fuel Calculator)';
    }
    btn.addEventListener('click', calc);
    sample.addEventListener('click', function () {
      dist.value = 80; avg.value = 14;
      if (!(parseFloat(price.value) > 0)) price.value = 300; /* example only */
      persons.value = 4; roundTrip = true; bRound.className = 'active'; bOne.className = '';
      calc();
    });

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { compute: compute };
  }
})();
