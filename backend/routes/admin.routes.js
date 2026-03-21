const express = require('express');
const User = require('../models/User');
const Department = require('../models/Department');
const CollegeInfo = require('../models/CollegeInfo');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../utils/upload');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// ── COLLEGE INFO ──────────────────────────────────────────────
// GET /api/admin/college-info
router.get('/college-info', async (req, res) => {
  try {
    let info = await CollegeInfo.findOne();
    if (!info) info = await CollegeInfo.create({});
    return successResponse(res, info);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PUT /api/admin/college-info — update text fields
router.put('/college-info', auth, requireRole('principal'), async (req, res) => {
  try {
    const fields = ['college_name','principal_name','accreditation','address','email','phone','website','established_year','vision','mission','editorial_board'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    let info = await CollegeInfo.findOneAndUpdate({}, update, { new: true, upsert: true });
    return successResponse(res, info, 'College info updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// POST /api/admin/college-info/logo — upload college logo
router.post('/college-info/logo', auth, requireRole('principal'), upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded');
    let info = await CollegeInfo.findOne();
    if (info?.logo_public_id) await deleteFromCloudinary(info.logo_public_id);
    const result = await uploadToCloudinary(req.file.buffer, 'gasc_newsletter/college');
    info = await CollegeInfo.findOneAndUpdate({}, { logo_url: result.url, logo_public_id: result.public_id }, { new: true, upsert: true });
    return successResponse(res, info, 'Logo updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// POST /api/admin/college-info/principal-photo
router.post('/college-info/principal-photo', auth, requireRole('principal'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded');
    let info = await CollegeInfo.findOne();
    if (info?.principal_photo_public_id) await deleteFromCloudinary(info.principal_photo_public_id);
    const result = await uploadToCloudinary(req.file.buffer, 'gasc_newsletter/college');
    info = await CollegeInfo.findOneAndUpdate({}, { principal_photo_url: result.url, principal_photo_public_id: result.public_id }, { new: true, upsert: true });
    return successResponse(res, info, 'Principal photo updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ── DEPARTMENTS ───────────────────────────────────────────────
// GET /api/admin/departments
router.get('/departments', async (req, res) => {
  try {
    const depts = await Department.find().sort({ type: 1, display_order: 1 });
    return successResponse(res, depts);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// POST /api/admin/departments
router.post('/departments', auth, requireRole('principal'), async (req, res) => {
  try {
    const { name, type, display_order } = req.body;
    if (!name || !type) return errorResponse(res, 'Name and type are required');
    const dept = await Department.create({ name, type, display_order: display_order || 0 });
    return successResponse(res, dept, 'Department created', 201);
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 'Department name already exists');
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/admin/departments/:id
router.patch('/departments/:id', auth, requireRole('principal'), async (req, res) => {
  try {
    const { name, type, display_order, is_active } = req.body;
    const dept = await Department.findByIdAndUpdate(req.params.id, { name, type, display_order, is_active }, { new: true });
    if (!dept) return errorResponse(res, 'Department not found', 404);
    return successResponse(res, dept, 'Department updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ── USERS ────────────────────────────────────────────────────
// GET /api/admin/users
router.get('/users', auth, requireRole('principal'), async (req, res) => {
  try {
    const users = await User.find().populate('department_id', 'name type').sort({ createdAt: -1 });
    return successResponse(res, users);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// POST /api/admin/users — Create staff account
router.post('/users', auth, requireRole('principal'), async (req, res) => {
  try {
    const { name, email, password, role, department_id, designation } = req.body;
    if (!name || !email || !password) return errorResponse(res, 'Name, email, and password required');

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return errorResponse(res, 'Email already registered');

    const user = await User.create({ name, email, password, role: role || 'staff', department_id: department_id || null, designation: designation || '' });
    await user.populate('department_id', 'name type');
    return successResponse(res, user, 'User created', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', auth, requireRole('principal'), async (req, res) => {
  try {
    const { name, department_id, designation, is_active, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    if (name) user.name = name;
    if (department_id !== undefined) user.department_id = department_id || null;
    if (designation !== undefined) user.designation = designation;
    if (is_active !== undefined) user.is_active = is_active;
    if (password && password.length >= 6) user.password = password; // triggers pre-save hash

    await user.save();
    await user.populate('department_id', 'name type');
    return successResponse(res, user, 'User updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, requireRole('principal'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return errorResponse(res, 'Cannot delete your own account');
    await User.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'User deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
