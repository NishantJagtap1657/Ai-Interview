import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as interviewService from '../services/interviewService';

const InterviewSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    targetRole: user?.targetRole || '',
    interviewType: 'technical+hr',
    difficulty: 'intermediate',
    numQuestions: 10,
    duration: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await interviewService.startInterview(formData);
      navigate(`/live-interview/${response.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

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
                  <Link to="/resume-upload" className="text-gray-500 hover:text-blue-600 px-3 border-b-2 border-transparent hover:border-blue-500">
                    Resume
                  </Link>
                  <Link to="/interview-setup" className="text-blue-600 font-semibold px-3 border-b-2 border-blue-500">
                    Interview Setup
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-10">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Setup</h2>
              <p className="text-gray-600 mb-6">
                Configure your interview preferences below.
              </p>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleStartInterview} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700">
                    Target Role
                  </label>
                  <input
                    id="targetRole"
                    type="text"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="interviewType" className="block text-sm font-medium text-gray-700">
                    Interview Type
                  </label>
                  <select
                    id="interviewType"
                    name="interviewType"
                    value={formData.interviewType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="technical">Technical Only</option>
                    <option value="hr">HR Only</option>
                    <option value="technical+hr">Technical + HR</option>
                    <option value="full">Full Interview (Technical, HR, Project, Behavioral)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                      Difficulty Level
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">
                      Number of Questions
                    </label>
                    <select
                      id="numQuestions"
                      name="numQuestions"
                      value={formData.numQuestions}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                      <option value="15">15 Questions</option>
                      <option value="20">20 Questions</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes</option>
                      <option value="20">20 Minutes</option>
                      <option value="30">30 Minutes</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'Starting Interview...' : 'Start Interview'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSetup;