import { HTTP_BACKEND } from "@/config";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

interface credentialResponse {
    clientId?: string | undefined,
    credential?: string | undefined
}

export default function GoogleLoginBtn () {
    async function handleSignup (credentials: credentialResponse) {
        console.log(credentials)
        const res = await axios.post(`${HTTP_BACKEND}/auth/signup?type=google`, {
            credential: credentials.credential
        })
        
    }
    return <GoogleLogin type="standard" size="large" text="continue_with" onSuccess={credentialResponse => {handleSignup(credentialResponse)} } onError={() => console.log('login failed')} />
}