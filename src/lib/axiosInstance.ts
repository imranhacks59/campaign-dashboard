import axios from 'axios';

const DEFAULT_BASE = 'https://mixo-fe-backend-task.vercel.app';

const BASE_URL = DEFAULT_BASE;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple request interceptor to attach token if present
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const accessToken = localStorage.getItem('@access_token');
      if (accessToken) {
        config.headers = config.headers ?? {};
        (config.headers as any)['Authorization'] = `Bearer ${accessToken}`;
      }
    } catch (e) {
        console.log(e)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;