import axios from 'axios';
import { ENV } from '../config/environment';
import { getAuthTokens, saveAuthTokens, clearAuthTokens } from '../utils/storage';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    const tokens = await getAuthTokens();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh expired access token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = await getAuthTokens();
        if (tokens?.refresh) {
          const refreshRes = await axios.post(`${ENV.API_BASE_URL}/api/cms/auth/refresh/`, {
            refresh: tokens.refresh,
          });
          if (refreshRes.data?.access) {
            const newTokens = {
              access: refreshRes.data.access,
              refresh: tokens.refresh,
            };
            await saveAuthTokens(newTokens);
            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshErr) {
        await clearAuthTokens();
      }
    }
    return Promise.reject(error);
  }
);
