import axios from 'axios';

// Dynamically determine the backend API base URL
export const getBaseURL = () => {
  // If Vite dev server or separate port, talk directly to FastAPI port 8000
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname || 'localhost';
    const port = window.location.port;

    // If running on Vite dev server (5173, 3000, etc.)
    if (port === '5173' || port === '3000') {
      return `http://${hostname}:8000/api`;
    }

    // If frontend is being served directly by FastAPI on port 8000 or production
    return '/api';
  }
  return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    // Ensure baseURL matches current environment
    if (!config.baseURL || config.baseURL === '/api') {
      config.baseURL = getBaseURL();
    }

    const token = localStorage.getItem('voxweb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with auto-fallback to alternative host if ECONNREFUSED
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry once with alternative host if localhost / 127.0.0.1 resolution failed
    if (config && !config._retry && error.message && error.message.includes('Network Error')) {
      config._retry = true;
      try {
        if (config.baseURL.includes('localhost')) {
          config.baseURL = config.baseURL.replace('localhost', '127.0.0.1');
        } else if (config.baseURL.includes('127.0.0.1')) {
          config.baseURL = config.baseURL.replace('127.0.0.1', 'localhost');
        } else {
          config.baseURL = 'http://127.0.0.1:8000/api';
        }
        return await axios(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }

    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('voxweb_token');
        localStorage.removeItem('voxweb_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
