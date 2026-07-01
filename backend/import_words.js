require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Word = require('./models/Word');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vozhaju')
  .then(async () => {
    console.log('Павастшавӣ ба базаи маълумот...');
    
    if (!fs.existsSync('words_export.json')) {
      console.error('Файли words_export.json ёфт нашуд!');
      process.exit(1);
    }

    const wordsData = JSON.parse(fs.readFileSync('words_export.json', 'utf-8'));
    console.log(`Дар файл ${wordsData.length} вожа мавҷуд аст. Дар ҳоли навсозӣ...`);

    // Мо тамоми базаро тоза карда аз нав вожаҳои ислоҳшударо мегузорем
    await Word.deleteMany({});
    await Word.insertMany(wordsData);

    console.log('✅ Базаи маълумот бо муваффақият навсозӣ шуд!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
