const express = require('express');
const { createIssue, getIssues, updateIssue } = require('../controllers/issueController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('citizen'), upload.array('images', 5), createIssue)
  .get(protect, getIssues);

router.route('/:id')
  .put(protect, authorize('authority'), updateIssue);

module.exports = router;
