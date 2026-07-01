const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { z } = require('zod');

const authSchema = z.object({
  username: z.string().min(3, 'Номи корбар бояд аз 3 ҳарф зиёд бошад').max(30, 'Номи корбар хеле дароз аст'),
  password: z.string().min(6, 'Рамз бояд камаш 6 аломат бошад')
});

exports.register = async (req, res, next) => {
  try {
    const parsedData = authSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: parsedData.error.issues[0].message });
    }
    const { username, password } = parsedData.data;
    
    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Ин номи корбар аллакай вуҷуд дорад' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    user = new User({
      username,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ token, user: { id: user.id, username: user.username, coins: user.coins, score: user.score } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const parsedData = authSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: parsedData.error.issues[0].message });
    }
    const { username, password } = parsedData.data;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Номи корбар ё парол нодуруст аст' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Номи корбар ё парол нодуруст аст' });
    }
    
    // Create token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        coins: user.coins,
        freeHints: user.freeHints,
        completedStoryLevels: user.completedStoryLevels,
        completedStoryLevelsFa: user.completedStoryLevelsFa,
        dictionary: user.dictionary,
        score: user.score
      } 
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};
