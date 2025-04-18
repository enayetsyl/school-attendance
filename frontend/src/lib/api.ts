// lib/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
const failedQueue: Array<{
  resolve: (r: AxiosResponse) => void;
  reject: (e: any) => void;
  config: AxiosRequestConfig;
}> = [];

// helper to replay queued requests after refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      axios(config).then(resolve).catch(reject);
    }
  });
  failedQueue.length = 0;
};

const getAccessToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
const getRefreshToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
const setAccessToken = (t: string) => localStorage.setItem('accessToken', t);

// ** one single instance **
const api: AxiosInstance = axios.create();

// REQUEST interceptor to choose baseURL + attach tokens
api.interceptors.request.use((config) => {
    // ensure headers object
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';

    // AUTH routes
  if (config.url?.startsWith('/auth')) {
    config.baseURL = process.env.NEXT_PUBLIC_AUTH_BASE_URL;
    // only on auth do we send X-Tenant-ID
    config.headers['X-Tenant-ID'] = process.env.NEXT_PUBLIC_TENANT_ID!;
    // no Authorization header for login/register/refresh
    return config;
  }

  // ALL OTHER (resource) routes
  config.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // skip X-Tenant-ID here

  // attach bearer token if present
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE interceptor to handle 401 → refresh
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const originalRequest = err.config as RetryConfig;
    const status = err.response?.status;

    // only try refresh on resource 401s, and only once per request
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.startsWith('/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      // if another refresh is already in-flight, queue this one
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(err);
      }

      return new Promise<AxiosResponse>((resolve, reject) => {
        // hit your auth‐server’s refresh endpoint
        api.post(
            '/auth/refresh-token',
            { token: refreshToken }
          )
          .then(({ data }) => {
            console.log('data,data',data)
            const newToken = data.token;
            setAccessToken(newToken);
            // update default for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);

            // retry the original request
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          })
          .catch((refreshErr) => {
            processQueue(refreshErr, null);
            console.log('refreshErr',refreshErr)
            reject(refreshErr);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(err);
  }
);

export default api;
