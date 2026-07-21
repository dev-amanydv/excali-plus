"use client"

import AuthBox from "@/components/AuthBox";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  return (
    <div className="w-screen h-screen flex justify-center items-center px-4">
      <AuthBox
        handleClose={() => router.replace("/")}
        onSuccess={() => router.replace(redirectTo)}
      />
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  );
}
