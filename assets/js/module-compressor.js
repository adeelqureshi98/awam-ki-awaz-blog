/* ============================================================
   Khari Baat Tools — P3-16: Photo Compressor
   (mount id: "photocompressor")
   Upload a photo → quality slider + max-width → canvas
   re-encode to JPG → before/after size + preview → download.
   Everything happens locally in the browser.
   Test hooks: formatBytes() exported under Node.
   ============================================================ */
(function () {
  'use strict';

  function formatBytes(bytes) {
    if (bytes == null || isNaN(bytes)) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
    var root = document.getElementById('photocompressor');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');

    var file = h('input', 'tm-input');
    file.type = 'file'; file.accept = 'image/*';
    var fWrap = h('div', 'tm-field');
    fWrap.appendChild(label('تصویر منتخب کریں', 'Choose a photo'));
    fWrap.appendChild(file);
    panel.appendChild(fWrap);

    var row = h('div', 'tm-row');
    /* quality */
    var qWrap = h('div', 'tm-field');
    var qLbl = label('معیار (کوالٹی)', 'Quality');
    qWrap.appendChild(qLbl);
    var quality = h('input', 'tm-range');
    quality.type = 'range'; quality.min = '10'; quality.max = '95'; quality.value = '75'; quality.step = '1';
    qWrap.appendChild(quality);
    var qVal = h('p', 'tm-help');
    qVal.innerHTML = 'Quality: <span class="tm-range-val">75%</span> — lower quality = smaller file. کوالٹی کم، فائل چھوٹی۔';
    qWrap.appendChild(qVal);
    row.appendChild(qWrap);
    /* max width */
    var width = h('select', 'tm-select');
    [['0', 'Original width · اصل چوڑائی'], ['1920', 'Max 1920 px'], ['1280', 'Max 1280 px'], ['800', 'Max 800 px'], ['480', 'Max 480 px (smallest)']]
      .forEach(function (o) { var op = h('option', null, o[1]); op.value = o[0]; width.appendChild(op); });
    var wWrap = h('div', 'tm-field');
    wWrap.appendChild(label('زیادہ سے زیادہ چوڑائی', 'Maximum width'));
    wWrap.appendChild(width);
    row.appendChild(wWrap);
    panel.appendChild(row);

    var actions = h('div', 'tm-actions');
    var btn = h('button', 'tm-btn tm-btn-gold', 'Compress · سائز کم کریں'); btn.type = 'button'; btn.disabled = true;
    var dl = h('button', 'tm-btn', 'Download compressed JPG · ڈاؤن لوڈ'); dl.type = 'button'; dl.disabled = true;
    actions.appendChild(btn); actions.appendChild(dl);
    panel.appendChild(actions);

    var err = h('p', 'tm-err', ''); err.hidden = true; panel.appendChild(err);

    var result = h('div', 'tm-result'); result.hidden = true;
    var grid = h('div', 'tm-grid');
    function mk(lbl, hero) {
      var it = h('div', 'tm-ritem' + (hero ? ' tm-hero' : ''));
      it.appendChild(h('div', 'tm-rlbl', lbl));
      var v = h('div', 'tm-rval', '—'); it.appendChild(v); grid.appendChild(it); return v;
    }
    var beforeVal = mk('پہلے سائز · Before');
    var afterVal = mk('اب سائز · After', true);
    var savedVal = mk('بچت · Saved');
    result.appendChild(grid);
    var pv = h('div', 'tm-preview');
    var img = h('img'); img.alt = 'Compressed preview';
    pv.appendChild(img);
    result.appendChild(pv);
    panel.appendChild(result);

    var note = h('p', 'tm-note');
    note.innerHTML = 'Your photo is processed only in your browser — it is never uploaded anywhere. Output is always JPG. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">تصویر آپ کے براؤزر میں ہی تیار ہوتی ہے، کہیں اپلوڈ نہیں ہوتی۔</span>';
    panel.appendChild(note);

    var srcImg = null, srcFile = null, outUrl = null, outName = 'photo-compressed.jpg';

    file.addEventListener('change', function () {
      err.hidden = true;
      if (!file.files || !file.files[0]) return;
      srcFile = file.files[0];
      if (srcFile.type.indexOf('image/') !== 0) {
        err.textContent = 'That file is not an image. · یہ فائل تصویر نہیں ہے';
        err.hidden = false; return;
      }
      var url = URL.createObjectURL(srcFile);
      var im = new Image();
      im.onload = function () {
        srcImg = im;
        beforeVal.textContent = formatBytes(srcFile.size);
        btn.disabled = false;
        result.hidden = false;
        img.src = url;
      };
      im.onerror = function () {
        err.textContent = 'Could not read that image. · تصویر پڑھی نہیں جا سکی';
        err.hidden = false;
      };
      im.src = url;
    });

    quality.addEventListener('input', function () {
      qVal.querySelector('.tm-range-val').textContent = quality.value + '%';
    });

    btn.addEventListener('click', function () {
      if (!srcImg) return;
      var maxW = parseInt(width.value, 10);
      var w = srcImg.naturalWidth, hh = srcImg.naturalHeight;
      if (maxW > 0 && w > maxW) { hh = Math.round(hh * maxW / w); w = maxW; }
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = hh;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, hh);
      ctx.drawImage(srcImg, 0, 0, w, hh);
      var q = parseInt(quality.value, 10) / 100;
      canvas.toBlob(function (blob) {
        if (!blob) { err.textContent = 'Compression failed. · ناکام رہا'; err.hidden = false; return; }
        if (outUrl) URL.revokeObjectURL(outUrl);
        outUrl = URL.createObjectURL(blob);
        img.src = outUrl;
        afterVal.textContent = formatBytes(blob.size);
        var saved = 100 - (blob.size / srcFile.size) * 100;
        savedVal.textContent = (saved > 0 ? saved.toFixed(1) + '% smaller' : 'similar size');
        var base = (srcFile.name || 'photo').replace(/\.[^.]+$/, '');
        outName = base + '-compressed.jpg';
        dl.disabled = false;
      }, 'image/jpeg', q);
    });

    dl.addEventListener('click', function () {
      if (!outUrl) return;
      var a = h('a'); a.href = outUrl; a.download = outName;
      document.body.appendChild(a); a.click(); a.remove();
    });

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatBytes: formatBytes };
  }
})();
