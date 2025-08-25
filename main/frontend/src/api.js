import axios from 'axios';

// Dev -> localhost API; Prod -> your hosted API (must be HTTPS)
const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : 'https://project4-backend.onrender.com/api'; // <-- set to your real backend

console.log('[API BASE]', BASE_URL);

const api = axios.create({ baseURL: BASE_URL });

// attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- AUTH ----------
export const signup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// ---------- Q&A ----------
export const getCategories = () => api.get('/categories');
export const getQuestionsByCategory = (catId) =>
  api.get(`/questions/by-category/${catId}`);
export const getAnswersByQuestion = (qId) =>
  api.get(`/answers/by-question/${qId}`);
export const postQuestion = (categoryId, title) =>
  api.post('/questions', { categoryId, title });
export const postAnswer = (questionId, answer) =>
  api.post('/answers', { questionId, answer });

export default api;
