import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as interviewService from '../services/interviewService';

const PreviousInterviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        // In a real app, we would fetch the user's interviews from the backend
        // For now, we'll simulate with an empty array
        setInterviews([]);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, [user]);

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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Previous Interviews</h2>
              <p className="text-gray-600 mb-6">
                Review your past interview performances.
              </p>

              {interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="px-6 py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">{new Date(interview.startTime).toLocaleDateString()}</p>
                            <p className="text-font-medium text-gray-800">{interview.targetRole}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">{interview.overallScore}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-3">
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <div className="flex-1">
                            <p>Technical: {interview.categoryScores?.technical || 0}%</p>
                          </div>
                          <div className="flex-1">
                            <p>HR: {interview.categoryScores?.hr || 0}%</p>
                          </div>
                          <div className="flex-1">
                            <p>Project: {interview.categoryScores?.project || 0}%</p>
                          </div>
                          <div className="flex-1">
                            <p>Behavioral: {interview.categoryScores?.behavioral || 0}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-3">
                        <Link to={`/report/${interview._id}`} className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg">
                          View Report
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">You haven't completed any interviews yet.</p>
                  <Link to="/resume-upload" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    Upload Resume to Start
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PreviousInterviews;