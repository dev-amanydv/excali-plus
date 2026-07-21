import { useState } from "react";
import GoogleLoginBtn from "./GoogleLoginBtn";
import { api } from "@/utils/api";
import { addUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/store";

function Spinner() {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 rounded-2xl">
      <svg
        className="animate-spin h-8 w-8 text-neutral-800"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export default function AuthBox({
    handleClose,
    onSuccess,
    title,
}: {
    handleClose: () => void;
    onSuccess?: () => void;
    title?: string;
}) {
    const dispatch = useAppDispatch();
    const [mode, setMode] = useState<"register" | "signin">("register");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            const endpoint = mode === "register" ? "/auth/signup" : "/auth/login";
            const body =
                mode === "register" ? { name, email, password } : { email, password };
            const res = await api.post(endpoint, body);
            const { user, accessToken } = res.data.data;
            dispatch(
                addUser({
                    userId: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar ?? null,
                    token: accessToken,
                }),
            );
            onSuccess?.();
        } catch (err: any) {
            if (err?.response) {
                setError(
                    err.response.data?.message ??
                        err.response.data?.msg ??
                        "Something went wrong. Please try again.",
                );
            } else {
                setError(
                    "Couldn't reach the server. Make sure the backend and database are running.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col gap-5 fixed max-w-137 w-full max-h-138 h-full rounded-2xl p-10 z-20 bg-white border-neutral-400 "
      >
        {loading && <Spinner />}
        <h1 className="font-semibold tracking-tight text-3xl w-xs ">
          {title ?? "Your first session is just a signup away."}
        </h1>
        <GoogleLoginBtn onSuccess={() => onSuccess?.()} onLoadingChange={setLoading} />
        <div className="flex gap-3 items-center text-neutral-500">
          <div className="w-full h-[1px] bg-neutral-200" />
          or
          <div className="w-full h-[1px] bg-neutral-200" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="flex flex-col gap-1">
                <h1 className="text-sm font-medium">Name</h1>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 py-1 text-md rounded-md border border-neutral-200 px-4 focus:outline-3 focus:outline-neutral-100 focus:border-neutral-300 focus:border"
                  placeholder="Your name"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h1 className="text-sm font-medium">Email</h1>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 py-1 text-md rounded-md border border-neutral-200 px-4 focus:outline-3 focus:outline-neutral-100 focus:border-neutral-300 focus:border"
                placeholder="ay.work07@gmail.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-sm font-medium">Password</h1>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                className="w-full bg-neutral-50 py-1 text-md rounded-md border border-neutral-200 px-4 focus:outline-3 focus:outline-neutral-100 focus:border-neutral-300 focus:border"
                placeholder="******"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-neutral-800 h-10 rounded-lg text-white hover:bg-black cursor-pointer disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "register"
                ? "Register"
                : "Sign in"}
          </button>
          <button
            onClick={() => {
              setError(null);
              setMode(mode === "register" ? "signin" : "register");
            }}
            className="text-sm text-neutral-500 hover:text-neutral-800 cursor-pointer"
          >
            {mode === "register"
              ? "Already have an account? Sign in"
              : "Need an account? Register"}
          </button>
        </div>
      </div>
    );
}
