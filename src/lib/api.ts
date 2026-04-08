import axios from 'axios';
import Cookies from 'js-cookie';

// 1. Create the base Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Runs BEFORE every request is sent
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  // If we have a token, attach it to the Authorization header
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response Interceptor: Runs AFTER every response is received
api.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true; // Mark this request so we don't end up in an infinite loop

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        // Call your FastAPI /auth/refresh endpoint
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        // Save the new access token
        Cookies.set('access_token', data.access_token);
        
        // Update the original request's header and retry it!
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Edge Case: The refresh token is expired or invalid.
        // We must log the user out and force them to log in again.
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        // Note: We use standard window.location here because this is a standard TS file, not a React Component.
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // If it's not a 401, or refresh failed, reject the promise so the calling function can catch it.
    return Promise.reject(error);
  }
);

export default api;