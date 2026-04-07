const mongoose = require('mongoose');

const quizQuestionSnapshotSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      default: '',
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [
        {
          key: { type: String, required: true, trim: true, lowercase: true },
          text: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    selectedOptionKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    correctOptionKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    jobOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOffer',
      required: true,
      index: true,
    },
    domain: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      index: true,
    },
    level: {
      type: String,
      enum: ['junior', 'intermediate', 'senior'],
      default: 'junior',
      index: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    scorePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    questions: {
      type: [quizQuestionSnapshotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
