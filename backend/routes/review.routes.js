const express = require('express');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// GET /api/review/pending — all pending submissions
router.get('/pending', auth, requireRole('principal'), async (req, res) => {
  try {
    const { dept, page = 1, limit = 20 } = req.query;
    const filter = { status: 'pending' };
    if (dept) filter.department_id = dept;

    const submissions = await Submission.find(filter)
      .populate('staff_id', 'name email designation')
      .populate('department_id', 'name type display_order')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(filter);
    return successResponse(res, { submissions, total });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/review/approved — approved submissions not yet in any volume
router.get('/approved', auth, requireRole('principal'), async (req, res) => {
  try {
    const { dept } = req.query;
    const filter = { status: 'approved', volume_id: null };
    if (dept) filter.department_id = dept;

    const submissions = await Submission.find(filter)
      .populate('staff_id', 'name email designation')
      .populate('department_id', 'name type display_order')
      .sort({ createdAt: -1 });

    return successResponse(res, { submissions });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/review/all — all submissions with filter
router.get('/all', auth, requireRole('principal'), async (req, res) => {
  try {
    const { status, dept, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (dept) filter.department_id = dept;

    const submissions = await Submission.find(filter)
      .populate('staff_id', 'name email designation')
      .populate('department_id', 'name type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(filter);
    return successResponse(res, { submissions, total });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/review/:id/approve
router.patch('/:id/approve', auth, requireRole('principal'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('staff_id', 'name email')
      .populate('department_id', 'name');

    if (!submission) return errorResponse(res, 'Submission not found', 404);
    if (submission.status !== 'pending') return errorResponse(res, 'Only pending submissions can be approved');

    submission.status = 'approved';
    submission.reviewed_at = new Date();
    submission.rejection_comment = '';
    await submission.save();

    return successResponse(res, submission, 'Submission approved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/review/:id/reject
router.patch('/:id/reject', auth, requireRole('principal'), async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) return errorResponse(res, 'Rejection comment is required');

    const submission = await Submission.findById(req.params.id)
      .populate('staff_id', 'name email')
      .populate('department_id', 'name');

    if (!submission) return errorResponse(res, 'Submission not found', 404);
    if (submission.status !== 'pending') return errorResponse(res, 'Only pending submissions can be rejected');

    submission.status = 'rejected';
    submission.rejection_comment = comment.trim();
    submission.reviewed_at = new Date();
    await submission.save();

    return successResponse(res, submission, 'Submission rejected');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/review/stats — dashboard stats for principal
router.get('/stats', auth, requireRole('principal'), async (req, res) => {
  try {
    const [pending, approved, rejected, inVolume] = await Promise.all([
      Submission.countDocuments({ status: 'pending' }),
      Submission.countDocuments({ status: 'approved', volume_id: null }),
      Submission.countDocuments({ status: 'rejected' }),
      Submission.countDocuments({ status: 'approved', volume_id: { $ne: null } })
    ]);
    return successResponse(res, { pending, approved, rejected, inVolume });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
