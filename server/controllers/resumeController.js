const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Upload resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;
    let extractedText = '';

    // Extract text based on file type
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ msg: 'Unsupported file format' });
    }

    // Create new resume record
    const resume = new Resume({
      userId: req.user.id,
      fileName: originalname,
      fileType: mimetype,
      extractedText: extractedText,
    });

    await resume.save();

    res.status(201).json({
      msg: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user's resume
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};