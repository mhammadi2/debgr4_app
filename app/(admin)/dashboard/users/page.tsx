"use client";
import useSWR from "swr";
import { useState } from "react";
import useAdminGuard from "@/components/useAdminGuard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UsersManagementPage() {
  useAdminGuard(); // ⬅️ client guard

  const {
    data: users,
    error,
    mutate,
  } = useSWR<any[]>(
    "/api/admin/users", // ⬅️ admin-only route
    fetcher
  );

  // UI states for create
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  // UI states for edit
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");

  // Create user
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      alert("Email and password are required.");
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      mutate();
      alert("User created!");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      setShowCreate(false);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Start editing user
  function startEditing(user: any) {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
  }

  // Cancel editing
  function cancelEdit() {
    setEditingUser(null);
    setEditEmail("");
    setEditRole("");
    setEditPassword("");
  }

  // Submit edit
  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser?.id) return;
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          email: editEmail,
          role: editRole,
          password: editPassword, // hashed on server if provided
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }

      mutate();
      alert("User updated!");
      cancelEdit();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Delete user
  async function handleDeleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      mutate();
      alert("User deleted!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (error) return <div>Error loading users: {error.message}</div>;
  if (!users) return <div>Loading users...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      <button
        onClick={() => setShowCreate(!showCreate)}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
      >
        {showCreate ? "Hide Create Form" : "Create New User"}
      </button>

      {/* CREATE USER FORM */}
      {showCreate && (
        <form
          onSubmit={handleCreateUser}
          className="space-y-4 p-4 border rounded mb-6"
        >
          <h2 className="font-semibold">Create User</h2>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="border p-2 w-full"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="border p-2 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="border p-2 w-full"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Create
          </button>
        </form>
      )}

      {/* EDIT USER FORM */}
      {editingUser && (
        <form
          onSubmit={handleEditUser}
          className="space-y-4 p-4 border rounded mb-6"
        >
          <h2 className="font-semibold">Edit User: {editingUser.email}</h2>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="border p-2 w-full"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="border p-2 w-full"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">New Password (optional)</label>
            <input
              type="password"
              className="border p-2 w-full"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
            <small className="text-gray-500">
              Leave blank if you don’t want to change the password.
            </small>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Update
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* USERS TABLE */}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Created At</th>
              <th className="border px-2 py-1 w-32 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.id}</td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">{u.role}</td>
                <td className="border px-2 py-1">
                  {new Date(u.createdAt).toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-center space-x-2">
                  <button
                    onClick={() => startEditing(u)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
