import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';

const DeviceCheck = () => {
  const navigate = useNavigate();
  const [webcamRef, setWebcamRef] = useState(null);
  const [audioPermission, setAudioPermission] = useState(false);
  const [videoPermission, setVideoPermission] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const checkPermissions = async () => {
    try {
      // Request video permission
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.getTracks().forEach(track => track.stop());
      setVideoPermission(true);

      // Request audio permission
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(track => track.stop());
      setAudioPermission(true);

      setChecking(false);
      setReady(true);
    } catch (err) {
      setChecking(false);
      setError('Failed to access camera and/or microphone. Please ensure you have granted permissions.');
      console.error('Permission error:', err);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleRetry = () => {
    setChecking(true);
    setError('');
    setTimeout(checkPermissions, 1000);
  };

  const handleStart = () => {
    navigate(`/live-interview/${window.sessionStorage.getItem('currentInterviewId')}`);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Checking your camera and microphone...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Try Again
          </button>
        </div>
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Device Check</h2>
              <p className="text-gray-600 mb-6">
                Please allow access to your camera and microphone for the interview.
              </p>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800">Camera</h3>
                  {videoPermission ? (
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Access granted</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">Access denied</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800">Microphone</h3>
                  {audioPermission ? (
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Access granted</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">Access denied</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                {videoPermission && audioPermission ? (
                  <button
                    onClick={handleStart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                  >
                    Start Interview
                  </button>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                  >
                    Retry Permission Check
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeviceCheck;