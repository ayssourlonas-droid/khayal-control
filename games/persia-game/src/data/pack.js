// The word pack: the only place language lives. Another language pair is another fork with another pack.
//   lang, dir     the pack language and its text direction
//   font          the face the word moment is set in, loaded from the page's own origin; `digits` names
//                 the same face kept to the pack's digits and thousands mark, which numbers are set in
//   species       { id, word, say, clip, ms } in the order they first appear across the levels, which is
//                 also the parade order. `id` is a core SPECIES id, `word` the plain written word (no
//                 diacritics), `say` the name in Latin letters, shown beside the word while it is
//                 said, `clip` its approved recording (public/audio/manifest.json), `ms` its length
//   numbers       { n, word, say, clip, ms }, one per wave of the game, 1 to the last; `word` is n in
//                 Persian digits, shown as it is said
//   weather       { rain, stars, petals, moon, dawn, sunrise, rainbow }, each { word, say, clip, ms }, by a
//                 level's weather kind (levels.js): said after the number and species of the wave
//                 the weather begins with, shown as a species' word is, without a face
//   hud           { wave, score, bombs, lives, combo }, the words the HUD shows in place of its English
//                 labels (a level's 'waveWord', 'scoreWord', 'bombsWord', 'livesWord' and 'comboWord'
//                 parts, levels.js); read, never heard, so no clip, set as a species' word is
//   digits        the ten digits, 0 to 9, a number is written in where the screen shows it in Persian
//   group         the mark that groups such a number's thousands
//   letterColours the colours the word moment cycles through, one per letter
export const PACK = {
  lang: 'fa', dir: 'rtl',
  font: { family: 'PackWord', digits: 'PackDigits', file: 'public/fonts/Vazirmatn-Bold.woff2', weight: '700' },
  species: [
    { id: 'dog', word: 'سگ', say: 'sag', clip: 'public/audio/sag.mp3', ms: 760 },
    { id: 'cow', word: 'گاو', say: 'gav', clip: 'public/audio/gav.mp3', ms: 760 },
    { id: 'rabbit', word: 'خرگوش', say: 'khargush', clip: 'public/audio/khargush.mp3', ms: 1070 },
    { id: 'bird', word: 'پرنده', say: 'parande', clip: 'public/audio/parande.mp3', ms: 780 },
    { id: 'cat', word: 'گربه', say: 'gorbe', clip: 'public/audio/gorbe.mp3', ms: 760 },
    { id: 'horse', word: 'اسب', say: 'asb', clip: 'public/audio/asb.mp3', ms: 760 },
    { id: 'fish', word: 'ماهی', say: 'mahi', clip: 'public/audio/mahi.mp3', ms: 860 },
    { id: 'mouse', word: 'موش', say: 'mush', clip: 'public/audio/mush.mp3', ms: 970 },
    { id: 'lion', word: 'شیر', say: 'shir', clip: 'public/audio/shir.mp3', ms: 970 },
    { id: 'camel', word: 'شتر', say: 'shotor', clip: 'public/audio/shotor.mp3', ms: 760 },
    { id: 'fox', word: 'روباه', say: 'rubah', clip: 'public/audio/rubah.mp3', ms: 890 },
  ],
  numbers: [
    { n: 1, word: '۱', say: 'yek', clip: 'public/audio/yek.mp3', ms: 760 },
    { n: 2, word: '۲', say: 'do', clip: 'public/audio/do.mp3', ms: 760 },
    { n: 3, word: '۳', say: 'se', clip: 'public/audio/se.mp3', ms: 760 },
    { n: 4, word: '۴', say: 'chahar', clip: 'public/audio/chahar.mp3', ms: 760 },
    { n: 5, word: '۵', say: 'panj', clip: 'public/audio/panj.mp3', ms: 840 },
    { n: 6, word: '۶', say: 'shesh', clip: 'public/audio/shesh.mp3', ms: 810 },
    { n: 7, word: '۷', say: 'haft', clip: 'public/audio/haft.mp3', ms: 760 },
    { n: 8, word: '۸', say: 'hasht', clip: 'public/audio/hasht.mp3', ms: 760 },
    { n: 9, word: '۹', say: 'noh', clip: 'public/audio/noh.mp3', ms: 760 },
    { n: 10, word: '۱۰', say: 'dah', clip: 'public/audio/dah.mp3', ms: 760 },
    { n: 11, word: '۱۱', say: 'yazdah', clip: 'public/audio/yazdah.mp3', ms: 890 },
    { n: 12, word: '۱۲', say: 'davazdah', clip: 'public/audio/davazdah.mp3', ms: 780 },
    { n: 13, word: '۱۳', say: 'sizdah', clip: 'public/audio/sizdah.mp3', ms: 760 },
    { n: 14, word: '۱۴', say: 'chahardah', clip: 'public/audio/chahardah.mp3', ms: 810 },
    { n: 15, word: '۱۵', say: 'panzdah', clip: 'public/audio/panzdah.mp3', ms: 970 },
    { n: 16, word: '۱۶', say: 'shanzdah', clip: 'public/audio/shanzdah.mp3', ms: 810 },
    { n: 17, word: '۱۷', say: 'hefdah', clip: 'public/audio/hefdah.mp3', ms: 780 },
    { n: 18, word: '۱۸', say: 'hejdah', clip: 'public/audio/hejdah.mp3', ms: 910 },
    { n: 19, word: '۱۹', say: 'nuzdah', clip: 'public/audio/nuzdah.mp3', ms: 840 },
    { n: 20, word: '۲۰', say: 'bist', clip: 'public/audio/bist.mp3', ms: 760 },
    { n: 21, word: '۲۱', say: 'bist-o-yek', clip: 'public/audio/bist-o-yek.mp3', ms: 1200 },
    { n: 22, word: '۲۲', say: 'bist-o-do', clip: 'public/audio/bist-o-do.mp3', ms: 810 },
    { n: 23, word: '۲۳', say: 'bist-o-se', clip: 'public/audio/bist-o-se.mp3', ms: 890 },
    { n: 24, word: '۲۴', say: 'bist-o-chahar', clip: 'public/audio/bist-o-chahar.mp3', ms: 990 },
    { n: 25, word: '۲۵', say: 'bist-o-panj', clip: 'public/audio/bist-o-panj.mp3', ms: 1200 },
    { n: 26, word: '۲۶', say: 'bist-o-shesh', clip: 'public/audio/bist-o-shesh.mp3', ms: 1040 },
    { n: 27, word: '۲۷', say: 'bist-o-haft', clip: 'public/audio/bist-o-haft.mp3', ms: 940 },
    { n: 28, word: '۲۸', say: 'bist-o-hasht', clip: 'public/audio/bist-o-hasht.mp3', ms: 1120 },
    { n: 29, word: '۲۹', say: 'bist-o-noh', clip: 'public/audio/bist-o-noh.mp3', ms: 760 },
    { n: 30, word: '۳۰', say: 'si', clip: 'public/audio/si.mp3', ms: 760 },
    { n: 31, word: '۳۱', say: 'si-o-yek', clip: 'public/audio/si-o-yek.mp3', ms: 1180 },
    { n: 32, word: '۳۲', say: 'si-o-do', clip: 'public/audio/si-o-do.mp3', ms: 760 },
    { n: 33, word: '۳۳', say: 'si-o-se', clip: 'public/audio/si-o-se.mp3', ms: 890 },
    { n: 34, word: '۳۴', say: 'si-o-chahar', clip: 'public/audio/si-o-chahar.mp3', ms: 1070 },
    { n: 35, word: '۳۵', say: 'si-o-panj', clip: 'public/audio/si-o-panj.mp3', ms: 1150 },
    { n: 36, word: '۳۶', say: 'si-o-shesh', clip: 'public/audio/si-o-shesh.mp3', ms: 1100 },
    { n: 37, word: '۳۷', say: 'si-o-haft', clip: 'public/audio/si-o-haft.mp3', ms: 1020 },
    { n: 38, word: '۳۸', say: 'si-o-hasht', clip: 'public/audio/si-o-hasht.mp3', ms: 970 },
    { n: 39, word: '۳۹', say: 'si-o-noh', clip: 'public/audio/si-o-noh.mp3', ms: 940 },
    { n: 40, word: '۴۰', say: 'chehel', clip: 'public/audio/chehel.mp3', ms: 760 },
    { n: 41, word: '۴۱', say: 'chehel-o-yek', clip: 'public/audio/chehel-o-yek.mp3', ms: 1200 },
    { n: 42, word: '۴۲', say: 'chehel-o-do', clip: 'public/audio/chehel-o-do.mp3', ms: 990 },
    { n: 43, word: '۴۳', say: 'chehel-o-se', clip: 'public/audio/chehel-o-se.mp3', ms: 1100 },
    { n: 44, word: '۴۴', say: 'chehel-o-chahar', clip: 'public/audio/chehel-o-chahar.mp3', ms: 1040 },
    { n: 45, word: '۴۵', say: 'chehel-o-panj', clip: 'public/audio/chehel-o-panj.mp3', ms: 1250 },
    { n: 46, word: '۴۶', say: 'chehel-o-shesh', clip: 'public/audio/chehel-o-shesh.mp3', ms: 1100 },
    { n: 47, word: '۴۷', say: 'chehel-o-haft', clip: 'public/audio/chehel-o-haft.mp3', ms: 1040 },
    { n: 48, word: '۴۸', say: 'chehel-o-hasht', clip: 'public/audio/chehel-o-hasht.mp3', ms: 1200 },
    { n: 49, word: '۴۹', say: 'chehel-o-noh', clip: 'public/audio/chehel-o-noh.mp3', ms: 1070 },
    { n: 50, word: '۵۰', say: 'panjah', clip: 'public/audio/panjah.mp3', ms: 760 },
  ],
  weather: {
    rain: { word: 'باران', say: 'baran', clip: 'public/audio/baran.mp3', ms: 760 },
    stars: { word: 'ستاره', say: 'setare', clip: 'public/audio/setare.mp3', ms: 1120 },
    petals: { word: 'گل', say: 'gol', clip: 'public/audio/gol.mp3', ms: 760 },
    moon: { word: 'ماه', say: 'mah', clip: 'public/audio/mah.mp3', ms: 760 },
    dawn: { word: 'آسمان', say: 'aseman', clip: 'public/audio/aseman.mp3', ms: 760 },
    sunrise: { word: 'خورشید', say: 'khorshid', clip: 'public/audio/khorshid.mp3', ms: 890 },
    rainbow: { word: 'رنگین‌کمان', say: 'rangin-kaman', clip: 'public/audio/rangin-kaman.mp3', ms: 1230 },
  },
  hud: { wave: 'موج', score: 'امتیاز', bombs: 'بمب', lives: 'جان', combo: 'پیاپی' },
  digits: '۰۱۲۳۴۵۶۷۸۹',
  group: '٬',
  letterColours: ['#ffd23a', '#3affc8', '#ff5ad8', '#7aa8ff', '#ff8a3a'],
};
