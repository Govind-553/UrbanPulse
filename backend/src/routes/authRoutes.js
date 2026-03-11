const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// The getMe route needs the protect middleware, which will be implemented next
router.get('/me', protect, getMe);

module.exports = router;
