/* ============================================================
   Khari Baat Tools — P3-13: CV Builder  (mount id: "cvbuilder")
   Dependency-free vanilla JS. Builds its own DOM inside the
   container. All data stays in the browser — nothing is sent
   anywhere. Print uses window.print() + the print CSS in
   tools-modules.css (body.tm-printing-cv prints only the sheet).
   Test hooks: pure helpers are exported when run under Node.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- pure helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function linesToList(text) {
    return String(text || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function splitSkills(text) {
    return String(text || '').split(/[,\n·•|]/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  /* ---------- DOM helpers ---------- */
  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function label(ur, en) {
    var l = h('span', 'tm-label');
    var a = h('span', 'tm-lur', ur); a.setAttribute('lang', 'ur'); a.setAttribute('dir', 'rtl');
    var b = h('span', 'tm-len', en);
    l.appendChild(a); l.appendChild(b);
    return l;
  }
  function field(ur, en, input) {
    var wrap = h('div', 'tm-field');
    wrap.appendChild(label(ur, en));
    wrap.appendChild(input);
    return wrap;
  }
  function textInput(ph) {
    var i = h('input', 'tm-input'); i.type = 'text'; if (ph) i.placeholder = ph;
    return i;
  }
  function area(ph, rows) {
    var t = h('textarea', 'tm-textarea'); if (ph) t.placeholder = ph; t.rows = rows || 3;
    return t;
  }

  /* ---------- mount ---------- */
  function mount() {
    var root = document.getElementById('cvbuilder');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var wrap = h('div', 'tm-cv-wrap');
    var form = h('div');
    var previewCol = h('div');

    /* --- personal fields --- */
    var fName = textInput('Muhammad Adeel');
    var fTitle = textInput('Social Media Manager · سماجی ذرائع ابلاغ مینیجر');
    var fPhone = textInput('03xx-xxxxxxx');
    var fEmail = textInput('you@example.com');
    var fCity = textInput('Kot Addu, Pakistan');
    var fSummary = area('Two or three lines about your experience and strengths…', 4);
    var fSkills = area('Social media, AI video ads, Content writing', 2);

    var row1 = h('div', 'tm-row');
    row1.appendChild(field('نام', 'Full name', fName));
    row1.appendChild(field('پیشہ / عہدہ', 'Professional title', fTitle));
    var row2 = h('div', 'tm-row');
    row2.appendChild(field('فون', 'Phone', fPhone));
    row2.appendChild(field('ای میل', 'Email', fEmail));
    form.appendChild(row1); form.appendChild(row2);
    form.appendChild(field('شہر', 'City', fCity));
    form.appendChild(field('خلاصہ', 'Professional summary', fSummary));

    /* --- repeatable rows --- */
    function repeatable(titleUr, titleEn, addLabel, makeFields) {
      var box = h('div');
      var head = h('div', 'tm-label');
      var a = h('span', 'tm-lur', titleUr); a.setAttribute('lang', 'ur'); a.setAttribute('dir', 'rtl');
      var b = h('span', 'tm-len', titleEn);
      head.appendChild(a); head.appendChild(b);
      box.appendChild(head);
      var list = h('div');
      box.appendChild(list);
      var addBtn = h('button', 'tm-btn tm-btn-small', addLabel);
      addBtn.type = 'button';
      box.appendChild(addBtn);
      var rows = [];
      function addRow() {
        var item = h('div', 'tm-repeat');
        var rh = h('div', 'tm-repeat-head');
        rh.appendChild(h('span', 'tm-repeat-title', titleEn + ' ' + (rows.length + 1)));
        var rm = h('button', 'tm-remove', 'Remove · ہٹائیں');
        rm.type = 'button';
        rh.appendChild(rm);
        item.appendChild(rh);
        var fields = makeFields();
        fields.nodes.forEach(function (n) { item.appendChild(n); });
        rm.addEventListener('click', function () {
          var i = rows.indexOf(entry);
          if (i > -1) rows.splice(i, 1);
          item.remove();
          render();
        });
        var entry = { el: item, get: fields.get };
        rows.push(entry);
        list.appendChild(item);
        fields.nodes.forEach(function (n) {
          n.querySelectorAll('input,textarea').forEach(function (inp) {
            inp.addEventListener('input', render);
          });
        });
        render();
      }
      addBtn.addEventListener('click', addRow);
      box.getData = function () { return rows.map(function (r) { return r.get(); }); };
      box.addRow = addRow;
      return box;
    }

    var eduBox = repeatable('تعلیم', 'Education', '+ Add education · تعلیم شامل کریں', function () {
      var deg = textInput('B.Com — Bachelor of Commerce');
      var inst = textInput('Bahauddin Zakariya University');
      var yrs = textInput('2016 – 2018');
      var r = h('div', 'tm-row');
      r.appendChild(field('ڈگری', 'Degree', deg));
      r.appendChild(field('ادارہ', 'Institution', inst));
      var nodes = [r, field('سال', 'Years', yrs)];
      return { nodes: nodes, get: function () { return { degree: deg.value, inst: inst.value, years: yrs.value }; } };
    });

    var expBox = repeatable('تجربہ', 'Experience', '+ Add experience · تجربہ شامل کریں', function () {
      var role = textInput('Social Media Manager');
      var org = textInput('Sapna Furniture & Home Decore');
      var yrs = textInput('2018 – Present');
      var pts = area('One achievement per line…', 3);
      var r1 = h('div', 'tm-row');
      r1.appendChild(field('عہدہ', 'Role / Title', role));
      r1.appendChild(field('ادارہ / کمپنی', 'Organisation', org));
      var nodes = [r1, field('سال', 'Years', yrs), field('کارنامے (ہر سطر ایک)', 'Achievements (one per line)', pts)];
      return { nodes: nodes, get: function () { return { role: role.value, org: org.value, years: yrs.value, points: pts.value }; } };
    });

    form.appendChild(eduBox);
    form.appendChild(expBox);
    form.appendChild(field('مہارتیں (کوما سے الگ کریں)', 'Skills (comma separated)', fSkills));

    /* --- actions --- */
    var actions = h('div', 'tm-actions');
    var sampleBtn = h('button', 'tm-btn', 'Sample · نمونہ بھریں');
    sampleBtn.type = 'button';
    var printBtn = h('button', 'tm-btn tm-btn-gold', 'Print / Download PDF · چھاپیں');
    printBtn.type = 'button';
    actions.appendChild(sampleBtn);
    actions.appendChild(printBtn);
    form.appendChild(actions);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Your information never leaves this browser — nothing is uploaded or saved on any server. ' +
      'To download, press Print and choose “Save as PDF”. <span class="tm-ur" lang="ur" dir="rtl">آپ کی معلومات اسی براؤزر میں رہتی ہیں، کہیں بھیج نہیں جاتیں۔ ڈاؤن لوڈ کے لیے پرنٹ دبا کر “Save as PDF” منتخب کریں۔</span>';
    form.appendChild(note);

    /* --- live preview sheet --- */
    var sheet = h('div', 'tm-cv-sheet');
    sheet.id = 'tmCvSheet';
    previewCol.appendChild(sheet);

    function jobHTML(headline, meta, points) {
      var d = h('div', 'tm-cv-job');
      var line = h('div');
      var b = h('b', null, headline || '');
      line.appendChild(b);
      if (meta) { var m = h('span', 'tm-cv-meta', meta); line.appendChild(m); }
      d.appendChild(line);
      if (points && points.length) {
        var ul = h('ul');
        points.forEach(function (p) { ul.appendChild(h('li', null, p)); });
        d.appendChild(ul);
      }
      return d;
    }

    function render() {
      sheet.innerHTML = '';
      sheet.appendChild(h('h3', null, fName.value.trim() || 'Your Name'));
      if (fTitle.value.trim()) sheet.appendChild(h('div', 'tm-cv-title', fTitle.value.trim()));
      var contact = [fPhone.value.trim(), fEmail.value.trim(), fCity.value.trim()].filter(Boolean).join('  ·  ');
      sheet.appendChild(h('div', 'tm-cv-contact', contact || 'phone · email · city'));

      if (fSummary.value.trim()) {
        sheet.appendChild(h('div', 'tm-cv-sec', 'Summary · خلاصہ'));
        sheet.appendChild(h('p', null, fSummary.value.trim()));
      }
      var exp = expBox.getData().filter(function (e) { return e.role || e.org; });
      if (exp.length) {
        sheet.appendChild(h('div', 'tm-cv-sec', 'Experience · تجربہ'));
        exp.forEach(function (e) {
          sheet.appendChild(jobHTML(
            (e.role || '') + (e.org ? ' — ' + e.org : ''),
            e.years || '', linesToList(e.points)));
        });
      }
      var edu = eduBox.getData().filter(function (e) { return e.degree || e.inst; });
      if (edu.length) {
        sheet.appendChild(h('div', 'tm-cv-sec', 'Education · تعلیم'));
        edu.forEach(function (e) {
          sheet.appendChild(jobHTML((e.degree || '') + (e.inst ? ' — ' + e.inst : ''), e.years || '', null));
        });
      }
      var skills = splitSkills(fSkills.value);
      if (skills.length) {
        sheet.appendChild(h('div', 'tm-cv-sec', 'Skills · مہارتیں'));
        sheet.appendChild(h('p', null, skills.join('  ·  ')));
      }
      if (!exp.length && !edu.length && !fSummary.value.trim()) {
        var em = h('p', 'tm-cv-empty', 'Start typing on the left — your CV appears here live. بائیں طرف لکھنا شروع کریں، سی وی یہیں بنتا جائے گا۔');
        sheet.appendChild(em);
      }
    }

    [fName, fTitle, fPhone, fEmail, fCity, fSummary, fSkills].forEach(function (inp) {
      inp.addEventListener('input', render);
    });

    sampleBtn.addEventListener('click', function () {
      fName.value = 'Muhammad Adeel';
      fTitle.value = 'Social Media Manager | Content Creator';
      fPhone.value = '0331-8009893';
      fEmail.value = 'adeelqureshipk3@gmail.com';
      fCity.value = 'Kot Addu, Pakistan (Remote)';
      fSummary.value = 'Social media manager and content creator with ten years in marketing and communication for furniture retail. I plan, create and publish AI video ads and animated content for brands, and write a daily Urdu & English column.';
      fSkills.value = 'Social media management, AI video ads, Content writing, Urdu & English columns, Podcasting, CapCut editing';
      if (!eduBox.getData().length) eduBox.addRow();
      if (!expBox.getData().length) expBox.addRow();
      render();
      // fill the first rows with sample data
      var er = form.querySelectorAll('.tm-repeat');
      if (er.length) {
        var inputs = er[0].querySelectorAll('input');
        if (inputs[0]) inputs[0].value = 'B.Com — Bachelor of Commerce';
        if (inputs[1]) inputs[1].value = 'Bahauddin Zakariya University';
        if (inputs[2]) inputs[2].value = '2016 – 2018';
      }
      if (er.length > 1) {
        var xi = er[1].querySelectorAll('input');
        var xt = er[1].querySelector('textarea');
        if (xi[0]) xi[0].value = 'Social Media Manager & Content Creator';
        if (xi[1]) xi[1].value = 'Sapna Furniture & Home Decore';
        if (xi[2]) xi[2].value = '2018 – Present';
        if (xt) xt.value = 'Run the brand pages on Facebook and Instagram\nCreate AI video ads and reels for products\nWrite bilingual posts, guides and offers';
      }
      render();
    });

    printBtn.addEventListener('click', function () {
      document.body.classList.add('tm-printing-cv');
      var done = function () {
        document.body.classList.remove('tm-printing-cv');
        window.removeEventListener('afterprint', done);
      };
      window.addEventListener('afterprint', done);
      setTimeout(done, 1500); /* safety cleanup */
      window.print();
    });

    wrap.appendChild(form);
    wrap.appendChild(previewCol);
    panel.appendChild(wrap);
    root.appendChild(panel);
    eduBox.addRow();
    expBox.addRow();
    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { esc: esc, linesToList: linesToList, splitSkills: splitSkills };
  }
})();
