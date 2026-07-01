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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Сервер дар порти ${PORT} ба кор даромад`);
});

module.exports = app;
