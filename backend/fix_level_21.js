require('dotenv').config();
const mongoose = require('mongoose');
const Level = require('./models/Level');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const level = await Level.findOne({ id: 21, type: 'story' });
    if (level) {
      // Find the first occurrence of "ЗАМИН" and replace it with "ОФТОБ"
      const words = [...level.words];
      const index = words.indexOf('ЗАМИН');
      if (index !== -1) {
          words[index] = 'ОФТОБ';
          level.words = words;
          await level.save();
          console.log('Level 21 fixed successfully in database.');
      } else {
          console.log('ЗАМИН not found in level 21.');
      }
    } else {
      console.log('Level 21 not found.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
