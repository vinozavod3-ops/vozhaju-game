const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  words: [{
    type: String
  }],
  type: {
    type: String,
    enum: ['story', 'challenge'],
    default: 'story'
  }
});

module.exports = mongoose.model('Level', LevelSchema);
