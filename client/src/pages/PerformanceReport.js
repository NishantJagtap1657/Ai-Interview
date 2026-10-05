import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as interviewService from '../services/interviewService';

const PerformanceReport = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const response = await interviewService.getReport(interviewId);
        setInterview(response);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load interview report');
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p>No interview data found.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Return to Dashboard
        </button>
      </div>
    );
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
          </div>
        </div>
      </header>

      <main className="mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Performance Report</h2>
              <p className="text-gray-600 mb-6">
                Detailed analysis of your interview performance.
              </p>

              {/* Student Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name:</p>
                    <p className="text-gray-700">{interview.userId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Target Role:</p>
                    <p className="text-gray-700">{interview.targetRole || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Education:</p>
                    <p className="text-gray-700">{interview.userId?.education || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">College:</p>
                    <p className="text-gray-700">{interview.userId?.college || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Overall Score and Category Scores */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Performance Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Overall Score</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {interview.overallScore}/100
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">T</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Technical</p>
                        <p className="text-lg font-bold text-gray-800">
                          {interview.categoryScores?.technical || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-green-600">H</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">HR</p>
                        <p className="text-lg font-bold text-gray-800">
                          {interview.categoryScores?.hr || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-600">P</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Project</p>
                        <p className="text-lg font-bold text-gray-800">
                          {interview.categoryScores?.project || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-pink-600">B</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Behavioral</p>
                        <p className="text-lg font-bold text-gray-800">
                          {interview.categoryScores?.behavioral || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Analysis */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Question-by-Question Analysis</h3>
                {interview.questions.length > 0 ? (
                  <div className="space-y-4">
                    {interview.questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-gray-800">
                            Question {index + 1}
                          </h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {q.category}
                          </span>
                        </div>
                        <div className="mb-2">
                          <p className="text-gray-700">{q.question}</p>
                        </div>
                        <div className="mb-2">
                          <p className="font-medium text-gray-700">Your Answer:</p>
                          <p className="text-gray-600">{q.studentAnswer || '[No answer provided]'}</p>
                        </div>
                        <div className="mb-2">
                          <p className="font-medium text-gray-700">AI Evaluation:</p>
                          <p className="text-gray-600">{q.feedback || 'No feedback available.'}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">Score:</span>
                            <span className="text-lg font-bold text-gray-800">
                              {q.answerScore}/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${(q.answerScore || 0) / 10 * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No questions found.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate(`/report/${interviewId}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Download PDF Report
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PerformanceReport;