import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Handle 401 errors more intelligently
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/signin', '/signup', '/forgot-password'].includes(currentPath);
      const hadToken = localStorage.getItem('authToken');
      const requestUrl = error.config?.url || '';
      
      // Check if this is a password change error (incorrect old password)
      const isPasswordChangeError = requestUrl.includes('/auth/change-password') && 
        (error.response?.data?.message?.includes('Old password is incorrect') || 
         error.response?.data?.error?.includes('Old password is incorrect'));
      
      // Don't clear auth data or redirect for password change errors
      if (isPasswordChangeError) {
        return Promise.reject(error);
      }
      
      // Clear auth data for other 401 errors
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on an auth page and had a token (meaning we were authenticated)
      if (!isAuthPage && hadToken) {
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;