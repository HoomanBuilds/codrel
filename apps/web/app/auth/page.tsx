"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-8 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] shadow-xl">
        <h1 className="text-2xl font-semibold text-center mb-6 text-white">
          {session ? "Welcome" : "Login"}
        </h1>

        {session ? (
          <button
            onClick={() => router.push("/console/analytics")}
            className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition"
          >
            Go to console
          </button>
        ) : (
          <button
            onClick={() => signIn("github", { callbackUrl: "/console/analytics" })}
            className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition"
          >
            Login with GitHub
          </button>
        )}

        <p className="text-center text-neutral-400 text-sm mt-6">
          Secure access using GitHub.
        </p>
      </div>
    </div>
  );
}
