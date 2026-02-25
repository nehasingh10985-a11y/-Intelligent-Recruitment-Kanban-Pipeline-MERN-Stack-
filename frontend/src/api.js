import axios from "axios";

const api = axios.create({
  // Use environment variable or fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Global 401 Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login"; // Force redirect on expired session
    }
    return Promise.reject(error);
  },
);

export default api;
