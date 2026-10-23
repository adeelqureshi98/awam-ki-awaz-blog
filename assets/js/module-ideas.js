/* ============================================================
   Khari Baat Tools — Tool 25: Idea Generator (خیالات سازی)
   (mount id: "ideagen")
   Template / idea-bank based: each idea = one category hook
   template × one theme subject, both written bilingually by
   hand (no machine translation, no AI claims). 5 ideas at a
   time, no immediate repeats per category+theme in a session.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- subjects per theme (Urdu phrase + English rendering) ---------- */
  var SUBJECTS = {
    politics: [
      { ur: 'حکومت کے وعدے', en: "the government's promises" },
      { ur: 'اسمبلی کی سیاست', en: 'assembly politics' },
      { ur: 'بلدیاتی نظام', en: 'the local government system' },
      { ur: 'الیکشن اور ووٹر', en: 'elections and the voter' },
      { ob: 'اپوزیشن کے کردار', ur: 'اپوزیشن کا کردار', en: 'the role of the opposition' },
      { ur: 'گورنر راج کی بحث', en: "the governor's-rule debate" },
      { ob: 'عوامی نمائندوں کے رویے', ur: 'عوامی نمائندوں کا رویہ', en: 'the conduct of public representatives' }
    ],
    economy: [
      { ur: 'مہنگائی', en: 'inflation' },
      { ur: 'بجلی کے بل', en: 'electricity bills' },
      { ur: 'سونے کی قیمت', en: 'the price of gold' },
      { ur: 'تنخواہ اور گزارا', en: 'salary and making ends meet' },
      { ob: 'ڈالر کے ریٹ', ur: 'ڈالر کا ریٹ', en: 'the dollar rate' },
      { ur: 'پیٹرول کی قیمت', en: 'petrol prices' },
      { ur: 'چھوٹے تاجر کی مشکلات', en: "the small trader's struggle" }
    ],
    society: [
      { ur: 'شادی بیاہ کے اخراجات', en: 'wedding expenses' },
      { ob: 'نوجوانوں کے روزگار', ur: 'نوجوانوں کا روزگار', en: 'youth employment' },
      { ur: 'سفارش کلچر', en: 'the culture of sifarish' },
      { ur: 'بزرگوں کی دیکھ بھال', en: 'care of the elderly' },
      { ur: 'محلے کی یکجہتی', en: 'neighbourhood unity' },
      { ob: 'سوشل میڈیا کے اثر', ur: 'سوشل میڈیا کا اثر', en: 'the effect of social media' },
      { ur: 'دکھاوے کی دوڑ', en: 'the race of showing off' }
    ],
    food: [
      { ur: 'دیسی گھی اور صحت', en: 'desi ghee and health' },
      { ur: 'ناشتے کی اہمیت', en: 'the importance of breakfast' },
      { ur: 'بازار کے کھانے', en: 'street food' },
      { ob: 'امّی کے ہاتھ کے ذائقے', ur: 'امّی کے ہاتھ کا ذائقہ', en: "the taste of mother's cooking" },
      { ur: 'مہمان نوازی', en: 'hospitality' },
      { ob: 'کھانے کے ضیاع', ur: 'کھانے کا ضیاع', en: 'food waste' },
      { ur: 'رمضان کے دسترخوان', en: 'the Ramadan dastarkhwan' }
    ],
    sports: [
      { ob: 'قومی ٹیم کے انتخاب', ur: 'قومی ٹیم کا انتخاب', en: 'national team selection' },
      { ur: 'گلی کرکٹ', en: 'street cricket' },
      { ob: 'نوجوان کھلاڑیوں کے مستقبل', ur: 'نوجوان کھلاڑیوں کا مستقبل', en: 'the future of young players' },
      { ur: 'کھیلوں میں سفارش', en: 'sifarish in sports' },
      { ob: 'میچ والے دن کے جوش', ur: 'میچ والے دن کا جوش', en: 'match-day passion' },
      { ob: 'کھیل اور تعلیم کے توازن', ur: 'کھیل اور تعلیم کا توازن', en: 'balancing sports and studies' },
      { ur: 'کبڈی اور دیسی کھیل', en: 'kabaddi and desi sports' }
    ],
    technology: [
      { ur: 'مصنوعی ذہانت', en: 'artificial intelligence' },
      { ur: 'موبائل فون کی لت', en: 'mobile phone addiction' },
      { ur: 'آن لائن کمائی', en: 'earning online' },
      { ur: 'سوشل میڈیا کی افواہیں', en: 'social media rumours' },
      { ob: 'بچوں کے اسکرین وقت', ur: 'بچوں کا اسکرین وقت', en: "children's screen time" },
      { ur: 'فری لانسنگ', en: 'freelancing' },
      { ur: 'آن لائن فراڈ', en: 'online fraud' }
    ],
    everyday: [
      { ob: 'گھر کے بجٹ', ur: 'گھر کا بجٹ', en: 'the household budget' },
      { ur: 'وقت کی قدر', en: 'the value of time' },
      { ur: 'بچت کی عادت', en: 'the habit of saving' },
      { ur: 'پڑوسیوں کے حقوق', en: 'the rights of neighbours' },
      { ur: 'صحت مند نیند', en: 'healthy sleep' },
      { ur: 'گھر کی صفائی', en: 'keeping the home clean' },
      { ur: 'بچوں کی تربیت', en: "raising children well" }
    ],
    business: [
      { ur: 'دکان کی ساکھ', en: "a shop's reputation" },
      { ur: 'گاہک کی خدمت', en: 'customer service' },
      { ur: 'معیار بمقابلہ قیمت', en: 'quality versus price' },
      { ur: 'آن لائن کاروبار', en: 'online business' },
      { ur: 'چھوٹے کاروبار کی مشکلات', en: 'the struggles of small business' },
      { ob: 'اشتہار کے فن', ur: 'اشتہار کا فن', en: 'the art of advertising' },
      { ob: 'ادھار کے نظام', ur: 'ادھار کا نظام', en: 'the credit (udhaar) system' }
    ]
  };

  /* ---------- hook templates per category ({S} = subject slot) ---------- */
  var TEMPLATES = {
    column: [
      { ur: 'وہ سچ جو کوئی نہیں بتاتا: {S} کی اصل کہانی', en: 'The truth nobody tells: the real story behind {S}' },
      { ur: '{S}: وعدے بہت ہوئے، اب حساب چاہیے', en: '{S}: enough promises — now we want the account' },
      { ur: 'جب {S} عام آدمی کی زندگی بدل دے', en: 'The day {S} changed the life of the common man' },
      { ur: '{O} پر خاموشی کیوں؟ ایک کھرا سوال', en: 'Why the silence on {S}? A blunt question' },
      { ur: 'میرے محلے سے {S} تک: ایک عام پاکستانی کی نظر', en: 'From my street to {S}: through the eyes of an ordinary Pakistani' },
      { ur: '{S} کی سیاست اور عوام کی جیب', en: "The politics of {S} — and the public's pocket" },
      { ur: 'کیا {S} کا حل واقعی اتنا مشکل ہے؟', en: 'Is the answer to {S} really that hard?' },
      { ur: '{S}: ذمہ دار کون؟ فیصلہ آپ کا', en: '{S}: who is responsible? You decide' },
      { ur: 'تاریخ گواہ ہے: {S} ہمیشہ کمزور کو ہی رُلاتا ہے', en: 'History is witness: the weak always pay the first price for {S}' },
      { ur: '{S} — بڑے دعوے، چھوٹے نتائج', en: '{S} — big claims, small results' },
      { ur: 'اگر میں فیصلہ ساز ہوتا تو {O} پر پہلا قدم یہ ہوتا', en: 'If I were the decision-maker, my first step on {S} would be this' },
      { ur: '{O} کے نام ایک کھلا خط', en: 'An open letter on {S}' },
      { ur: '{S} کل اور آج: ہم کہاں کھڑے ہیں؟', en: '{S}, yesterday and today: where do we stand?' }
    ],
    blog: [
      { ur: '{O} کے بارے میں 7 باتیں جو آپ کو معلوم ہونی چاہیں', en: '7 things you should know about {S}' },
      { ur: 'میرا ذاتی تجربہ: {O} سے میں نے کیا سیکھا', en: 'My personal experience: what I learned from {S}' },
      { ur: '{O} کے لیے آسان رہنما — قدم بہ قدم', en: 'A simple guide to {S} — step by step' },
      { ur: 'لوگ {O} میں یہ 5 غلطیاں کیوں کرتے ہیں؟', en: 'Why do people make these 5 mistakes with {S}?' },
      { ur: '{S}: فائدے اور نقصان، صاف صاف', en: '{S}: the benefits and the harms, plainly told' },
      { ur: 'ابتدائی افراد کے لیے {S} — شروع کہاں سے کریں؟', en: '{S} for beginners — where do you start?' },
      { ur: '{O} پر میرے آزمودہ نکات، جو روز کام آتے ہیں', en: 'My tried-and-tested lessons from {S} that help every day' },
      { ur: 'کیا {S} واقعی اتنا اہم ہے؟ میری ایماندارانہ رائے', en: 'Does {S} really matter that much? My honest view' },
      { ur: '{O} سے جڑی غلط فہمیاں اور ان کی حقیقت', en: 'Common myths about {S} — and the reality' },
      { ur: 'میں نے ایک ہفتہ {O} پر توجہ دی — پھر کیا ہوا؟', en: 'I gave one week to {S} — then what happened?' },
      { ur: '{O} کو سمجھنا آسان بنانے کے 10 آزمودہ طریقے', en: '10 tried-and-tested ways to understand {S} properly' },
      { ur: 'آپ کے سوالات، میرے جوابات: {O} پر کھری بات', en: 'Your questions, my answers: straight talk on {S}' }
    ],
    podcast: [
      { ur: 'بات چیت: {O} پر دو نسلوں کی سوچ', en: 'The conversation: two generations on {S}' },
      { ur: '{S} — مہمان کے ساتھ کھری اور سیدھی گفتگو', en: '{S} — a frank, straight conversation with a guest' },
      { ur: 'سننے والوں کے سوالات: {O} پر کھل کر بات', en: "Listeners' questions: an open talk on {S}" },
      { ur: '{O} پر بحث: حقائق بمقابلہ افواہیں', en: 'The debate on {S}: facts versus rumours' },
      { ur: 'ایک کہانی، ہزار سبق: {S} کی اندر کی بات', en: 'One story, a thousand lessons: the inside account of {S}' },
      { ur: '{O} پر وہ باتیں جو کیمرے کے سامنے کوئی نہیں کہتا', en: 'The things about {S} that nobody says on camera' },
      { ur: '{S} اور ہماری روزمرہ زندگی — ہلکی پھلکی گپ شپ', en: '{S} and our daily life — a light, honest chat' },
      { ur: 'ماہر کی زبانی: {S} کا آسان سا خلاصہ', en: "In the expert's words: {S} explained simply" },
      { ur: '{O} پر عوام کی آواز — لوگ کیا کہتے ہیں؟', en: 'The voice of the people on {S} — what are they saying?' },
      { ur: 'کل بمقابلہ آج: {O} پر وقت کی گفتگو', en: 'Yesterday versus today: a talk across time on {S}' },
      { ur: '{O} پر تین بڑے سوال اور ان کے سیدھے جواب', en: 'Three big questions on {S} — and straight answers' },
      { ur: 'مائیک آپ کے ہاتھ میں: {O} پر آپ کی رائے اہم ہے', en: 'The mic is yours: your opinion on {S} matters' }
    ],
    youtube: [
      { ur: '{S} کی اصل حقیقت — جو آپ کو کوئی نہیں بتاتا', en: 'The real truth about {S} — what nobody tells you' },
      { ur: '{S} — یہ غلطی مت کریں! پہلے یہ ویڈیو دیکھیں', en: "{S} — don't make this mistake! Watch this first" },
      { ur: 'صرف 10 منٹ میں {S} مکمل سمجھیں', en: 'Understand {S} completely in just 10 minutes' },
      { ur: '{S}: پہلے اور بعد — تبدیلی دیکھ کر حیران رہ جائیں گے', en: '{S}: before and after — the change will surprise you' },
      { ur: 'میں نے {S} خود آزما کر دیکھا — نتیجہ آپ کے سامنے', en: 'I put {S} to the test myself — the result is in front of you' },
      { ur: '{S} کے 5 راز جو صرف ماہر جانتے ہیں', en: '5 secrets of {S} that only experts know' },
      { ur: '{O} شروع کرنے سے پہلے یہ ضرور جان لیں', en: 'Before you start with {S}, know this first' },
      { ur: 'کیا {S} واقعی کام کرتا ہے؟ سچائی کی جانچ', en: 'Does {S} really work? Testing the truth' },
      { ur: '{S} — مبتدی سے ماہر تک کا مکمل سفر', en: '{S} — the full journey from beginner to expert' },
      { ur: 'لوگ {O} میں پیسہ اور وقت کیوں ضائع کرتے ہیں؟', en: 'Why do people waste money and time on {S}?' },
      { ur: '{S}: مشکل بات، آسان الفاظ میں', en: '{S}: the hard topic, explained in easy words' },
      { ur: '2026 میں {S}: نیا رجحان، نئے اصول', en: '{S} in 2026: new trends, new rules' }
    ],
    business: [
      { ur: '{S} اور آپ کے گاہک: اعتماد بنانے والی پوسٹ', en: '{S} and your customers: a trust-building post' },
      { ur: 'آج کا موضوع {S} — اپنے تجربے کی کہانی سنائیے', en: "Today's topic is {S} — tell the story of your experience" },
      { ur: '{O} پر گاہکوں کے 3 عام سوال اور آپ کے جواب', en: '3 common customer questions on {S} — and your answers' },
      { ur: 'پردے کے پیچھے: {O} میں آپ کی محنت کی جھلک', en: 'Behind the scenes: a glimpse of your hard work in {S}' },
      { ur: '{O} کے حوالے سے خوش گاہک کی رائے — اظہارِ تشکر کا دن', en: "A happy customer's words on {S} — testimonial day" },
      { ur: '{S}: سستا بمقابلہ معیاری — فرق صاف دکھائیے', en: '{S}: cheap versus quality — show the difference plainly' },
      { ur: 'ہفتے کی ترکیب: {O} سے فائدہ اٹھانے کا آسان طریقہ', en: 'Tip of the week: an easy way to benefit from {S}' },
      { ur: '{O} پر مختصر سروے — گاہکوں سے رائے مانگیے', en: 'A short poll on {S} — ask your customers' },
      { ur: 'نیا اسٹاک، نئی بات: {O} کے ساتھ تازہ آغاز', en: 'New stock, new story: a fresh start with {S}' },
      { ur: '{S} کی دیکھ بھال کے 5 سنہرے اصول', en: '5 golden rules for looking after {S}' },
      { ur: 'خاص دن کا اعلان: {O} پر خصوصی رعایت کی خبر دیجیے', en: 'Special-day announcement: share a discount story around {S}' },
      { ur: '{S} — ہماری کہانی، آپ کا بھروسا', en: '{S} — our story, your trust' }
    ]
  };

  var CATEGORIES = [
    ['column', 'Column topics · کالم کے موضوعات'],
    ['blog', 'Blog · بلاگ'],
    ['podcast', 'Podcast · پوڈکاسٹ'],
    ['youtube', 'YouTube video · یوٹیوب ویڈیو'],
    ['business', 'Business social post · کاروباری پوسٹ']
  ];
  var THEMES = [
    ['politics', 'Politics · سیاست'],
    ['economy', 'Economy · معیشت'],
    ['society', 'Society · سماج'],
    ['food', 'Food · کھانا'],
    ['sports', 'Sports & Cricket · کھیل و کرکٹ'],
    ['technology', 'Technology · ٹیکنالوجی'],
    ['everyday', 'Everyday Life · روزمرہ زندگی'],
    ['business', 'Business · کاروبار']
  ];

  function fill(tpl, subj) { return tpl.split('{O}').join(subj.ob || subj.ur).split('{S}').join(subj.ur); }
  function fillEn(tpl, subj) { var r = tpl.split('{O}').join(subj.en).split('{S}').join(subj.en); return r.charAt(0).toUpperCase() + r.slice(1); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* pure generator (exported for tests): returns n idea objects {ur,en} */
  var usedMap = {};
  function generate(cat, theme, n) {
    var tpls = TEMPLATES[cat], subs = SUBJECTS[theme];
    if (!tpls || !subs) return [];
    var key = cat + '|' + theme;
    var used = usedMap[key] || (usedMap[key] = {});
    var pool = [];
    for (var t = 0; t < tpls.length; t++)
      for (var s = 0; s < subs.length; s++)
        pool.push([t, s]);
    var fresh = pool.filter(function (p) { return !used[p[0] + ':' + p[1]]; });
    if (fresh.length < n) { usedMap[key] = {}; used = usedMap[key]; fresh = pool.slice(); }
    shuffle(fresh);
    var out = [];
    for (var i = 0; i < Math.min(n, fresh.length); i++) {
      var p = fresh[i];
      used[p[0] + ':' + p[1]] = 1;
      out.push({
        ur: fill(tpls[p[0]].ur, subs[p[1]]),
        en: fillEn(tpls[p[0]].en, subs[p[1]])
      });
    }
    return out;
  }

  /* ---------- DOM helpers (match tm- module pattern) ---------- */
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
  function copyText(btn, text) {
    function done() {
      var old = btn.textContent;
      btn.textContent = 'Copied ✓';
      setTimeout(function () { btn.textContent = old; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = h('textarea'); ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* clipboard unavailable */ }
      document.body.removeChild(ta);
    }
  }

  function mount() {
    var root = document.getElementById('ideagen');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');

    var row = h('div', 'tm-row');
    var catSel = h('select', 'tm-select');
    CATEGORIES.forEach(function (c) { var o = h('option', null, c[1]); o.value = c[0]; catSel.appendChild(o); });
    var themeSel = h('select', 'tm-select');
    THEMES.forEach(function (t) { var o = h('option', null, t[1]); o.value = t[0]; themeSel.appendChild(o); });
    themeSel.value = 'economy';
    row.appendChild(field('زمرہ چنیے', 'Choose a category', catSel));
    row.appendChild(field('موضوع چنیے', 'Choose a theme', themeSel));
    panel.appendChild(row);

    var genBtn = h('button', 'tm-btn tm-btn-gold', 'خیالات بنائیں · Generate ideas');
    genBtn.type = 'button';
    var act = h('div', 'tm-actions'); act.appendChild(genBtn); panel.appendChild(act);

    var res = h('div', 'tm-result'); res.hidden = true;
    var list = h('div', 'idg-list');
    res.appendChild(list);
    var shareRow = h('div', 'tm-share');
    var moreBtn = h('button', 'tm-btn', 'مزید خیالات · More ideas'); moreBtn.type = 'button';
    var copyAllBtn = h('button', 'tm-btn', 'Copy all · سب کاپی کریں'); copyAllBtn.type = 'button';
    var waBtn = h('a', 'tm-btn tm-btn-wa', 'Share on WhatsApp · واٹس ایپ پر بھیجیں');
    waBtn.target = '_blank'; waBtn.rel = 'noopener';
    shareRow.appendChild(moreBtn); shareRow.appendChild(copyAllBtn); shareRow.appendChild(waBtn);
    res.appendChild(shareRow);
    panel.appendChild(res);

    var note = h('p', 'tm-note');
    note.innerHTML = 'This tool builds suggestions from a handcrafted bank of idea templates — it is not AI. Use each idea as a starting point and shape it in your own words. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ اوزار تیار شدہ خیال سانچوں کے بینک سے تجاویز بناتا ہے؛ ہر خیال کو اپنی سوچ اور اپنے انداز سے مزید نکھاریں۔</span>';
    panel.appendChild(note);

    var current = [];
    function allText() {
      return current.map(function (idea, i) {
        return (i + 1) + '. ' + idea.ur + '\n   ' + idea.en;
      }).join('\n');
    }
    function render() {
      list.innerHTML = '';
      current.forEach(function (idea, i) {
        var item = h('div', 'idg-item');
        var body = h('div', 'idg-body');
        var num = h('span', 'idg-num', String(i + 1));
        var ur = h('div', 'idg-ur', idea.ur);
        ur.setAttribute('lang', 'ur'); ur.setAttribute('dir', 'rtl');
        var en = h('div', 'idg-en', idea.en);
        body.appendChild(num); body.appendChild(ur); body.appendChild(en);
        var cp = h('button', 'tm-btn tm-btn-small idg-copy', 'Copy');
        cp.type = 'button';
        cp.addEventListener('click', function () { copyText(cp, idea.ur + '\n' + idea.en); });
        item.appendChild(body); item.appendChild(cp);
        list.appendChild(item);
      });
      waBtn.href = 'https://wa.me/?text=' + encodeURIComponent('Khari Baat — Idea Generator\n\n' + allText());
      res.hidden = false;
    }
    function run() {
      current = generate(catSel.value, themeSel.value, 5);
      render();
    }
    genBtn.addEventListener('click', run);
    moreBtn.addEventListener('click', run);
    copyAllBtn.addEventListener('click', function () { copyText(copyAllBtn, allText()); });

    root.appendChild(panel);
    run(); /* sample ideas on load */
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generate: generate, SUBJECTS: SUBJECTS, TEMPLATES: TEMPLATES };
  }
})();
