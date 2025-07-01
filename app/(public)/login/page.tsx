// File: app/(public)/login/page.tsx (Corrected and Aligned)

"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, AlertCircle, Loader2 } from "lucide-react";

// Reusable input component - this is well-designed and needs no changes.
const FormInput = ({ id, type, placeholder, value, onChange, icon: Icon }) => (
  <div className="relative">
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      id={id}
      name={id}
      type={type}
      required
      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default function PublicLoginPage() {
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
  const searchParams = useSearchParams();
  // ✅ IMPROVEMENT: Read the callbackUrl from the URL for a smart redirect.
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // ❌ REMOVED: The `useEffect` and `useSession` hooks have been removed.
  // They are no longer needed as the middleware handles all session-based redirects.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ REVISED: The login function is now simple, direct, and correct.
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ CORRECTION: Use the specific "credentials-user" provider.
    const result = await signIn("credentials-user", {
      email: formData.email,
      password: formData.password,
      redirect: false, // We handle redirects manually after checking the result.
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else if (result?.ok) {
      // On success, ALWAYS redirect to the user dashboard or the saved callbackUrl.
      router.push(callbackUrl);
    }
  };

  // This function remains largely the same, but now calls the corrected `handleLogin`.
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

      // After registration, trigger the simplified login process.
      await handleLogin(e);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginTab
              ? "Sign in to your Account"
              : "Create a Customer Account"}
          </h2>
        </div>
        <div className="flex border-b">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`w-1/2 py-4 text-sm font-medium ${
              isLoginTab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`w-1/2 py-4 text-sm font-medium ${
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
            <div className="flex items-center rounded-md bg-red-50 p-4">
              <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
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

            {/* ✅ CORRECTION: Placeholder text is now clear and unambiguous. */}
            <FormInput
              id="email"
              type="email"
              placeholder="Email"
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
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : isLoginTab ? (
                "Sign In"
              ) : (
                "Create Account & Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
