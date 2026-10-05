const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// @route   POST api/resume/upload
// @desc    Upload resume
// @access  Private
router.post('/upload', auth, upload.single('resume'), resumeController.uploadResume);

// @route   GET api/resume
// @desc    Get user's resume
// @access  Private
router.get('/', auth, resumeController.getResume);

module.exports = router;