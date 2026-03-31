const mongoose = require('mongoose');

const candidateSessionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    endedAt: {
      type: Date,
      default: null,
      index: true,
    },
    ip: {
      type: String,
      trim: true,
      default: '',
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

candidateSessionSchema.index({ candidateId: 1, startedAt: -1 });

module.exports = mongoose.model('CandidateSession', candidateSessionSchema);
