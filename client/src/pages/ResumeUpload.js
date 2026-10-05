import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as resumeService from '../services/resumeService';

const ResumeUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await resumeService.uploadResume(file);
      setSuccess('Resume uploaded successfully!');
      setFile(null);
      // Redirect to interview setup after successful upload
      setTimeout(() => {
        navigate('/interview-setup');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to upload resume');
    } finally {
      setUploading(false);
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
                  <Link to="/resume-upload" className="text-blue-600 font-semibold px-3 border-b-2 border-blue-500">
                    Resume Upload
                  </Link>
                  <Link to="/interview-setup" className="text-gray-500 hover:text-blue-600 px-3 border-b-2 border-transparent hover:border-blue-500">
                    Interview Setup
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Your Resume</h2>
              <p className="text-gray-600 mb-6">
                Upload your resume in PDF or DOC/DOCX format so our AI can extract your skills, experience, and projects to create a personalized interview experience.
              </p>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                    Select Resume File
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {file && (
                      <span className="text-sm text-gray-600">
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX (Max size: 5MB)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeUpload;