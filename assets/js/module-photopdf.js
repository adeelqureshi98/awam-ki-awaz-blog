/* ============================================================
   Khari Baat Tools — P3-17: Photos → PDF
   (mount id: "photopdf")
   Multi-image upload → A4 PDF, one image per page, fitted
   with margins. Uses jsPDF (UMD) loaded on demand from the
   cdnjs CDN; if the CDN cannot be reached the module shows
   an honest error instead of failing silently.
   Test hooks: fitRect() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  var JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  var A4 = { w: 210, h: 297, margin: 10 }; /* mm */

  function fitRect(imgW, imgH) {
    var maxW = A4.w - A4.margin * 2, maxH = A4.h - A4.margin * 2;
    var scale = Math.min(maxW / imgW, maxH / imgH);
    var w = imgW * scale, hh = imgH * scale;
    return { x: (A4.w - w) / 2, y: (A4.h - hh) / 2, w: w, h: hh };
  }

  var jsPdfPromise = null;
  function loadJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (jsPdfPromise) return jsPdfPromise;
    jsPdfPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = JSPDF_URL; s.async = true;
      s.onload = function () {
        if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error('jsPDF loaded but global missing'));
      };
      s.onerror = function () { reject(new Error('CDN unreachable')); };
      document.head.appendChild(s);
    });
    return jsPdfPromise;
  }

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function mount() {
    var root = document.getElementById('photopdf');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var lbl = h('div', 'tm-label');
    var a = h('span', 'tm-lur', 'تصویریں منتخب کریں (ایک سے زیادہ بھی چلیں گی)'); a.setAttribute('lang', 'ur'); a.setAttribute('dir', 'rtl');
    lbl.appendChild(a); lbl.appendChild(h('span', 'tm-len', 'Choose photos (multiple allowed)'));
    panel.appendChild(lbl);

    var file = h('input', 'tm-input');
    file.type = 'file'; file.accept = 'image/*'; file.multiple = true;
    panel.appendChild(file);

    var listWrap = h('div');
    var list = h('ul', 'tm-filelist');
    listWrap.appendChild(list);
    panel.appendChild(listWrap);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Make PDF · پی ڈی ایف بنائیں'); btn.type = 'button'; btn.disabled = true;
    actions.appendChild(btn);
    panel.appendChild(actions);

    var status = h('p', 'tm-help', '');
    panel.appendChild(status);
    var err = h('p', 'tm-err', ''); err.hidden = true; panel.appendChild(err);
    var ok = h('p', 'tm-ok', ''); ok.hidden = true; panel.appendChild(ok);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Each photo becomes one A4 page, fitted to the page with a small margin. Photos are processed in your browser and never uploaded. The PDF maker (jsPDF) loads from a public CDN when you press the button, so an internet connection is needed for that one step. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">ہر تصویر ایک اے فور صفحہ بنے گی۔ تصویریں کہیں اپلوڈ نہیں ہوتیں۔</span>';
    panel.appendChild(note);

    file.addEventListener('change', function () {
      list.innerHTML = '';
      err.hidden = true; ok.hidden = true;
      var files = file.files ? Array.prototype.slice.call(file.files) : [];
      files = files.filter(function (f) { return f.type.indexOf('image/') === 0; });
      files.forEach(function (f) {
        list.appendChild(h('li', null, f.name + ' — ' + Math.max(1, Math.round(f.size / 1024)) + ' KB'));
      });
      status.textContent = files.length ? files.length + ' photo(s) ready · تصویریں تیار ہیں' : '';
      btn.disabled = files.length === 0;
    });

    function readAsDataURL(f) {
      return new Promise(function (resolve, reject) {
        var r = new FileReader();
        r.onload = function () { resolve(r.result); };
        r.onerror = reject;
        r.readAsDataURL(f);
      });
    }
    function loadImage(src) {
      return new Promise(function (resolve, reject) {
        var im = new Image();
        im.onload = function () { resolve(im); };
        im.onerror = reject;
        im.src = src;
      });
    }

    btn.addEventListener('click', function () {
      err.hidden = true; ok.hidden = true;
      var files = file.files ? Array.prototype.slice.call(file.files).filter(function (f) { return f.type.indexOf('image/') === 0; }) : [];
      if (!files.length) return;
      btn.disabled = true;
      status.textContent = 'Loading the PDF maker… · پی ڈی ایف میکر لوڈ ہو رہا ہے';
      loadJsPdf().then(function (JsPDF) {
        status.textContent = 'Building your PDF… · پی ڈی ایف بن رہی ہے';
        var doc = new JsPDF({ unit: 'mm', format: 'a4' });
        var chain = Promise.resolve();
        files.forEach(function (f, idx) {
          chain = chain.then(function () {
            return readAsDataURL(f).then(loadImage).then(function (im) {
              if (idx > 0) doc.addPage();
              var r = fitRect(im.naturalWidth, im.naturalHeight);
              var fmtImg = (f.type === 'image/png') ? 'PNG' : 'JPEG';
              doc.addImage(im, fmtImg, r.x, r.y, r.w, r.h);
            });
          });
        });
        return chain.then(function () {
          doc.save('khari-baat-photos.pdf');
          ok.textContent = 'PDF downloaded — ' + files.length + ' page(s). · پی ڈی ایف ڈاؤن لوڈ ہو گئی';
          ok.hidden = false;
          status.textContent = '';
          btn.disabled = false;
        });
      }).catch(function () {
        err.innerHTML = 'The PDF maker could not be loaded — please check your internet connection and try again. Nothing was uploaded or lost. ' +
          '<span lang="ur" dir="rtl">پی ڈی ایف میکر لوڈ نہیں ہو سکا، انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔</span>';
        err.hidden = false;
        status.textContent = '';
        btn.disabled = false;
      });
    });

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fitRect: fitRect, JSPDF_URL: JSPDF_URL };
  }
})();
