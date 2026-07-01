const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 150
  },
  freeHints: {
    type: Number,
    default: 3
  },
  completedStoryLevels: [{
    levelId: { type: Number, required: true },
    stars: { type: Number, default: 0 },
    timeSeconds: { type: Number, default: 0 }
  }],
  completedStoryLevelsFa: [{
    levelId: { type: Number, required: true },
    stars: { type: Number, default: 0 },
    timeSeconds: { type: Number, default: 0 }
  }],
  dictionary: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
