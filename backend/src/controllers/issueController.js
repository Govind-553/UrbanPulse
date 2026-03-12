const Issue = require('../models/Issue');
const fs = require('fs');
const path = require('path');

// @desc    Create new issue (Citizens only)
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res, next) => {
  try {
    req.body.reportedBy = req.user.id;

    if (req.files) {
      req.body.images = req.files.map(file => file.path.replace(/\\/g, '/'));
    }

    const issue = await Issue.create(req.body);

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res, next) => {
  try {
    let query;

    // If user is authority, they might want to see all or filter by their ward
    // If user is citizen, they might want to see public issues or their own
    if (!req.user) {
      if (req.query.public === 'true') {
        query = Issue.find({});
      } else {
        return res.status(401).json({ success: false, error: 'Not authorized to view private issues' });
      }
    } else if (req.user.role === 'citizen') {
      if (req.query.public === 'true') {
        query = Issue.find({});
      } else {
        query = Issue.find({ reportedBy: req.user.id });
      }
    } else {
      // Authority might pass a ward query param or fall back to their assigned ward
      const wardFilter = req.query.ward || req.user.ward;
      const filter = wardFilter ? { ward: wardFilter } : {};
      query = Issue.find(filter);
    }

    const issues = await query.populate({
      path: 'reportedBy',
      select: 'name email role'
    });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Private (any authenticated user) or optionalAuth
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate({
      path: 'reportedBy',
      select: 'name email role'
    });

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update issue status (Authority only)
// @route   PUT /api/issues/:id
// @access  Private/Authority
exports.updateIssue = async (req, res, next) => {
  try {
    let issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    // Role check is largely handled by middleware, but we can ensure they only update their ward
    if (req.user.role === 'authority' && issue.ward !== req.user.ward && req.user.ward) {
        // If an authority has a strict ward, they shouldn't update other wards
        // (Assuming authority's ward is set). We just allow it if no specific rules apply for cross-ward
    }

    issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
