const fs = require('fs');

const path = 'words_export.json';
let words = JSON.parse(fs.readFileSync(path, 'utf8'));

let uniqueWords = [];
let seen = new Set();

words.forEach(w => {
  if (!seen.has(w.word)) {
    seen.add(w.word);
    uniqueWords.push(w);
  } else {
    console.log('Калимаи такрорӣ ёфт ва тоза шуд: ' + w.word);
  }
});

fs.writeFileSync(path, JSON.stringify(uniqueWords, null, 2), 'utf8');
console.log(`Ҳамагӣ ${uniqueWords.length} калимаи бетакрор сабт шуд.`);
