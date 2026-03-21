const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name:          { type: String, required: true, unique: true, trim: true },
  type:          { type: String, enum: ['aided', 'unaided', 'forum'], required: true },
  display_order: { type: Number, default: 0 },
  is_active:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
