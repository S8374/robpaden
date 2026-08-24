import axios from "axios";

// Create a configured Axios instance
export const axiosInstance = axios.create({
  // Use your API URL from environment variables, or a default local URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Optional: Add a request interceptor to inject auth tokens
axiosInstance.interceptors.request.use(
  (config) => {
    // Only access sessionStorage in the browser
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // e.g., handle 401 Unauthorized globally
    return Promise.reject(error);
  }
);
