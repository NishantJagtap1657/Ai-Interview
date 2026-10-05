const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a new user
exports.register = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        msg: 'Database Connection Error: MongoDB is not connected. Please start MongoDB locally or update MONGODB_URI in server/.env' 
      });
    }

    const { name, email, password, education, college, branch, graduationYear, targetRole, experienceLevel, skills, introduction } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      education,
      college,
      branch,
      graduationYear,
      targetRole,
      experienceLevel,
      skills,
      introduction,
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    const jwtSecret = process.env.JWT_SECRET || 'default_secret_fallback';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message || String(err) || 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        msg: 'Database Connection Error: MongoDB is not connected. Please start MongoDB locally or update MONGODB_URI in server/.env' 
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    const jwtSecret = process.env.JWT_SECRET || 'default_secret_fallback';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { education, college, branch, graduationYear, targetRole, experienceLevel, skills, introduction } = req.body;

    // Build user object
    const userFields = {};
    if (education) userFields.education = education;
    if (college) userFields.college = college;
    if (branch) userFields.branch = branch;
    if (graduationYear) userFields.graduationYear = graduationYear;
    if (targetRole) userFields.targetRole = targetRole;
    if (experienceLevel) userFields.experienceLevel = experienceLevel;
    if (skills) userFields.skills = skills;
    if (introduction) userFields.introduction = introduction;

    // Update user
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};