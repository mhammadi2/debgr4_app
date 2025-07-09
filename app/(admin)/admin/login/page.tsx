"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, AlertCircle, Shield, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials-admin", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) setError(result.error);
    else if (result?.ok) router.push(callbackUrl);
  };

  return (
    /* 24 px top padding = clears ±64 px fixed navbar (adjust if needed) */
    <main className="flex min-h-screen items-center justify-center bg-gray-100 pt-24 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        {/* header */}
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Administrator Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Access the management dashboard.
          </p>
        </div>

        {/* form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center rounded-md bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full rounded-md border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-md border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
