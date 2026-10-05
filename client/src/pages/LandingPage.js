import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          AI-Powered Mock Interview
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Practice. Improve. Get Interview Ready.
        </p>
        <p className="text-lg text-gray-500 mb-8">
          Upload your resume and experience a personalized AI interview designed around your skills and career goals.
        </p>
        <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
          Start Interview
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;