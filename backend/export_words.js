require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Word = require('./models/Word');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vozhaju')
  .then(async () => {
    console.log('Павастшавӣ ба базаи маълумот...');
    const words = await Word.find().select('-_id word persian meaning').lean();
    
    fs.writeFileSync('words_export.json', JSON.stringify(words, null, 2), 'utf-8');
    console.log(`✅ Бо муваффақият ${words.length} вожа ба файли 'words_export.json' сабт шуд!`);
    console.log('Шумо метавонед ин файлро кушоед, хатогиҳоро ислоҳ кунед ва сипас скрипти import_words.js -ро иҷро кунед.');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
