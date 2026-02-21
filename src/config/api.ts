import axios, { AxiosHeaders } from "axios";
import hmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";
import { toast } from "react-toastify";

// Use environment variable from .env
export const API_BASE_URL = import.meta.env.VITE_BASE_API;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;

/**
 * Generate headers with security HMAC
 */
const makeHeader = (
  customHeaders?: Record<string, string>
) => {
  const nonce = Date.now().toString() + (Math.random() * 1000000000).toFixed();

  const signature = Base64.stringify(
    hmacSHA256(nonce, import.meta.env.VITE_OAUTH_KEY || "")
  );

  const headers: Record<string, string> = {
    Accept: "application/json",
    Nonce: nonce,
    Signature: signature,
    ApplicationId: import.meta.env.VITE_APPLICATION_ID || "",
    ...customHeaders,
  };

  // Let the interceptor handle Content-Type dynamically based on whether it's FormData

  return headers;
};

/**
 * Axios instance with interceptors
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  // Get token using the configured key
  const token = localStorage.getItem(TOKEN_KEY);
  const hasBody = !!config.data;

  const headers = new AxiosHeaders({
    ...makeHeader(config.headers as Record<string, string>),
  });

  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Explicitly set Content-Type if body exists, but NOT for FormData (let browser set boundary)
  if (hasBody && !(config.data instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers;

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Use toast.error from react-toastify
    if (error.response?.data?.Message) {
      toast.error(error.response.data.Message);
    } else if (error.message && error.message !== "canceled") {
      // fallback error
      toast.error(error.message);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token may be invalid or expired");
      logoutUser();
    }
    return Promise.reject(error);
  }
);

function logoutUser() {
  if (typeof window === "undefined") return;

  // Clear session data
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("refreshToken"); // Assuming refresh token might be stored separately or you want to clear all
  localStorage.removeItem("gymOwner");

  // Redirect to login page
  window.location.href = "/login";
}

export default axiosInstance;
