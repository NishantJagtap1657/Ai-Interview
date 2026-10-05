import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as interviewService from '../services/interviewService';

const LiveInterview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [timer, setTimer] = useState(0);
  const [categoryScores, setCategoryScores] = useState({
    technical: 0,
    hr: 0,
    project: 0,
    behavioral: 0,
  });
  const [overallScore, setOverallScore] = useState(0);
  const webcamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const response = await interviewService.getQuestion(interviewId);
        if (response.msg === 'Interview completed') {
          setInterviewComplete(true);
          navigate(`/interview-completed/${interviewId}`);
          return;
        }
        setQuestion(response.question);
        // Update progress if available
        if (response.questionIndex !== undefined) {
          setProgress(prev => ({ ...prev, current: response.questionIndex + 1 }));
        }
        // Speak the question
        speakQuestion(response.question);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to get question');
      }
    };

    loadQuestion();

    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAnswer(transcript);
        setIsListening(false);
        // Auto-submit after a short delay
        setTimeout(() => {
          submitAnswer();
        }, 1500);
      };

      speechRecognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      speechRecognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition is not supported in your browser. Please use a modern browser like Chrome.');
    }

    // Start timer
    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, [interviewId, navigate]);

  const speakQuestion = (text) => {
    if (!speechSynthesisRef.current) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => {
      setIsSpeaking(false);
      // Start listening after speaking
      if (speechRecognitionRef.current) {
        setIsListening(true);
        speechRecognitionRef.current.start();
      }
    };
    speechSynthesisRef.current.speak(utterance);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      // If answer is empty, ask to try again
      setError('Please provide an answer');
      setIsListening(true);
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }
      return;
    }

    setIsListening(false);
    try {
      await interviewService.submitAnswer({
        interviewId,
        questionIndex: progress.current - 1, // Assuming 0-indexed
        answer,
      });
      // Reset answer and get next question
      setAnswer('');
      setError('');
      const response = await interviewService.getQuestion(interviewId);
      if (response.msg === 'Interview completed') {
        setInterviewComplete(true);
        navigate(`/interview-completed/${interviewId}`);
        return;
      }
      setQuestion(response.question);
      if (response.questionIndex !== undefined) {
        setProgress(prev => ({ ...prev, current: response.questionIndex + 1 }));
      }
      // Speak the next question
      speakQuestion(response.question);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit answer');
      setIsListening(true);
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }
    }
  };

  const skipQuestion = async () => {
    try {
      await interviewService.submitAnswer({
        interviewId,
        questionIndex: progress.current - 1,
        answer: '[Skipped]',
      });
      setAnswer('');
      setError('');
      const response = await interviewService.getQuestion(interviewId);
      if (response.msg === 'Interview completed') {
        setInterviewComplete(true);
        navigate(`/interview-completed/${interviewId}`);
        return;
      }
      setQuestion(response.question);
      if (response.questionIndex !== undefined) {
        setProgress(prev => ({ ...prev, current: response.questionIndex + 1 }));
      }
      speakQuestion(response.question);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to skip question');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (interviewComplete) {
    navigate(`/interview-completed/${interviewId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img className="h-8 w-8" src="https://via.placeholder.com/40" alt="Logo" />
              </Link>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link to="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 border-b-2 border-transparent hover:border-blue-500">
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button type="button" className="bg-white rounded-md p-1 text-gray-400 hover:text-gray-500">
                  <img className="h-8 w-8" src="https://via.placeholder.com/40" alt="User Avatar" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {/* Interview Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">AI Interviewer</h2>
                <p className="text-sm text-gray-500">Live Interview Session</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Elapsed: <span className="font-medium">{formatTime(timer)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              {error}
            </div>
          )}

          {/* Main Interview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Question and Answer */}
            <div className="space-y-6">
              {/* Question Card */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Question</h3>
                  <div className="text-xl text-gray-800 mb-4" style={{ minHeight: '60px' }}>
                    {question || 'Loading question...'}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">
                      {isSpeaking ? 'AI is speaking...' : 'Click to listen again'}
                    </span>
                  </div>
                  <button
                    onClick={() => speakQuestion(question)}
                    disabled={isSpeaking || !question}
                    className="mt-2 w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg"
                  >
                    Listen Again
                  </button>
                </div>
              </div>

              {/* Answer Card */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Your Answer</h3>
                  <div className="mb-4">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Speak your answer or type it here..."
                      className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setAnswer('')}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-600">
                        {isListening ? 'Listening...' : 'Click to speak'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (speechRecognitionRef.current) {
                          if (isListening) {
                            speechRecognitionRef.current.stop();
                          } else {
                            speechRecognitionRef.current.start();
                          }
                          setIsListening(!isListening);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        {isListening ? (
                          <path fillRule="evenodd" d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.305 1.819.93 2.171l1.902-.362c1.13-.054 1.897-.896 1.466-1.89l-.738-3.468z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M12 9c0 .452-.184.877-.493 1.132l-2.515 2.515a1 1 0 01-1.414-1.414l2.515-2.515A1 1 0 0112 9zM9.75 8.25a.75.75 0 00-1.06 1.06l1.06 1.061a1 1 010 1.414l-2.515 2.515a1 1 000 1.414l1.06 1.061a.75.75 0 001.06 1.061l1.06-1.06a1 1 011.414-0l1.06-1.061a.75.75 0 00-1.06-1.06l-2.515-2.515a.75.75 0 00-1.06 0z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={submitAnswer}
                    disabled={isListening || !answer.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Submit Answer
                  </button>
                  <button
                    onClick={skipQuestion}
                    className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                  >
                    Skip Question
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Webcam and Progress */}
            <div className="space-y-6">
              {/* Webcam Card */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Your Video</h3>
                  <div className="relative w-full h-64 bg-gray-200">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      videoConstraints={{ width: 640, height: 480 }}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    {!webcamRef.current && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 text-white">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-b-2 border-white"></div>
                          <p className="mt-2">Loading camera...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Interview Progress</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Question: {progress.current} / {progress.total || '?'}</span>
                      <span>Duration: {formatTime(timer)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: progress.total ? Math.min((progress.current / progress.total) * 100, 100) : 0 }}
                    ></div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Technical:</span>
                      <span className="font-medium">{categoryScores.technical}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HR:</span>
                      <span className="font-medium">{categoryScores.hr}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Project:</span>
                      <span className="font-medium">{categoryScores.project}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Behavioral:</span>
                      <span className="font-medium">{categoryScores.behavioral}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Card */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Controls</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/dashboard`)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      End Interview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveInterview;