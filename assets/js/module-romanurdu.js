/* ============================================================
   Khari Baat Tools — P3-14: Roman Urdu → Urdu Script
   (mount id: "romanurdu")
   A dictionary of 300+ common Roman Urdu words and phrases,
   plus a letter-combination fallback for unknown words.
   Honest scope: everyday words convert well; it is NOT a
   perfect transliterator and says so on the page.
   Test hooks: convert() + DICT are exported under Node.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- phrase dictionary (checked longest-first) ---------- */
  var PHRASES = {
    'assalam o alaikum': 'السلام علیکم',
    'assalamualaikum': 'السلام علیکم',
    'walaikum assalam': 'وعلیکم السلام',
    'wa alaikum assalam': 'وعلیکم السلام',
    'in sha allah': 'ان شاء اللہ',
    'insha allah': 'ان شاء اللہ',
    'inshallah': 'ان شاء اللہ',
    'masha allah': 'ماشاء اللہ',
    'mashallah': 'ماشاء اللہ',
    'alhamdulillah': 'الحمد للہ',
    'subhan allah': 'سبحان اللہ',
    'khuda hafiz': 'خدا حافظ',
    'allah hafiz': 'اللہ حافظ',
    'jazak allah': 'جزاک اللہ',
    'shukr hai': 'شکر ہے',
    'eid mubarak': 'عید مبارک',
    'ramzan mubarak': 'رمضان مبارک',
    'jumma mubarak': 'جمعہ مبارک',
    'khair mubarak': 'خیر مبارک',
    'kia haal': 'کیا حال',
    'kya haal': 'کیا حال',
    'kaise ho': 'کیسے ہو',
    'kahan ho': 'کہاں ہو',
    'kya kar': 'کیا کر',
    'bohat acha': 'بہت اچھا',
    'bahut acha': 'بہت اچھا',
    'shukriya bohat': 'شکریہ بہت',
    'bohat shukriya': 'بہت شکریہ',
    'bahut shukriya': 'بہت شکریہ'
  };

  /* ---------- word dictionary (340+ common words) ---------- */
  var DICT = {
    /* pronouns & people */
    'main': 'میں', 'mein': 'میں', 'me': 'میں', 'mujhe': 'مجھے', 'mujh': 'مجھ',
    'mera': 'میرا', 'meri': 'میری', 'mere': 'میرے', 'hum': 'ہم', 'hamara': 'ہمارا',
    'hamari': 'ہماری', 'tum': 'تم', 'tumhara': 'تمہارا', 'tumhari': 'تمہاری',
    'aap': 'آپ', 'aapka': 'آپ کا', 'aapki': 'آپ کی', 'aapke': 'آپ کے',
    'woh': 'وہ', 'wo': 'وہ', 'yeh': 'یہ', 'ye': 'یہ', 'us': 'اس', 'is': 'اس',
    'uska': 'اس کا', 'uski': 'اس کی', 'iske': 'اس کے', 'unka': 'ان کا',
    'unki': 'ان کی', 'inka': 'ان کا', 'un': 'ان', 'in': 'ان', 'woh log': 'وہ لوگ',
    'kaun': 'کون', 'kon': 'کون', 'koi': 'کوئی', 'sab': 'سب', 'sabhi': 'سبھی',
    'har': 'ہر', 'apna': 'اپنا', 'apni': 'اپنی', 'apne': 'اپنے', 'khud': 'خود',
    'ek': 'ایک', 'do': 'دو', 'teen': 'تین', 'char': 'چار', 'paanch': 'پانچ',
    'chhe': 'چھ', 'saat': 'سات', 'aath': 'آٹھ', 'nau': 'نو', 'das': 'دس',
    'aadmi': 'آدمی', 'admi': 'آدمی', 'aurat': 'عورت', 'larka': 'لڑکا', 'ladka': 'لڑکا',
    'larki': 'لڑکی', 'ladki': 'لڑکی', 'bacha': 'بچہ', 'bachay': 'بچے', 'bachche': 'بچے',
    'dost': 'دوست', 'bhai': 'بھائی', 'behen': 'بہن', 'maa': 'ماں', 'baap': 'باپ',
    'walid': 'والد', 'walida': 'والدہ', 'beta': 'بیٹا', 'beti': 'بیٹی',
    'shohar': 'شوہر', 'biwi': 'بیوی', 'khandan': 'خاندان', 'rishtedar': 'رشتہ دار',
    'ustaad': 'استاد', 'ustad': 'استاد', 'shagird': 'شاگرد', 'doctor': 'ڈاکٹر',
    /* questions & connectors */
    'kya': 'کیا', 'kia': 'کیا', 'kyun': 'کیوں', 'kiun': 'کیوں', 'kyunke': 'کیونکہ',
    'kahan': 'کہاں', 'kab': 'کب', 'kaise': 'کیسے', 'kaisa': 'کیسا', 'kaisi': 'کیسی',
    'kitna': 'کتنا', 'kitne': 'کتنے', 'kitni': 'کتنی', 'kuch': 'کچھ', 'kuchh': 'کچھ',
    'aur': 'اور', 'ya': 'یا', 'lekin': 'لیکن', 'magar': 'مگر', 'leikin': 'لیکن',
    'agar': 'اگر', 'jab': 'جب', 'tab': 'تب', 'phir': 'پھر', 'bhi': 'بھی',
    'hi': 'ہی', 'to': 'تو', 'na': 'نہ', 'nahi': 'نہیں', 'nahin': 'نہیں',
    'han': 'ہاں', 'haan': 'ہاں', 'ji': 'جی', 'shayad': 'شاید',
    'kyunki': 'کیونکہ', 'isliye': 'اس لیے', 'isiliye': 'اسی لیے', 'warna': 'ورنہ',
    'halanke': 'حالانکہ', 'taake': 'تاکہ', 'take': 'تاکہ',
    /* verbs & helpers */
    'hai': 'ہے', 'hain': 'ہیں', 'ho': 'ہو', 'hu': 'ہوں', 'hun': 'ہوں',
    'hoga': 'ہوگا', 'hogi': 'ہوگی', 'honge': 'ہوں گے', 'hota': 'ہوتا', 'hoti': 'ہوتی',
    'tha': 'تھا', 'thi': 'تھی', 'the': 'تھے', 'raha': 'رہا', 'rahi': 'رہی', 'rahe': 'رہے',
    'gaya': 'گیا', 'gayi': 'گئی', 'gaye': 'گئے', 'karna': 'کرنا', 'karta': 'کرتا',
    'karti': 'کرتی', 'karte': 'کرتے', 'kar': 'کر', 'karo': 'کرو', 'karen': 'کریں',
    'karke': 'کر کے', 'kiya': 'کیا', 'hua': 'ہوا', 'hue': 'ہوئے', 'hui': 'ہوئی',
    'jana': 'جانا', 'jaana': 'جانا', 'jata': 'جاتا', 'jati': 'جاتی',
    'ana': 'آنا', 'aana': 'آنا', 'ata': 'آتا', 'aati': 'آتی', 'aaya': 'آیا',
    'aayi': 'آئی', 'aya': 'آیا', 'khana': 'کھانا', 'kha': 'کھا',
    'peena': 'پینا', 'sona': 'سونا', 'uthna': 'اٹھنا', 'baithna': 'بیٹھنا',
    'chalna': 'چلنا', 'rukna': 'رکنا', 'bolna': 'بولنا', 'sunna': 'سننا',
    'dekhna': 'دیکھنا', 'samajhna': 'سمجھنا', 'likhna': 'لکھنا', 'parhna': 'پڑھنا',
    'seekhna': 'سیکھنا', 'khelna': 'کھیلنا', 'hasna': 'ہنسنا', 'rona': 'رونا',
    'milna': 'ملنا', 'dena': 'دینا', 'lena': 'لینا', 'rakhna': 'رکھنا',
    'uthana': 'اٹھانا', 'girna': 'گرنا', 'jeena': 'جینا', 'banna': 'بننا',
    'banana': 'بنانا', 'kharidna': 'خریدنا', 'bechna': 'بیچنا', 'kholna': 'کھولنا',
    'band': 'بند', 'shuru': 'شروع', 'khatam': 'ختم', 'khatm': 'ختم',
    'intezar': 'انتظار', 'koshish': 'کوشش', 'madad': 'مدد', 'sochna': 'سوچنا',
    'samajh': 'سمجھ', 'yaad': 'یاد', 'bhool': 'بھول', 'chahiye': 'چاہیے',
    'chahie': 'چاہیے', 'sakta': 'سکتا', 'sakti': 'سکتی', 'sakte': 'سکتے',
    'milega': 'ملے گا', 'mila': 'ملا', 'mili': 'ملی', 'diya': 'دیا', 'diye': 'دیے',
    'liya': 'لیا', 'liye': 'لیے', 'lene': 'لینے', 'dene': 'دینے',
    /* time & place */
    'aaj': 'آج', 'kal': 'کل', 'parson': 'پرسوں', 'subah': 'صبح', 'shaam': 'شام',
    'raat': 'رات', 'din': 'دن', 'abhi': 'ابھی', 'ab': 'اب', 'pehle': 'پہلے',
    'baad': 'بعد', 'peeche': 'پیچھے', 'aage': 'آگے', 'aagay': 'آگے',
    'upar': 'اوپر', 'neeche': 'نیچے', 'neechay': 'نیچے', 'andar': 'اندر',
    'bahar': 'باہر', 'saath': 'ساتھ', 'sath': 'ساتھ', 'paas': 'پاس', 'door': 'دور',
    'yahan': 'یہاں', 'wahan': 'وہاں', 'idhar': 'ادھر', 'udhar': 'ادھر',
    'saal': 'سال', 'mahina': 'مہینہ', 'hafta': 'ہفتہ', 'ghanta': 'گھنٹہ',
    'waqt': 'وقت', 'hamesha': 'ہمیشہ', 'kabhi': 'کبھی', 'aksar': 'اکثر',
    'der': 'دیر', 'jaldi': 'جلدی',
    /* postpositions */
    'se': 'سے', 'ko': 'کو', 'ka': 'کا', 'ki': 'کی', 'ke': 'کے', 'ne': 'نے',
    'par': 'پر', 'per': 'پر', 'mein': 'میں', 'tak': 'تک', 'liye': 'لیے',
    'bina': 'بغیر', 'baghair': 'بغیر', 'baad mein': 'بعد میں',
    /* everyday nouns */
    'ghar': 'گھر', 'sheher': 'شہر', 'shahar': 'شہر', 'mulk': 'ملک',
    'duniya': 'دنیا', 'zindagi': 'زندگی', 'mohabbat': 'محبت', 'pyar': 'پیار',
    'pyaar': 'پیار', 'dil': 'دل', 'baat': 'بات', 'kaam': 'کام',
    'paise': 'پیسے', 'paisa': 'پیسہ', 'pani': 'پانی', 'paani': 'پانی',
    'kitaab': 'کتاب', 'kitab': 'کتاب', 'school': 'اسکول', 'ilm': 'علم',
    'khuda': 'خدا', 'allah': 'اللہ', 'naam': 'نام', 'nam': 'نام',
    'zuban': 'زبان', 'log': 'لوگ', 'awam': 'عوام', 'awaam': 'عوام',
    'sarkar': 'سرکار', 'hukumat': 'حکومت', 'naukri': 'نوکری', 'nokri': 'نوکری',
    'safar': 'سفر', 'rasta': 'راستہ', 'raasta': 'راستہ', 'gaari': 'گاڑی',
    'gari': 'گاڑی', 'bazaar': 'بازار', 'bazar': 'بازار', 'dukan': 'دکان',
    'dukaan': 'دکان', 'mohalla': 'محلہ', 'gaon': 'گاؤں', 'khet': 'کھیت',
    'mausam': 'موسم', 'barish': 'بارش', 'baarish': 'بارش', 'hawa': 'ہوا',
    'dhoop': 'دھوپ', 'chaand': 'چاند', 'chand': 'چاند', 'suraj': 'سورج',
    'sitara': 'ستارہ', 'phool': 'پھول', 'darakht': 'درخت', 'janwar': 'جانور',
    'insaan': 'انسان', 'insan': 'انسان', 'rishta': 'رشتہ', 'shaadi': 'شادی',
    'shadi': 'شادی', 'eid': 'عید', 'ramzan': 'رمضان', 'ramazan': 'رمضان',
    'namaz': 'نماز', 'roza': 'روزہ', 'masjid': 'مسجد', 'quran': 'قرآن',
    'dua': 'دعا', 'khabar': 'خبر', 'akhbar': 'اخبار', 'kahani': 'کہانی',
    'sher': 'شعر', 'ghazal': 'غزل', 'gaana': 'گانا', 'film': 'فلم',
    'mobile': 'موبائل', 'computer': 'کمپیوٹر', 'internet': 'انٹرنیٹ',
    'sehat': 'صحت', 'bimari': 'بیماری', 'dawa': 'دوا', 'khel': 'کھیل',
    'jeet': 'جیت', 'haar': 'ہار', 'khushi': 'خوشی', 'gham': 'غم',
    'umeed': 'امید', 'umid': 'امید', 'khwab': 'خواب', 'sawaal': 'سوال',
    'sawal': 'سوال', 'jawab': 'جواب', 'masla': 'مسئلہ', 'hal': 'حل',
    'tareeqa': 'طریقہ', 'tariqa': 'طریقہ', 'soch': 'سوچ', 'khayal': 'خیال',
    'ehsas': 'احساس', 'mehsoos': 'محسوس', 'sakoon': 'سکون', 'sukoon': 'سکون',
    'izzat': 'عزت', 'sharam': 'شرم', 'mehnat': 'محنت', 'kamyabi': 'کامیابی',
    'nakami': 'ناکامی', 'ghalti': 'غلطی', 'sach': 'سچ', 'jhooth': 'جھوٹ',
    'aman': 'امن', 'jang': 'جنگ', 'fauj': 'فوج', 'siyasat': 'سیاست',
    'mehngai': 'مہنگائی', 'tankhwah': 'تنخواہ', 'karobar': 'کاروبار',
    'bijli': 'بجلی', 'petrol': 'پیٹرول', 'sona': 'سونا', 'chandi': 'چاندی',
    'zameen': 'زمین', 'aasman': 'آسمان', 'samandar': 'سمندر', 'darya': 'دریا',
    'pahad': 'پہاڑ', 'jangal': 'جنگل', 'shehar': 'شہر',
    /* adjectives & adverbs */
    'bara': 'بڑا', 'bada': 'بڑا', 'bari': 'بڑی', 'chota': 'چھوٹا', 'choti': 'چھوٹی',
    'lamba': 'لمبا', 'naya': 'نیا', 'nayi': 'نئی', 'purana': 'پرانا',
    'garam': 'گرم', 'thanda': 'ٹھنڈا', 'tez': 'تیز', 'aahista': 'آہستہ',
    'mushkil': 'مشکل', 'aasan': 'آسان', 'aasaan': 'آسان',
    'khoobsurat': 'خوبصورت', 'khubsurat': 'خوبصورت', 'saaf': 'صاف',
    'ganda': 'گندا', 'ameer': 'امیر', 'ghareeb': 'غریب', 'gareeb': 'غریب',
    'beemar': 'بیمار', 'bimar': 'بیمار', 'khush': 'خوش', 'udas': 'اداس',
    'udaas': 'اداس', 'naraz': 'ناراض', 'naraaz': 'ناراض', 'acha': 'اچھا',
    'achha': 'اچھا', 'acchi': 'اچھی', 'bura': 'برا', 'buri': 'بری',
    'sahi': 'صحیح', 'ghalat': 'غلط', 'galat': 'غلط', 'zaroor': 'ضرور',
    'zaroori': 'ضروری', 'mumkin': 'ممکن', 'takreeban': 'تقریباً',
    'taqreeban': 'تقریباً', 'akela': 'اکیلا', 'tanha': 'تنہا',
    'bohat': 'بہت', 'bahut': 'بہت', 'boht': 'بہت', 'zyada': 'زیادہ',
    'ziada': 'زیادہ', 'kam': 'کم', 'kum': 'کم', 'theek': 'ٹھیک', 'thik': 'ٹھیک',
    'bilkul': 'بالکل', 'shukriya': 'شکریہ', 'mehrbani': 'مہربانی',
    'salaam': 'سلام', 'salam': 'سلام', 'mubarak': 'مبارک', 'khush amdeed': 'خوش آمدید'
  };

  /* ---------- fallback transliteration ---------- */
  var DIGRAPHS = [
    ['chh', 'چھ'], ['kh', 'کھ'], ['gh', 'غ'], ['ch', 'چ'], ['sh', 'ش'],
    ['zh', 'ژ'], ['ph', 'پھ'], ['th', 'تھ'], ['dh', 'دھ'], ['bh', 'بھ'],
    ['rh', 'ڑھ'], ['jh', 'جھ'], ['nh', 'نھ'], ['lh', 'لھ'], ['mh', 'مھ'],
    ['ai', 'ے'], ['ay', 'ے'], ['au', 'و'], ['aa', 'ا'], ['ee', 'ی'],
    ['oo', 'و'], ['ou', 'و'], ['ei', 'ے']
  ];
  var LETTERS = {
    'a': 'ا', 'b': 'ب', 'c': 'ک', 'd': 'د', 'e': 'ے', 'f': 'ف', 'g': 'گ',
    'h': 'ہ', 'i': 'ی', 'j': 'ج', 'k': 'ک', 'l': 'ل', 'm': 'م', 'n': 'ن',
    'o': 'و', 'p': 'پ', 'q': 'ق', 'r': 'ر', 's': 'س', 't': 'ت', 'u': 'و',
    'v': 'و', 'w': 'و', 'x': 'کس', 'y': 'ی', 'z': 'ز'
  };
  function fallbackWord(w) {
    var out = '', i = 0;
    var lower = w.toLowerCase();
    while (i < lower.length) {
      var matched = false;
      for (var d = 0; d < DIGRAPHS.length; d++) {
        var dg = DIGRAPHS[d][0];
        if (lower.substr(i, dg.length) === dg) { out += DIGRAPHS[d][1]; i += dg.length; matched = true; break; }
      }
      if (matched) continue;
      var ch = lower[i];
      out += (LETTERS[ch] !== undefined ? LETTERS[ch] : ch);
      i++;
    }
    return out;
  }

  /* ---------- converter ---------- */
  function convertWord(token) {
    var lower = token.toLowerCase();
    if (DICT[lower]) return DICT[lower];
    return fallbackWord(token);
  }
  function convert(text) {
    var src = String(text || '');
    if (!src.trim()) return '';
    /* phrases first: longest match on the whole text (case-insensitive) */
    var keys = Object.keys(PHRASES).sort(function (a, b) { return b.length - a.length; });
    var slots = [];
    var work = ' ' + src + ' ';
    keys.forEach(function (k) {
      var needle = ' ' + k + ' ';
      var idx;
      while ((idx = work.toLowerCase().indexOf(needle)) !== -1) {
        var token = '\u0001' + slots.length + '\u0002';
        slots.push(PHRASES[k]);
        work = work.substring(0, idx + 1) + token + work.substring(idx + needle.length - 1);
      }
    });
    /* word by word, keeping punctuation/spacing */
    work = work.replace(/[A-Za-z]+/g, function (w) { return convertWord(w); });
    /* restore phrase slots */
    work = work.replace(/\u0001(\d+)\u0002/g, function (m, n) { return slots[Number(n)]; });
    return work.trim();
  }

  /* ---------- DOM helpers ---------- */
  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function mount() {
    var root = document.getElementById('romanurdu');
    if (!root || root.dataset.tmMounted) return;
    root.dataset.tmMounted = '1';

    var panel = h('div', 'tm-panel');
    var lbl = h('div', 'tm-label');
    var a = h('span', 'tm-lur', 'رومن اردو یہاں لکھیے'); a.setAttribute('lang', 'ur'); a.setAttribute('dir', 'rtl');
    var b = h('span', 'tm-len', 'Type Roman Urdu here');
    lbl.appendChild(a); lbl.appendChild(b);
    panel.appendChild(lbl);

    var input = h('textarea', 'tm-textarea');
    input.placeholder = 'e.g. mera naam adeel hai aur main kot addu se hoon';
    input.setAttribute('dir', 'ltr');
    panel.appendChild(input);

    var outLbl = h('div', 'tm-label');
    outLbl.style.marginTop = '18px';
    var a2 = h('span', 'tm-lur', 'اردو رسم الخط میں'); a2.setAttribute('lang', 'ur'); a2.setAttribute('dir', 'rtl');
    var b2 = h('span', 'tm-len', 'In Urdu script');
    outLbl.appendChild(a2); outLbl.appendChild(b2);
    panel.appendChild(outLbl);

    var output = h('textarea', 'tm-textarea tm-urdu-out');
    output.readOnly = true;
    output.setAttribute('dir', 'rtl'); output.setAttribute('lang', 'ur');
    output.placeholder = 'اردو یہاں نظر آئے گی…';
    panel.appendChild(output);

    var actions = h('div', 'tm-actions');
    var convBtn = h('button', 'tm-btn tm-btn-gold', 'Convert · اردو میں بدلیں');
    convBtn.type = 'button';
    var copyBtn = h('button', 'tm-btn', 'Copy Urdu · نقل کریں');
    copyBtn.type = 'button';
    var sampleBtn = h('button', 'tm-btn', 'Sample · نمونہ');
    sampleBtn.type = 'button';
    var waBtn = h('button', 'tm-btn tm-btn-wa', 'WhatsApp');
    waBtn.type = 'button';
    actions.appendChild(convBtn); actions.appendChild(copyBtn);
    actions.appendChild(sampleBtn); actions.appendChild(waBtn);
    panel.appendChild(actions);

    var ok = h('p', 'tm-ok', ''); ok.hidden = true;
    panel.appendChild(ok);

    var note = h('p', 'tm-note');
    note.innerHTML = 'This converter knows 300+ common everyday words and matches them exactly; unknown words are spelled out letter by letter as a best guess. It works well for aam alfaaz (common words) — it is <b>not 100% accurate</b> for every word, so please read the Urdu once before sending. ' +
      '<span class="tm-ur" lang="ur" dir="rtl">یہ کنورٹر تین سو سے زائد روزمرہ الفاظ پہچانتا ہے؛ انجان الفاظ حرف بحرف لکھے جاتے ہیں، اس لیے بھیجنے سے پہلے ایک نظر دیکھ لیں۔ سو فیصد درستگی کی ضمانت نہیں۔</span>';
    panel.appendChild(note);

    function doConvert() {
      output.value = convert(input.value);
      return output.value;
    }
    input.addEventListener('input', doConvert);
    convBtn.addEventListener('click', doConvert);
    sampleBtn.addEventListener('click', function () {
      input.value = 'assalam o alaikum, mera naam adeel hai. main kot addu se hoon aur khari baat ke liye column likhta hoon. aap ka bohat shukriya ke aap ne waqt nikala.';
      doConvert();
    });
    copyBtn.addEventListener('click', function () {
      var v = doConvert();
      if (!v) return;
      function done() { ok.textContent = 'Copied · نقل ہو گیا'; ok.hidden = false; setTimeout(function () { ok.hidden = true; }, 2000); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, done);
      else { output.select(); try { document.execCommand('copy'); } catch (e) {} done(); }
    });
    waBtn.addEventListener('click', function () {
      var v = doConvert();
      if (!v) return;
      window.open('https://wa.me/?text=' + encodeURIComponent(v), '_blank', 'noopener');
    });

    root.appendChild(panel);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { convert: convert, DICT: DICT, PHRASES: PHRASES, fallbackWord: fallbackWord };
  }
})();
