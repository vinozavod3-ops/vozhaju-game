const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Хеле зиёд дархост фиристода шуд, лутфан каме пас кӯшиш кунед'
});
app.use('/api', limiter);

app.use(cors());
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Пайвастшавӣ ба MongoDB муваффақона анҷом ёфт'))
  .catch(err => console.error('❌ Хатогӣ ҳангоми пайвастшавӣ ба MongoDB:', err));

// Routes
app.get('/api/seed', async (req, res) => {
    try {
        const Level = require('./models/Level');
        const Word = require('./models/Word');
        const fs = require('fs');
        const { STORY_LEVELS, CHALLENGE_LEVELS } = require('./tempData.js');
        
        await Level.deleteMany({});
        await Word.deleteMany({});
        
        const wordsData = JSON.parse(fs.readFileSync('words_export.json', 'utf-8'));
        await Word.insertMany(wordsData);
        
        const storyLevels = STORY_LEVELS.map(l => ({ ...l, type: 'story' }));
        const challengeLevels = CHALLENGE_LEVELS.map(l => ({ ...l, type: 'challenge' }));
        await Level.insertMany([...storyLevels, ...challengeLevels]);
        
        res.json({ message: 'Seeded successfully! Words: ' + wordsData.length + ', Levels: ' + (storyLevels.length + challengeLevels.length) });
    } catch(err) {
        res.status(500).json({ error: err.toString() });
    }
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Сервер дар порти ${PORT} ба кор даромад`);
});

module.exports = app;
