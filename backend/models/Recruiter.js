const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema(
  {
    banned:    { type: Boolean, default: false },
    banReason: { type: String, default: '' },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    companySize: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'pro'],
      default: 'starter',
    },
    profileImage: {
      type: String,
      default: '',
      trim: true,
    },
    language: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr',
    },
    timezone: {
      type: String,
      default: 'Africa/Tunis',
      trim: true,
    },
    dateFormat: {
      type: String,
      enum: ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'],
      default: 'dd/mm/yyyy',
    },
    notifyNewCandidate: {
      type: Boolean,
      default: true,
    },
    notifyInterviewReminder: {
      type: Boolean,
      default: true,
    },
    notifyWeeklyReport: {
      type: Boolean,
      default: false,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recruiter', recruiterSchema);
