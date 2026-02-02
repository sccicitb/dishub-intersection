import axios from 'axios';
import Cookies from 'js-cookie';

const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : null);

const baseURL = envUrl
  ? `${envUrl}/api`
  : 'https://staging-smartx-mobility.jogjaprov.go.id/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 70000,
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
    // console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    const status = error?.response?.status;

    // Hanya tampilkan log selain 401
    if (status !== 401) {
      console.error('Response interceptor error:', error);

      // Detailed error logging
      if (error.response) {
        console.error('Error Details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          config: error.config
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      // Handle 401 Unauthorized
      if (status === 401) {
        Cookies.remove('token');
        Cookies.remove('id_user');

        // if (typeof window !== 'undefined') {
        //   window.location.href = '/auth';
        // }
      }

      // return Promise.reject(error);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
