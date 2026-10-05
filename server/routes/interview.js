const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const auth = require('../middleware/auth');

// @route   POST api/interview/start
// @desc    Start a new interview
// @access  Private
router.post('/start', auth, interviewController.startInterview);

// @route   GET api/interview/question/:interviewId
// @desc    Get the next question for an interview
// @access  Private
router.get('/question/:interviewId', auth, interviewController.getQuestion);

// @route   POST api/interview/answer
// @desc    Submit an answer for a question
// @access  Private
router.post('/answer', auth, interviewController.submitAnswer);

// @route   PUT api/interview/complete/:interviewId
// @desc    Complete an interview
// @access  Private
router.put('/complete/:interviewId', auth, interviewController.completeInterview);

// @route   GET api/interview/report/:interviewId
// @desc    Get interview report
// @access  Private
router.get('/report/:interviewId', auth, interviewController.getReport);

module.exports = router;