import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
  : 'http://63.250.52.19:9090/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 70000,
  withCredentials: false, // Set to false to avoid CORS preflight issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});


axiosInstance.interceptors.request.use(function (config) {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Interceptor error:', error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
)

export default axiosInstance;