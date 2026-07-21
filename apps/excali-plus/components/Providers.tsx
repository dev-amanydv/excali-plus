"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/config";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import SessionExpiredOverlay from "./SessionExpiredOverlay";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <AuthBootstrap>
          {children}
          <SessionExpiredOverlay />
        </AuthBootstrap>
      </Provider>
    </GoogleOAuthProvider>
  );
}
