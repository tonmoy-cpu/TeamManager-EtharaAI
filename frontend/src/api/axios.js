import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://teammanager-etharaai-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      // Supress the error in console or handle it gracefully to avoid unhandled promise rejections crashing UI
      return Promise.resolve({ data: [] }); // return empty data to prevent crash
    }
    return Promise.reject(error);
  }
);

export default api;
