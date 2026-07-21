import { addUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/store";
import { api } from "@/utils/api";
import { GoogleLogin } from "@react-oauth/google";

interface credentialResponse {
    clientId?: string | undefined,
    credential?: string | undefined
}

export default function GoogleLoginBtn({ onSuccess, onLoadingChange }: { onSuccess?: () => void; onLoadingChange?: (loading: boolean) => void }) {
    const dispatch = useAppDispatch();

    async function handleSignup(credentials: credentialResponse) {
        onLoadingChange?.(true);
        try {
            const res = await api.post(`/auth/google`, {
                credential: credentials.credential,
            });
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
        } catch (err) {
            console.error("Google login failed", err);
        } finally {
            onLoadingChange?.(false);
        }
    }

    return (
        <GoogleLogin
            type="standard"
            size="large"
            text="continue_with"
            onSuccess={(credentialResponse) => {
                handleSignup(credentialResponse);
            }}
            onError={() => console.log("login failed")}
            
        />
    );
}
