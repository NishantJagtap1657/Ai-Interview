import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as resumeService from '../services/resumeService';
import * as interviewService from '../services/interviewService';

const Dashboard = () => {
  const { user } = useAuth();
  const [latestInterview, setLatestInterview] = useState(null);
  const [previousInterviews, setPreviousInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, we would fetch the latest interview and previous interviews from the backend
        // For now, we'll simulate with empty arrays
        setLatestInterview(null);
        setPreviousInterviews([]);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
        <Link to="/login" className="mt-4 text-blue-600 hover:text-blue-700">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-8" src="https://via.placeholder.com/40" alt="Logo" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link to="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 border-b-2 border-transparent hover:border-blue-500">
                    Dashboard
                  </Link>
                  <Link to="/resume-upload" className="text-gray-500 hover:text-blue-600 px-3 border-b-2 border-transparent hover:border-blue-500">
                    Resume
                  </Link>
                  <Link to="/interviews" className="text-gray-500 hover:text-blue-600 px-3 border-b-2 border-transparent hover:border-blue-500">
                    Interviews
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="mt-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome, {user?.name || 'Student'} 👋
              </h2>
            </div>

            {/* Latest Interview Card */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Latest Interview</h3>
                {latestInterview ? (
                  <>
                    <p className="text-sm text-gray-500">Role: {latestInterview.targetRole}</p>
                    <div className="mt-2">
                      <p className="text-2xl font-bold text-gray-800">Score: {latestInterview.overallScore}/100</p>
                      <div className="mt-2 flex space-x-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Technical</p>
                          <p className="text-lg font-semibold">{latestInterview.categoryScores?.technical || 0}%</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Communication</p>
                          <p className="text-lg font-semibold">{latestInterview.categoryScores?.hr || 0}%</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Confidence</p>
                          <p className="text-lg font-semibold">{latestInterview.categoryScores?.project || 0}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link to={`/report/${latestInterview._id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        View Report
                      </Link>
                      <Link to={`/report/${latestInterview._id}`} className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                        Download PDF
                      </Link>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-gray-500">No interviews yet. Start your first interview!</p>
                    <Link to="/resume-upload" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                      Upload Resume to Begin
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Previous Interviews */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Previous Interviews</h3>
              {previousInterviews.length > 0 ? (
                <div className="space-y-4">
                  {previousInterviews.map((interview) => (
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No previous interviews</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;