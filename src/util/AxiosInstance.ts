import axios, { AxiosInstance } from "axios";
import { getAuthToken, setAuthToken } from "./cookies";
// import { getCookieValue } from '@/utils/cookie';

const Axios: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  validateStatus: (s) => s >= 200 && s <= 500,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

// Request interceptor to add Authorization header automatically
Axios.interceptors.request.use(
  (config) => {
    // Skip adding auth header for login endpoint
    if (config.url?.includes("/login")) {
      return config;
    }

    // Add Authorization header for all other requests
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-refresh-token"];
	console.log('Received new token:', newToken);
    if (newToken) {
      setAuthToken(newToken);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { Axios };
