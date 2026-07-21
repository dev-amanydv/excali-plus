import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { getStoredToken } from "@/store/slices/userSlice";

export const api = axios.create({
  baseURL: HTTP_BACKEND,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
