
import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL || '/';

const api = axios.create({
  baseURL: BASE_URL,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const signup = (name, email, password) =>
  api.post('/api/auth/signup', { name, email, password });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });


export const getCategories = () => api.get('/api/categories');

export const getQuestionsByCategory = (catId) =>
  api.get(`/api/questions/by-category/${catId}`);

export const getAnswersByQuestion = (qId) =>
  api.get(`/api/answers/by-question/${qId}`);

export const postQuestion = (categoryId, title) =>
  api.post('/api/questions', { categoryId, title });

export const postAnswer = (questionId, answer) =>
  api.post('/api/answers', { questionId, answer });

export default api;
