import axios, { AxiosHeaders } from "axios";
import hmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../utils/apiError";

export const API_BASE_URL = import.meta.env.VITE_BASE_API;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;

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

  return headers;
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const hasBody = !!config.data;

  const headers = new AxiosHeaders({
    ...makeHeader(config.headers as Record<string, string>),
  });

  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (hasBody && !(config.data instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers;

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isCanceled = error.code === "ERR_CANCELED" || error.message === "canceled";
    if (!isCanceled) {
      toast.error(getApiErrorMessage(error));
    }

    if (error.response?.status === 401) {
      console.warn("Unauthorized - token may be invalid or expired");
      logoutUser();
    }
    return Promise.reject(error);
  }
);

function logoutUser() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("gymOwner");

  window.location.href = "/login";
}

export default axiosInstance;
