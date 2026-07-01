const mongoose = require('mongoose');
require('dotenv').config();
const Level = require('./models/Level');
const Word = require('./models/Word');
const fs = require('fs');

// We need to read data.js, but since it's an ES module, we'll just require a temp JSON or parse it.
// For simplicity, let's just copy the data here or read it directly.
const { WORD_MEANINGS, STORY_LEVELS, CHALLENGE_LEVELS } = require('./tempData.js');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB. Seeding...');
    
    // Clear existing
    await Level.deleteMany({});
    await Word.deleteMany({});
    
    // Seed Words
    const wordDocs = Object.keys(WORD_MEANINGS).map(word => ({
      word,
      meaning: WORD_MEANINGS[word]
    }));
    await Word.insertMany(wordDocs);
    console.log(`✅ Seeded ${wordDocs.length} words`);
    
    // Seed Levels
    const storyLevels = STORY_LEVELS.map(l => ({ ...l, type: 'story' }));
    const challengeLevels = CHALLENGE_LEVELS.map(l => ({ ...l, type: 'challenge' }));
    await Level.insertMany([...storyLevels, ...challengeLevels]);
    console.log(`✅ Seeded ${storyLevels.length + challengeLevels.length} levels`);
    
    console.log('Seeding complete!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
