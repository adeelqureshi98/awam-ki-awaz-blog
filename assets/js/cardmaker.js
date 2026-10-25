/* ============================================================
   Khari Baat — Occasion Card Maker (cardmaker.js)
   Universal card generator: Poetry · Wedding (Daawat Nama) ·
   Birthday · Custom Event. Pure vanilla JS, no dependencies.
   Mounts into <div id="cardmaker"></div> and builds its own DOM.
   Uses site design-system classes (f-group, f-input, seg,
   tool-cols, card-preview…) + scoped cm- classes.
   ============================================================ */
(function () {
  'use strict';

  var BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u064e\u0651\u0647\u0650 \u0627\u0644\u0631\u064e\u0651\u062D\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u064e\u0651\u062D\u0650\u064a\u0645\u0650';
  var URDU_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  function isUrdu(s) { return URDU_RE.test(String(s || '')); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shade(hex, pct) { // pct -100..100
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100;
    r = Math.round((t - r) * p) + r; g = Math.round((t - g) * p) + g; b = Math.round((t - b) * p) + b;
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ---------------- themes ---------------- */
  var THEMES = {
    royal:    { name: 'Royal Gold',    ur: 'شاہی سنہری',  bg1: '#0B0F1A', bg2: '#1B2436', fg: '#F7F2E9', accent: '#E7C877', deep: '#C9A24B', sub: '#CFC8B8', frame: '#C9A24B' },
    emerald:  { name: 'Emerald Court', ur: 'زمردی',       bg1: '#06231C', bg2: '#14665A', fg: '#F2FBF6', accent: '#E7C877', deep: '#C9A24B', sub: '#BFE3D2', frame: '#C9A24B' },
    maroon:   { name: 'Royal Maroon',  ur: 'عنابی',       bg1: '#2B0710', bg2: '#6E1423', fg: '#FDF3E7', accent: '#E7C877', deep: '#C9A24B', sub: '#EBC9C4', frame: '#C9A24B' },
    midnight: { name: 'Midnight Blue', ur: 'نصف شب نیلا', bg1: '#060D26', bg2: '#1D3468', fg: '#EEF2FF', accent: '#BFD0FF', deep: '#C9A24B', sub: '#B9C6E8', frame: '#C9A24B' },
    rose:     { name: 'Rose Garden',   ur: 'گلابی',       bg1: '#2E0A1C', bg2: '#7A2547', fg: '#FFF3F6', accent: '#F6C6D3', deep: '#C9A24B', sub: '#F0CDD8', frame: '#D9A441' },
    ivory:    { name: 'Ivory Paper',   ur: 'ہاتھی دانت',  bg1: '#F7F2E9', bg2: '#EDDFC4', fg: '#232323', accent: '#9A7B2D', deep: '#9A7B2D', sub: '#6B6455', frame: '#B08A2E' }
  };

  /* ---------------- modes & fields ---------------- */
  // type: 'text' | 'textarea' | 'textarea-en' ; half:true pairs fields into .f-row
  var MODES = {
    poetry: {
      label: 'Poetry', ur: 'شاعری',
      fields: [
        { k: 'lines', type: 'textarea', ur: 'اشعار لکھیے', en: 'Poetry / quote — one line (misra) per line', ph: 'اپنا پسندیدہ شعر یہاں لکھیے…' },
        { k: 'tag', type: 'text', ur: 'عنوان / سطر', en: 'Tag line — optional', ph: 'مثلاً: شعرِ روز' },
        { k: 'creator', type: 'text', ur: 'آپ کا نام', en: 'Creator name — optional', ph: 'مثلاً: محمد عدیل' }
      ]
    },
    wedding: {
      label: 'Wedding', ur: 'شادی',
      fields: [
        { k: 'dulha', type: 'text', ur: 'دلہا کا نام', en: "Groom's name", half: true },
        { k: 'dulhan', type: 'text', ur: 'دلہن کا نام', en: "Bride's name", half: true },
        { k: 'dulhaParents', type: 'text', ur: 'دلہا کے والدین', en: "Groom's parents — optional", ph: 'مثلاً: حاجی محمد اسلم و اہلیہ کے صاحبزادے', half: true },
        { k: 'dulhanParents', type: 'text', ur: 'دلہن کے والدین', en: "Bride's parents — optional", ph: 'مثلاً: میاں عبدالرشید و اہلیہ کی صاحبزادی', half: true },
        { k: 'dua', type: 'text', ur: 'دعائیہ جملہ', en: 'Dua / blessing line — optional', ph: 'اللہ تعالیٰ اس جوڑے کو خوش و آباد رکھے' },
        { k: 'date', type: 'text', ur: 'تاریخ', en: 'Date', half: true },
        { k: 'time', type: 'text', ur: 'وقت', en: 'Time', half: true },
        { k: 'venue', type: 'text', ur: 'جگہ / ہال', en: 'Venue', half: true },
        { k: 'city', type: 'text', ur: 'شہر', en: 'City', half: true },
        { k: 'host', type: 'text', ur: 'میزبان', en: 'Host — optional', half: true },
        { k: 'rsvp', type: 'text', ur: 'رابطہ نمبر', en: 'RSVP / contact — optional', half: true }
      ]
    },
    birthday: {
      label: 'Birthday', ur: 'سالگرہ',
      fields: [
        { k: 'name', type: 'text', ur: 'نام', en: 'Name of the birthday star' },
        { k: 'age', type: 'text', ur: 'عمر', en: 'Age line — optional', ph: 'e.g. Turning 7', half: true },
        { k: 'date', type: 'text', ur: 'تاریخ', en: 'Date', half: true },
        { k: 'time', type: 'text', ur: 'وقت', en: 'Time', half: true },
        { k: 'venue', type: 'text', ur: 'جگہ', en: 'Venue', half: true },
        { k: 'host', type: 'text', ur: 'میزبان', en: 'Host — optional', half: true },
        { k: 'message', type: 'textarea-en', ur: 'پیغام', en: 'Message line — optional', ph: 'A warm line for your guests…' }
      ]
    },
    custom: {
      label: 'Custom Event', ur: 'کوئی بھی تقریب',
      fields: [
        { k: 'title', type: 'text', ur: 'تقریب کا عنوان', en: 'Event title' },
        { k: 'names', type: 'text', ur: 'اہم نام / سطر', en: 'Main names line — optional' },
        { k: 'message', type: 'textarea-en', ur: 'پیغام', en: 'Message line — optional', ph: 'You are warmly invited…' },
        { k: 'date', type: 'text', ur: 'تاریخ', en: 'Date', half: true },
        { k: 'time', type: 'text', ur: 'وقت', en: 'Time', half: true },
        { k: 'venue', type: 'text', ur: 'جگہ', en: 'Venue', half: true },
        { k: 'host', type: 'text', ur: 'میزبان', en: 'Host — optional', half: true }
      ]
    }
  };
  var MODE_ORDER = ['poetry', 'wedding', 'birthday', 'custom'];

  var SAMPLES = {
    poetry: {
      lines: 'خودی کو کر بلند اتنا کہ ہر تقدیر سے پہلے\nخدا بندے سے خود پوچھے بتا تیری رضا کیا ہے',
      tag: 'شعرِ روز', creator: 'محمد عدیل'
    },
    wedding: {
      dulha: 'محمد علی رضا', dulhan: 'فاطمہ زینب',
      dulhaParents: 'حاجی محمد اسلم و اہلیہ کے صاحبزادے',
      dulhanParents: 'میاں عبدالرشید و اہلیہ کی صاحبزادی',
      dua: 'اللہ تعالیٰ اس جوڑے کو ہمیشہ خوش و آباد رکھے، آمین',
      date: 'اتوار، ۱۵ نومبر ۲۰۲۶', time: 'شام ۷ بجے',
      venue: 'رائل پام میرج ہال', city: 'کوٹ ادو',
      host: 'برادرانِ رضا', rsvp: '0331-8009893'
    },
    birthday: {
      name: 'Ayesha Khan', age: 'Turning 7',
      date: 'Saturday, 21 November 2026', time: '5:00 PM',
      venue: 'Rose Garden Hall', host: 'The Khan Family',
      message: 'Cake, games and lots of fun — you are warmly invited!'
    },
    custom: {
      title: 'Annual Mehfil & Dinner', names: 'The Adeel Family',
      message: 'An evening of poetry, food and good company.',
      date: 'Friday, 4 December 2026', time: '7:30 PM',
      venue: 'Sapna Hall, GT Road', host: 'Muhammad Adeel'
    }
  };

  /* ---------------- state ---------------- */
  var state = {
    mode: 'poetry',
    theme: 'royal',
    size: '1:1',           // '1:1' | '9:16'
    customBg: '',          // '' = use theme
    customFg: '',
    values: { poetry: {}, wedding: {}, birthday: {}, custom: {} }
  };
  state.values.poetry = {
    lines: SAMPLES.poetry.lines, tag: '', creator: ''
  };

  /* ---------------- DOM build ---------------- */
  var root, fieldsBox, canvas, ctx, previewWrap, themeRow, sizeSeg, modeSeg;

  function fieldGroup(f) {
    var g = el('div', 'f-group');
    var id = 'cm-' + state.mode + '-' + f.k;
    var lab = el('label', 'f-label');
    lab.setAttribute('for', id);
    lab.innerHTML = '<span class="fl-ur" lang="ur" dir="rtl">' + esc(f.ur) + '</span>' +
                    '<span class="fl-en">' + esc(f.en) + '</span>';
    g.appendChild(lab);
    var input;
    if (f.type === 'textarea' || f.type === 'textarea-en') {
      input = el('textarea', 'f-input' + (f.type === 'textarea-en' ? ' cm-ta' : ''));
      input.rows = f.type === 'textarea' ? 4 : 3;
    } else {
      input = el('input', 'f-input');
      input.type = 'text';
    }
    input.id = id;
    input.setAttribute('data-cm-field', f.k);
    input.setAttribute('dir', 'auto');
    if (f.ph) input.setAttribute('placeholder', f.ph);
    input.value = state.values[state.mode][f.k] || '';
    g.appendChild(input);
    return g;
  }

  function buildFields() {
    fieldsBox.innerHTML = '';
    var fields = MODES[state.mode].fields;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.half && i + 1 < fields.length && fields[i + 1].half) {
        var row = el('div', 'f-row');
        row.appendChild(fieldGroup(f));
        row.appendChild(fieldGroup(fields[i + 1]));
        fieldsBox.appendChild(row);
        i++;
      } else {
        fieldsBox.appendChild(fieldGroup(f));
      }
    }
  }

  function buildUI(mount) {
    root = mount;
    root.innerHTML = '';
    var cols = el('div', 'tool-cols');

    /* ---- left column: controls ---- */
    var left = el('div');

    var modeGroup = el('div', 'f-group');
    modeGroup.innerHTML = '<span class="f-label"><span class="fl-ur" lang="ur" dir="rtl">کارڈ کی قسم منتخب کیجیے</span><span class="fl-en">Card type</span></span>';
    modeSeg = el('div', 'seg');
    modeSeg.setAttribute('role', 'group');
    modeSeg.setAttribute('aria-label', 'Card type');
    MODE_ORDER.forEach(function (m) {
      var b = el('button', m === state.mode ? 'active' : '', esc(MODES[m].label));
      b.type = 'button';
      b.setAttribute('data-cm-mode', m);
      b.addEventListener('click', function () { setMode(m); });
      modeSeg.appendChild(b);
    });
    modeGroup.appendChild(modeSeg);
    left.appendChild(modeGroup);

    fieldsBox = el('div', 'cm-fields');
    left.appendChild(fieldsBox);

    /* sample fill */
    var qf = el('div', 'quick-fill');
    qf.style.marginBottom = '18px';
    var sampleBtn = el('button', '', 'Fill a sample · <span lang="ur" dir="rtl">نمونہ بھریے</span>');
    sampleBtn.type = 'button';
    sampleBtn.addEventListener('click', fillSample);
    qf.appendChild(sampleBtn);
    left.appendChild(qf);

    /* theme swatches */
    var themeGroup = el('div', 'f-group');
    themeGroup.innerHTML = '<span class="f-label"><span class="fl-ur" lang="ur" dir="rtl">تھیم منتخب کیجیے</span><span class="fl-en">Theme</span></span>';
    themeRow = el('div', 'cm-swatches');
    Object.keys(THEMES).forEach(function (key) {
      var t = THEMES[key];
      var wrap = el('div', 'cm-swatch-cell');
      var b = el('button', 'cm-swatch' + (key === state.theme ? ' active' : ''));
      b.type = 'button';
      b.title = t.name;
      b.setAttribute('aria-label', t.name);
      b.setAttribute('data-cm-theme', key);
      b.style.background = 'linear-gradient(135deg,' + t.bg1 + ',' + t.bg2 + ')';
      b.addEventListener('click', function () { setTheme(key); });
      var nm = el('span', 'cm-swatch-name', esc(t.name));
      wrap.appendChild(b); wrap.appendChild(nm);
      themeRow.appendChild(wrap);
    });
    themeGroup.appendChild(themeRow);
    left.appendChild(themeGroup);

    /* custom colours */
    var colorGroup = el('div', 'f-group');
    colorGroup.innerHTML = '<span class="f-label"><span class="fl-ur" lang="ur" dir="rtl">اپنے رنگ (اختیاری)</span><span class="fl-en">Custom colours — optional</span></span>';
    var colors = el('div', 'cm-colors');
    function colorCell(label, key) {
      var cell = el('label', 'cm-color');
      var inp = el('input', 'cm-color-input');
      inp.type = 'color';
      inp.value = key === 'bg' ? (state.customBg || THEMES[state.theme].bg1) : (state.customFg || THEMES[state.theme].fg);
      inp.addEventListener('input', function () {
        if (key === 'bg') state.customBg = inp.value; else state.customFg = inp.value;
        scheduleDraw();
      });
      cell.appendChild(inp);
      cell.appendChild(el('span', '', esc(label)));
      return cell;
    }
    colors.appendChild(colorCell('Background', 'bg'));
    colors.appendChild(colorCell('Text', 'fg'));
    var reset = el('button', 'cm-reset', 'Reset to theme');
    reset.type = 'button';
    reset.addEventListener('click', function () {
      readFields();
      state.customBg = ''; state.customFg = '';
      buildUI(root); scheduleDraw();
    });
    colors.appendChild(reset);
    colorGroup.appendChild(colors);
    left.appendChild(colorGroup);

    /* size */
    var row2 = el('div', 'f-row');
    var sizeGroup = el('div', 'f-group');
    sizeGroup.innerHTML = '<span class="f-label"><span class="fl-ur" lang="ur" dir="rtl">سائز</span><span class="fl-en">Size</span></span>';
    sizeSeg = el('div', 'seg');
    sizeSeg.setAttribute('role', 'group');
    sizeSeg.setAttribute('aria-label', 'Card size');
    [['1:1', '1:1 · Post'], ['9:16', '9:16 · Status']].forEach(function (pair) {
      var b = el('button', pair[0] === state.size ? 'active' : '', esc(pair[1]));
      b.type = 'button';
      b.setAttribute('data-cm-size', pair[0]);
      b.addEventListener('click', function () { setSize(pair[0]); });
      sizeSeg.appendChild(b);
    });
    sizeGroup.appendChild(sizeSeg);
    row2.appendChild(sizeGroup);

    left.appendChild(row2);

    /* actions */
    var actions = el('div', 'tool-actions');
    var dl = el('button', 'btn btn-gold', 'Download PNG · <span lang="ur" dir="rtl">ڈاؤن لوڈ</span>');
    dl.type = 'button';
    dl.addEventListener('click', download);
    actions.appendChild(dl);
    left.appendChild(actions);

    var note = el('p', 'tool-note',
      'Every card is drawn in your own browser at full HD (1080px) — nothing is uploaded anywhere. ' +
      '<span class="n-ur" lang="ur" dir="rtl">کارڈ آپ کے براؤزر ہی میں بنتا ہے، کہیں اپلوڈ نہیں ہوتا۔</span>');
    left.appendChild(note);

    cols.appendChild(left);

    /* ---- right column: live preview ---- */
    previewWrap = el('div', 'card-preview' + (state.size === '9:16' ? ' tall' : ''));
    canvas = el('canvas');
    canvas.id = 'cmCanvas';
    canvas.width = state.size === '9:16' ? 1080 : 1080;
    canvas.height = state.size === '9:16' ? 1920 : 1080;
    canvas.setAttribute('aria-label', 'Card preview');
    ctx = canvas.getContext('2d');
    previewWrap.appendChild(canvas);
    previewWrap.appendChild(el('p', 'card-cap', 'Live preview · <span lang="ur" dir="rtl">براہِ راست جھلک</span>'));
    cols.appendChild(previewWrap);

    root.appendChild(cols);
    buildFields();

    /* live preview: any keystroke redraws the card */
    fieldsBox.addEventListener('input', function (e) {
      var k = e.target && e.target.getAttribute && e.target.getAttribute('data-cm-field');
      if (k) { state.values[state.mode][k] = e.target.value; scheduleDraw(); }
    });
  }

  /* ---------------- control actions ---------------- */
  function setMode(m) {
    readFields();
    state.mode = m;
    var btns = modeSeg.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-cm-mode') === m);
    }
    buildFields();
    scheduleDraw();
  }
  function setTheme(key) {
    state.theme = key;
    state.customBg = ''; state.customFg = '';
    var btns = themeRow.querySelectorAll('.cm-swatch');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-cm-theme') === key);
    }
    scheduleDraw();
  }
  function setSize(s) {
    state.size = s;
    canvas.width = 1080;
    canvas.height = s === '9:16' ? 1920 : 1080;
    previewWrap.classList.toggle('tall', s === '9:16');
    var btns = sizeSeg.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-cm-size') === s);
    }
    scheduleDraw();
  }
  function fillSample() {
    state.values[state.mode] = JSON.parse(JSON.stringify(SAMPLES[state.mode]));
    buildFields();
    scheduleDraw();
  }
  function readFields() {
    if (!fieldsBox) return;
    var inputs = fieldsBox.querySelectorAll('[data-cm-field]');
    for (var i = 0; i < inputs.length; i++) {
      state.values[state.mode][inputs[i].getAttribute('data-cm-field')] = inputs[i].value;
    }
  }
  function download() {
    draw();
    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'khari-baat-' + state.mode + '-card.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
      }, 'image/png');
    } else {
      var a2 = document.createElement('a');
      a2.href = canvas.toDataURL('image/png');
      a2.download = 'khari-baat-' + state.mode + '-card.png';
      document.body.appendChild(a2); a2.click(); a2.remove();
    }
  }

  /* ---------------- drawing engine ---------------- */
  function fontFor(stack, size, weight) {
    if (stack === 'ur') return weight + ' ' + size + 'px "Noto Nastaliq Urdu","Playfair Display",serif';
    return weight + ' ' + size + 'px "Playfair Display",Georgia,"Times New Roman",serif';
  }
  function stackOf(text) { return isUrdu(text) ? 'ur' : 'en'; }

  function fitSize(text, stack, weight, start, min, maxW) {
    var s = start;
    ctx.font = fontFor(stack, s, weight);
    while (s > min && ctx.measureText(text).width > maxW) {
      s -= 3;
      ctx.font = fontFor(stack, s, weight);
    }
    return s;
  }
  function wrapText(text, stack, weight, size, maxW) {
    ctx.font = fontFor(stack, size, weight);
    var words = String(text).split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width <= maxW || !cur) cur = test;
      else { lines.push(cur); cur = words[i]; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }

  function starPath(cx, cy, R) {
    ctx.beginPath();
    for (var i = 0; i < 16; i++) {
      var ang = (Math.PI / 8) * i - Math.PI / 2;
      var r = (i % 2 === 0) ? R : R * 0.44;
      var x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  function drawPattern(W, H, t) {
    ctx.save();
    ctx.fillStyle = t.accent;
    // large faint central medallion
    ctx.globalAlpha = 0.05;
    starPath(W / 2, H / 2, Math.min(W, H) * 0.30); ctx.fill();
    ctx.globalAlpha = 0.10;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.335, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = t.accent; ctx.stroke();
    // corner medallions
    var inset = 96, R = 52;
    [[inset, inset], [W - inset, inset], [inset, H - inset], [W - inset, H - inset]].forEach(function (c) {
      ctx.globalAlpha = 0.13;
      starPath(c[0], c[1], R); ctx.fill();
      ctx.globalAlpha = 0.20;
      ctx.beginPath(); ctx.arc(c[0], c[1], R * 1.22, 0, Math.PI * 2); ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.restore();
  }
  function drawFrame(W, H, t) {
    ctx.save();
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, t.deep); grad.addColorStop(0.5, t.accent); grad.addColorStop(1, t.deep);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.strokeRect(38, 38, W - 76, H - 76);
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 1;
    ctx.strokeRect(56, 56, W - 112, H - 112);
    ctx.globalAlpha = 1;
    // corner diamonds + quarter arcs on the inner frame
    ctx.fillStyle = t.accent;
    [[56, 56], [W - 56, 56], [56, H - 56], [W - 56, H - 56]].forEach(function (c) {
      ctx.save();
      ctx.translate(c[0], c[1]); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-8, -8, 16, 16);
      ctx.restore();
    });
    ctx.strokeStyle = t.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
    [[56, 56, 0], [W - 56, 56, Math.PI / 2], [W - 56, H - 56, Math.PI], [56, H - 56, -Math.PI / 2]].forEach(function (c) {
      ctx.beginPath(); ctx.arc(c[0], c[1], 34, c[2], c[2] + Math.PI / 2); ctx.stroke();
    });
    ctx.restore();
  }
  function drawDivider(cx, cy, w, t) {
    ctx.save();
    ctx.strokeStyle = t.accent; ctx.fillStyle = t.accent; ctx.globalAlpha = 0.9;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.lineTo(cx - 26, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 26, cy); ctx.lineTo(cx + w / 2, cy); ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4); ctx.fillRect(-8, -8, 16, 16); ctx.restore();
    ctx.beginPath(); ctx.arc(cx - 40, cy, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 40, cy, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ---------------- content blocks per mode ---------------- */
  // block: {text, size, weight, color:role, single, gap} | {divider:true, gap}
  function blocksFor(mode, v, t) {
    var B = [];
    function txt(text, size, role, opts) {
      text = String(text || '').replace(/\s+$/g, '');
      if (!text.trim()) return;
      opts = opts || {};
      B.push({ text: text, size: size, role: role, single: !!opts.single, gap: opts.gap == null ? 14 : opts.gap, weight: opts.weight || 400 });
    }
    function div(gap) { B.push({ divider: true, gap: gap == null ? 10 : gap }); }
    function joinLine() {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) if (arguments[i] && String(arguments[i]).trim()) parts.push(String(arguments[i]).trim());
      return parts.join('   \u00B7   ');
    }

    if (mode === 'poetry') {
      txt(v.tag, 46, 'accent', { weight: 700, gap: 30 });
      String(v.lines || '').split('\n').forEach(function (line) {
        txt(line, 66, 'fg', { weight: 700, gap: 16 });
      });
      if (v.creator && String(v.creator).trim()) {
        div(18);
        txt(v.creator, 42, 'sub', { gap: 0 });
      }
    }

    if (mode === 'wedding') {
      txt(BISMILLAH, 50, 'accent', { gap: 26 });
      var anyUrduName = isUrdu(v.dulha) || isUrdu(v.dulhan);
      txt(anyUrduName ? 'دعوتِ شادی' : 'Wedding Invitation', anyUrduName ? 40 : 30, 'sub', { gap: 30 });
      txt(v.dulhaParents, 40, 'sub', { gap: 8 });
      txt(v.dulha, 104, 'fg', { single: true, weight: 700, gap: 6 });
      div(8);
      txt(v.dulhanParents, 40, 'sub', { gap: 8 });
      txt(v.dulhan, 104, 'fg', { single: true, weight: 700, gap: 18 });
      txt(v.dua, 46, 'accent', { gap: 20 });
      div(6);
      txt(joinLine(v.date, v.time), 42, 'fg', { gap: 10 });
      txt(joinLine(v.venue, v.city), 42, 'fg', { gap: 10 });
      txt(v.host, 38, 'sub', { gap: 6 });
      if (v.rsvp && String(v.rsvp).trim()) {
        txt((isUrdu(v.rsvp) ? 'رابطہ: ' : 'RSVP: ') + String(v.rsvp).trim(), 36, 'sub', { gap: 0 });
      }
    }

    if (mode === 'birthday') {
      var urName = isUrdu(v.name);
      txt(urName ? 'سالگرہ مبارک' : 'Happy Birthday', urName ? 44 : 34, 'accent', { weight: 700, gap: 26 });
      txt(v.name, 108, 'fg', { single: true, weight: 700, gap: 10 });
      txt(v.age, 48, 'accent', { gap: 18 });
      txt(v.message, 46, 'fg', { gap: 20 });
      div(6);
      txt(joinLine(v.date, v.time), 42, 'fg', { gap: 10 });
      txt(v.venue, 42, 'fg', { gap: 10 });
      txt(v.host, 38, 'sub', { gap: 0 });
    }

    if (mode === 'custom') {
      txt(v.title, 88, 'fg', { single: true, weight: 700, gap: 14 });
      txt(v.names, 56, 'accent', { weight: 700, gap: 18 });
      txt(v.message, 46, 'fg', { gap: 20 });
      div(6);
      txt(joinLine(v.date, v.time), 42, 'fg', { gap: 10 });
      txt(v.venue, 42, 'fg', { gap: 10 });
      txt(v.host, 38, 'sub', { gap: 0 });
    }

    if (!B.length) {
      B.push({ text: 'آپ کا خوبصورت کارڈ یہاں بنے گا', size: 54, role: 'sub', single: false, gap: 0, weight: 400 });
    }
    return B;
  }

  function resolve(blocks, W, H, t) {
    var maxW = W - 220;
    var top = 124, bottom = H - 130;
    var avail = bottom - top;
    var scale = 1, items = [], total = 0, iter;
    for (iter = 0; iter < 3; iter++) {
      items = []; total = 0;
      blocks.forEach(function (b) {
        var gap = (b.gap || 0) * scale;
        if (b.divider) { items.push({ divider: true, h: 36 * scale, gap: gap }); total += 36 * scale + gap; return; }
        var stack = stackOf(b.text);
        var size = b.size * scale, weight = b.weight || 400, lines;
        if (b.single) {
          size = fitSize(b.text, stack, weight, size, Math.max(20, b.size * 0.34), maxW);
          lines = [b.text];
        } else {
          lines = wrapText(b.text, stack, weight, size, maxW);
        }
        var lh = size * (stack === 'ur' ? 1.95 : 1.3);
        items.push({ lines: lines, size: size, stack: stack, weight: weight, role: b.role, lh: lh, h: lines.length * lh, gap: gap });
        total += lines.length * lh + gap;
      });
      if (total <= avail || iter === 2) break;
      scale *= (avail / total) * 0.99;
    }
    return { items: items, total: total, top: top, avail: avail };
  }

  function roleColor(role, t) {
    if (role === 'accent') return t.accent;
    if (role === 'sub') return t.sub;
    return t.fg;
  }

  function draw() {
    if (!canvas || !ctx) return;
    readFields();
    var W = canvas.width, H = canvas.height;
    var base = THEMES[state.theme];
    var t = {
      bg1: state.customBg || base.bg1,
      bg2: state.customBg ? shade(state.customBg, -22) : base.bg2,
      fg: state.customFg || base.fg,
      accent: base.accent, deep: base.deep, sub: base.sub, frame: base.frame
    };

    // background
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, t.bg1); g.addColorStop(1, t.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // soft top glow
    var glow = ctx.createRadialGradient(W / 2, -H * 0.1, 0, W / 2, -H * 0.1, W * 0.9);
    glow.addColorStop(0, 'rgba(231,200,119,0.16)'); glow.addColorStop(1, 'rgba(231,200,119,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    drawPattern(W, H, t);
    drawFrame(W, H, t);

    // content
    var v = state.values[state.mode];
    var layout = resolve(blocksFor(state.mode, v, t), W, H, t);
    var y = layout.top + Math.max(0, (layout.avail - layout.total) / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    layout.items.forEach(function (it) {
      if (it.divider) {
        drawDivider(W / 2, y + it.h / 2, Math.min(520, W - 320), t);
        y += it.h + it.gap;
        return;
      }
      ctx.font = fontFor(it.stack, it.size, it.weight);
      ctx.fillStyle = roleColor(it.role, t);
      if (it.stack === 'en' && it.size <= 34) { try { ctx.letterSpacing = '5px'; } catch (e) {} }
      for (var i = 0; i < it.lines.length; i++) {
        ctx.fillText(it.lines[i], W / 2, y + it.lh / 2);
        y += it.lh;
      }
      try { ctx.letterSpacing = '0px'; } catch (e) {}
      y += it.gap;
    });

  }

  var rafPending = false;
  function scheduleDraw() {
    if (rafPending) return;
    rafPending = true;
    var run = function () { rafPending = false; draw(); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run); else setTimeout(run, 16);
  }

  /* ---------------- init ---------------- */
  function init() {
    var mount = document.getElementById('cardmaker');
    if (!mount) return;
    buildUI(mount);
    draw();
    if (document.fonts) {
      var jobs = [
        document.fonts.load('700 60px "Noto Nastaliq Urdu"'),
        document.fonts.load('400 40px "Noto Nastaliq Urdu"'),
        document.fonts.load('700 60px "Playfair Display"')
      ];
      if (document.fonts.ready) jobs.push(document.fonts.ready);
      Promise.all(jobs).then(function () { draw(); }).catch(function () {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* small API (used by the self-test page; handy for integrators) */
  window.KhariBaatCardMaker = {
    version: '1.0',
    draw: draw,
    setMode: function (m) { if (MODES[m]) setMode(m); },
    setSize: function (s) { if (s === '1:1' || s === '9:16') setSize(s); },
    setTheme: function (k) { if (THEMES[k]) setTheme(k); },
    fillSample: fillSample,
    canvas: function () { return canvas; },
    state: state
  };
})();
