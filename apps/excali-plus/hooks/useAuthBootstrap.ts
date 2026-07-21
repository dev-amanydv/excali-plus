import { useEffect } from "react";
import { useAppDispatch } from "@/store/store";
import { addUser, AUTH_KEY } from "@/store/slices/userSlice";

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.token || !parsed?.user) return;
      dispatch(
        addUser({
          userId: parsed.user.userId ?? null,
          email: parsed.user.email ?? null,
          name: parsed.user.name ?? null,
          avatar: parsed.user.avatar ?? null,
          token: parsed.token,
        }),
      );
    } catch {
    }
  }, [dispatch]);
}
