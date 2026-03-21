const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url:        { type: String, required: true },
  public_id:  { type: String, required: true },
  order:      { type: Number, default: 0 }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  staff_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  category:          { type: String, enum: ['research', 'event', 'achievement', 'general'], required: true },
  title:             { type: String, required: true, trim: true, maxlength: 300 },
  content:           { type: String, required: true, trim: true },
  photos:            { type: [photoSchema], validate: [arr => arr.length <= 4, 'Max 4 photos allowed'] },
  status:            { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejection_comment: { type: String, default: '' },
  volume_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'NewsletterVolume', default: null },
  reviewed_at:       { type: Date, default: null }
}, { timestamps: true });

// Index for common queries
submissionSchema.index({ status: 1 });
submissionSchema.index({ department_id: 1 });
submissionSchema.index({ volume_id: 1 });
submissionSchema.index({ staff_id: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
