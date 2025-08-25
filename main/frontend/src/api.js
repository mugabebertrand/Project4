// src/lib/api.js
import axios from 'axios';

// Expect VITE_API_URL to be the FULL API base, e.g.:
//   - DEV:  http://localhost:3000/api
//   - PROD: https://YOUR-BACKEND-DOMAIN/api
const rawBase = import.meta.env.VITE_API_URL || '';
const BASE_URL = rawBase.replace(/\/$/, ''); // strip trailing slash

if (import.meta.env.PROD && !BASE_URL) {
  // Make it obvious in case the env var wasn't set during the Pages build
  console.error('VITE_API_URL is missing in production build.');
}

const api = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true, // uncomment only if you use cookies/sessions
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helpful error logging in dev
if (import.meta.env.DEV) {
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error(
        '[API ERROR]',
        err?.response?.status,
        err?.config?.method?.toUpperCase(),
        err?.config?.url,
        err?.response?.data || err.message
      );
      return Promise.reject(err);
    }
  );
}

/* ----------- AUTH ----------- */
// NOTE: paths NO LONGER include "/api" because BASE_URL already ends with /api
export const signup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

/* ----------- Q&A ----------- */
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
