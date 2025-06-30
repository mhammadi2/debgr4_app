// app/(admin)/admin/login/page.tsx (Revised)
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Shield } from "lucide-react";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: "", // This can be an email or a unique admin username
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // CRUCIAL: We are calling the "admin-credentials" provider specifically.
      const result = await signIn("admin-credentials", {
        username: credentials.username,
        password: credentials.password,
        redirect: false, // We handle the redirect manually to provide feedback
      });

      // --- REVISED ERROR HANDLING ---
      // The `authorize` function now throws specific errors, which NextAuth passes here.
      if (result?.error) {
        // Display the specific error message from the server for better feedback.
        setError(result.error);
        setLoading(false);
        return;
      }

      // If there's no error, the user is authenticated as an admin.
      // Redirect to the admin dashboard.
      router.push("/admin");
    } catch (error) {
      console.error("Admin Login Error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl shadow-2xl">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-500">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Authorized Personnel Only
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-900 bg-opacity-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Admin Username or Email"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
