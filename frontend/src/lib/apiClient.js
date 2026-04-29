import axios from 'axios';
import Cookies from 'js-cookie';

const rawApiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const normalizedApiBaseUrl = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, '')
  : '';
const baseURL = normalizedApiBaseUrl
  ? `${normalizedApiBaseUrl}/api`
  : '/api';
  
  const axiosInstance = axios.create({
    baseURL,
    timeout: 120000, 
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
  
  // Request interceptor
  axiosInstance.interceptors.request.use(function (config) {
    const token = Cookies.get('token');
    if (token && token !== 'mocked.jwt.token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
    return config;
  }, function (error) {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  });
  
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const status = error?.response?.status;
  
      // 401
      if (status !== 401) {
        console.error('Response interceptor error:', error);
  
        // Detailed error logging
        if (error.response) {
          console.error('Error Details:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
      }
  
      // Handle 401 Unauthorized
      if (status === 401) {
        Cookies.remove('token');
        Cookies.remove('id_user');
        // Optionally redirect to login
        // if (typeof window !== 'undefined') {
        //   window.location.href = '/auth';
        // }
      }
  
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('Request timeout - server may be slow or unavailable');
        error.userMessage = 'Server response timeout. Please try again later.';
      }
  
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('Network error - check connection or server status');
        error.userMessage = 'Network error. Please check your connection.';
      }
  
      return Promise.reject(error);
    }
  );
  
  export default axiosInstance;
  