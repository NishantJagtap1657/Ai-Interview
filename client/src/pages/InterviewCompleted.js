import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as interviewService from '../services/interviewService';

const InterviewCompleted = () => {
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
        setError(err.response?.data?.msg || 'Failed to load interview results');
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Completed</h2>
              <p className="text-gray-600 mb-6">
                Your interview has been completed. Review your performance below.
              </p>

              {/* Overall Score */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Overall Performance</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-gray-800">
                    {interview.overallScore}/100
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${interview.overallScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Scores */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Category Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Technical</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {interview.categoryScores?.technical || 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">HR</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {interview.categoryScores?.hr || 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Project</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {interview.categoryScores?.project || 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Behavioral</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {interview.categoryScores?.behavioral || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Interview Details */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Interview Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Date:</span>
                    <span>{new Date(interview.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Duration:</span>
                    <span>{Math.floor(interview.duration / 60)}:{interview.duration % 60
                      .toString()
                      .padStart(2, '0')} min</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Questions Answered:</span>
                    <span>{interview.questions.length}</span>
                  </div>
                </div>
              </div>

              {/* Final Feedback */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Final Feedback</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{interview.finalFeedback || 'No feedback available.'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate(`/report/${interviewId}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  View Detailed Report
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

export default InterviewCompleted;