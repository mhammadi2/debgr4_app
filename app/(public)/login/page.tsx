"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

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
      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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

  // ✅ FIX:
  // 1. Look for the correct "redirect" parameter used by NextAuth.
  // 2. Default to the customer "/profile" page.
  const callbackUrl = searchParams.get("redirect") || "/profile";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials-user", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else if (result?.ok) {
      // On success, redirect to the intended page or the user's profile.
      router.push(callbackUrl);
    }
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

      await handleLogin(); // Automatically log in after successful registration
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isLoginTab ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>
        {/* ... The rest of your JSX remains the same ... */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setIsLoginTab(true)}
              className={`${isLoginTab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium w-1/2`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              className={`${!isLoginTab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium w-1/2`}
            >
              Create Account
            </button>
          </nav>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={isLoginTab ? handleLogin : handleRegister}
        >
          {error && (
            <div className="flex items-center rounded-md bg-red-50 p-3">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-4 rounded-md">
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
              type="email"
              placeholder="Email address"
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
                <Link
                  href="/terms"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
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
