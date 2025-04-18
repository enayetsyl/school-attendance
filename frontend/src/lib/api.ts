// lib/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// —————————————————————————————————————————————————————
// 1) Create two Axios instances
// —————————————————————————————————————————————————————

// Auth server (login, register, refresh, etc.)
export const authApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Resource server (all other protected routes)
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// —————————————————————————————————————————————————————
// 2) Shared token helpers & queue
// —————————————————————————————————————————————————————

type FailedRequest = {
  resolve: (value: AxiosResponse) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
};

let isRefreshing = false;
const failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      axios(config)
        .then(res => resolve(res))
        .catch(err => reject(err));
    }
  });
  failedQueue.length = 0;
};

const getAccessToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
const getRefreshToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
const setAccessToken = (token: string) =>
  localStorage.setItem('accessToken', token);

// —————————————————————————————————————————————————————
// 3) Configure resource-server request interceptor
// —————————————————————————————————————————————————————

api.interceptors.request.use(
  config => {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
    config.headers['X-Tenant-ID'] = process.env.NEXT_PUBLIC_TENANT_ID || '';
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// —————————————————————————————————————————————————————
// 4) Configure resource-server response interceptor
//    to catch 401, call authApi.refresh-token, queue others
// —————————————————————————————————————————————————————

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;
    if (!originalRequest) return Promise.reject(error);

    // Only intercept once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don’t try to refresh if we're already hitting refresh
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      // Call the auth service’s refresh endpoint
      return new Promise<AxiosResponse>((resolve, reject) => {
        authApi
          .post('/auth/refresh-token', { token: refreshToken })
          .then(({ data }) => {
            const newToken = data.accessToken;
            setAccessToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
