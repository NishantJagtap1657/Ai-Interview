const Interview = require('../models/Interview');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Start interview
exports.startInterview = async (req, res) => {
  try {
    const { targetRole, interviewType, difficulty, numQuestions, duration } = req.body;

    // Get user profile and resume
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const resume = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found. Please upload a resume first.' });
    }

    // Create new interview record
    const interview = new Interview({
      userId: req.user.id,
      targetRole: targetRole || user.targetRole,
      startTime: new Date(),
    });

    await interview.save();

    res.status(201).json({
      msg: 'Interview started successfully',
      interviewId: interview._id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get interview questions (this will be called by frontend to get the next question)
exports.getQuestion = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Get interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ msg: 'Interview not found' });
    }

    // Check if interview belongs to user
    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // If no questions yet, generate the first question
    if (interview.questions.length === 0) {
      const firstQuestion = await generateFirstQuestion(interview, req.user);
      // Add question to interview
      interview.questions.push({
        question: firstQuestion.question,
        category: firstQuestion.category,
        difficulty: firstQuestion.difficulty,
      });
      await interview.save();
      return res.json({ question: firstQuestion });
    }

    // Get the last question that hasn't been answered
    const lastQuestionIndex = interview.questions.findIndex(q => !q.studentAnswer);
    if (lastQuestionIndex === -1) {
      // All questions answered, interview is complete
      return res.json({ msg: 'Interview completed', interviewId });
    }

    const lastQuestion = interview.questions[lastQuestionIndex];
    res.json({
      question: lastQuestion.question,
      category: lastQuestion.category,
      difficulty: lastQuestion.difficulty,
      questionIndex: lastQuestionIndex,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Submit answer
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer } = req.body;

    // Get interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ msg: 'Interview not found' });
    }

    // Check if interview belongs to user
    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Validate question index
    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ msg: 'Invalid question index' });
    }

    // Check if question already answered
    if (interview.questions[questionIndex].studentAnswer) {
      return res.status(400).json({ msg: 'Question already answered' });
    }

    // Update question with answer
    interview.questions[questionIndex].studentAnswer = answer;

    // Analyze the answer (simplified for now)
    const analysis = await analyzeAnswer(interview.questions[questionIndex], answer, interview, req.user);
    interview.questions[questionIndex].answerScore = analysis.score;
    interview.questions[questionIndex].feedback = analysis.feedback;

    // Save interview
    await interview.save();

    res.json({ msg: 'Answer submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Complete interview
exports.completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Get interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ msg: 'Interview not found' });
    }

    // Check if interview belongs to user
    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Check if all questions are answered
    const unanswered = interview.questions.some(q => !q.studentAnswer);
    if (unanswered) {
      return res.status(400).json({ msg: 'Please answer all questions before completing the interview' });
    }

    // Calculate overall score and category scores
    const scores = calculateScores(interview.questions);
    interview.overallScore = scores.overall;
    interview.categoryScores = scores.categoryScores;

    // Set end time and duration
    interview.endTime = new Date();
    interview.duration = Math.floor((interview.endTime - interview.startTime) / 1000); // in seconds

    // Generate final feedback
    interview.finalFeedback = await generateFinalFeedback(interview, req.user);

    await interview.save();

    res.json({
      msg: 'Interview completed successfully',
      interview: {
        id: interview._id,
        overallScore: interview.overallScore,
        categoryScores: interview.categoryScores,
        duration: interview.duration,
        finalFeedback: interview.finalFeedback,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get interview report
exports.getReport = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Get interview
    const interview = await Interview.findById(interviewId)
      .populate('userId', 'name email targetRole')
      .lean();

    if (!interview) {
      return res.status(404).json({ msg: 'Interview not found' });
    }

    // Check if interview belongs to user
    if (interview.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    res.json(interview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Helper function to generate first question
async function generateFirstQuestion(interview, user) {
  // Get user profile and resume
  const resume = await Resume.findOne({ userId: user.id }).sort({ uploadedAt: -1 });

  // Create prompt for Gemini
  const prompt = `
    You are a professional technical interviewer. You are interviewing a student for the role of ${interview.targetRole}.

    Student Profile:
    - Name: ${user.name}
    - Education: ${user.education}
    - College: ${user.college}
    - Branch: ${user.branch}
    - Graduation Year: ${user.graduationYear}
    - Target Role: ${user.targetRole}
    - Experience Level: ${user.experienceLevel}
    - Skills: ${user.skills.join(', ')}
    - Introduction: ${user.introduction}

    Resume:
    ${resume.extractedText}

    Generate the first question for the interview. The question should be relevant to the student's profile and resume.
    Return the response in the following JSON format:
    {
      "question": "The question text",
      "category": "technical|hr|project|behavioral",
      "difficulty": "easy|medium|hard"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    } else {
      // Fallback if JSON parsing fails
      return {
        question: "Tell me about yourself and your background.",
        category: "hr",
        difficulty: "easy"
      };
    }
  } catch (error) {
    console.error('Error generating first question:', error);
    return {
      question: "Tell me about yourself and your background.",
      category: "hr",
      difficulty: "easy"
    };
  }
}

// Helper function to analyze answer
async function analyzeAnswer(question, answer, interview, user) {
  // Get user profile and resume for context
  const resume = await Resume.findOne({ userId: user.id }).sort({ uploadedAt: -1 });

  // Create prompt for Gemini
  const prompt = `
    You are an AI interviewer evaluating a student's answer.

    Question: ${question.question}
    Student's Answer: ${answer}

    Evaluate the answer on the following criteria (score 0-10 for each):
    - Technical Accuracy: How correct and technically sound is the answer?
    - Relevance: How relevant is the answer to the question?
    - Communication: How clear and articulate is the communication?
    - Confidence: How confident does the answer sound?
    - Completeness: How complete is the answer?
    - Problem Solving: How well does the answer demonstrate problem-solving skills? (if applicable)

    Provide feedback on what was strong and what could be improved.

    Return the response in the following JSON format:
    {
      "score": 8, // Overall score (0-10)
      "feedback": "Detailed feedback about the answer"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    } else {
      // Fallback if JSON parsing fails
      return {
        score: 5,
        feedback: "Thanks for your answer. Keep practicing to improve your interview skills."
      };
    }
  } catch (error) {
    console.error('Error analyzing answer:', error);
    return {
      score: 5,
      feedback: "Thanks for your answer. Keep practicing to improve your interview skills."
    };
  }
}

// Helper function to calculate scores
function calculateScores(questions) {
  let totalScore = 0;
  let categoryScores = { technical: 0, hr: 0, project: 0, behavioral: 0 };
  let categoryCounts = { technical: 0, hr: 0, project: 0, behavioral: 0 };

  questions.forEach(q => {
    if (q.answerScore !== null && q.answerScore !== undefined) {
      totalScore += q.answerScore;
      categoryScores[q.category] += q.answerScore;
      categoryCounts[q.category]++;
    }
  });

  const overallScore = questions.length > 0 ? Math.round((totalScore / questions.length) * 10) / 10 : 0;

  // Calculate average for each category
  for (const category in categoryScores) {
    if (categoryCounts[category] > 0) {
      categoryScores[category] = Math.round((categoryScores[category] / categoryCounts[category]) * 10) / 10;
    } else {
      categoryScores[category] = 0;
    }
  }

  return {
    overall: overallScore,
    categoryScores: categoryScores,
  };
}

// Helper function to generate final feedback
async function generateFinalFeedback(interview, user) {
  // Get user profile and resume
  const resume = await Resume.findOne({ userId: user.id }).sort({ uploadedAt: -1 });

  // Create prompt for Gemini
  const prompt = `
    You are an AI interviewer providing final feedback after an interview.

    Student Profile:
    - Name: ${user.name}
    - Target Role: ${interview.targetRole}

    Interview Summary:
    - Overall Score: ${interview.overallScore}/10
    - Technical Score: ${interview.categoryScores.technical}/10
    - HR Score: ${interview.categoryScores.hr}/10
    - Project Score: ${interview.categoryScores.project}/10
    - Behavioral Score: ${interview.categoryScores.behavioral}/10

    Questions and Answers:
    ${interview.questions.map((q, index) =>
      'Q' + (index+1) + ': ' + q.question + '\nA: ' + q.studentAnswer + '\nScore: ' + q.answerScore + '/10\nFeedback: ' + q.feedback + '\n'
    ).join('\n')}

    Generate a final interview summary and feedback that includes:
    1. Overall performance summary
    2. Strengths
    3. Areas for improvement
    4. Specific recommendations

    Keep the feedback professional, constructive, and encouraging.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating final feedback:', error);
    return "Thank you for completing the interview. Keep practicing to improve your skills.";
  }
}

module.exports = exports;