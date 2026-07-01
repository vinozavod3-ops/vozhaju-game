const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/authMiddleware');

router.post('/sync', auth, gameController.syncProgress);
router.get('/levels', gameController.getLevels);
router.get('/words', gameController.getWords);
router.get('/leaderboard', auth, gameController.getLeaderboard);

module.exports = router;
