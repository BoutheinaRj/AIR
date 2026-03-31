const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: true,
      index: true,
    },
    jobOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOffer',
      required: false,
      index: true,
    },
    candidateName: {
      type: String,
      default: '',
    },
    candidateEmail: {
      type: String,
      default: '',
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['Visio', 'Présentiel'],
      default: 'Visio',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Planifie',
    },
  },
  { timestamps: true }
);

InterviewSchema.index({ candidateId: 1, scheduledAt: -1 });
InterviewSchema.index({ recruiterId: 1, scheduledAt: -1 });

module.exports = mongoose.model('Interview', InterviewSchema);
