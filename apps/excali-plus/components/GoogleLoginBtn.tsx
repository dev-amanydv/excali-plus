import { HTTP_BACKEND } from "@/config";
import { addUser } from "@/store/slices/userSlice";
import { store } from "@/store/store";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

interface credentialResponse {
    clientId?: string | undefined,
    credential?: string | undefined
}

export default function GoogleLoginBtn () {
    async function handleSignup (credentials: credentialResponse) {
        console.log(credentials)
        const res = await axios.post(`${HTTP_BACKEND}/auth/google`, {
            credential: credentials.credential
        });
        addUser({userId: res.data.id, email: res.data.email, name: res.data.name})
    }
    return <GoogleLogin type="standard" size="large" text="continue_with" onSuccess={credentialResponse => {handleSignup(credentialResponse)} } onError={() => console.log('login failed')} />
}