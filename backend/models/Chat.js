const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const chatSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['assistant', 'offerHelp'],
      required: true,
      index: true,
    },
    jobOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOffer',
      default: null,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ candidateId: 1, type: 1, updatedAt: -1 });
chatSchema.index({ candidateId: 1, type: 1, jobOfferId: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
