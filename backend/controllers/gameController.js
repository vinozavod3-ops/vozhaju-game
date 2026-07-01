const User = require('../models/User');
const Level = require('../models/Level');
const Word = require('../models/Word');

exports.syncProgress = async (req, res, next) => {
  try {
    const { coins, freeHints, completedStoryLevels, completedStoryLevelsFa, dictionary } = req.body;
    
    // Calculate Score dynamically
    const calcStars = (arr) => (arr || []).reduce((acc, curr) => acc + (curr.stars || 1), 0);
    const score = (calcStars(completedStoryLevels) + calcStars(completedStoryLevelsFa)) * 10;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { coins, freeHints, completedStoryLevels, completedStoryLevelsFa, dictionary, score } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getLevels = async (req, res, next) => {
  try {
    const levels = await Level.find().sort({ id: 1 });
    res.json(levels);
  } catch (err) {
    next(err);
  }
};

exports.getWords = async (req, res, next) => {
  try {
    const words = await Word.find();
    res.json(words);
  } catch (err) {
    next(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ score: -1 })
      .limit(50)
      .select('username score coins createdAt');
    res.json(users);
  } catch (err) {
    next(err);
  }
};
