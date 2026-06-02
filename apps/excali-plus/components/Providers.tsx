"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/config";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><Provider store={store}>{children}</Provider></GoogleOAuthProvider>
  ;
}
