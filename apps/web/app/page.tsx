"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 bg-black text-white rounded"
    >
      Login with GitHub
    </button>
  );
}
