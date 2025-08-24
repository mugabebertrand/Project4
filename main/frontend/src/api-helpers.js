// src/api-helpers.js
import api from './api.js';

export const getCategories = () => api.get('/api/categories');
export const getQuestionsByCategory = (catId) =>
  api.get(`/api/questions/by-category/${catId}`);
export const getAnswersByQuestion = (qId) =>
  api.get(`/api/answers/by-question/${qId}`);
export const postQuestion = (categoryId, title) =>
  api.post('/api/questions', { categoryId, title });
export const postAnswer = (questionId, answer) =>
  api.post('/api/answers', { questionId, answer });

