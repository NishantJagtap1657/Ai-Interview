import api from './api';

export const startInterview = async (interviewData) => {
  const response = await api.post('/interview/start', interviewData);
  return response.data;
};

export const getQuestion = async (interviewId) => {
  const response = await api.get(`/interview/question/${interviewId}`);
  return response.data;
};

export const submitAnswer = async (answerData) => {
  const response = await api.post('/interview/answer', answerData);
  return response.data;
};

export const completeInterview = async (interviewId) => {
  const response = await api.put(`/interview/complete/${interviewId}`);
  return response.data;
};

export const getReport = async (interviewId) => {
  const response = await api.get(`/interview/report/${interviewId}`);
  return response.data;
};