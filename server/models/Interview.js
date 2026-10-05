const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // in seconds
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    category: {
      type: String, // technical, hr, project, behavioral
      required: true,
    },
    difficulty: {
      type: String, // easy, medium, hard
      required: true,
    },
    studentAnswer: {
      type: String,
    },
    answerScore: {
      type: Number, // 0-10
    },
    feedback: {
      type: String,
    },
    duration: {
      type: Number, // in seconds
    },
  }],
  overallScore: {
    type: Number,
  },
  categoryScores: {
    technical: Number,
    hr: Number,
    project: Number,
    behavioral: Number,
  },
  integrityEvents: [{
    type: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  finalFeedback: {
    type: String,
  },
});

module.exports = mongoose.model('Interview', interviewSchema);