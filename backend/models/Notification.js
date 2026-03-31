const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: false,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: false,
      index: true,
    },
    jobOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOffer',
      required: false,
      index: true,
    },
    type: {
      type: String,
      required: true,
      default: 'interview_scheduled',
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    meetingAt: {
      type: Date,
      required: false,
    },
    mode: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ candidateId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
