const express = require('express');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../utils/upload');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// POST /api/submissions — Staff creates submission with up to 4 photos
router.post('/', auth, requireRole('staff'), upload.array('photos', 4), async (req, res) => {
  try {
    const { category, title, content } = req.body;
    if (!category || !title || !content) return errorResponse(res, 'Category, title, and content are required');
    if (!req.user.department_id) return errorResponse(res, 'Your account has no department assigned. Contact admin.');

    // Upload photos to Cloudinary
    const photos = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i].buffer, 'gasc_newsletter/submissions');
        photos.push({ url: result.url, public_id: result.public_id, order: i });
      }
    }

    const submission = await Submission.create({
      staff_id: req.user._id,
      department_id: req.user.department_id._id || req.user.department_id,
      category,
      title,
      content,
      photos
    });

    await submission.populate(['staff_id', 'department_id']);
    return successResponse(res, submission, 'Submission created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/submissions/mine — Staff views own submissions
router.get('/mine', auth, requireRole('staff'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { staff_id: req.user._id };
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .populate('department_id', 'name type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(filter);
    return successResponse(res, { submissions, total, page: parseInt(page) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/submissions/:id — View single submission
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('staff_id', 'name email designation')
      .populate('department_id', 'name type');

    if (!submission) return errorResponse(res, 'Submission not found', 404);

    // Staff can only view their own
    if (req.user.role === 'staff' && submission.staff_id._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Forbidden', 403);
    }
    return successResponse(res, submission);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/submissions/:id — Staff edits own pending submission
router.patch('/:id', auth, requireRole('staff'), upload.array('photos', 4), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return errorResponse(res, 'Submission not found', 404);
    if (submission.staff_id.toString() !== req.user._id.toString()) return errorResponse(res, 'Forbidden', 403);
    if (submission.status !== 'pending') return errorResponse(res, 'Only pending submissions can be edited');

    const { category, title, content } = req.body;
    if (category) submission.category = category;
    if (title) submission.title = title;
    if (content) submission.content = content;

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      // Delete old photos from Cloudinary
      for (const photo of submission.photos) {
        await deleteFromCloudinary(photo.public_id);
      }
      submission.photos = [];
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i].buffer, 'gasc_newsletter/submissions');
        submission.photos.push({ url: result.url, public_id: result.public_id, order: i });
      }
    }

    await submission.save();
    return successResponse(res, submission, 'Submission updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// DELETE /api/submissions/:id — Staff deletes own pending submission
router.delete('/:id', auth, requireRole('staff'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return errorResponse(res, 'Submission not found', 404);
    if (submission.staff_id.toString() !== req.user._id.toString()) return errorResponse(res, 'Forbidden', 403);
    if (submission.status !== 'pending') return errorResponse(res, 'Only pending submissions can be deleted');

    for (const photo of submission.photos) {
      await deleteFromCloudinary(photo.public_id);
    }
    await submission.deleteOne();
    return successResponse(res, null, 'Submission deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
