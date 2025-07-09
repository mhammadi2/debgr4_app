"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

// Enhanced fetcher with better error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    // Extract error message properly
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.error || `Error: ${res.status}`;
    throw new Error(errorMessage);
  }
  return res.json();
};

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const { data, error, mutate, isLoading } = useSWR(
    status === "authenticated" ? "/api/admin/profile" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // profile form
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "" });

  // password form
  const [pwd, setPwd] = useState({ cur: "", next: "", confirm: "" });
  const [pwdVisible, setPwdVisible] = useState<{ [k: string]: boolean }>({
    cur: false,
    next: false,
    confirm: false,
  });
  const [pwdSaving, setPwdSaving] = useState(false);

  // toast
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (data) setProfile({ name: data.name ?? "", email: data.email });
  }, [data]);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      await mutate();
      setEditing(false);
      setMsg({ ok: true, text: "Profile updated" });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm)
      return setMsg({ ok: false, text: "Passwords do not match" });
    if (pwd.next.length < 6)
      return setMsg({ ok: false, text: "Password too short" });

    setPwdSaving(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwd.cur,
          newPassword: pwd.next,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      setPwd({ cur: "", next: "", confirm: "" });
      setMsg({ ok: true, text: "Password changed" });
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setPwdSaving(false);
    }
  };

  // Show loading state when session is loading
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  // Redirect or show unauthorized message if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">Not authorized</h2>
        <p className="text-gray-600">Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        Settings
      </h1>

      {msg && (
        <div
          className={`p-3 rounded-md flex items-center space-x-2 ${
            msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {msg.ok ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Profile */}
      <section className="bg-white p-6 rounded-md shadow">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="font-medium text-lg">Admin Profile</h2>
            <p className="text-sm text-gray-500">
              Update your personal information
            </p>
          </div>
          {!editing && data && (
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 text-sm"
            >
              Edit
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error.message || "Failed to load profile"}
          </p>
        )}

        {isLoading && (
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm text-gray-500">Loading…</span>
          </div>
        )}

        {!isLoading && !error && data && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                className={`w-full pl-9 pr-3 py-2 border rounded-md ${
                  editing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                }`}
                disabled={!editing}
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="Full name"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                className={`w-full pl-9 pr-3 py-2 border rounded-md ${
                  editing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                }`}
                disabled={!editing}
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="Email"
              />
            </div>

            {editing && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setProfile({
                      name: data.name ?? "",
                      email: data.email,
                    });
                  }}
                  className="px-3 py-1 text-sm rounded-md border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1 text-sm rounded-md bg-blue-600 text-white flex items-center"
                >
                  {saving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                  Save
                </button>
              </div>
            )}
          </form>
        )}
      </section>

      {/* Password */}
      <section className="bg-white p-6 rounded-md shadow">
        <h2 className="font-medium text-lg mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          {["cur", "next", "confirm"].map((key, i) => {
            const label =
              key === "cur"
                ? "Current password"
                : key === "next"
                ? "New password"
                : "Confirm new password";
            return (
              <div className="relative" key={key}>
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md"
                  type={pwdVisible[key] ? "text" : "password"}
                  value={pwd[key as keyof typeof pwd]}
                  onChange={(e) => setPwd({ ...pwd, [key]: e.target.value })}
                  placeholder={label}
                />
                <button
                  type="button"
                  onClick={() =>
                    setPwdVisible((v) => ({ ...v, [key]: !v[key] }))
                  }
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {pwdVisible[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={pwdSaving}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md flex items-center"
          >
            {pwdSaving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Change password
          </button>
        </form>
      </section>
    </div>
  );
}
