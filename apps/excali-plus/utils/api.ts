import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { getStoredToken } from "@/store/slices/userSlice";
import { store } from "@/store/store";
import { logout } from "@/store/slices/userSlice";
import { setSessionExpiredDialogOpen } from "@/store/slices/uiSlice";

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

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.url !== "/auth/login" &&
      error.config?.url !== "/auth/signup"
    ) {
      store.dispatch(logout());
      store.dispatch(setSessionExpiredDialogOpen(true));
    }
    return Promise.reject(error);
  },
);
