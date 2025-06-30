// File: app/(public)/login/page.tsx (Complete and Corrected)

"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle } from "lucide-react";

// A small, reusable input component for a clean form structure
const FormInput = ({ id, type, placeholder, value, onChange, icon: Icon }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      id={id}
      name={id}
      type={type}
      required
      className="rounded-md relative block w-full appearance-none px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 sm:text-sm"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default function UnifiedAuthPage() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Get session status from NextAuth
  const { status, data: session } = useSession();

  // ✅ This useEffect hook is the core of the fix.
  // It waits for the session status to become "authenticated" before redirecting.
  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session?.user?.role;
      // Now that the session is confirmed, we can safely redirect based on role.
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]); // This hook runs when status, session, or router changes.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ REVISED: The handleLogin function now ONLY handles the sign-in attempt.
  // The redirect is handled by the useEffect hook above.
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      // Send the input value for the backend to check as email or username.
      email: formData.email,
      password: formData.password,
      redirect: false, // We must handle redirects manually to avoid race conditions.
    });

    setLoading(false);

    if (result?.error) {
      // If NextAuth returns an error (e.g., wrong password), display it.
      setError("Invalid username or password.");
    }

    // If login is successful, the `useEffect` hook will automatically handle the redirect.
    // We do not need to add any `router.push` logic here.
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.terms)
      return setError("You must agree to the Terms and Conditions.");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create account.");

      // After successful registration, trigger the login process.
      // The handleLogin function will then allow the useEffect to redirect.
      await handleLogin(e);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginTab
              ? "Sign in to your Account"
              : "Create a Customer Account"}
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`w-1/2 py-4 font-medium text-sm ${
              isLoginTab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`w-1/2 py-4 font-medium text-sm ${
              !isLoginTab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create Account
          </button>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={isLoginTab ? handleLogin : handleRegister}
        >
          {error && (
            <div className="rounded-md bg-red-50 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            {!isLoginTab && (
              <FormInput
                id="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                icon={User}
              />
            )}
            <FormInput
              id="email"
              type="text"
              placeholder="Email or Admin Username"
              value={formData.email}
              onChange={handleInputChange}
              icon={User}
            />
            <FormInput
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              icon={Lock}
            />
          </div>

          {!isLoginTab && (
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || status === "authenticated"} // Also disable button after successful login
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : isLoginTab
                ? "Sign In"
                : "Create Account & Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
