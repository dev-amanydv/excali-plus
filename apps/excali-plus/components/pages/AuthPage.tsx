import { Card } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import Link from "next/link";

export default function AuthPage({
  authType,
}: {
  authType: "signup" | "signin";
}) {
  return (
    <div className="w-screen h-screen flex justify-center items-center px-4">
      <div className="w-full max-w-lg">
        <Card className="w-full flex flex-col gap-4 rounded-xl p-5">
          <div className="flex flex-col gap-4">
            {authType === 'signup' ? (
                <div className="flex flex-col gap-1">
              <h1 className="px-1">Name</h1>
              <Input placeholder="Name" className="rounded" type="text" />
            </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <h1 className="px-1">Email</h1>
              <Input placeholder="Email" className="rounded" type="text" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="px-1">Password</h1>
              <Input placeholder="Password" className="rounded" type="text" />
            </div>
            { authType === 'signin' ? (
                <div className="self-end">Forgot Password?</div>
            ) : null}
          </div>
          <div>
            <Button
              appName="Shared Canvas"
              className="cursor-pointer"
              fullWidth
              variant="primary"
            >
              Submit
            </Button>
          </div>
          <div className="flex items-center">
            <div className="h-px w-full bg-gray-400" />
            <span className="px-3">or</span>
            <div className="h-px w-full bg-gray-400" />
          </div>
          <div>
            <Button className="w-full bg-white text-black cursor-po hover:bg-gray-200 active:bg-gray-300">
              Sign In with Google
            </Button>
          </div>
          <div className="flex justify-center">
            { authType === 'signin' ? (
                <div className="flex gap-1">Don&apos;t have an account?<Link className="text-blue-600 font-medium" href={'/auth/signup'}>Sign Up</Link></div>
            ) : (
                <div className="flex gap-1">Already have an account?<Link href={'/auth/signin'} className="text-blue-600 font-medium">Sign In</Link></div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
