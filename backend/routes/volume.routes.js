const express = require('express');
const NewsletterVolume = require('../models/NewsletterVolume');
const Submission = require('../models/Submission');
const Department = require('../models/Department');
const CollegeInfo = require('../models/CollegeInfo');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// POST /api/volumes — Create new volume
router.post('/', auth, requireRole('principal'), async (req, res) => {
  try {
    const { volume_no, issue_no, period_label, principal_message } = req.body;
    if (!volume_no || !issue_no || !period_label) return errorResponse(res, 'volume_no, issue_no, and period_label are required');

    const exists = await NewsletterVolume.findOne({ volume_no, issue_no });
    if (exists) return errorResponse(res, `Volume ${volume_no}, Issue ${issue_no} already exists`);

    const volume = await NewsletterVolume.create({ volume_no, issue_no, period_label, principal_message: principal_message || '' });
    return successResponse(res, volume, 'Volume created', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/volumes — List all volumes
router.get('/', async (req, res) => {
  try {
    const volumes = await NewsletterVolume.find().sort({ volume_no: -1, issue_no: -1 });
    return successResponse(res, volumes);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/volumes/:id — Full volume with submissions
router.get('/:id', async (req, res) => {
  try {
    const volume = await NewsletterVolume.findById(req.params.id);
    if (!volume) return errorResponse(res, 'Volume not found', 404);

    const submissions = await Submission.find({ _id: { $in: volume.submission_ids } })
      .populate('staff_id', 'name designation')
      .populate('department_id', 'name type display_order')
      .lean();

    // Sort by department display_order and type (aided → unaided → forum)
    const typeOrder = { aided: 1, unaided: 2, forum: 3 };
    submissions.sort((a, b) => {
      const ta = typeOrder[a.department_id?.type] || 4;
      const tb = typeOrder[b.department_id?.type] || 4;
      if (ta !== tb) return ta - tb;
      return (a.department_id?.display_order || 0) - (b.department_id?.display_order || 0);
    });

    // Group by department
    const grouped = {};
    for (const sub of submissions) {
      const deptId = sub.department_id?._id?.toString() || 'unknown';
      if (!grouped[deptId]) {
        grouped[deptId] = {
          department: sub.department_id,
          submissions: []
        };
      }
      grouped[deptId].submissions.push(sub);
    }

    return successResponse(res, { volume, grouped: Object.values(grouped) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/volumes/:id/add — Add approved submissions to volume
router.patch('/:id/add', auth, requireRole('principal'), async (req, res) => {
  try {
    const { submission_ids } = req.body;
    if (!submission_ids || !Array.isArray(submission_ids) || submission_ids.length === 0) {
      return errorResponse(res, 'submission_ids array is required');
    }

    const volume = await NewsletterVolume.findById(req.params.id);
    if (!volume) return errorResponse(res, 'Volume not found', 404);
    if (volume.status === 'published') return errorResponse(res, 'Cannot modify a published volume');

    // Validate all are approved and not in another volume
    const subs = await Submission.find({ _id: { $in: submission_ids }, status: 'approved' });
    if (subs.length !== submission_ids.length) return errorResponse(res, 'Some submissions are not approved or not found');

    const alreadyInVolume = subs.filter(s => s.volume_id && s.volume_id.toString() !== req.params.id);
    if (alreadyInVolume.length > 0) return errorResponse(res, 'Some submissions are already in another volume');

    // Add to volume (avoid duplicates)
    const existingIds = volume.submission_ids.map(id => id.toString());
    const newIds = submission_ids.filter(id => !existingIds.includes(id));
    volume.submission_ids.push(...newIds);
    await volume.save();

    // Update submissions with volume_id
    await Submission.updateMany({ _id: { $in: newIds } }, { volume_id: volume._id });

    return successResponse(res, volume, `${newIds.length} submission(s) added to volume`);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/volumes/:id/remove — Remove submission from volume
router.patch('/:id/remove', auth, requireRole('principal'), async (req, res) => {
  try {
    const { submission_id } = req.body;
    if (!submission_id) return errorResponse(res, 'submission_id is required');

    const volume = await NewsletterVolume.findById(req.params.id);
    if (!volume) return errorResponse(res, 'Volume not found', 404);
    if (volume.status === 'published') return errorResponse(res, 'Cannot modify a published volume');

    volume.submission_ids = volume.submission_ids.filter(id => id.toString() !== submission_id);
    await volume.save();

    await Submission.findByIdAndUpdate(submission_id, { volume_id: null });
    return successResponse(res, volume, 'Submission removed from volume');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/volumes/:id/message — Update principal message
router.patch('/:id/message', auth, requireRole('principal'), async (req, res) => {
  try {
    const { principal_message } = req.body;
    const volume = await NewsletterVolume.findByIdAndUpdate(
      req.params.id,
      { principal_message: principal_message || '' },
      { new: true }
    );
    if (!volume) return errorResponse(res, 'Volume not found', 404);
    return successResponse(res, volume, 'Message updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/volumes/:id/publish — Publish volume
router.patch('/:id/publish', auth, requireRole('principal'), async (req, res) => {
  try {
    const volume = await NewsletterVolume.findById(req.params.id);
    if (!volume) return errorResponse(res, 'Volume not found', 404);
    if (volume.status === 'published') return errorResponse(res, 'Volume is already published');
    if (volume.submission_ids.length === 0) return errorResponse(res, 'Cannot publish an empty volume');

    volume.status = 'published';
    volume.published_at = new Date();
    await volume.save();
    return successResponse(res, volume, 'Volume published successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/volumes/:id/unpublish — Revert to draft
router.patch('/:id/unpublish', auth, requireRole('principal'), async (req, res) => {
  try {
    const volume = await NewsletterVolume.findByIdAndUpdate(
      req.params.id,
      { status: 'draft', published_at: null },
      { new: true }
    );
    if (!volume) return errorResponse(res, 'Volume not found', 404);
    return successResponse(res, volume, 'Volume reverted to draft');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// GET /api/volumes/:id/render — Full render data for newsletter preview
router.get('/:id/render', async (req, res) => {
  try {
    const [volume, collegeInfo, departments] = await Promise.all([
      NewsletterVolume.findById(req.params.id),
      CollegeInfo.findOne(),
      Department.find({ is_active: true }).sort({ type: 1, display_order: 1 })
    ]);
    if (!volume) return errorResponse(res, 'Volume not found', 404);

    const submissions = await Submission.find({ _id: { $in: volume.submission_ids } })
      .populate('staff_id', 'name designation')
      .populate('department_id', 'name type display_order')
      .lean();

    const typeOrder = { aided: 1, unaided: 2, forum: 3 };
    submissions.sort((a, b) => {
      const ta = typeOrder[a.department_id?.type] || 4;
      const tb = typeOrder[b.department_id?.type] || 4;
      if (ta !== tb) return ta - tb;
      return (a.department_id?.display_order || 0) - (b.department_id?.display_order || 0);
    });

    const grouped = {};
    for (const sub of submissions) {
      const deptId = sub.department_id?._id?.toString() || 'unknown';
      if (!grouped[deptId]) {
        grouped[deptId] = { department: sub.department_id, submissions: [] };
      }
      grouped[deptId].submissions.push(sub);
    }

    return successResponse(res, {
      volume,
      collegeInfo,
      sections: Object.values(grouped)
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
