import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userState {
    userId: string | null;
    email: string | null;
    name: string | null;
    avatar: string | null;
    token: string | null;
}

const initiaState: userState = {
    userId: null,
    email: null,
    name: null,
    avatar: null,
    token: null,
};

interface AddUserPayload {
    userId: string | null;
    email: string | null;
    name: string | null;
    avatar?: string | null;
    token: string | null;
}

const AUTH_STORAGE_KEY = "auth";

const userSlice = createSlice({
    name: "user",
    initialState: initiaState,
    reducers: {
        addUser(state, action: PayloadAction<AddUserPayload>) {
            state.email = action.payload.email;
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.avatar = action.payload.avatar ?? null;
            state.token = action.payload.token;

            if (typeof window !== "undefined" && action.payload.token) {
                localStorage.setItem(
                    AUTH_STORAGE_KEY,
                    JSON.stringify({
                        user: {
                            userId: action.payload.userId,
                            email: action.payload.email,
                            name: action.payload.name,
                            avatar: action.payload.avatar ?? null,
                        },
                        token: action.payload.token,
                    }),
                );
            }
        },
        logout(state) {
            state.email = null;
            state.userId = null;
            state.name = null;
            state.avatar = null;
            state.token = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        },
    },
});

export const { addUser, logout } = userSlice.actions;

export const AUTH_KEY = AUTH_STORAGE_KEY;

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw).token ?? null;
    } catch {
        return null;
    }
}

export default userSlice.reducer;
