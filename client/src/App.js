import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import InterviewSetup from './pages/InterviewSetup';
import DeviceCheck from './pages/DeviceCheck';
import LiveInterview from './pages/LiveInterview';
import InterviewCompleted from './pages/InterviewCompleted';
import PerformanceReport from './pages/PerformanceReport';
import PreviousInterviews from './pages/PreviousInterviews';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - we'll check auth in the components or use a wrapper */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-upload" element={<ResumeUpload />} />
          <Route path="/interview-setup" element={<InterviewSetup />} />
          <Route path="/device-check" element={<DeviceCheck />} />
          <Route path="/live-interview/:interviewId" element={<LiveInterview />} />
          <Route path="/interview-completed/:interviewId" element={<InterviewCompleted />} />
          <Route path="/report/:interviewId" element={<PerformanceReport />} />
          <Route path="/interviews" element={<PreviousInterviews />} />

          {/* Redirect unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;