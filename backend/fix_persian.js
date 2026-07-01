const fs = require('fs');

const path = 'words_export.json';
let words = JSON.parse(fs.readFileSync(path, 'utf8'));

let updatedCount = 0;

words.forEach(w => {
  const originalPersian = w.persian;

  // Fix specific words based on the user's Cyrillic changes
  if (w.word === 'МЕҲР') w.persian = 'مهر';
  if (w.word === 'САВОР') w.persian = 'سوار';
  if (w.word === 'ЧАРХ') w.persian = 'چرخ';
  if (w.word === 'МИЖГОН') w.persian = 'مژگان';
  if (w.word === 'ЧАККУШ') w.persian = 'چکش';
  
  // Just in case check for other words that might need a tweak
  if (w.word === 'РӮЙ') w.persian = 'روی';
  if (w.word === 'ДЕВ') w.persian = 'دیو';
  if (w.word === 'НАЙЗА') w.persian = 'نیزه';
  if (w.word === 'ГАРДОБ') w.persian = 'گرداب';
  if (w.word === 'МУШ') w.persian = 'موش';
  if (w.word === 'ХУРӮС') w.persian = 'خروس';
  if (w.word === 'ГУЛӮ') w.persian = 'گلو';
  if (w.word === 'ТОЗА') w.persian = 'تازه';
  if (w.word === 'ГУРУСНА') w.persian = 'گرسنه';
  if (w.word === 'САБӮ') w.persian = 'سبو';
  if (w.word === 'ЧАРОҒ') w.persian = 'چراغ';
  if (w.word === 'ПУТК') w.persian = 'پتک';
  if (w.word === 'ЗИМИСТОН') w.persian = 'زمستان';
  if (w.word === 'СУДМАНД') w.persian = 'سودمند';
  if (w.word === 'ДОРУ') w.persian = 'دارو';
  if (w.word === 'ХӮРОК') w.persian = 'خوراک';
  if (w.word === 'ФУРУД') w.persian = 'فرود';
  if (w.word === 'ОВОРА') w.persian = 'آواره';

  if (w.persian !== originalPersian) {
    console.log(`Ислоҳ шуд: ${w.word} (${originalPersian} -> ${w.persian})`);
    updatedCount++;
  }
});

fs.writeFileSync(path, JSON.stringify(words, null, 2), 'utf8');
console.log(`Ҳамагӣ ${updatedCount} калимаи форсӣ ислоҳ шуд.`);
