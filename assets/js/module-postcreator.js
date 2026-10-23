/* ============================================================
   Khari Baat Tools — Tool 26: Social Post Creator (سوشل پوسٹ ساز)
   (mount id: "postcreator")
   Template-based: 4 hand-written templates per occasion in
   each of Urdu, English and Roman Urdu, rotated per generate.
   Business name / item / offer detail are woven in, with
   graceful fallbacks. Per-type hashtag sets. Honestly labeled
   as ready templates — no AI claims.
   ============================================================ */
(function () {
  'use strict';

  var BUSINESSES = [
    ['furniture', 'Furniture & Home Decor · فرنیچر و گھر کی سجاوٹ'],
    ['food', 'Food / Restaurant · کھانا / ریستوران'],
    ['clothing', 'Clothing · ملبوسات'],
    ['shop', 'General Shop · جنرل اسٹور'],
    ['services', 'Services · خدمات']
  ];
  var OCCASIONS = [
    ['arrival', 'New Arrival · نیا اسٹاک'],
    ['offer', 'Offer / Discount · خصوصی رعایت'],
    ['eid', 'Eid / Ramzan · عید و رمضان'],
    ['thanks', 'Thank-You / Review · شکریہ و آراء'],
    ['announce', 'Announcement · اعلان'],
    ['weekend', 'Weekend · اختتامِ ہفتہ']
  ];

  /* fallbacks when the optional item field is left empty */
  var ITEM_FALLBACK = {
    furniture: { ur: 'نئے ڈیزائن کا فرنیچر', en: 'our new furniture collection', ru: 'naye design ka furniture' },
    food: { ur: 'مزیدار کھانے', en: 'our fresh new menu', ru: 'mazaydaar khana' },
    clothing: { ur: 'نئے سوٹ و ملبوسات', en: 'our new clothing collection', ru: 'naye suits aur kapray' },
    shop: { ur: 'نئی اشیاء', en: 'our new stock', ru: 'nayi cheezain' },
    services: { ur: 'ہماری خدمات', en: 'our new service package', ru: 'hamari services' }
  };
  var NAME_FALLBACK = { ur: 'ہماری دکان', en: 'our shop', ru: 'hamari dukaan' };
  var OFFER_FALLBACK = { ur: 'خصوصی رعایت', en: 'a special discount', ru: 'khaas discount' };

  var HASHTAGS = {
    furniture: ['#Furniture', '#HomeDecor', '#InteriorDesign', '#FurnitureDesign', '#HomeStyle', '#FurnitureShopping', '#DecorIdeas', '#Pakistan'],
    food: ['#FoodLovers', '#Foodie', '#DesiFood', '#Restaurant', '#TastyFood', '#PakistanFood', '#FoodDiaries', '#EatLocal'],
    clothing: ['#Fashion', '#Clothing', '#Style', '#NewCollection', '#PakistaniFashion', '#OOTD', '#Shopping', '#Wardrobe'],
    shop: ['#Shopping', '#NewArrivals', '#LocalBusiness', '#ShopLocal', '#BestDeals', '#QualityProducts', '#SupportSmallBusiness', '#Pakistan'],
    services: ['#Services', '#ProfessionalServices', '#QualityWork', '#CustomerFirst', '#TrustedServices', '#BookNow', '#SupportLocal', '#Pakistan']
  };

  /* ---------- templates: {B}=business, {P}=item, {O}=offer ---------- */
  var T = {
    arrival: {
      ur: [
        'خوشخبری! {B} پر {P} پہنچ گیا ہے۔ معیار ایسا کہ دیکھتے ہی دل خوش ہو جائے۔ آج ہی تشریف لائیے اور اپنی پسند لے جائیے۔',
        'انتظار ختم ہوا! {P} اب {B} پر دستیاب ہے۔ اسٹاک محدود ہے — دیر نہ کیجیے، آج ہی وزٹ کیجیے۔',
        'کچھ نیا، کچھ خاص — {P} کی آمد ہو گئی ہے {B} پر۔ آئیے، دیکھیے اور معیار کا فرق خود محسوس کیجیے۔',
        '{B} کی تازہ پیشکش: {P}۔ تصویروں سے زیادہ اصل میں خوبصورت۔ ملاحظہ ضرور فرمائیے۔'
      ],
      en: [
        'Good news! {P} has just arrived at {B}. Quality you can see and feel. Visit today and take your favourite home.',
        'The wait is over! {P} is now available at {B}. Stock is limited — do not miss out, visit us today.',
        'Something new, something special — {P} has landed at {B}. Come, see it up close and feel the difference in quality.',
        'Fresh at {B}: {P}. Even better in person than in pictures. Do drop by and have a look.'
      ],
      ru: [
        'Khushkhabri! {B} par {P} aa gaya hai. Quality aisi ke dekhte hi dil khush ho jaye. Aaj hi tashreef layen aur apni pasand le jayen.',
        'Intezaar khatam hua! {P} ab {B} par available hai. Stock limited hai — der na karen, aaj hi visit karen.',
        'Kuch naya, kuch khaas — {P} ki aamad ho gayi hai {B} par. Aayen, dekhen aur quality ka farq khud mehsoos karen.',
        '{B} ki taza peshkash: {P}. Tasveeron se zyada asal mein khoobsurat. Zaroor dekhne aayen.'
      ]
    },
    offer: {
      ur: [
        'خوشخبری گاہکوں کے لیے! {B} پر {P} پر {O} جاری ہے۔ یہ موقع ہاتھ سے نہ جانے دیجیے — آفر محدود مدت کے لیے ہے۔',
        '{O}! جی ہاں، {B} پر {P} پر خصوصی رعایت مل رہی ہے۔ آج آئیے اور پورا فائدہ اٹھائیے۔',
        'بچت کا سنہرا موقع — {B} کی طرف سے {P} پر {O}۔ معیار وہی، قیمت کم۔',
        'اعلان! {B} اپنے پیارے گاہکوں کے لیے لایا ہے {O}۔ اگر {P} لینا ہے تو یہی بہترین وقت ہے۔'
      ],
      en: [
        'Great news for our customers! {O} is now on at {B} on {P}. Do not let this chance slip away — the offer is for a limited time only.',
        '{O}! Yes, a special discount is live at {B} on {P}. Visit today and make the most of it.',
        'A golden chance to save — {B} brings you {O} on {P}. Same quality, lower price.',
        'Announcement! {B} has brought {O} for its valued customers. If {P} is on your list, this is the best time to buy.'
      ],
      ru: [
        'Khushkhabri customers ke liye! {B} par {P} par {O} jaari hai. Yeh mauqa haath se na jaane den — offer limited time ke liye hai.',
        '{O}! Ji haan, {B} par {P} par khaas discount mil raha hai. Aaj aayen aur pura faida uthayen.',
        'Bachat ka sunehra mauqa — {B} ki taraf se {P} par {O}. Quality wahi, qeemat kam.',
        'Aelaan! {B} apne pyaray customers ke liye laya hai {O}. Agar {P} lena hai to yehi best time hai.'
      ]
    },
    eid: {
      ur: [
        'عید مبارک! {B} کی طرف سے آپ کو اور آپ کے اہل خانہ کو دلی عید مبارک۔ اس عید {P} کے ساتھ اپنی خوشیوں کو خاص بنائیے۔',
        'رمضان کریم! {B} کی طرف سے سب کو برکتوں بھرا مہینہ مبارک ہو۔ {P} کے لیے تشریف لائیے، خدمت کا موقع دیجیے۔',
        'عید کی تیاری {B} سے شروع کیجیے — {P} آپ کی عید کو چار چاند لگا دے گا۔ عید مبارک!',
        'اس عید کچھ خاص کیجیے — {B} پر {P} آپ کے لیے حاضر ہے۔ آپ کو اور آپ کے پیاروں کو عید کی ڈھیروں مبارکباد۔'
      ],
      en: [
        'Eid Mubarak! Warm Eid wishes from {B} to you and your family. Make this Eid special with {P}.',
        'Ramadan Kareem! Blessed wishes from {B} for a month full of barakah. Visit us for {P} — we would love to serve you.',
        'Start your Eid preparations at {B} — {P} will add the perfect finishing touch to your celebrations. Eid Mubarak!',
        'Do something special this Eid — {P} is waiting for you at {B}. Hearty Eid greetings to you and your loved ones.'
      ],
      ru: [
        'Eid Mubarak! {B} ki taraf se aap ko aur aap ke ghar walon ko dili Eid Mubarak. Is Eid {P} ke saath apni khushiyon ko khaas banayen.',
        'Ramzan Kareem! {B} ki taraf se sab ko barkaton bhara mahina mubarak ho. {P} ke liye tashreef layen, khidmat ka mauqa den.',
        'Eid ki tayyari {B} se shuru karen — {P} aap ki Eid ko chaar chaand laga dega. Eid Mubarak!',
        'Is Eid kuch khaas karen — {B} par {P} aap ke liye haazir hai. Aap ko aur aap ke pyaron ko Eid ki dheron mubarakbad.'
      ]
    },
    thanks: {
      ur: [
        'آپ کے بھروسے کا دل سے شکریہ! {B} کے گاہک ہی ہماری اصل طاقت ہیں۔ آپ کی محبت ہی ہمارا سب سے بڑا انعام ہے۔',
        'ایک اور خوش گاہک، ایک اور مسکراہٹ۔ {B} کو چننے کا شکریہ — آپ کی رائے ہمارے لیے بہت قیمتی ہے۔',
        'شکریہ! آپ کے اچھے الفاظ ہمیں اور بہتر کام کی ترغیب دیتے ہیں۔ {B} ہمیشہ آپ کی خدمت میں حاضر ہے۔',
        'الحمدللہ، گاہک خوش تو ہم خوش۔ {B} پر اعتماد کرنے کا شکریہ — دعا ہے یہ رشتہ یونہی قائم رہے۔'
      ],
      en: [
        'A heartfelt thank-you for your trust! The customers of {B} are our real strength. Your love is our biggest reward.',
        'Another happy customer, another smile. Thank you for choosing {B} — your feedback means the world to us.',
        'Thank you! Your kind words inspire us to do even better. {B} is always at your service.',
        'Alhamdulillah — when our customers are happy, we are happy. Thank you for trusting {B}; may this bond last.'
      ],
      ru: [
        'Aap ke bharosay ka dil se shukriya! {B} ke customers hi hamari asal taaqat hain. Aap ki mohabbat hi hamara sab se bara inaam hai.',
        'Ek aur khush customer, ek aur muskurahat. {B} ko chunne ka shukriya — aap ki raaye hamare liye bohat qeemti hai.',
        'Shukriya! Aap ke achay alfaaz humein aur behtar kaam ki targheeb dete hain. {B} hamesha aap ki khidmat mein haazir hai.',
        'Alhamdulillah, customer khush to hum khush. {B} par aitmaad karne ka shukriya — dua hai yeh rishta yunhi qaim rahe.'
      ]
    },
    announce: {
      ur: [
        'اہم اعلان! {B} کی طرف سے خوشخبری — {P} کے بارے میں تازہ خبر آ گئی ہے۔ تفصیل کے لیے رابطہ کیجیے یا تشریف لائیے۔',
        'سنیے سنیے! {B} لایا ہے آپ کے لیے {P}۔ مزید جاننے کے لیے آج ہی پیغام بھیجیے۔',
        '{B} کی طرف سے بڑی خبر — {P} اب اور آسان ہو گیا ہے۔ تفصیلات کے لیے رابطہ کیجیے، ہم حاضر ہیں۔',
        'نیا آغاز، نئی امید! {B} کا {P} آپ کی خدمت کے لیے حاضر ہے۔ آئیے اور خود دیکھیے۔'
      ],
      en: [
        'Important announcement! Good news from {B} — a fresh update about {P} is here. Message us or visit for full details.',
        'Hear, hear! {B} has brought {P} for you. Send us a message today to know more.',
        'Big news from {B} — {P} is now even easier to get. Contact us for details; we are happy to help.',
        'A new beginning, a new hope! {P} from {B} is here to serve you. Come and see for yourself.'
      ],
      ru: [
        'Ahem aelaan! {B} ki taraf se khushkhabri — {P} ke baare mein taza khabar aa gayi hai. Tafseel ke liye rabta karen ya tashreef layen.',
        'Suniye suniye! {B} laya hai aap ke liye {P}. Mazeed jaanne ke liye aaj hi message bhejiye.',
        '{B} ki taraf se bari khabar — {P} ab aur asaan ho gaya hai. Tafseelaat ke liye rabta karen, hum haazir hain.',
        'Naya aaghaaz, nayi umeed! {B} ka {P} aap ki khidmat ke liye haazir hai. Aayen aur khud dekhen.'
      ]
    },
    weekend: {
      ur: [
        'ویک اینڈ آ گیا! {B} پر {P} دیکھنے کا یہی بہترین وقت ہے۔ اہل خانہ کے ساتھ تشریف لائیے، سکون سے پسند کیجیے۔',
        'اس ویک اینڈ {B} ضرور آئیے — {P} آپ کا منتظر ہے۔ خریداری کا مزہ بھی، سکون بھی۔',
        'چھٹی کا دن، خریداری کا مزہ! {B} پر {P} کے ساتھ اپنا ویک اینڈ خاص بنائیے۔',
        'ویک اینڈ کی سیر {B} سے شروع کیجیے — {P} آپ کو ضرور پسند آئے گا۔ ہم آپ کے منتظر ہیں۔'
      ],
      en: [
        'The weekend is here! This is the best time to see {P} at {B}. Bring the family and choose in peace.',
        'Do visit {B} this weekend — {P} is waiting for you. Enjoy shopping, with full peace of mind.',
        'A day off means shopping fun! Make your weekend special with {P} at {B}.',
        'Start your weekend outing at {B} — you will surely love {P}. We look forward to welcoming you.'
      ],
      ru: [
        'Weekend aa gaya! {B} par {P} dekhne ka yehi best time hai. Ghar walon ke saath tashreef layen, sukoon se pasand karen.',
        'Is weekend {B} zaroor aayen — {P} aap ka muntazir hai. Kharidari ka maza bhi, sukoon bhi.',
        'Chutti ka din, kharidari ka maza! {B} par {P} ke saath apna weekend khaas banayen.',
        'Weekend ki sair {B} se shuru karen — {P} aap ko zaroor pasand aayega. Hum aap ke muntazir hain.'
      ]
    }
  };

  function weave(tpl, vals) {
    return tpl.split('{B}').join(vals.B).split('{P}').join(vals.P).split('{O}').join(vals.O);
  }

  /* pure generator (exported for tests) */
  var lastIdx = {};
  function generate(biz, occ, name, item, offer) {
    var bank = T[occ]; if (!bank) return null;
    var fb = ITEM_FALLBACK[biz] || ITEM_FALLBACK.shop;
    var vals = {
      ur: {
        B: name || NAME_FALLBACK.ur,
        P: item || fb.ur,
        O: offer || OFFER_FALLBACK.ur
      },
      en: {
        B: name || NAME_FALLBACK.en,
        P: item || fb.en,
        O: offer || OFFER_FALLBACK.en
      },
      ru: {
        B: name || NAME_FALLBACK.ru,
        P: item || fb.ru,
        O: offer || OFFER_FALLBACK.ru
      }
    };
    var n = bank.ur.length;
    var k = Math.floor(Math.random() * n);
    if (n > 1 && lastIdx[occ] === k) k = (k + 1) % n;
    lastIdx[occ] = k;
    return {
      ur: weave(bank.ur[k], vals.ur),
      en: weave(bank.en[k], vals.en),
      ru: weave(bank.ru[k], vals.ru),
      tags: (HASHTAGS[biz] || HASHTAGS.shop).join(' ')
    };
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
    var root = document.getElementById('postcreator');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');

    var row1 = h('div', 'tm-row');
    var bizSel = h('select', 'tm-select');
    BUSINESSES.forEach(function (b) { var o = h('option', null, b[1]); o.value = b[0]; bizSel.appendChild(o); });
    var occSel = h('select', 'tm-select');
    OCCASIONS.forEach(function (b) { var o = h('option', null, b[1]); o.value = b[0]; occSel.appendChild(o); });
    occSel.value = 'offer';
    row1.appendChild(field('کاروبار کی قسم', 'Business type', bizSel));
    row1.appendChild(field('موقع / مناسبت', 'Occasion', occSel));
    panel.appendChild(row1);

    var nameIn = h('input', 'tm-input'); nameIn.type = 'text';
    nameIn.placeholder = 'e.g. Sapna Furniture & Home Decor';
    var itemIn = h('input', 'tm-input'); itemIn.type = 'text';
    itemIn.placeholder = 'e.g. sofa set · اختیاری';
    var row2 = h('div', 'tm-row');
    row2.appendChild(field('کاروبار کا نام', 'Business name', nameIn));
    row2.appendChild(field('چیز / پروڈکٹ (اختیاری)', 'Product / item (optional)', itemIn));
    panel.appendChild(row2);

    var offerIn = h('input', 'tm-input'); offerIn.type = 'text';
    offerIn.placeholder = 'e.g. 10% discount · اختیاری';
    panel.appendChild(field('آفر کی تفصیل (اختیاری)', 'Offer detail (optional)', offerIn));

    var genBtn = h('button', 'tm-btn tm-btn-gold', 'پوسٹ بنائیں · Create posts');
    genBtn.type = 'button';
    var act = h('div', 'tm-actions'); act.appendChild(genBtn); panel.appendChild(act);

    var res = h('div', 'tm-result'); res.hidden = true;
    var cards = h('div', 'spc-cards');
    res.appendChild(cards);
    panel.appendChild(res);

    var note = h('p', 'tm-note');
    note.innerHTML = 'These posts are ready-made templates (ٹیمپلیٹس) written for this tool — pick a variant, adjust a line if you like, and post. They are not AI-generated text. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ پوسٹس اسی اوزار کے لیے لکھے گئے تیار ٹیمپلیٹس ہیں — ایک چنیں، چاہیں تو ایک سطر بدلیں، اور پوسٹ کر دیں۔</span>';
    panel.appendChild(note);

    function variantCard(title, isUrdu, text, tags) {
      var card = h('div', 'spc-card');
      var head = h('div', 'spc-head');
      head.appendChild(h('span', 'spc-lang', title));
      card.appendChild(head);
      var body = h('div', 'spc-text' + (isUrdu ? ' spc-ur' : ''), text);
      if (isUrdu) { body.setAttribute('lang', 'ur'); body.setAttribute('dir', 'rtl'); }
      card.appendChild(body);
      var tagEl = h('div', 'spc-tags', tags);
      card.appendChild(tagEl);
      var share = h('div', 'tm-share');
      var full = text + '\n\n' + tags;
      var cp = h('button', 'tm-btn tm-btn-small', 'Copy · کاپی کریں'); cp.type = 'button';
      cp.addEventListener('click', function () { copyText(cp, full); });
      var wa = h('a', 'tm-btn tm-btn-small tm-btn-wa', 'WhatsApp');
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(full);
      wa.target = '_blank'; wa.rel = 'noopener';
      share.appendChild(cp); share.appendChild(wa);
      card.appendChild(share);
      return card;
    }

    function run() {
      var out = generate(
        bizSel.value,
        occSel.value,
        nameIn.value.trim(),
        itemIn.value.trim(),
        offerIn.value.trim()
      );
      if (!out) return;
      cards.innerHTML = '';
      cards.appendChild(variantCard('اردو · Urdu', true, out.ur, out.tags));
      cards.appendChild(variantCard('English', false, out.en, out.tags));
      cards.appendChild(variantCard('Roman Urdu', false, out.ru, out.tags));
      res.hidden = false;
    }
    genBtn.addEventListener('click', run);

    root.appendChild(panel);
    run(); /* sample posts on load */
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generate: generate, T: T, HASHTAGS: HASHTAGS };
  }
})();
