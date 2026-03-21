const mongoose = require('mongoose');

const newsletterVolumeSchema = new mongoose.Schema({
  volume_no:         { type: Number, required: true },
  issue_no:          { type: Number, required: true },
  period_label:      { type: String, required: true, trim: true },
  status:            { type: String, enum: ['draft', 'published'], default: 'draft' },
  submission_ids:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
  principal_message: { type: String, default: '' },
  published_at:      { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('NewsletterVolume', newsletterVolumeSchema);
